class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :notes

  def tags_by_creation
    self.notes.map { |note| note.tags }.flatten.sort_by { |t| t.created_at }
  end
  def tag_titles
    tags_by_creation.map { |t| t.title }.uniq
  end
end
