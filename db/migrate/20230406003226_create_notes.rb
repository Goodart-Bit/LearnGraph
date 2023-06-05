class CreateNotes < ActiveRecord::Migration[7.0]
  def change
    create_table :notes do |t|
      t.string :title, null: false, limit: 255
      t.references :user, null: false, foreign_key: true
      t.text :body

      t.timestamps
    end
  end
end
