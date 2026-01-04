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
    rotate_filter = rotation_filter
    filters = [rotate_filter, resize_filter].compact.join(",")
    autorotate_flag = rotate_filter ? "-noautorotate" : nil

    cmd = [
      "ffmpeg", "-y",
      autorotate_flag,
      "-ss", second_mark.to_s,
      "-i", source_path,
      "-vframes", "1",
      "-map_metadata", "-1", # strip metadata that some decoders choke on
      "-vf", filters,
      "-pix_fmt", "yuv420p", # baseline-friendly for embedded JPEG decoders
      "-q:v", quality.to_s, # smaller payload to reduce memory pressure
      tempfile.path
    ]

    stdout, stderr, status = Open3.capture3(*cmd.compact)
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

  def rotation_filter
    return unless rotate_to_fit

    rotation = video_stream_rotation
    return unless rotation

    case rotation
    when 90
      "transpose=1"
    when 180
      "hflip,vflip"
    when 270
      "transpose=2"
    end
  end

  def video_stream_rotation
    info = video_stream_info
    rotation = info[:rotation]
    return if rotation.nil?

    rotation.to_i % 360
  end

  def video_stream_info
    stdout, status = Open3.capture2(
      "ffprobe",
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=width,height:stream_tags=rotate:stream_side_data=rotation,side_data_type",
      "-of", "json",
      source_path
    )
    return {} unless status.success?

    data = JSON.parse(stdout)
    stream = data["streams"]&.first || {}
    rotation = stream.dig("tags", "rotate")
    rotation ||= stream["side_data_list"]&.find { |item| item["rotation"] }&.dig("rotation")

    {
      width: stream["width"],
      height: stream["height"],
      rotation: rotation
    }
  rescue JSON::ParserError
    {}
  end
end
