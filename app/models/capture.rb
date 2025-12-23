class Capture < ApplicationRecord
  belongs_to :event
  belongs_to :offset_base_capture, class_name: "Capture", optional: true
  belongs_to :room, optional: true

  has_one_attached :video
  has_many_attached :thumbnails

  validates :video, attached: true

  before_validation :inherit_room_from_event

  private

  def inherit_room_from_event
    self.room_id ||= event&.room_id
  end
end
