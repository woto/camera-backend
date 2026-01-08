class RegenerateThumbnailsJob < ApplicationJob
  queue_as :default

  def perform(event_id: nil, capture_id: nil)
    scope = Capture.joins(:video_attachment)
    scope = scope.where(event_id: event_id) if event_id.present?
    scope = scope.where(id: capture_id) if capture_id.present?

    scope.find_each do |capture|
      regenerate_for_capture(capture)
    rescue => e
      Rails.logger.warn("[RegenerateThumbnailsJob] Failed Capture##{capture.id}: #{e.message}")
    end
  end

  private

  def regenerate_for_capture(capture)
    small_thumbnails = []
    large_thumbnails = []

    capture.video.open do |file|
      small_thumbnails = ThumbnailGenerator.new(
        file.path,
        capture_count: 5,
        target_width: 170,
        target_height: 320,
        quality: 7,
        fit_mode: :contain,
        rotate_to_fit: true
      ).generate

      large_thumbnails = ThumbnailGenerator.new(
        file.path,
        capture_count: 36,
        target_width: 640,
        target_height: 400,
        quality: 3
      ).generate

      base_filename = capture.video.filename.to_s

      ActiveRecord::Base.transaction do
        capture.small_thumbnails.purge
        capture.large_thumbnails.purge

        small_thumbnails.each_with_index do |thumbnail_file, index|
          data = File.binread(thumbnail_file.path)
          capture.small_thumbnails.attach(
            io: StringIO.new(data),
            filename: "thumb_#{index + 1}_#{base_filename}.jpg",
            content_type: "image/jpeg"
          )
        end

        large_thumbnails.each_with_index do |thumbnail_file, index|
          data = File.binread(thumbnail_file.path)
          capture.large_thumbnails.attach(
            io: StringIO.new(data),
            filename: "large_thumb_#{index + 1}_#{base_filename}.jpg",
            content_type: "image/jpeg"
          )
        end
      end
    end
  ensure
    small_thumbnails.each { |file| file.close! if file.respond_to?(:close!) }
    large_thumbnails.each { |file| file.close! if file.respond_to?(:close!) }
  end
end
