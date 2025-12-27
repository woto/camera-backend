class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :require_login
  before_action :set_locale
  before_action :load_current_room

  helper_method :current_user, :current_room, :current_room_name, :events_scope, :websocket_connections_count

  private

  def set_locale
    I18n.locale = :ru
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def require_login
    return if current_user

    redirect_to new_session_path, alert: "Пожалуйста, войдите в систему."
  end

  def current_room
    return @current_room if defined?(@current_room)

    # Сначала проверяем параметр room (по имени)
    if params[:room].present?
      @current_room = Room.find_by(name: params[:room])
      return @current_room
    end

    # Затем проверяем сессию (по ID)
    if session[:room_id].present?
      @current_room = Room.find_by(id: session[:room_id])
      return @current_room
    end

    @current_room = nil
  end

  def current_room_name
    current_room&.name
  end

  def load_current_room
    current_room
  end

  def events_scope
    # 1. Публичные события всегда видны
    scope = Event.where(hidden: false)

    # 2. Приватные события видны только если есть текущая комната
    if current_room
      private_events = Event.where(hidden: true, room_id: current_room.id)
      scope = scope.or(private_events)
    end

    scope
  end

  def websocket_connections_count
    Rails.cache.read("ws_connections_count").to_i
  end
end
