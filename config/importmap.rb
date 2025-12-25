# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin "@rails/actioncable", to: "actioncable.esm.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "controllers/video_switcher_controller.js", to: "controllers/video_switcher_controller.js"
pin "video.js" # @8.21.0
pin "hls.js", to: "https://cdn.jsdelivr.net/npm/hls.js@1.5.0/dist/hls.min.js"
pin "@babel/runtime/helpers/extends", to: "@babel--runtime--helpers--extends.js" # @7.28.4
pin "@videojs/vhs-utils/es/byte-helpers", to: "@videojs--vhs-utils--es--byte-helpers.js" # @4.1.1
pin "@videojs/vhs-utils/es/containers", to: "@videojs--vhs-utils--es--containers.js" # @4.1.1
pin "@videojs/vhs-utils/es/decode-b64-to-uint8-array", to: "@videojs--vhs-utils--es--decode-b64-to-uint8-array.js" # @4.1.1
