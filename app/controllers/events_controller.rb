class EventsController < ApplicationController
  skip_before_action :require_login, only: [ :index, :show, :latest ]

  def index
    @events = Event.order(captured_at: :desc).includes(captures: { thumbnails_attachments: :blob }).page(params[:page]).per(20)
  end

  def show
    @event = Event.find(params[:id])
    @captures = @event.captures.with_attached_thumbnails.with_attached_video.order(created_at: :desc)
    @next_event = Event.where("captured_at > ?", @event.captured_at).order(captured_at: :asc).first
    @prev_event = Event.where("captured_at < ?", @event.captured_at).order(captured_at: :desc).first

    respond_to do |format|
      format.html
      format.json { render json: thumbnails_payload(@event, @captures) }
    end
  end

  def latest
    @event = Event.order(captured_at: :desc).first

    unless @event
      return respond_to do |format|
        format.html { redirect_to events_path, alert: "No events yet." }
        format.json { render json: { event_id: nil, thumbnails: [] }, status: :ok }
      end
    end

    @captures = @event.captures.with_attached_thumbnails.with_attached_video.order(created_at: :desc)

    respond_to do |format|
      format.html { render :show }
      format.json { render json: thumbnails_payload(@event, @captures) }
    end
  end

  def destroy
    @event = Event.find(params[:id])
    @older_event = Event.where("captured_at < ?", @event.captured_at).order(captured_at: :desc).first

    if @event.destroy
      if @older_event
        redirect_to event_path(@older_event), notice: "Event deleted. Showing older event."
      else
        redirect_to events_path, notice: "Event deleted."
      end
    else
      redirect_to event_path(@event), alert: "Failed to delete event."
    end
  end

  private

  def thumbnails_payload(event, captures)
    {
      event_id: event.id,
      captured_at: event.captured_at&.iso8601,
      thumbnails: interleaved_thumbnails(captures).map do |capture, thumb|
        {
          capture_id: capture.id,
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
end
