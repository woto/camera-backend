class GenerateHlsJob < ApplicationJob
  queue_as :default

  def perform(capture_id)
    capture = Capture.find_by(id: capture_id)
    return unless capture

    return if capture.hls_processing?

    capture.update!(hls_processing: true, hls_error: nil)
    begin
      HlsGenerator.new(capture).generate!
      # Broadcast to room channel so clients can update live (if room available)
      if (room = capture.room || capture.event&.room)
        ActionCable.server.broadcast("recording_channel:#{room.name}", { action: "hls_ready", capture_id: capture.id, hls_url: "#{capture.hls_manifest_path}" })
      end
    rescue => e
      Rails.logger.error("[GenerateHlsJob] failed for Capture ##{capture.id}: #{e.message}")
      capture.update!(hls_processing: false, hls_error: e.message)
      raise e
    end
  end
end
