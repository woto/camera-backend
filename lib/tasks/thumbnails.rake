namespace :captures do
  desc "Regenerate small and large thumbnails. Optional ALL, EVENT_ID, CAPTURE_ID, LIMIT env vars."
  task regenerate_thumbnails: :environment do
    event_id = ENV["EVENT_ID"]&.to_i
    capture_id = ENV["CAPTURE_ID"]&.to_i
    limit = ENV["LIMIT"]&.to_i
    all = %w[1 true yes].include?(ENV["ALL"].to_s.downcase)

    if !all && !(event_id && event_id > 0) && !(capture_id && capture_id > 0) && !(limit && limit > 0)
      puts "Usage: bundle exec rake captures:regenerate_thumbnails ALL=true"
      puts "   or: bundle exec rake captures:regenerate_thumbnails EVENT_ID=123"
      puts "   or: bundle exec rake captures:regenerate_thumbnails CAPTURE_ID=456"
      puts "   or: bundle exec rake captures:regenerate_thumbnails LIMIT=10"
      exit 1
    end

    scope = Capture.joins(:video_attachment)
    scope = scope.where(event_id: event_id) if !all && event_id && event_id > 0
    scope = scope.where(id: capture_id) if !all && capture_id && capture_id > 0
    scope = scope.limit(limit) if limit && limit > 0
    processed = 0
    errors = 0

    scope.find_each do |capture|
      processed += 1
      puts "Regenerating Capture##{capture.id} (event #{capture.event_id})"

      small_thumbnails = []
      large_thumbnails = []

      capture.video.open do |file|
        small_thumbnails = ThumbnailGenerator.new(
          file.path,
          capture_count: 5,
          target_width: 170,
          target_height: 320,
          quality: 7
        ).generate

        large_thumbnails = ThumbnailGenerator.new(
          file.path,
          capture_count: 12,
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
    rescue => e
      errors += 1
      warn "Failed Capture##{capture.id}: #{e.message}"
    ensure
      small_thumbnails.each { |file| file.close! if file.respond_to?(:close!) }
      large_thumbnails.each { |file| file.close! if file.respond_to?(:close!) }
    end

    puts "Done. processed=#{processed} errors=#{errors}"
  end
end
