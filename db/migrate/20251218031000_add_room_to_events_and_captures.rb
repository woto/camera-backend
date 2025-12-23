class AddRoomToEventsAndCaptures < ActiveRecord::Migration[8.0]
  def change
    add_column :events, :room, :string
    add_column :captures, :room, :string

    remove_index :events, :captured_at if index_exists?(:events, :captured_at)
    add_index :events, [:captured_at, :room], unique: true
    add_index :events, :room
    add_index :captures, :room
  end
end
