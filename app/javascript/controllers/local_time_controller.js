import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    iso: String,
    locale: String,
    format: { type: String, default: "long" }
  }

  connect() {
    this.render()
  }

  render() {
    if (!this.hasIsoValue) return
    const date = new Date(this.isoValue)
    if (Number.isNaN(date.getTime())) return
    const formatter = this.formatterFor(this.formatValue)
    this.element.textContent = formatter.format(date)
  }

  formatterFor(style) {
    const locale = this.hasLocaleValue ? this.localeValue : undefined
    switch (style) {
      case "short":
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
      case "date":
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      case "time":
        return new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit"
        })
      default:
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
    }
  }
}
