import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "panel"]

  connect() {
    const first = this.buttonTargets[0]
    if (first) {
      this.show(first.dataset.tab)
    }
  }

  select(event) {
    this.show(event.currentTarget.dataset.tab)
  }

  show(tab) {
    this.panelTargets.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.tab !== tab)
    })
    this.buttonTargets.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tab === tab)
    })
  }
}
