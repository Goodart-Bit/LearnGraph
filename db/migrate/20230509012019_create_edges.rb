class CreateEdges < ActiveRecord::Migration[7.0]
  def change
    create_table :edges do |t|
      t.bigint :source, null: false
      t.bigint :target, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
    add_foreign_key :edges, :notes, column: :source
    add_foreign_key :edges, :notes, column: :target 
  end
end
