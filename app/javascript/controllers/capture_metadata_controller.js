import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "panel"]

  connect() {
    const first = this.buttonTargets[0]
    if (first) {
      this.show(first.dataset.captureId)
    }
  }

  select(event) {
    this.show(event.currentTarget.dataset.captureId)
  }

  show(captureId) {
    this.panelTargets.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.captureId !== captureId)
    })
    this.buttonTargets.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.captureId === captureId)
    })
  }
}
