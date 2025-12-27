module ApplicationCable
  class Connection < ActionCable::Connection::Base
    def connect
      update_ws_connections(:increment)
    end

    def disconnect
      update_ws_connections(:decrement)
    end

    private

    def update_ws_connections(direction)
      key = "ws_connections_count"
      Rails.cache.write(key, 0) unless Rails.cache.exist?(key)

      count =
        if direction == :increment
          Rails.cache.increment(key)
        else
          Rails.cache.decrement(key)
        end

      count = 0 unless count.is_a?(Integer) && count >= 0
      Rails.cache.write(key, count)
      ActionCable.server.broadcast("ws_connections", { count: count })
    end
  end
end
