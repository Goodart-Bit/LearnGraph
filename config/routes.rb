Rails.application.routes.draw do
  devise_for :views
  devise_for :users, controllers: {
    registrations: 'users/registrations'
  }
  get '/logged_in' => "home#logged_in", :as => :user_root
  resources 'notes', :only => [:new, :create, :index, :show]
  get '/notes_graph' => "notes#graph_index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  root to: "home#index"
  # Defines the root path route ("/")
  # root "articles#index"
end
