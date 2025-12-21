class Capture < ApplicationRecord
  belongs_to :event
  belongs_to :offset_base_capture, class_name: "Capture", optional: true

  has_one_attached :video
  has_many_attached :thumbnails

  validates :video, attached: true
end
