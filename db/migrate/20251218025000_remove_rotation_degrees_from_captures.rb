class RemoveRotationDegreesFromCaptures < ActiveRecord::Migration[7.1]
  def change
    remove_column :captures, :rotation_degrees, :integer
  end
end
