class Note < ApplicationRecord
  belongs_to :user
  has_many :pointers, class_name: 'Edge', foreign_key: :source_id, dependent: :destroy
  has_many :mentions, class_name: 'Edge', foreign_key: :target_id, dependent: :destroy

  validates :title, presence: true, uniqueness: true,
            length: { in: 5..255, message: 'debe tener más de 5 carácteres' }
end
