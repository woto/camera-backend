class RecorderController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:upload, :trigger]
  skip_before_action :require_login, only: [:upload, :trigger]

  def upload
    video_file = params[:video]
    raw_timestamp = params[:timestamp]

    unless video_file.present? && raw_timestamp.present?
      Rails.logger.warn("[RecorderController#upload] Missing required params: video=#{video_file.present?}, timestamp=#{raw_timestamp.present?}")
      return render json: { success: false, message: "Missing video/timestamp params" }, status: :bad_request
    end

    captured_at = parse_timestamp(raw_timestamp)
    unless captured_at
      Rails.logger.warn("[RecorderController#upload] Invalid timestamp: #{raw_timestamp.inspect}")
      return render json: { success: false, message: "Invalid timestamp" }, status: :bad_request
    end

    thumbnails = []
    response_payload = {}
    event = nil
    capture = nil

    ActiveRecord::Base.transaction do
      event = Event.find_or_create_by!(captured_at: captured_at)
      capture = event.captures.build

      attach_video!(capture, video_file)
      capture.save!

      thumbnails = ThumbnailGenerator.new(video_file.tempfile.path).generate
      attach_thumbnails!(capture, thumbnails, safe_filename(video_file))

      response_payload = {
        success: true,
        message: "Video uploaded",
        event_id: event.id,
        event_timestamp: event.captured_at.iso8601,
        capture_id: capture.id,
        video: blob_payload(capture.video),
        thumbnails: capture.thumbnails.map { |thumb| blob_payload(thumb) }
      }
    end
    broadcast_upload_success(event, capture)
    render json: response_payload, status: :ok
  rescue ThumbnailGenerator::Error => e
    Rails.logger.error("[RecorderController#upload] Thumbnail generation failed: #{e.message}")
    render json: { success: false, message: e.message }, status: :unprocessable_entity
  rescue => e
    Rails.logger.error("[RecorderController#upload] Upload failed: #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}")
    render json: { success: false, message: e.message }, status: :internal_server_error
  ensure
    thumbnails&.each { |file| file.close! if file.respond_to?(:close!) }
  end

  def trigger
    timestamp = Time.current
    # Broadcast signal to all connected clients via ActionCable
    ActionCable.server.broadcast("recording_channel", { action: "capture", timestamp: timestamp.iso8601 })
    render json: { success: true, timestamp: timestamp.iso8601, message: "Capture signal sent" }, status: :ok
  rescue => e
    render json: { success: false, message: e.message }, status: :internal_server_error
  end

  private

  def safe_filename(file)
    File.basename(file.original_filename)
  end

  def parse_timestamp(raw_timestamp)
    numeric_timestamp?(raw_timestamp) ? Time.zone.at(raw_timestamp.to_f) : Time.zone.parse(raw_timestamp.to_s)
  rescue ArgumentError, TypeError
    nil
  end

  def numeric_timestamp?(value)
    /\A-?\d+(\.\d+)?\z/.match?(value.to_s)
  end

  def attach_video!(capture, file)
    file.tempfile.rewind

    capture.video.attach(
      io: file,
      filename: safe_filename(file),
      content_type: file.content_type.presence
    )

    raise "Failed to save video" unless capture.video.attached?
  end

  def attach_thumbnails!(capture, files, base_filename)
    files.each_with_index do |thumbnail_file, index|
      data = File.binread(thumbnail_file.path)
      io = StringIO.new(data)

      capture.thumbnails.attach(
        io: io,
        filename: "thumb_#{index + 1}_#{base_filename}.jpg",
        content_type: "image/jpeg"
      )
    end

    raise "Failed to save thumbnails" unless capture.thumbnails.count >= files.size
  end

  def blob_payload(attached_file)
    blob =
      if attached_file.respond_to?(:attached?)
        return unless attached_file.attached?
        attached_file.respond_to?(:blob) ? attached_file.blob : nil
      elsif attached_file.respond_to?(:blob)
        attached_file.blob
      end

    return unless blob

    {
      signed_id: blob.signed_id,
      filename: blob.filename.to_s,
      byte_size: blob.byte_size,
      content_type: blob.content_type
    }
  end

  def broadcast_upload_success(event, capture)
    return unless event&.persisted? && capture&.persisted?

    payload = {
      action: "upload_success",
      event_id: event.id,
      event_timestamp: event.captured_at&.iso8601,
      capture_id: capture.id,
      video: blob_payload(capture.video),
      thumbnails: capture.thumbnails.map { |thumb| blob_payload(thumb) }
    }

    ActionCable.server.broadcast("recording_channel", payload)
  rescue => e
    Rails.logger.warn("[RecorderController#upload] Failed to broadcast upload success: #{e.message}")
  end
end
