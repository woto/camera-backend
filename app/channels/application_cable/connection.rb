module ApplicationCable
  class Connection < ActionCable::Connection::Base
    def connect
      @ws_connection_id = SecureRandom.uuid
    end
    attr_reader :ws_connection_id
  end
end
