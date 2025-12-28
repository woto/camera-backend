# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin "@rails/actioncable", to: "actioncable.esm.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin_all_from "app/javascript/channels", under: "channels"
pin "channels/consumer", to: "channels/consumer.js"
pin "channels/ws_connections_channel", to: "channels/ws_connections_channel.js"
pin "controllers/video_switcher_controller.js", to: "controllers/video_switcher_controller.js"
pin "hls.js", to: "https://cdn.jsdelivr.net/npm/hls.js@1.5.0/dist/hls.min.js"
