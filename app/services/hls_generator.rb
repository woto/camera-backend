require "open3"
require "fileutils"

class HlsGenerator
  # Generate HLS files for a capture and publish them under public/hls/capture-<id>/
  # Returns public relative path to manifest (e.g. "/hls/capture-123/master.m3u8")
  class Error < StandardError; end

  def initialize(capture)
    @capture = capture
  end

  def generate!
    raise Error, "Capture has no video" unless @capture.video.attached?

    @capture.update!(hls_processing: true, hls_error: nil)

    Dir.mktmpdir("hls-gen-") do |tmpdir|
      src = source_path_for(@capture.video.blob)
      raise Error, "Failed to locate source file" unless src && File.exist?(src)

      out_dir = File.join(tmpdir, "out")
      FileUtils.mkdir_p(out_dir)

      master = File.join(out_dir, "master.m3u8")

      cmd = [
        "ffmpeg", "-hide_banner", "-y",
        "-fflags", "+genpts",
        "-i", src,

        # video
        "-vf", "scale='min(1280,iw)':'-2'",
        "-vsync", "cfr", "-r", "30",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-profile:v", "main",
        "-level:v", "4.0",
        "-preset", "veryfast",
        "-crf", "23",
        "-maxrate", "3000k",
        "-bufsize", "6000k",
        "-g", "180",
        "-keyint_min", "180",
        "-sc_threshold", "0",
        "-force_key_frames", "expr:gte(t,n_forced*6)",
        "-x264-params", "nal-hrd=vbr:force-cfr=1",

        # audio
        "-c:a", "aac",
        "-b:a", "128k",
        "-af", "aresample=async=1:first_pts=0",

        # hls
        "-hls_time", "6",
        "-hls_list_size", "0",
        "-hls_flags", "independent_segments",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", File.join(out_dir, "segment_%03d.ts"),
        master
      ]

      stdout_str, stderr_str, status = Open3.capture3(*cmd)
      unless status.success? && File.exist?(master)
        raise Error, "FFmpeg failed: #{stderr_str.presence || stdout_str.presence || 'unknown error'}"
      end

      # Move to public/hls/capture-<id>
      public_dir = Rails.root.join("public", "hls", "capture-#{@capture.id}")
      FileUtils.rm_rf(public_dir) if Dir.exist?(public_dir)
      FileUtils.mkdir_p(public_dir)
      FileUtils.cp_r(Dir.glob(File.join(out_dir, "*")), public_dir)

      manifest_rel = "/hls/capture-#{@capture.id}/master.m3u8"
      @capture.update!(hls_manifest_path: manifest_rel, hls_processed_at: Time.current, hls_processing: false, hls_error: nil)

      return manifest_rel
    end
  rescue => e
    @capture.update!(hls_processing: false, hls_error: e.message)
    raise
  end

  private

  # Attempt to find local file path for a blob (works with Disk service)
  def source_path_for(blob)
    service = ActiveStorage::Blob.service
    if service.respond_to?(:path_for)
      service.path_for(blob.key)
    else
      # older/private API fallback
      service.send(:path_for, blob.key)
    end
  rescue => _e
    # As fallback, download blob to tempfile
    tmp = Tempfile.new([ "capture-src", File.extname(blob.filename.to_s) ])
    tmp.binmode
    blob.download { |chunk| tmp.write(chunk) }
    tmp.rewind
    tmp.path
  end
end
