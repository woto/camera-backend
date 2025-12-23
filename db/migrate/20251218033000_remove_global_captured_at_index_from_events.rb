class RemoveGlobalCapturedAtIndexFromEvents < ActiveRecord::Migration[8.0]
  def change
    if index_exists?(:events, :captured_at, name: "index_events_on_captured_at_and_room")
      remove_index :events, name: "index_events_on_captured_at_and_room"
    elsif index_exists?(:events, :captured_at)
      remove_index :events, :captured_at
    end
  end
end
