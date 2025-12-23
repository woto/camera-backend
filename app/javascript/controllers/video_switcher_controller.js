import { Controller } from "@hotwired/stimulus"

// Shows one video at a time and keeps playback aligned using stored offsets.
// Offsets are relative to a base capture (offset_seconds = 0 for base).
// Uses Plyr when available; otherwise falls back to native video element.
export default class extends Controller {
  static targets = ["player", "label"]
  static values = {
    captures: Array,
    currentId: Number
  }

  connect() {
    console.log("[video-switcher] connect", {
      capturesCount: this.capturesValue.length,
      hasPlayerTarget: this.hasPlayerTarget,
      currentIdValue: this.currentIdValue
    })
    this.capturesById = new Map(this.capturesValue.map((c) => [c.id, this.normalizeCapture(c)]))
    if (!this.hasPlayerTarget) return
    if (!this.currentIdValue && this.capturesValue.length > 0) {
      this.currentIdValue = this.capturesValue[0].id
    }
    this.setupPlyr()
    this.setupSourceButtons()
    this.loadCurrent(false)
  }

  switch(event) {
    event.preventDefault()
    const nextId = Number(event.params.id)
    if (!Number.isFinite(nextId)) return
    this.switchTo(nextId)
  }

  switchTo(nextId) {
    const next = this.capturesById.get(nextId)
    if (!next) return

    const current = this.capturesById.get(this.currentIdValue)
    const currentTime = this.getCurrentTime() || 0
    const currentOffset = this.offsetSeconds(current)
    const nextOffset = this.offsetSeconds(next)
    const baseTime = current ? currentTime + currentOffset : currentTime
    const targetTime = Math.max(baseTime - nextOffset - this.rewindSeconds(), 0)
    console.log("[video-switcher] switchTo", {
      currentId: this.currentIdValue,
      nextId,
      currentTime,
      currentOffset,
      nextOffset,
      baseTime,
      rewind: this.rewindSeconds(),
      targetTime
    })
    const wasPlaying = this.isPlaying()

    this.currentIdValue = nextId
    this.updateLabel(next)
    this.applyRotation(next)
    this.updateActiveSourceButton()
    this.loadVideo(next, targetTime, wasPlaying).catch(() => {})
  }

  loadCurrent(autoPlay = false) {
    console.log("[video-switcher] loadCurrent", { autoPlay, currentId: this.currentIdValue })
    const current = this.capturesById.get(this.currentIdValue)
    if (!current) return
    this.updateLabel(current)
    this.applyRotation(current)
    this.loadVideo(current, 0, autoPlay).catch(() => {})
  }

  loadVideo(capture, targetTime, autoPlay) {
    const video = this.mediaElement()
    if (!video) return
    const src = capture.url
    console.log("[video-switcher] loadVideo", {
      captureId: capture.id,
      src,
      currentSrc: video.currentSrc
    })

    // Apply rotation immediately before any source changes; Plyr may rebuild controls/video.
    this.applyRotation(capture)

    return this.loadSource(capture)
      .catch(() => {})
      .finally(() => {
        this.seekAndMaybePlay(targetTime, autoPlay)
      })
  }

  updateLabel(capture) {
    if (!this.hasLabelTarget) return
    const offset = this.offsetSeconds(capture)
    const basePart = offset === 0 ? "База" : `Смещение: ${offset.toFixed(3)}s`
    this.labelTarget.textContent = `${capture.label} (${basePart})`
  }

  setupPlyr() {
    if (window.Plyr && !this.plyr) {
      this.plyr = new Plyr(this.playerTarget, {
        controls: ["play", "progress", "current-time", "mute", "volume", "settings", "fullscreen"]
      })
    }
  }

  mediaElement() {
    if (this.plyr && this.plyr.media) return this.plyr.media
    if (this.hasPlayerTarget) return this.playerTarget
    return this.element.querySelector("video")
  }

  loadSource(capture) {
    const src = capture.url
    const video = this.mediaElement()
    if (!video) return Promise.resolve()

    if (this.plyr) {
      return this.loadWithPlyr(src, capture)
    }

    return this.loadNative(video, src, capture)
  }

  seekAndMaybePlay(targetTime, autoPlay) {
    const video = this.mediaElement()
    if (!video) return
    const duration = Number.isFinite(video.duration) ? video.duration : targetTime
    video.currentTime = Math.min(targetTime, duration || targetTime)
    if (autoPlay) {
      video.play().catch(() => {})
    }
  }

  getCurrentTime() {
    if (this.plyr) return this.plyr.currentTime
    const video = this.mediaElement()
    return video ? video.currentTime : 0
  }

  isPlaying() {
    if (this.plyr) return !this.plyr.paused && !this.plyr.ended
    const video = this.mediaElement()
    return video ? !video.paused && !video.ended : false
  }

  // No-op logger kept to avoid errors if stray debug calls remain.
  log() {}

  setupSourceButtons() {
    if (this.plyr && this.plyr.ready) {
      this.renderSourceButtons()
      return
    }
    if (this.plyr && this.plyr.on) {
      this.plyr.on("ready", () => this.renderSourceButtons())
    } else {
      // Fallback if Plyr isn't available; try once after a tick.
      setTimeout(() => this.renderSourceButtons(), 0)
    }
  }

  renderSourceButtons() {
    const controls = this.controlsElement()
    if (!controls) return
    const existing = controls.querySelector(".plyr-source-buttons")
    if (existing) existing.remove()

    const wrapper = document.createElement("div")
    wrapper.className = "plyr__controls__item plyr-source-buttons custom-scrollbar"

    this.capturesValue.forEach((capture) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "plyr__controls__item plyr-source-button"
      button.dataset.captureId = capture.id
      button.textContent = `CAM ${capture.id}`
      button.addEventListener("click", () => this.switchTo(Number(capture.id)))
      wrapper.appendChild(button)
    })

    controls.appendChild(wrapper)
    this.updateActiveSourceButton()
  }

  updateActiveSourceButton() {
    const controls = this.controlsElement()
    if (!controls) return
    const buttons = controls.querySelectorAll(".plyr-source-button")
    buttons.forEach((btn) => {
      const id = Number(btn.dataset.captureId)
      btn.classList.toggle("is-active", id === this.currentIdValue)
    })
  }

  controlsElement() {
    if (this.plyr && this.plyr.elements && this.plyr.elements.controls) return this.plyr.elements.controls
    const root = this.playerTarget?.closest(".plyr")
    if (root) return root.querySelector(".plyr__controls")
    return null
  }

  applyRotation(capture) {
    const video = this.mediaElement()
    if (!video) return
    const deg = Number.isFinite(capture?.rotation_degrees) ? capture.rotation_degrees : 0
    video.style.transform = `rotate(${deg}deg)`
  }

  offsetSeconds(capture) {
    const raw = capture?.offset_seconds
    const num = typeof raw === "string" ? parseFloat(raw) : raw
    return Number.isFinite(num) ? num : 0
  }

  rewindSeconds() {
    return 1
  }

  normalizeCapture(capture) {
    return {
      ...capture,
      offset_seconds: this.offsetSeconds(capture),
      rotation_degrees: Number.isFinite(capture.rotation_degrees) ? capture.rotation_degrees : 0
    }
  }

  loadWithPlyr(src, capture) {
    return new Promise((resolve) => {
      if (!this.plyr) return resolve()

      const cleanup = () => {
        if (this.plyr?.off && readyHandler) this.plyr.off("ready", readyHandler)
        clearTimeout(timeout)
      }

      const done = () => {
        if (finished) return
        finished = true
        cleanup()
        this.applyRotation(capture)
        resolve()
      }

      let finished = false
      const readyHandler = () => {
        this.waitForMetadata(this.mediaElement()).then(done)
      }
      const timeout = setTimeout(done, 2000)

      if (this.plyr.once) {
        this.plyr.once("ready", readyHandler)
      } else {
        readyHandler()
      }

      this.plyr.source = {
        type: "video",
        sources: [{ src, type: "video/mp4" }]
      }

      // Plyr rebuilds controls when source changes; re-add custom buttons after that cycle.
      setTimeout(() => this.renderSourceButtons(), 0)
      setTimeout(() => this.applyRotation(capture), 0)
    })
  }

  loadNative(video, src, capture) {
    return new Promise((resolve) => {
      const done = () => {
        if (finished) return
        finished = true
        cleanup()
        this.applyRotation(capture)
        resolve()
      }

      const cleanup = () => {
        clearTimeout(timeout)
        video.removeEventListener("loadedmetadata", done)
      }

      let finished = false
      const timeout = setTimeout(done, 2000)

      video.addEventListener("loadedmetadata", done, { once: true })
      video.src = src
      video.load()

      if (video.readyState >= 1) done()
    })
  }

  waitForMetadata(video) {
    return new Promise((resolve) => {
      if (!video) return resolve()
      if (video.readyState >= 1 && Number.isFinite(video.duration)) return resolve()

      const cleanup = () => {
        clearTimeout(timeout)
        video.removeEventListener("loadedmetadata", onReady)
      }

      const onReady = () => {
        cleanup()
        resolve()
      }

      const timeout = setTimeout(onReady, 1500)
      video.addEventListener("loadedmetadata", onReady, { once: true })
    })
  }
}
