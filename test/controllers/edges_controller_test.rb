require "test_helper"

class EdgesControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  def before_setup
    super
    @user = users :one
    @note = notes :one
    sign_in @user
  end

  test "should respond with the user's notes on #new path" do
    get new_edge_path(@note.pointers.size), params: { note_id: @note.id }
    assert_select 'form#link-select-form' do |input|
      @note.pointers.each do |pointer| # asserts only note pointers are displayed
        assert_match /#{pointer.id}/, input.to_s
      end
    end
  end

  test "should be able to post to create" do
    link_note = notes :two
    post edge_path(source_id: "#{@note.id}", target_id: "#{link_note.id}", index: @note.pointers.size),
         params: { note_id: @note.id }
    assert_response :success
  end

  test "should not be able to post if target is the same as source" do
    post edge_path(source_id: "#{@note.id}", target_id: "#{@note.id}", index: @note.pointers.size),
         params: { note_id: @note.id }
    assert_response :bad_request
  end

  test "should be able to get user edges" do
    Edge.create(source_id: @note.id, target_id: notes(:two).id)
    get edges_path, params: { note_id: @note.id }
    note_edges = @response.parsed_body
    assert note_edges = @note.reload.pointers
  end
end
