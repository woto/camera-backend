import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["image"]
  static values = {
    frames: Array,
    interval: { type: Number, default: 240 }
  }

  connect() {
    this.index = 0
    this.timer = null
    this.showFrame(0)
  }

  disconnect() {
    this.stop()
  }

  start() {
    if (!this.hasImageTarget) return
    if (!this.framesValue || this.framesValue.length < 2) return
    if (this.timer) return
    this.timer = setInterval(() => this.nextFrame(), this.intervalValue)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.showFrame(0)
  }

  nextFrame() {
    const frames = this.framesValue || []
    if (frames.length === 0) return
    this.index = (this.index + 1) % frames.length
    this.showFrame(this.index)
  }

  showFrame(index) {
    if (!this.hasImageTarget) return
    const frames = this.framesValue || []
    if (frames.length === 0) return
    this.imageTarget.src = frames[index] || frames[0]
  }
}
