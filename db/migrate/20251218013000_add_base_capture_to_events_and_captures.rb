class AddBaseCaptureToEventsAndCaptures < ActiveRecord::Migration[8.0]
  def change
    add_reference :events, :base_capture, foreign_key: { to_table: :captures }
    add_reference :captures, :offset_base_capture, foreign_key: { to_table: :captures }
  end
end
