import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["aside", "overlay"]

  toggle() {
    this.asideTarget.classList.toggle("-translate-x-full")
    this.overlayTarget.classList.toggle("hidden")
  }

  close() {
    this.asideTarget.classList.add("-translate-x-full")
    this.overlayTarget.classList.add("hidden")
  }
}
