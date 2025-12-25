namespace :captures do
  desc "Sync offsets (timings) for all events. Optional EVENT_ID, LIMIT, ANALYZE_DURATION, SAMPLE_RATE env vars."
  task sync_offsets: :environment do
    event_id = ENV["EVENT_ID"]&.to_i
    limit = ENV["LIMIT"]&.to_i
    analyze_duration = ENV["ANALYZE_DURATION"]
    sample_rate = ENV["SAMPLE_RATE"]

    scope = Event.order(:captured_at)
    scope = scope.where(id: event_id) if event_id && event_id > 0
    scope = scope.limit(limit) if limit && limit > 0

    total = scope.count
    puts "Syncing offsets for #{total} event(s)..."

    scope.find_each do |event|
      base_capture = event.base_capture || event.captures.order(:created_at).first
      unless base_capture
        puts "Event ##{event.id}: skipped (no captures)"
        next
      end

      begin
        result = OffsetsSyncer.new(
          event,
          base_capture: base_capture,
          analyze_duration: analyze_duration,
          sample_rate: sample_rate
        ).call
        message = "Event ##{event.id}: updated #{result[:updated]}"
        message += " (skipped: #{result[:skipped].join(", ")})" if result[:skipped].any?
        puts message
      rescue => e
        puts "Event ##{event.id}: failed (#{e.message})"
      end
    end

    puts "Done."
  end
end
