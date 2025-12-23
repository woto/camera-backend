Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "events#latest"

  resource :session, only: [:new, :create, :destroy]
  get "/login", to: "sessions#new"
  delete "/logout", to: "sessions#destroy"

  resources :events, only: [:index, :show, :destroy] 
  resources :events, only: [] do
    member do
      post :set_base
      post :sync_offsets
      patch :set_rotation
      patch :set_visibility
    end
  end

  # Video recorder routes
  post "/recorder/upload", to: "recorder#upload"
  post "/recorder/trigger", to: "recorder#trigger"

  resource :room_selection, only: [:new, :create], controller: "room_selections"
end
