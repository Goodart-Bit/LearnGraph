class Edge < ApplicationRecord
  belongs_to :source, class_name: 'Note'
  belongs_to :target, class_name: 'Note'
  validate :non_recursive_association

  def non_recursive_association
    errors.add(:target_id, 'no puede ser igual a la nota actual') if
      source_id == target_id
  end
end
