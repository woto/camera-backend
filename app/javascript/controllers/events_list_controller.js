import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { selected: Number }

  connect() {
    // Priority: URL param `selected` -> value passed from server -> sessionStorage fallback
    const urlSelected = this._selectedFromUrl()
    const initial = urlSelected || this.selectedValue || window.sessionStorage.getItem("last_viewed_event_id")
    if (!initial) return

    const id = String(initial)
    const el = document.getElementById(`event-${id}`)
    if (!el) return

    // Mark as selected for both CSS and tests
    el.dataset.selected = "true"
    // Add a visible ring via Tailwind classes
    el.classList.add("ring-4", "ring-accent-purple/30", "border-accent-purple")

    // Scroll into view (defer a tick so layout is settled)
    setTimeout(() => {
      try { el.scrollIntoView({ behavior: "smooth", block: "center" }) } catch (e) { /* ignore */ }
    }, 50)
  }

  _selectedFromUrl() {
    try {
      const params = new URL(window.location.href).searchParams
      return params.get("selected")
    } catch (e) {
      return null
    }
  }
}
