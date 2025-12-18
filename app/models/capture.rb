class Capture < ApplicationRecord
  belongs_to :event

  has_one_attached :video
  has_many_attached :thumbnails

  validates :video, attached: true
end
