require "open3"
require "json"

class OffsetsSyncer
  class Error < StandardError; end

  def initialize(event, base_capture: nil, analyze_duration: nil, sample_rate: nil)
    @event = event
    @base_capture = base_capture || event.base_capture || event.captures.order(:created_at).first
    @analyze_duration = analyze_duration.presence || "90"
    @sample_rate = sample_rate.presence || "8000"
  end

  def call
    captures = @event.captures.order(:created_at).to_a
    raise Error, "No captures to sync" if captures.empty?
    raise Error, "Need at least two captures to sync" if captures.size < 2
    raise Error, "Base capture is missing" unless @base_capture

    files = [ @base_capture ] + captures.reject { |cap| cap.id == @base_capture.id }
    paths_map = files.index_with { |cap| video_path_for(cap) }

    cmd = [
      Rails.root.join("bin", "camera.sh").to_s,
      "-d", @analyze_duration.to_s,
      "-r", @sample_rate.to_s,
      *paths_map.values
    ]

    stdout_str, stderr_str, status = Open3.capture3(*cmd)
    raise Error, "camera.sh failed: #{stderr_str.presence || stdout_str}" unless status.success?

    json = JSON.parse(stdout_str)
    offsets_by_path = json.fetch("files", []).to_h { |entry| [ entry["file"], entry["offset_sec"] ] }

    updated = 0
    skipped = []
    ActiveRecord::Base.transaction do
      @event.update!(base_capture: @base_capture)
      @event.captures.update_all(offset_base_capture_id: @base_capture.id)

      paths_map.each do |cap, path|
        offset = offsets_by_path[path]
        if offset.nil?
          skipped << "Capture ##{cap.id}"
          next
        end
        cap.update!(offset_seconds: offset.to_f, offset_base_capture_id: @base_capture.id)
        updated += 1
      end
    end

    { updated: updated, skipped: skipped }
  end

  private

  def video_path_for(capture)
    blob = capture.video&.blob
    raise Error, "Capture ##{capture.id} has no video" unless blob

    service = ActiveStorage::Blob.service
    if service.respond_to?(:path_for)
      service.path_for(blob.key)
    else
      service.send(:path_for, blob.key)
    end
  end
end
