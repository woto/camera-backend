import { Controller } from "@hotwired/stimulus"

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
]

export default class extends Controller {
  static values = {
    dates: Array,
    selected: String,
    baseUrl: String
  }

  static targets = ["monthLabel", "grid", "empty"]

  connect() {
    this.dateStrings = (this.datesValue || []).map((value) => String(value))
    this.datesSet = new Set(this.dateStrings)
    this.selectedDate = this.normalizeDateString(this.selectedValue)
    this.currentDate = this.initialMonthDate()
    this.render()
  }

  prev() {
    this.shiftMonth(-1)
  }

  next() {
    this.shiftMonth(1)
  }

  shiftMonth(delta) {
    const year = this.currentDate.getUTCFullYear()
    const month = this.currentDate.getUTCMonth() + delta
    this.currentDate = new Date(Date.UTC(year, month, 1))
    this.render()
  }

  render() {
    const year = this.currentDate.getUTCFullYear()
    const month = this.currentDate.getUTCMonth()
    this.monthLabelTarget.textContent = `${MONTHS[month]} ${year}`
    this.gridTarget.innerHTML = ""

    const firstDay = new Date(Date.UTC(year, month, 1))
    const weekdayIndex = (firstDay.getUTCDay() + 6) % 7
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

    for (let i = 0; i < weekdayIndex; i += 1) {
      const empty = document.createElement("div")
      empty.className = "h-8"
      this.gridTarget.appendChild(empty)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateString = this.formatDate(year, month + 1, day)
      const hasEvent = this.datesSet.has(dateString)
      const isSelected = this.selectedDate === dateString

      if (hasEvent) {
        const link = document.createElement("a")
        link.href = this.buildUrl(dateString)
        link.textContent = day
        link.className = [
          "h-8",
          "flex",
          "items-center",
          "justify-center",
          "rounded-lg",
          "border",
          "text-[11px]",
          "font-black",
          "tracking-tight",
          isSelected
            ? "bg-white/10 text-white border-white/10"
            : "text-text-secondary border-transparent hover:bg-white/5 hover:text-white"
        ].join(" ")
        this.gridTarget.appendChild(link)
      } else {
        const cell = document.createElement("div")
        cell.textContent = day
        cell.className = "h-8 flex items-center justify-center text-[11px] text-text-secondary/40"
        this.gridTarget.appendChild(cell)
      }
    }

    this.emptyTarget.textContent = this.datesSet.size ? "" : "Событий пока нет"
  }

  initialMonthDate() {
    if (this.selectedDate) {
      return this.parseDate(this.selectedDate)
    }

    if (this.dateStrings.length > 0) {
      const latest = this.dateStrings.slice().sort().pop()
      return this.parseDate(latest)
    }

    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  }

  normalizeDateString(value) {
    if (!value) return null
    return String(value).slice(0, 10)
  }

  parseDate(value) {
    const [year, month, day] = value.split("-").map((part) => Number(part))
    return new Date(Date.UTC(year, month - 1, day))
  }

  formatDate(year, month, day) {
    const paddedMonth = String(month).padStart(2, "0")
    const paddedDay = String(day).padStart(2, "0")
    return `${year}-${paddedMonth}-${paddedDay}`
  }

  buildUrl(dateString) {
    const baseUrl = this.baseUrlValue || "/events"
    const url = new URL(baseUrl, window.location.origin)
    url.searchParams.set("date", dateString)
    return `${url.pathname}${url.search}`
  }
}
