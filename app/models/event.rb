class Event < ApplicationRecord
  has_many :captures, dependent: :destroy

  validates :captured_at, presence: true
end
