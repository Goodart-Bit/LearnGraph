class Note < ApplicationRecord
  belongs_to :user
  validates_associated :user
  validates :title, presence: true
  validates :title, uniqueness: true
end
