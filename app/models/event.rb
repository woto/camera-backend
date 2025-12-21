class Event < ApplicationRecord
  has_many :captures, dependent: :destroy
  belongs_to :base_capture, class_name: "Capture", optional: true

  validates :captured_at, presence: true
end
