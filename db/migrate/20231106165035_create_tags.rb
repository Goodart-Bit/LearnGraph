class CreateTags < ActiveRecord::Migration[7.0]
  def change
    create_table :tags do |t|
      t.string :title
      t.belongs_to :user, null: false, foreign_key: true
      t.belongs_to :note, null: false, foreign_key: true

      t.timestamps
    end
  end
end
