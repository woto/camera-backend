class RecordingChannel < ApplicationCable::Channel
  def subscribed
    # Stream from the recording channel
    stream_from "recording_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
