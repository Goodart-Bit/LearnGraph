class CreateEdges < ActiveRecord::Migration[7.0]
  def change
    create_table :edges do |t|
      t.references :source, null: false, foreign_key: { to_table: :notes}
      t.references :target, null: false, foreign_key: { to_table: :notes}

      t.timestamps
    end
  end
end
