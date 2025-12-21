class AddOffsetSecondsToCaptures < ActiveRecord::Migration[8.0]
  def change
    add_column :captures, :offset_seconds, :decimal, precision: 10, scale: 5
  end
end
