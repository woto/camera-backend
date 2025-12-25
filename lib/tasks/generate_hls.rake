namespace :captures do
  desc "Enqueue HLS generation for captures without manifest. Optionally set LIMIT env var to limit number enqueued."
  task generate_hls: :environment do
    limit = ENV["LIMIT"]&.to_i

    scope = Capture.joins(:video_attachment).where(hls_manifest_path: nil)
    scope = scope.limit(limit) if limit && limit > 0

    puts "Enqueuing HLS generation for #{scope.count} captures..."
    scope.find_each do |capture|
      GenerateHlsJob.perform_now(capture.id)
      puts "Enqueued Capture ##{capture.id}"
    end
    puts "Done."
  end
end
