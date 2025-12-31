class WsConnectionsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "ws_connections"
  end

  def ping
    connection.touch_ws_connection
  end
end
