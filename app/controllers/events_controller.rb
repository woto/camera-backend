require "open3"

class EventsController < ApplicationController
  skip_before_action :require_login, only: [ :index, :show, :latest ]
  before_action :set_event, only: [ :show, :destroy, :set_base, :sync_offsets, :set_rotation, :generate_hls, :generate_hls_all, :set_visibility ]
  helper_method :room_param

  def index
    @events = scoped_events.order(captured_at: :desc).includes(captures: { thumbnails_attachments: :blob }).page(params[:page]).per(12)
  end

  def show
    @captures = @event.captures.with_attached_thumbnails.with_attached_video.order(created_at: :asc)
    backfill_rotations!(@captures)
    scope = scoped_events
    @next_event = scope.where("captured_at > ?", @event.captured_at).order(captured_at: :asc).first
    @prev_event = scope.where("captured_at < ?", @event.captured_at).order(captured_at: :desc).first
    assign_switcher_data!(@captures)

    respond_to do |format|
      format.html
      format.json { render json: thumbnails_payload(@event, @captures) }
    end
  end

  def latest
    @event = scoped_events.order(captured_at: :desc).first
    unless @event
      return respond_to do |format|
        format.html { redirect_to events_path, alert: "Событий пока нет." }
        format.json { render json: { event_id: nil, thumbnails: [] }, status: :ok }
      end
    end

    @captures = @event.captures.with_attached_thumbnails.with_attached_video.order(created_at: :desc)
    assign_switcher_data!(@captures)

    respond_to do |format|
      format.html { render :show }
      format.json { render json: thumbnails_payload(@event, @captures) }
    end
  end

  def destroy
    @older_event = Event.where("captured_at < ?", @event.captured_at).order(captured_at: :desc).first

    if @event.destroy
      if @older_event
        redirect_to event_path(@older_event), notice: "Событие удалено. Показано более старое событие."
      else
        redirect_to events_path, notice: "Событие удалено."
      end
    else
      redirect_to event_path(@event), alert: "Не удалось удалить событие."
    end
  end

  def set_base
    capture = @event.captures.find(params[:capture_id])

    ActiveRecord::Base.transaction do
      @event.update!(base_capture: capture)
      # Mark offsets relative to this base; preserve existing offset_seconds.
      @event.captures.update_all(offset_base_capture_id: capture.id)
      capture.update!(offset_seconds: 0.0)
    end

    redirect_to event_path(@event), notice: "Базовый ролик установлен (Capture ##{capture.id})."
  rescue => e
    redirect_to event_path(@event), alert: "Не удалось установить базовый ролик: #{e.message}"
  end

  def sync_offsets
    capture = params[:capture_id].present? ? @event.captures.find(params[:capture_id]) : (@event.base_capture || @event.captures.first)
    unless capture
      return redirect_to event_path(@event), alert: "Нет роликов для синхронизации."
    end

    result = compute_offsets_for_event(@event, capture, sync_params)
    notice = "Смещения обновлены: #{result[:updated]} шт."
    notice += " (пропущено: #{result[:skipped].join(", ")})" if result[:skipped].any?

    redirect_to event_path(@event), notice: notice
  rescue => e
    redirect_to event_path(@event), alert: "Ошибка синхронизации: #{e.message}"
  end

  def set_rotation
    capture = @event.captures.find(params[:capture_id])
    rotation = params[:rotation].to_i
    allowed = [ 0, 90, 180, 270 ]
    unless allowed.include?(rotation)
      return redirect_to event_path(@event), alert: "Недопустимый угол (разрешены: #{allowed.join(", ")})"
    end

    capture.update!(rotation_degrees: rotation)
    redirect_to event_path(@event), notice: "Ориентация Capture ##{capture.id} установлена на #{rotation}°."
  rescue => e
    redirect_to event_path(@event), alert: "Не удалось обновить ориентацию: #{e.message}"
  end

  def generate_hls
    capture = @event.captures.find(params[:capture_id])

    unless capture.video.attached?
      return redirect_to event_path(@event), alert: "У Capture ##{capture.id} нет прикреплённого видео."
    end

    if capture.hls_processing?
      return redirect_to event_path(@event), notice: "Для Capture ##{capture.id} уже идёт обработка HLS."
    end

    GenerateHlsJob.perform_later(capture.id)
    redirect_to event_path(@event), notice: "Запущена генерация HLS для Capture ##{capture.id}."
  rescue => e
    redirect_to event_path(@event), alert: "Не удалось запустить генерацию HLS: #{e.message}"
  end

  def generate_hls_all
    captures = @event.captures.joins(:video_attachment).to_a

    if captures.empty?
      return redirect_to event_path(@event), notice: "Нет роликов, требующих генерации HLS."
    end

    captures.each do |capture|
      public_dir = Rails.root.join("public", "hls", "capture-#{capture.id}")
      FileUtils.rm_rf(public_dir) if Dir.exist?(public_dir)
      capture.update_columns(
        hls_manifest_path: nil,
        hls_processed_at: nil,
        hls_processing: false,
        hls_error: nil
      )
      GenerateHlsJob.perform_later(capture.id)
    end

    redirect_to event_path(@event), notice: "Запущена генерация HLS для #{captures.count} роликов."
  rescue => e
    redirect_to event_path(@event), alert: "Не удалось запустить массовую генерацию HLS: #{e.message}"
  end

  def set_visibility
    hidden = ActiveModel::Type::Boolean.new.cast(params[:hidden])

    if @event.update(hidden: hidden)
      status_text = hidden ? "скрыто" : "открыто"
      redirect_back fallback_location: event_path(@event), notice: "Событие теперь #{status_text}."
    else
      redirect_back fallback_location: event_path(@event), alert: "Не удалось обновить видимость события."
    end
  end

  private

  def thumbnails_payload(event, captures)
    {
      event_id: event.id,
      captured_at: event.captured_at&.iso8601,
      room: event.room&.name,
      thumbnails: interleaved_thumbnails(captures).map do |capture, thumb|
        {
          capture_id: capture.id,
          offset_seconds: capture.offset_seconds&.to_f,
          filename: thumb.filename.to_s,
          byte_size: thumb.byte_size,
          content_type: thumb.content_type,
          url: url_for(thumb)
        }
      end
    }
  end

  def interleaved_thumbnails(captures)
    attachments_by_capture = captures.map { |capture| [ capture, capture.thumbnails.attachments ] }
    return [] if attachments_by_capture.empty?

    max_thumbs = attachments_by_capture.map { |(_, thumbs)| thumbs.size }.max
    max_thumbs.times.flat_map do |index|
      attachments_by_capture.filter_map do |capture, thumbs|
        thumb = thumbs[index]
        [ capture, thumb ] if thumb
      end
    end
  end

  def set_event
    @event = scoped_events.find_by(id: params[:id])
    return if @event

    redirect_to events_path, alert: "Событие не найдено."
  end

  def sync_params
    params.permit(:analyze_duration, :sample_rate)
  end

  def compute_offsets_for_event(event, base_capture, options = {})
    files = [ base_capture ] + event.captures.order(:created_at).where.not(id: base_capture.id).to_a
    if files.empty?
      raise "Нет файлов для анализа"
    end

    paths_map = files.index_with { |cap| video_path_for(cap) }
    analyze_duration = options[:analyze_duration].presence || "90"
    sample_rate = options[:sample_rate].presence || "8000"

    cmd = [
      Rails.root.join("bin/camera.sh").to_s,
      "-d", analyze_duration.to_s,
      "-r", sample_rate.to_s,
      *paths_map.values
    ]

    stdout_str, stderr_str, status = Open3.capture3(*cmd)
    raise "camera.sh failed: #{stderr_str.presence || stdout_str}" unless status.success?

    json = JSON.parse(stdout_str)
    offsets_by_path = json["files"].to_h { |entry| [ entry["file"], entry["offset_sec"] ] }

    updated = 0
    skipped = []
    ActiveRecord::Base.transaction do
      event.update!(base_capture: base_capture)
      event.captures.update_all(offset_base_capture_id: base_capture.id)

      paths_map.each do |cap, path|
        offset = offsets_by_path[path]
        if offset.nil?
          skipped << "Capture ##{cap.id}"
          next
        end
        cap.update!(offset_seconds: offset.to_f, offset_base_capture_id: base_capture.id)
        updated += 1
      end
    end

    { updated: updated, skipped: skipped }
  end

  def video_path_for(capture)
    blob = capture.video&.blob
    raise "Capture ##{capture.id} без видео" unless blob

    service = ActiveStorage::Blob.service
    if service.respond_to?(:path_for)
      service.path_for(blob.key)
    else
      service.send(:path_for, blob.key)
    end
  end

  def backfill_rotations!(captures)
    captures.each do |capture|
      next unless capture.video.attached?
      next unless capture.rotation_degrees.nil?

      path = video_path_for(capture)
      rotation = VideoMetadata.rotation_degrees(path)
      capture.update_columns(rotation_degrees: rotation) # avoid callbacks; lightweight backfill
    rescue => e
      Rails.logger.warn("[EventsController#show] rotation backfill failed for Capture ##{capture.id}: #{e.message}")
    end
  end

  def assign_switcher_data!(captures)
    @base_capture = @event.base_capture || captures.first
    @switcher_captures = captures.filter_map do |capture|
      next unless capture.video.attached?
      offset = capture.offset_seconds&.to_f || 0.0
      rotation = capture.rotation_degrees || 0
      {
        id: capture.id,
        offset_seconds: offset,
        url: capture.hls_manifest_path.present? ? "#{request.base_url}#{capture.hls_manifest_path}" : url_for(capture.video),
        label: "Запись ##{capture.id}",
        rotation_degrees: rotation,
        hls: {
          manifest: capture.hls_manifest_path.present? ? "#{request.base_url}#{capture.hls_manifest_path}" : nil,
          processing: capture.hls_processing?,
          error: capture.hls_error
        }
      }
    end
  end

  def scoped_events
    events_scope
  end

  def room_param
    params[:room].presence || current_room_name
  end
end
