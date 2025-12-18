class EventsController < ApplicationController
  def index
    @events = Event.order(captured_at: :desc).includes(:captures)
  end

  def show
    @event = Event.find(params[:id])
    @captures = @event.captures.with_attached_thumbnails.order(created_at: :desc)

    respond_to do |format|
      format.html
      format.json { render json: thumbnails_payload(@event, @captures) }
    end
  end

  def latest
    @event = Event.order(captured_at: :desc).first

    unless @event
      return respond_to do |format|
        format.html { redirect_to events_path, alert: "Пока нет событий." }
        format.json { render json: { event_id: nil, thumbnails: [] }, status: :ok }
      end
    end

    @captures = @event.captures.with_attached_thumbnails.order(created_at: :desc)

    respond_to do |format|
      format.html { render :show }
      format.json { render json: thumbnails_payload(@event, @captures) }
    end
  end

  private

  def thumbnails_payload(event, captures)
    {
      event_id: event.id,
      captured_at: event.captured_at&.iso8601,
      thumbnails: captures.flat_map do |capture|
        capture.thumbnails.map do |thumb|
          {
            capture_id: capture.id,
            filename: thumb.filename.to_s,
            byte_size: thumb.byte_size,
            content_type: thumb.content_type,
            url: url_for(thumb)
          }
        end
      end
    }
  end
end
