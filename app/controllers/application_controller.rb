class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  before_action :require_login
  before_action :set_locale
  before_action :load_current_room

  helper_method :current_user, :current_room, :current_room_name, :events_scope

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

    param_room = params[:room].presence
    if param_room
      @room_from_params = true
      @current_room = Room.find_by(name: param_room)
      return @current_room
    end

    @current_room =
      if session[:room_id]
        Room.find_by(id: session[:room_id])
      end
  end

  def current_room_name
    current_room&.name
  end

  def load_current_room
    current_room
  end

  def events_scope
    # Доверенные комнаты (сессия)
    trusted_room_ids = [ session[:room_id] ].compact.uniq

    # Все открытые события видны всегда
    open_events = Event.where(hidden: false)

    # Скрытые события видны только в доверенных комнатах
    accessible_hidden_events = Event.where(hidden: true, room_id: trusted_room_ids)

    # Если выбрана конкретная комната, фильтруем только скрытые события по ней.
    # Открытые события показываем всегда, как просил пользователь.
    if current_room
      accessible_hidden_events = accessible_hidden_events.where(room_id: current_room.id)
    elsif @room_from_params && current_room.nil?
      # Если в параметрах указана несуществующая комната,
      # мы всё равно показываем открытые события, но скрытых не будет.
      accessible_hidden_events = Event.none
    end

    open_events.or(accessible_hidden_events)
  end
end
