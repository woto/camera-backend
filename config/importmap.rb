# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin "@rails/actioncable", to: "actioncable.esm.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "controllers/video_switcher_controller.js", to: "controllers/video_switcher_controller.js"
pin "video.js" # @8.21.0
pin "plyr" # @3.8.3
pin "@babel/runtime/helpers/extends", to: "@babel--runtime--helpers--extends.js" # @7.28.4
pin "loadjs" # @4.3.0
pin "rangetouch" # @2.0.1
