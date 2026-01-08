# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

## Events navigation behavior

- When viewing an event (`/events/:id`), the app stores the last viewed event id in session storage.
- The `All events` link on the event page includes `?selected=<id>` so it works without JavaScript.
- The events index reads `selected` from the URL or session storage and will highlight and scroll the selected event into view; if the selected event is on another paginated page, the index will redirect to the containing page so it is visible.
