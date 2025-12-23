class RoomSelectionsController < ApplicationController
  skip_before_action :require_login

  def new
    render_room_modal
  end

  def create
    room = find_or_create_room
    session[:room_id] = room.id
    @current_room = room
    redirect_back fallback_location: events_path, notice: "Комната выбрана: #{room.name}", status: :see_other
  rescue => e
    respond_to do |format|
      format.turbo_stream { render turbo_stream: turbo_stream.update("modal", method: :morph, partial: "room_selections/form", locals: { error: e.message }) }
      format.html { redirect_back fallback_location: events_path, alert: e.message }
    end
  end

  private

  def find_or_create_room
    name = params[:room].to_s.strip
    raise "Укажите код комнаты" if name.blank?

    Room.find_or_create_by!(name: name)
  end

  def render_room_modal
    respond_to do |format|
      format.turbo_stream { render "room_selections/new" }
      format.html { render "room_selections/new", layout: false }
    end
  end

  def load_events_for_current_page
    @events = events_scope.order(captured_at: :desc).includes(captures: { thumbnails_attachments: :blob }).page(params[:page]).per(5)
  end
end
