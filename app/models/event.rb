class Event < ApplicationRecord
  has_many :captures, dependent: :destroy
  belongs_to :base_capture, class_name: "Capture", optional: true
  belongs_to :room, optional: true

  attribute :hidden, :boolean, default: false

  scope :visible, -> { where(hidden: false) }
  scope :in_room, ->(room) { room.present? ? where(room: room) : all }

  validates :captured_at, presence: true
  validates :captured_at, uniqueness: { scope: :room_id }
end
