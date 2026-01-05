import { Controller } from "@hotwired/stimulus"

const DISMISS_KEY = "localePromptDismissed"

export default class extends Controller {
  static targets = [
    "actionLabel",
    "description",
    "dismissLabel",
    "localeInput",
    "localeName",
    "modal",
    "primaryFlag",
    "primaryLabel",
    "title"
  ]
  static values = {
    availableLocales: Array,
    copies: Object,
    currentLocale: String,
    defaultLocale: String,
    flags: Object,
    localeNames: Object
  }

  connect() {
    this.matchedLocale = this.matchBrowserLocale()
    if (!this.matchedLocale) return
    if (this.matchedLocale === this.defaultLocaleValue) return
    if (this.currentLocaleValue && this.currentLocaleValue !== this.defaultLocaleValue) return
    if (this.dismissed()) return
    this.show()
  }

  dismiss() {
    this.setDismissed()
    if (this.hasModalTarget) this.modalTarget.remove()
  }

  submit() {
    this.setDismissed()
  }

  show() {
    this.populate()
    if (this.hasModalTarget) this.modalTarget.classList.remove("hidden")
  }

  populate() {
    if (!this.matchedLocale) return
    if (this.hasLocaleInputTarget) this.localeInputTarget.value = this.matchedLocale
    const localeName = this.localeNamesValue?.[this.matchedLocale] || this.matchedLocale
    if (this.hasLocaleNameTarget) this.localeNameTarget.textContent = localeName
    if (this.hasPrimaryFlagTarget) {
      this.primaryFlagTarget.textContent = this.flagsValue?.[this.matchedLocale] || ""
    }
    const copy = this.copiesValue?.[this.matchedLocale]
    if (copy) {
      if (this.hasTitleTarget) this.titleTarget.textContent = copy.title
      if (this.hasActionLabelTarget) this.actionLabelTarget.textContent = copy.action
      if (this.hasDescriptionTarget) this.descriptionTarget.textContent = copy.description
      if (this.hasDismissLabelTarget) this.dismissLabelTarget.textContent = copy.dismiss_button
    }
    if (this.hasPrimaryLabelTarget) {
      const template = copy?.switch_button || "Switch to %{locale}"
      this.primaryLabelTarget.textContent = template.replace("%{locale}", localeName)
    }
  }

  matchBrowserLocale() {
    const available = (this.availableLocalesValue || []).map((loc) => String(loc))
    if (available.length === 0) return null
    const normalizedMap = new Map()
    available.forEach((loc) => normalizedMap.set(this.normalize(loc), loc))

    const browserLocales = (navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language]).filter(Boolean)

    for (const browserLocale of browserLocales) {
      const normalized = this.normalize(browserLocale)
      if (normalizedMap.has(normalized)) return normalizedMap.get(normalized)
      const base = normalized.split("-")[0]
      if (normalizedMap.has(base)) return normalizedMap.get(base)
    }
    return null
  }

  normalize(locale) {
    return locale.toString().replace("_", "-").toLowerCase()
  }

  dismissed() {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === "1"
    } catch {
      return false
    }
  }

  setDismissed() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // Ignore unavailable storage (private mode, etc).
    }
  }
}
