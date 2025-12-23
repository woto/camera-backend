class SessionsController < ApplicationController
  skip_before_action :require_login, only: [ :new, :create ]

  def new
  end

  def create
    if (user = User.find_by(username: params[:username])) && user.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_back fallback_location: events_path, notice: "Вы вошли успешно.", status: :see_other
    else
      flash.now[:alert] = "Неверное имя пользователя или пароль."
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.update("modal", method: :morph, partial: "sessions/form") }
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    reset_session
    redirect_back fallback_location: events_path, notice: "Вы вышли.", status: :see_other
  end
end
