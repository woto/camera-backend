class CreateRoomsAndLinkRecords < ActiveRecord::Migration[8.0]
  class MigrationRoom < ApplicationRecord
    self.table_name = "rooms"
  end

  class MigrationEvent < ApplicationRecord
    self.table_name = "events"
  end

  class MigrationCapture < ApplicationRecord
    self.table_name = "captures"
  end

  def up
    create_table :rooms do |t|
      t.string :name, null: false
      t.timestamps
    end
    add_index :rooms, :name, unique: true

    add_reference :events, :room, foreign_key: true
    add_reference :captures, :room, foreign_key: true
    add_reference :users, :room, foreign_key: true

    backfill_rooms!

    remove_column :events, :room, :string
    remove_column :captures, :room, :string

    add_index :events, [:captured_at, :room_id], unique: true
  end

  def down
    add_column :events, :room, :string
    add_column :captures, :room, :string

    MigrationRoom.reset_column_information
    MigrationEvent.reset_column_information
    MigrationCapture.reset_column_information

    MigrationEvent.find_each do |event|
      name = MigrationRoom.where(id: event.room_id).pick(:name)
      event.update_columns(room: name)
    end

    MigrationCapture.find_each do |capture|
      name = MigrationRoom.where(id: capture.room_id).pick(:name)
      capture.update_columns(room: name)
    end

    remove_index :events, [:captured_at, :room_id] if index_exists?(:events, [:captured_at, :room_id])

    remove_reference :users, :room, foreign_key: true
    remove_reference :captures, :room, foreign_key: true
    remove_reference :events, :room, foreign_key: true

    drop_table :rooms

    add_index :events, [:captured_at, :room], unique: true
    add_index :events, :room
    add_index :captures, :room
  end

  private

  def backfill_rooms!
    MigrationRoom.reset_column_information
    MigrationEvent.reset_column_information
    MigrationCapture.reset_column_information

    room_cache = {}
    find_or_create_room = lambda do |name|
      return nil if name.blank?
      room_cache[name] ||= MigrationRoom.find_or_create_by!(name: name)
    end

    say_with_time "Backfilling room references for events" do
      MigrationEvent.find_each do |event|
        room = find_or_create_room.call(event.read_attribute(:room))
        event.update_columns(room_id: room&.id)
      end
    end

    say_with_time "Backfilling room references for captures" do
      MigrationCapture.find_each do |capture|
        room = find_or_create_room.call(capture.read_attribute(:room))
        room_id = room&.id || MigrationEvent.where(id: capture.event_id).pick(:room_id)
        capture.update_columns(room_id: room_id)
      end
    end

    # Users did not previously have rooms; leave room_id nil by default.
  end
end
