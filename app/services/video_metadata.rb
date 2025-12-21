require "open3"
require "json"

class VideoMetadata
  def self.rotation_degrees(path)
    cmd = [
      "ffprobe", "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream_tags=rotate:stream_side_data_list=side_data_type,rotation",
      "-print_format", "json",
      path.to_s
    ]

    stdout, stderr, status = Open3.capture3(*cmd)
    return 0 unless status.success?

    json = JSON.parse(stdout) rescue {}
    stream = json["streams"]&.first || {}
    rotate_tag = stream.dig("tags", "rotate")
    side_data = stream["side_data_list"]&.find do |sd|
      sd["side_data_type"] == "Display Matrix" && sd["rotation"]
    end
    rotation = side_data&.dig("rotation") || rotate_tag

    normalize_rotation(rotation)
  rescue => e
    Rails.logger.warn("[VideoMetadata] rotation parse error: #{e.message}")
    0
  end

  def self.normalize_rotation(value)
    deg = Float(value)
    normalized = deg % 360
    normalized.negative? ? (normalized + 360).round : normalized.round
  rescue
    0
  end
end
