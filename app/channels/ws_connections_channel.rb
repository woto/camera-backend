class WsConnectionsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "ws_connections"
  end
end
