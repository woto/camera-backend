class RenameCaptureThumbnailsAttachments < ActiveRecord::Migration[7.0]
  def up
    rename_attachment("thumbnails", "small_thumbnails")
    rename_attachment("preview_thumbnails", "large_thumbnails")
  end

  def down
    rename_attachment("small_thumbnails", "thumbnails")
    rename_attachment("large_thumbnails", "preview_thumbnails")
  end

  private

  def rename_attachment(from, to)
    ActiveStorage::Attachment.where(record_type: "Capture", name: from).update_all(name: to)
  end
end
