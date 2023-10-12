require "test_helper"

class NoteTest < ActiveSupport::TestCase
  def before_setup
    super
    @user = User.find(999)
    @note = Note.create( user: @user, title: "Prueba")
  end

  test "user can create note" do
    assert Note.find( @note.id )
  end

  test "user cannot create note without title" do
    titleless_note = Note.new( user: @user, body: "Something")
    assert_not  titleless_note.valid?
  end

  test "user cannot create notes with duplicate titles" do
    assert_raises ActiveRecord::RecordInvalid do
      Note.create!( user: @user, title: @note.title )
    end
  end

  # TODO: Fix model constraints
  test "other users can create notes with the same title" do
    other_user = User.find(998)
    other_note = Note.create( user: other_user, title: @note.title )
    assert other_note.valid?
  end

  test "note can be deleted" do
    @note.destroy
    assert_raises ActiveRecord::RecordNotFound do
      Note.find(@note.id)
    end
  end

  test "can update note title" do
    updated_title = "New title"
    @note.update( title: updated_title )
    assert @note.title === updated_title
  end

  test "can update note" do
    original_title = @note.title
    original_body = @note.body
    @note.update( title: "#{original_title} new", body: "#{original_body} new" )
    assert @note.title != original_title && @note.body != original_body
  end
end
