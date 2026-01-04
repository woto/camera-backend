require "json"
require "open3"
require "tempfile"

# Builds thumbnail images at evenly spaced timestamps in a video.
class ThumbnailGenerator
  class Error < StandardError; end

  def initialize(source_path, capture_count:, target_width:, target_height:, quality:, fit_mode: :fill, rotate_to_fit: false)
    @source_path = source_path
    @capture_count = capture_count
    @target_width = target_width
    @target_height = target_height
    @quality = quality
    @fit_mode = fit_mode
    @rotate_to_fit = rotate_to_fit
  end

  def generate
    duration = video_duration
    raise Error, "Unable to determine video duration" if duration.nil? || duration <= 0

    capture_points(duration).map.with_index(1) do |second_mark, index|
      generate_thumbnail(second_mark, index)
    end
  end

  private

  attr_reader :source_path, :capture_count, :target_width, :target_height, :quality, :fit_mode, :rotate_to_fit

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
    resize_filter = build_resize_filter
    rotate_filter = rotate_to_fit? ? "transpose=1" : nil
    filters = [rotate_filter, resize_filter].compact.join(",")

    cmd = [
      "ffmpeg", "-y",
      "-ss", second_mark.to_s,
      "-i", source_path,
      "-vframes", "1",
      "-map_metadata", "-1", # strip metadata that some decoders choke on
      "-vf", filters,
      "-pix_fmt", "yuv420p", # baseline-friendly for embedded JPEG decoders
      "-q:v", quality.to_s, # smaller payload to reduce memory pressure
      tempfile.path
    ]

    stdout, stderr, status = Open3.capture3(*cmd)
    raise Error, stderr.presence || stdout.presence || "FFmpeg exited with an error" unless status.success?

    tempfile
  end

  def build_resize_filter
    case fit_mode
    when :contain
      "scale=#{target_width}:#{target_height}:force_original_aspect_ratio=decrease,pad=#{target_width}:#{target_height}:(ow-iw)/2:(oh-ih)/2"
    else
      # Fill the frame and crop to avoid black bars.
      "scale=#{target_width}:#{target_height}:force_original_aspect_ratio=increase,crop=#{target_width}:#{target_height}"
    end
  end

  def rotate_to_fit?
    return false unless rotate_to_fit

    dimensions = display_dimensions
    return false unless dimensions

    original_scale = scale_for(dimensions[:width], dimensions[:height])
    rotated_scale = scale_for(dimensions[:height], dimensions[:width])
    rotated_scale > original_scale + 0.0001
  end

  def display_dimensions
    info = video_stream_info
    width = info[:width]
    height = info[:height]
    return unless width && height

    rotation = info[:rotation].to_i % 360
    if rotation == 90 || rotation == 270
      { width: height.to_f, height: width.to_f }
    else
      { width: width.to_f, height: height.to_f }
    end
  end

  def scale_for(width, height)
    return 0.0 if width.to_f <= 0.0 || height.to_f <= 0.0

    [target_width / width.to_f, target_height / height.to_f].min
  end

  def video_stream_info
    stdout, status = Open3.capture2(
      "ffprobe",
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height:stream_tags=rotate",
      "-of", "json",
      source_path
    )
    return {} unless status.success?

    data = JSON.parse(stdout)
    stream = data["streams"]&.first || {}
    {
      width: stream["width"],
      height: stream["height"],
      rotation: stream.dig("tags", "rotate")
    }
  rescue JSON::ParserError
    {}
  end
end
