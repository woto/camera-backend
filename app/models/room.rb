class Room < ApplicationRecord
  has_many :users, dependent: :nullify
  has_many :events, dependent: :nullify
  has_many :captures, dependent: :nullify

  validates :name, presence: true, uniqueness: true
end
