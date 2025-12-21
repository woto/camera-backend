class MakeRotationNullableAndUnsetDefaults < ActiveRecord::Migration[8.0]
  def change
    change_column_default :captures, :rotation_degrees, from: 0, to: nil
    change_column_null :captures, :rotation_degrees, true
    # Force recalculation for existing rows; orientation will be re-detected on access.
    reversible do |dir|
      dir.up { execute("UPDATE captures SET rotation_degrees = NULL") }
    end
  end
end
