Rails.application.routes.draw do
  devise_for :views
  devise_for :users, controllers: {
    registrations: 'users/registrations',
  }
  devise_scope :user do  
    get '/users/sign_out' => 'devise/sessions#destroy'     
 end
  get '/welcome' => "home#welcome", :as => :user_root
  resources 'notes', :only => [:new, :create, :index, :show, :edit, :update]
  get '/all_notes' => "notes#get_all"
  get '/notes_graph' => "notes#graph_index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  root to: "home#index"
  # Defines the root path route ("/")
  # root "articles#index"
end
