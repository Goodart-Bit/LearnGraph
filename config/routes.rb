Rails.application.routes.draw do
  devise_for :views
  devise_for :users, controllers: {
    registrations: 'users/registrations',
  }
  devise_scope :user do  
    get '/users/sign_out' => 'devise/sessions#destroy' # TODO: Remove unnecessary route
  end
  # ROOTS
  get '/welcome' => "home#welcome", as: :user_root
  root to: "home#index"
  # NOTE ROUTES
  resources 'notes'
  get '/all_notes' => "notes#get_all"
  get '/notes_graph' => "notes#graph_index"
  get '/notes/:id/find/' => 'notes#get_by_title', as: :get_notes_by_title
  post 'notes/:id/edit/link' => 'notes#link_note', as: :link_note
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  # Defines the root path route ("/")
  # root "articles#index"
end
