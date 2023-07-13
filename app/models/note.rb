class Note < ApplicationRecord
  belongs_to :user
  has_many :pointers, class_name: 'Edge', foreign_key: :source_id, dependent: :destroy
  has_many :mentions, class_name: 'Edge', foreign_key: :target_id, dependent: :destroy
  accepts_nested_attributes_for :pointers, reject_if: :all_blank, allow_destroy: true

  validates :title, presence: true, uniqueness: true, #TODO: Make uniqueness only apply for notes' titles of the same user
            length: { in: 5..255, message: 'debe tener más de 5 carácteres' }
end
