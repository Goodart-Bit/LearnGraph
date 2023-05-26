class HomeController < ApplicationController
  before_action :authenticate_user!, except: [:index]

  def index
    redirect_to user_root_path if current_user
  end
  def welcome
  end
end
