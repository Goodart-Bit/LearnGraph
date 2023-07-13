require "test_helper"

class EdgesControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get edges_create_url
    assert_response :success
  end

  test "should get destroy" do
    get edges_destroy_url
    assert_response :success
  end
end
