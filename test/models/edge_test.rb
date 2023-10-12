require "test_helper"

class EdgeTest < ActiveSupport::TestCase
  def before_setup
    super
    @user_note = Note.find 990
    @other_note = Note.find 991
    @edge = Edge.create(source_id: @user_note.id, target_id: @other_note.id)
  end

  test "can create an edge" do
    assert Edge.find @edge.id
  end

  test "can delete an edge" do
    @edge.destroy
    assert_raises ActiveRecord::RecordNotFound do
      Edge.find @edge.id
    end
  end

  test "created edge is reflected on both notes" do
    points_to_other = @user_note.pointers.include? @edge
    other_has_mention = @other_note.mentions.include? @edge
    assert points_to_other && other_has_mention
  end

  test "deleted edge is reflected on both notes" do
    @edge.destroy
    points_to_other = @user_note.pointers.include? @edge
    other_has_mention = @other_note.mentions.include? @edge
    assert_not points_to_other || other_has_mention
  end
end
