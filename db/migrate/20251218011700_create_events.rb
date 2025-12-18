class CreateEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :events do |t|
      t.datetime :captured_at, null: false

      t.timestamps
    end

    add_index :events, :captured_at, unique: true
  end
end
