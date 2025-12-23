class RemoveRoomIdFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_index :users, :room_id
    remove_column :users, :room_id, :integer
  end
end
