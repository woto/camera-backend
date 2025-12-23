import { Controller } from "@hotwired/stimulus"

// Simple modal controller to clear modal frame.
export default class extends Controller {
  close(event) {
    event.preventDefault()
    const frame = document.getElementById("modal")
    if (frame) frame.innerHTML = ""
  }
}
