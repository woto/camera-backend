class AddHiddenToEvents < ActiveRecord::Migration[8.0]
  class Event < ApplicationRecord; end

  def up
    add_column :events, :hidden, :boolean, default: true, null: false
    Event.reset_column_information
    Event.update_all(hidden: false)
  end

  def down
    remove_column :events, :hidden
  end
end
