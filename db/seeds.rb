# Clear existing data to avoid duplicates (optional, but often helpful for seeds)
puts "Cleaning database..."
Capture.destroy_all
Event.destroy_all
User.destroy_all

# Create a default user
puts "Creating user..."
User.create!(username: "admin", password: "password")

# Create events and captures
puts "Creating events and captures..."

# Create 25 events to test pagination (default is 20 per page)
25.times do |i|
  captured_at = (24 - i).hours.ago
  event = Event.create!(captured_at: captured_at)

  # Each event has 1-3 captures
  rand(1..3).times do |j|
    capture = event.captures.build
    
    # Attach a dummy video
    capture.video.attach(
      io: File.open(Rails.root.join("db/seed_assets/video.mp4")),
      filename: "video_#{i}_#{j}.mp4",
      content_type: "video/mp4"
    )

    # Attach 1-2 thumbnails
    rand(1..2).times do |k|
      thumb_file = "thumb#{rand(1..3)}.jpg"
      capture.thumbnails.attach(
        io: File.open(Rails.root.join("db/seed_assets", thumb_file)),
        filename: "thumb_#{i}_#{j}_#{k}.jpg",
        content_type: "image/jpeg"
      )
    end
    capture.save!
  end
end

puts "Seed completed successfully!"
puts "Created #{User.count} user(s)"
puts "Created #{Event.count} event(s)"
puts "Created #{Capture.count} capture(s)"
