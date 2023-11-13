class Tag < ApplicationRecord
  belongs_to :user
  belongs_to :note
  validates :title, presence: true, uniqueness: { scope: :note_id },
            length: { in: 5..255, message: 'debe tener más de 5 carácteres' }

  def title
    super.capitalize
  end
end
