require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  test "should get welcome when off session" do
    get root_path
    assert_response :success
  end

  test "should redirect to login page when off session" do
    get user_root_path
    assert_response :redirect
  end

  test "should be able to get user root when logged in" do
    sign_in(users :one)
    get user_root_path
    assert_response :success
  end

  test "welcome should redirect to user root when in session" do
    sign_in(users :one)
    get root_path
    assert_response :redirect
  end
end
