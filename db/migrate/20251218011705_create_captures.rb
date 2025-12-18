class CreateCaptures < ActiveRecord::Migration[8.0]
  def change
    create_table :captures do |t|
      t.references :event, null: false, foreign_key: true

      t.timestamps
    end
  end
end
