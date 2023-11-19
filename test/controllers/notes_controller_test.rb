require "test_helper"

class NotesControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  def before_setup
    super
    @user = users :one
    @note = @user.notes[rand(0..@user.notes.size) - 1]
    sign_in @user
  end

  test "can retrieve notes with their title" do
    get notes_path
    notes_size = @user.notes.size
    @user.notes.each do |note|
      assert_select 'div.note-post', notes_size do |content|
        assert_match /#{note.title}/, content.to_s
      end
    end
  end

  test "can retrieve one specific note in JSON" do
    get note_path(@note.id)
    response_note = @response.parsed_body
    assert response_note["id"] = @note.id
    assert response_note["title"] = @note.title
    assert response_note["body"] = @note.body
  end

  test 'can create a note' do
    get user_root_path
    assert_template partial: '_new'

    note_title = 'Test Note - Do not create on DB'
    post notes_path, params: { note: { title: note_title} }
    assert_response :redirect

    get edit_note_path(Note.last.id)
    assert_select 'input#title', 1 do |title_content|
      assert_match /#{note_title}/, title_content.to_s
    end
  end

  test 'can update a note' do
    assert_changes '@note.reload.title' do
      patch note_path(@note), params: { note: { title: @note.title + " changed" } }
    end

    assert_changes '@note.reload.body' do
      patch note_path(@note), params: { note: { body: @note.body + " changed" } }
    end
  end

  test 'can delete a note' do
    assert_difference 'Note.count', -1 do
      delete note_path(@note), params: { note: { id: @note.id } }
    end
  end

  test 'an user cannot create two notes with the same name' do
    note_title = 'Test Note - Do not create on DB'
    post notes_path, params: { note: { title: note_title} }

    assert_response :redirect do
      post notes_path, params: { note: { title: note_title} }
    end
  end
end
