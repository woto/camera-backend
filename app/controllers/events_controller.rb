class EventsController < ApplicationController
  skip_before_action :require_login, only: [ :index, :show, :latest, :set_visibility, :destroy ]
  before_action :set_event, only: [ :show, :destroy, :set_base, :sync_offsets, :generate_hls, :generate_hls_all, :regenerate_thumbnails, :set_visibility ]
  helper_method :room_param

  def index
    @selected_date = parsed_date
    @selected_event_id = params[:selected].presence
    scoped = scoped_events
    if @selected_date
      scoped = scoped.where(captured_at: @selected_date.beginning_of_day..@selected_date.end_of_day)
    end
    @events = scoped.order(captured_at: :desc).includes(captures: [ { small_thumbnails_attachments: :blob }, { large_thumbnails_attachments: :blob } ]).page(params[:page]).per(12)

    # If a selected event was requested but is not on the current page, redirect to the page
    # that contains it so the selected event will be visible in the list. Only perform this
    # automatic redirect when the request did not explicitly ask for a `page` (so that
    # users intentionally navigating pages are not forced back to the selected event's page).
    if @selected_event_id.present? && params[:page].blank?
      selected_event = scoped.find_by(id: @selected_event_id)
      if selected_event && !@events.map(&:id).include?(selected_event.id)
        # Compute page for selected event in the same scope and ordering
        ids = scoped.order(captured_at: :desc).pluck(:id)
        index = ids.index(selected_event.id)
        if index
          per = @events.limit_value
          page = (index / per) + 1
          redirect_params = { page: page, selected: @selected_event_id }
          redirect_params[:room] = params[:room] if params[:room].present?
          redirect_params[:date] = params[:date] if params[:date].present?
          redirect_to events_path(redirect_params)
        end
      end
    end
  end

  def show
    force_html_for_non_event_stream!
    @captures = @event.captures.with_attached_small_thumbnails.with_attached_large_thumbnails.with_attached_video.order(created_at: :asc)
    scope = scoped_events
    @next_event = scope.where("captured_at > ?", @event.captured_at).order(captured_at: :asc).first
    @prev_event = scope.where("captured_at < ?", @event.captured_at).order(captured_at: :desc).first
    assign_switcher_data!(@captures)
    assign_share_metadata!(@captures)
    assign_admin_metadata!(@captures)

    respond_to do |format|
      format.html
      format.turbo_stream
      format.json { render json: thumbnails_payload(@event, @captures) }
    end
  end

  def latest
    force_html_for_non_event_stream!
    @event = scoped_events.order(captured_at: :desc).first
    unless @event
      return respond_to do |format|
        format.html { redirect_to events_path, alert: t("events.index.empty") }
        format.json { render json: { event_id: nil, thumbnails: [] }, status: :ok }
      end
    end

    @captures = @event.captures.with_attached_small_thumbnails.with_attached_large_thumbnails.with_attached_video.order(created_at: :desc)
    assign_switcher_data!(@captures)
    assign_share_metadata!(@captures)
    assign_admin_metadata!(@captures)
    @prev_event = scoped_events.where("captured_at < ?", @event.captured_at).order(captured_at: :desc).first
    @from_latest = true

    respond_to do |format|
      format.html { render :show }
      format.turbo_stream { render :show }
      format.json { render json: thumbnails_payload(@event, @captures) }
    end
  end

  def destroy
    unless current_room
      return redirect_back fallback_location: event_path(@event), alert: t("events.permissions.room_required_delete")
    end

    unless same_room_as_event?
      return redirect_back fallback_location: event_path(@event), alert: t("events.permissions.room_mismatch_delete")
    end

    @older_event = Event.where("captured_at < ?", @event.captured_at).order(captured_at: :desc).first

    if @event.destroy
      if @older_event
        redirect_to event_path(@older_event), notice: t("events.notices.deleted_showing_older")
      else
        redirect_to events_path, notice: t("events.notices.deleted")
      end
    else
      redirect_to event_path(@event), alert: t("events.errors.delete_failed")
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

    redirect_to event_path(@event), notice: t("events.notices.base_set", id: capture.id)
  rescue => e
    redirect_to event_path(@event), alert: t("events.errors.base_set_failed", error: e.message)
  end

  def sync_offsets
    capture = params[:capture_id].present? ? @event.captures.find(params[:capture_id]) : (@event.base_capture || @event.captures.first)
    unless capture
      return redirect_to event_path(@event), alert: t("events.errors.no_captures_to_sync")
    end

    result = OffsetsSyncer.new(
      @event,
      base_capture: capture,
      analyze_duration: sync_params[:analyze_duration],
      sample_rate: sync_params[:sample_rate]
    ).call
    notice = t("events.notices.offsets_updated", count: result[:updated])
    notice += " (#{t("events.notices.offsets_skipped", ids: result[:skipped].join(", "))})" if result[:skipped].any?

    redirect_to event_path(@event), notice: notice
  rescue => e
    redirect_to event_path(@event), alert: t("events.errors.sync_failed", error: e.message)
  end

  def generate_hls
    capture = @event.captures.find(params[:capture_id])

    unless capture.video.attached?
      return redirect_to event_path(@event), alert: t("events.errors.no_video", id: capture.id)
    end

    if capture.hls_processing?
      return redirect_to event_path(@event), notice: t("events.notices.hls_already_processing", id: capture.id)
    end

    GenerateHlsJob.perform_later(capture.id)
    redirect_to event_path(@event), notice: t("events.notices.hls_started", id: capture.id)
  rescue => e
    redirect_to event_path(@event), alert: t("events.errors.hls_start_failed", error: e.message)
  end

  def generate_hls_all
    captures = @event.captures.joins(:video_attachment).to_a

    if captures.empty?
      return redirect_to event_path(@event), notice: t("events.notices.hls_none")
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

    redirect_to event_path(@event), notice: t("events.notices.hls_bulk_started", count: captures.count)
  rescue => e
    redirect_to event_path(@event), alert: t("events.errors.hls_bulk_failed", error: e.message)
  end

  def regenerate_thumbnails
    capture_id = params[:capture_id].presence
    if capture_id
      RegenerateThumbnailsJob.perform_later(capture_id: capture_id)
      redirect_to event_path(@event), notice: t("admin.thumbnails.regenerate_capture_started", id: capture_id)
    else
      RegenerateThumbnailsJob.perform_later(event_id: @event.id)
      redirect_to event_path(@event), notice: t("admin.thumbnails.regenerate_started")
    end
  rescue => e
    redirect_to event_path(@event), alert: t("admin.thumbnails.regenerate_failed", error: e.message)
  end

  def set_visibility
    unless current_room
      return redirect_back fallback_location: event_path(@event), alert: t("events.permissions.room_required_visibility")
    end

    unless same_room_as_event?
      return redirect_back fallback_location: event_path(@event), alert: t("events.permissions.room_mismatch_visibility")
    end

    hidden = ActiveModel::Type::Boolean.new.cast(params[:hidden])

    if @event.update(hidden: hidden)
      status_text = hidden ? t("events.labels.hidden") : t("events.labels.published")
      redirect_back fallback_location: event_path(@event), notice: t("events.notices.visibility_changed", status: status_text)
    else
      redirect_back fallback_location: event_path(@event), alert: t("events.errors.visibility_failed")
    end
  end

  private

  def force_html_for_non_event_stream!
    return unless request.format.turbo_stream?
    return if request.headers["X-Event-Stream"] == "1"

    request.format = :html
  end

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
    attachments_by_capture = captures.map { |capture| [ capture, capture.small_thumbnails.attachments ] }
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

    redirect_to events_path, alert: t("events.errors.not_found")
  end

  def sync_params
    params.permit(:analyze_duration, :sample_rate)
  end

  def assign_switcher_data!(captures)
    @base_capture = @event.base_capture || captures.first
    @switcher_captures = captures.filter_map do |capture|
      next unless capture.video.attached?
      offset = capture.offset_seconds&.to_f || 0.0
      large_thumbs = if capture.large_thumbnails.attached?
        capture.large_thumbnails
      else
        capture.small_thumbnails
      end

      {
        id: capture.id,
        offset_seconds: offset,
        url: capture.hls_manifest_path.present? ? "#{request.base_url}#{capture.hls_manifest_path}" : url_for(capture.video),
        label: t("events.labels.capture", id: capture.id),
        large_thumbnails: large_thumbs.map { |thumb| url_for(thumb) },
        hls: {
          manifest: capture.hls_manifest_path.present? ? "#{request.base_url}#{capture.hls_manifest_path}" : nil,
          processing: capture.hls_processing?,
          error: capture.hls_error
        }
      }
    end
  end


  def assign_share_metadata!(captures)
    @meta_title = t("events.meta.title", id: @event.id)
    @meta_description = t("events.meta.description", time: I18n.l(@event.captured_at, format: :long))
    @meta_url = request.original_url

    large_thumb = captures.find { |capture| capture.large_thumbnails.attached? }&.large_thumbnails&.first
    fallback_thumb = captures.find { |capture| capture.small_thumbnails.attached? }&.small_thumbnails&.first
    @meta_image_url = if large_thumb
      url_for(large_thumb)
    elsif fallback_thumb
      url_for(fallback_thumb)
    else
      "#{request.base_url}/icon.png"
    end
  end

  def assign_admin_metadata!(captures)
    return unless current_user
    return unless request.format.html? || request.format.turbo_stream?

    @metadata_by_capture_id = captures.each_with_object({}) do |capture, memo|
      memo[capture.id] = VideoMetadata.new(capture).call
    end
  end

  def scoped_events
    events_scope
  end

  def room_param
    params[:room].presence || current_room_name
  end

  def same_room_as_event?
    current_room.present? && @event.room_id == current_room.id
  end

  def parsed_date
    return if params[:date].blank?

    Date.iso8601(params[:date])
  rescue ArgumentError
    nil
  end
end
