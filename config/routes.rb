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
  resources 'notes' do
    collection do
      get 'graph' => 'notes#graph_index'
      get 'all' => 'notes#get_notes'
    end
  end
  resources 'edges', only: [], param: :index do
    member do
      get '/new' => 'edges#new', defaults: { format: 'turbo_stream' }
      post '/' => 'edges#create', defaults: { format: 'turbo_stream' }
      # delete '(:id)' => 'edges#destroy', as: ''
    end
  end

  resources 'edges', only: [:index]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  # Defines the root path route ("/")
  # root "articles#index"
end
