require "json"
require "open3"

class VideoMetadata
  def initialize(capture)
    @capture = capture
  end

  def call
    return { error: "Video not attached" } unless capture.video.attached?

    capture.video.open do |file|
      stdout, stderr, status = Open3.capture3(
        "ffprobe",
        "-v", "error",
        "-show_format",
        "-show_streams",
        "-of", "json",
        file.path
      )

      return { error: stderr.presence || "ffprobe failed" } unless status.success?

      JSON.parse(stdout)
    end
  rescue JSON::ParserError => e
    { error: "Invalid JSON from ffprobe: #{e.message}" }
  rescue => e
    { error: e.message }
  end

  private

  attr_reader :capture
end
