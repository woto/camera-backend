namespace :captures do
  desc "Generate HLS for captures with videos. Optional EVENT_ID, CAPTURE_ID, LIMIT env vars."
  task generate_hls: :environment do
    event_id = ENV["EVENT_ID"]&.to_i
    capture_id = ENV["CAPTURE_ID"]&.to_i
    limit = ENV["LIMIT"]&.to_i

    scope = Capture.joins(:video_attachment)
    scope = scope.where(event_id: event_id) if event_id && event_id > 0
    scope = scope.where(id: capture_id) if capture_id && capture_id > 0
    scope = scope.limit(limit) if limit && limit > 0

    puts "Enqueuing HLS generation for #{scope.count} captures..."
    scope.find_each do |capture|
      GenerateHlsJob.perform_now(capture.id)
      puts "Enqueued Capture ##{capture.id}"
    end
    puts "Done."
  end
end
