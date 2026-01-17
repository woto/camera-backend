namespace :captures do
  desc "Generate HLS for captures with videos. Optional EVENT_ID, CAPTURE_ID, ROOM_ID, LIMIT env vars."
  task generate_hls: :environment do
    event_id = ENV["EVENT_ID"]&.to_i
    capture_id = ENV["CAPTURE_ID"]&.to_i
    room_id = ENV["ROOM_ID"]&.to_i
    limit = ENV["LIMIT"]&.to_i

    scope = Capture.joins(:video_attachment)
    scope = scope.where(event_id: event_id) if event_id && event_id > 0
    scope = scope.where(id: capture_id) if capture_id && capture_id > 0
    scope = scope.where(room_id: room_id) if room_id && room_id > 0
    scope = scope.limit(limit) if limit && limit > 0

    total = scope.count
    processed = 0
    errors = 0
    puts "Generating HLS for #{total} capture(s)..."
    scope.find_each do |capture|
      processed += 1
      puts "Generating Capture##{capture.id} (event #{capture.event_id})"
      GenerateHlsJob.perform_now(capture.id)
    rescue => e
      errors += 1
      warn "Failed Capture##{capture.id}: #{e.message}"
    end
    puts "Done. processed=#{processed} errors=#{errors}"
  end
end
