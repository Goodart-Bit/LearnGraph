class AddIndexToNotesUserTitles < ActiveRecord::Migration[7.0]
  def change
    add_index :notes, [:user_id, :title], unique: true
  end
end
