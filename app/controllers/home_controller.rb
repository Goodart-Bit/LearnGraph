class HomeController < ApplicationController
  before_action :authenticate_user!, except: %i[index help]

  def index
    redirect_to user_root_path if current_user
  end
  def welcome
  end

  def help
  end
end
