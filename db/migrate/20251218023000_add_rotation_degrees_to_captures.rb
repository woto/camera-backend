class AddRotationDegreesToCaptures < ActiveRecord::Migration[8.0]
  def change
    add_column :captures, :rotation_degrees, :integer, default: 0, null: false
  end
end
