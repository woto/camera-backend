class AddHlsToCaptures < ActiveRecord::Migration[7.0]
  def change
    add_column :captures, :hls_manifest_path, :string
    add_column :captures, :hls_processed_at, :datetime
    add_column :captures, :hls_processing, :boolean, default: false, null: false
    add_column :captures, :hls_error, :text
    add_index :captures, :hls_manifest_path
  end
end
