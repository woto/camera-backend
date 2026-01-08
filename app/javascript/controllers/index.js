// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "controllers/application"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
eagerLoadControllersFrom("controllers", application)

// Explicitly register critical controllers to avoid missing eager-loads in cached importmaps.
import VideoSwitcherController from "controllers/video_switcher_controller.js"
application.register("video-switcher", VideoSwitcherController)
import LocalTimeController from "controllers/local_time_controller"
application.register("local-time", LocalTimeController)
import EventsListController from "controllers/events_list_controller"
application.register("events-list", EventsListController)
