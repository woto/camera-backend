import { Controller } from "@hotwired/stimulus"

// Simple modal controller to clear modal frame.
export default class extends Controller {
  close(event) {
    event.preventDefault()
    const frame = this.element.closest("turbo-frame#modal") || document.getElementById("modal")
    if (frame && frame.contains(this.element)) {
      frame.innerHTML = ""
      return
    }
    this.element.remove()
  }
}
