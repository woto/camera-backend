require "open3"
require "tempfile"

# Builds thumbnail images at evenly spaced timestamps in a video.
class ThumbnailGenerator
  class Error < StandardError; end

  def initialize(source_path, capture_count:, target_width:, target_height:, quality:)
    @source_path = source_path
    @capture_count = capture_count
    @target_width = target_width
    @target_height = target_height
    @quality = quality
  end

  def generate
    duration = video_duration
    raise Error, "Unable to determine video duration" if duration.nil? || duration <= 0

    capture_points(duration).map.with_index(1) do |second_mark, index|
      generate_thumbnail(second_mark, index)
    end
  end

  private

  attr_reader :source_path, :capture_count, :target_width, :target_height, :quality

  def video_duration
    stdout, status = Open3.capture2("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", source_path)
    return unless status.success?

    Float(stdout.strip)
  rescue ArgumentError
    nil
  end

  # Evenly space thumbnails across the duration.
  def capture_points(duration)
    stride = duration / (capture_count + 1)
    (1..capture_count).map { |index| (stride * index).round(3) }
  end

  def generate_thumbnail(second_mark, index)
    tempfile = Tempfile.new(["thumbnail_#{index}", ".jpg"])
    tempfile.binmode
    resize_filter = "scale=#{target_width}:#{target_height}:force_original_aspect_ratio=decrease,pad=#{target_width}:#{target_height}:(#{target_width}-iw)/2:(#{target_height}-ih)/2"

    cmd = [
      "ffmpeg", "-y",
      "-ss", second_mark.to_s,
      "-i", source_path,
      "-vframes", "1",
      "-map_metadata", "-1", # strip metadata that some decoders choke on
      "-vf", resize_filter,
      "-pix_fmt", "yuv420p", # baseline-friendly for embedded JPEG decoders
      "-q:v", quality.to_s, # smaller payload to reduce memory pressure
      tempfile.path
    ]

    stdout, stderr, status = Open3.capture3(*cmd)
    raise Error, stderr.presence || stdout.presence || "FFmpeg exited with an error" unless status.success?

    tempfile
  end
end
