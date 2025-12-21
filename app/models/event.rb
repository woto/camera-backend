class Event < ApplicationRecord
  has_many :captures, dependent: :destroy
  belongs_to :base_capture, class_name: "Capture", optional: true

  attribute :hidden, :boolean, default: false

  scope :visible, -> { where(hidden: false) }
  scope :for_viewer, ->(user) { user.present? ? all : visible }

  validates :captured_at, presence: true
end
