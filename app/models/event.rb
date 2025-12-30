class Event < ApplicationRecord
  has_many :captures, dependent: :destroy
  belongs_to :base_capture, class_name: "Capture", optional: true
  belongs_to :room, optional: true

  attribute :hidden, :boolean, default: false

  scope :visible, -> { where(hidden: false) }
  scope :in_room, ->(room) { room.present? ? where(room: room) : all }

  validates :captured_at, presence: true
  validates :captured_at, uniqueness: { scope: :room_id }

  before_destroy :clear_capture_references, prepend: true

  private

  def clear_capture_references
    capture_ids = captures.select(:id)
    Capture.where(offset_base_capture_id: capture_ids).update_all(offset_base_capture_id: nil)
    Event.where(base_capture_id: capture_ids).update_all(base_capture_id: nil)
    update_columns(base_capture_id: nil)
  end
end
