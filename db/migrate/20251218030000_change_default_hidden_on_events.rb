class ChangeDefaultHiddenOnEvents < ActiveRecord::Migration[8.0]
  def up
    change_column_default :events, :hidden, from: true, to: false
  end

  def down
    change_column_default :events, :hidden, from: false, to: true
  end
end
