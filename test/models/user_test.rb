require "test_helper"

class UserTest < ActiveSupport::TestCase
  def before_setup
    super
    @user = User.create({ email: "test-user@gmail.com", password: 'something' })
  end

  test "adds new user" do
    @new_user = User.create({ email: "new-user@gmail.com", password: 'something' })
    assert User.find_by({id: @new_user.id})
  end

  test "deletes a user" do
    User.delete(@user.id)
    assert_raises ActiveRecord::RecordNotFound do
      User.find(@user.id)
    end
  end

  test "updates user's email" do
    new_email = "updated-email@gmail.com"
    @user.update(email: new_email)
    assert_equal @user.email, new_email
  end

  test 'encrypts password on create' do
    input_pass = 'something'
    @new_user = User.create({ email: "new-user@gmail.com", password: input_pass })
    assert_not_equal @new_user.encrypted_password, input_pass
  end

  test "authenticates user" do
    credentials = { email: @user.email, password: @user.password }
    target_user = User.find_by(email: credentials[:email] )
    assert target_user.valid_password? credentials[:password]
  end

  test "doesn't find invalid email" do
    credentials = { email: 'invalid@dontuse.com', password: 'something' }
    assert_not User.find_by(email: credentials[:email])
  end

  test "doesn't authenticate wrong password" do
    credentials = { email: @user.email, password: 'invalid' }
    target_user = User.find_by(email: credentials[:email] )
    assert_not target_user.valid_password? credentials[:password]
  end

  test "validates passwords match" do
    password = 'a_password'
    user = User.new({ email: 'someone@gmail.com',
                      password: password, password_confirmation: password })
    assert user.valid?
  end

  test "invalidates on password mismatch" do
    password = 'a_password'
    user = User.new({ email: 'someone@gmail.com',
                      password: password, password_confirmation: 'something_else' })
    assert_not user.valid?
  end
end
