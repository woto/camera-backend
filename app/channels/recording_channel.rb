class RecordingChannel < ApplicationCable::Channel
  CONNECTION_TTL = 120

  def subscribed
    # Stream from the recording channel
    return reject unless recording_stream

    stream_from recording_stream
    update_recording_connections(:touch)
  end

  def unsubscribed
    update_recording_connections(:remove)
  end

  def ping
    update_recording_connections(:touch)
  end

  private

  def recording_stream
    room = params[:room].presence
    room.present? ? "recording_channel:#{room}" : nil
  end

  def update_recording_connections(action)
    connection_id = connection.ws_connection_id
    return unless connection_id

    key = "recording_connections_registry"
    now = Time.current.to_i
    registry = Rails.cache.read(key) || {}
    registry = registry.select { |_id, ts| ts && (now - ts) < CONNECTION_TTL }

    case action
    when :touch
      registry[connection_id] = now
    when :remove
      registry.delete(connection_id)
    end

    Rails.cache.write(key, registry, expires_in: CONNECTION_TTL * 2)
    Rails.cache.write("recording_connections_count", registry.size)
    ActionCable.server.broadcast("ws_connections", { count: registry.size })
  end
end
