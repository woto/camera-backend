class RecordingChannel < ApplicationCable::Channel
  def subscribed
    # Stream from the recording channel
    return reject unless recording_stream

    stream_from recording_stream
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  private

  def recording_stream
    room = params[:room].presence
    room.present? ? "recording_channel:#{room}" : nil
  end
end
