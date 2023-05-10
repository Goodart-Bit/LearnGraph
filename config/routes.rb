Rails.application.routes.draw do
  devise_for :views
  devise_for :users, controllers: {
    registrations: 'users/registrations'
  }
  get '/logged_in' => "home#logged_in", :as => :user_root
  resources 'notes', :only => [:new, :create, :index, :show, :edit, :update]
  get '/all_notes' => "notes#get_all"
  get '/notes_graph' => "notes#graph_index"
  get '/notes/search/title=:title' => "notes#lookup"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  root to: "home#index"
  # Defines the root path route ("/")
  # root "articles#index"
end
