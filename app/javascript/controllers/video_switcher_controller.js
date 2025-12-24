import { Controller } from "@hotwired/stimulus"
import Plyr from "plyr"

// Shows one video at a time and keeps playback aligned using stored offsets.
// Offsets are relative to a base capture (offset_seconds = 0 for base).
export default class extends Controller {
  static targets = ["player", "label", "controls", "progress", "progressBar", "progressHandle", "currentTime", "duration", "playIcon", "pauseIcon", "volumeIcon", "muteIcon", "volumeSlider", "controlsOverlay"]
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
    this.isScrubbing = false
    this.capturesById = new Map(this.capturesValue.map((c) => [c.id, this.normalizeCapture(c)]))
    if (!this.hasPlayerTarget) return
    // initialize Plyr with no built-in controls (we use custom controls)
    try {
      // Use Plyr default controls to get a standard appearance
      // Ensure fullscreen uses the surrounding .player-container so
      // any absolutely positioned UI inside the container (like the
      // source buttons) is included in fullscreen.
      // Use selector string for fullscreen container to avoid passing a DOM
      // element (Plyr expects a selector or will attempt selector ops).
      const fullscreenSelector = '.player-container'
      this.plyr = new Plyr(this.playerTarget, {
        settings: ['captions', 'quality', 'speed', 'loop'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
        tooltips: { controls: true, seek: true },
        keyboard: { focused: true, global: false },
        fullscreen: { container: fullscreenSelector }
      })
    } catch (e) {
      console.warn("[video-switcher] Plyr init failed", e)
      this.plyr = null
    }
    if (!this.currentIdValue && this.capturesValue.length > 0) {
      this.currentIdValue = this.capturesValue[0].id
    }
    this.renderSourceButtons()
    this.loadCurrent(false)
    this.updateVolumeUI()
    this.showControls()
  }

  disconnect() {
    if (this.plyr && typeof this.plyr.destroy === 'function') {
      this.plyr.destroy()
      this.plyr = null
    }
  }
  

  showControls() {
    if (!this.hasControlsOverlayTarget) return

    this.controlsOverlayTarget.classList.remove("opacity-0", "invisible")

    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout)
    }

    // Don't auto-hide if video is paused
    if (this.playerTarget.paused) return

    this.controlsTimeout = setTimeout(() => {
      this.hideControls()
    }, 3000)
  }

  hideControls() {
    if (!this.hasControlsOverlayTarget) return
    if (this.playerTarget.paused) return

    this.controlsOverlayTarget.classList.add("opacity-0", "invisible")
  }

  // Playback Controls
  togglePlay() {
    const video = this.playerTarget
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  onPlay() {
    if (this.hasPlayIconTarget) this.playIconTarget.classList.add("hidden")
    if (this.hasPauseIconTarget) this.pauseIconTarget.classList.remove("hidden")
    this.showControls()
  }

  onPause() {
    if (this.hasPlayIconTarget) this.playIconTarget.classList.remove("hidden")
    if (this.hasPauseIconTarget) this.pauseIconTarget.classList.add("hidden")
    this.showControls()
  }

  updateProgress() {
    const video = this.playerTarget
    if (!video || !this.hasProgressTarget) return

    // Avoid fighting user input while they are scrubbing the seek bar
    if (this.isScrubbing) return

    const percent = (video.currentTime / video.duration) * 100
    if (Number.isFinite(percent)) {
      this.progressTarget.value = percent
      this.progressBarTarget.style.width = `${percent}%`
      this.progressHandleTarget.style.left = `${percent}%`
    }
    if (this.hasCurrentTimeTarget) this.currentTimeTarget.textContent = this.formatTime(video.currentTime)
  }

  onProgressInput(e) {
    this.showControls()
    this.isScrubbing = true
    const percent = parseFloat(e.target.value)
    this.progressBarTarget.style.width = `${percent}%`
    this.progressHandleTarget.style.left = `${percent}%`

    const video = this.playerTarget
    if (video && video.duration) {
      const time = (percent / 100) * video.duration
      this.currentTimeTarget.textContent = this.formatTime(time)
    }
  }

  onProgressChange(e) {
    this.showControls()
    this.isScrubbing = false
    const video = this.playerTarget
    const percent = parseFloat(e.target.value)
    if (video && Number.isFinite(video.duration)) {
      video.currentTime = (percent / 100) * video.duration
    }
  }

  onLoadedMetadata() {
    if (this.hasDurationTarget) this.durationTarget.textContent = this.formatTime(this.playerTarget.duration)
    this.updateProgress()
  }

  formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  toggleMute() {
    this.playerTarget.muted = !this.playerTarget.muted
    this.updateVolumeUI()
  }

  onVolumeInput(e) {
    this.showControls()
    const val = parseFloat(e.target.value)
    this.playerTarget.volume = val
    this.playerTarget.muted = (val === 0)
    this.updateVolumeUI()
  }

  onVolumeChange() {
    this.updateVolumeUI()
  }

  updateVolumeUI() {
    const video = this.playerTarget
    if (!video) return
    const isMuted = video.muted || video.volume === 0

    if (this.hasVolumeIconTarget) this.volumeIconTarget.classList.toggle("hidden", isMuted)
    if (this.hasMuteIconTarget) this.muteIconTarget.classList.toggle("hidden", !isMuted)
    if (this.hasVolumeSliderTarget) this.volumeSliderTarget.value = video.muted ? 0 : video.volume
  }

  toggleFullscreen() {
    const container = this.playerTarget.closest('.player-container')
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen()
    }
  }

  switch(event) {
    event.preventDefault()
    const nextId = Number(event.params.id)
    if (!Number.isFinite(nextId)) return
    this.switchTo(nextId)
  }

  switchTo(nextId) {
    this.showControls()
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
    this.updateActiveSourceButton()
    this.loadVideo(next, targetTime, wasPlaying).catch(() => {})
  }

  loadCurrent(autoPlay = false) {
    console.log("[video-switcher] loadCurrent", { autoPlay, currentId: this.currentIdValue })
    const current = this.capturesById.get(this.currentIdValue)
    if (!current) return
    this.updateLabel(current)
    this.loadVideo(current, 0, autoPlay).catch(() => {})
  }

  loadVideo(capture, targetTime, autoPlay) {
    const video = this.playerTarget
    if (!video) return Promise.resolve()

    console.log("[video-switcher] loadVideo", {
      captureId: capture.id,
      src: capture.url,
      currentSrc: video.currentSrc
    })

    return this.loadNative(video, capture.url, capture)
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

  getCurrentTime() {
    return this.playerTarget ? this.playerTarget.currentTime : 0
  }

  isPlaying() {
    return this.playerTarget ? !this.playerTarget.paused && !this.playerTarget.ended : false
  }

  renderSourceButtons() {
    this.controlsTargets.forEach((container) => {
      container.innerHTML = ""
      this.capturesValue.forEach((capture) => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "source-button"
        button.dataset.captureId = capture.id
        button.textContent = `CAM ${capture.id}`
        button.addEventListener("click", (e) => {
          e.stopPropagation()
          this.switchTo(Number(capture.id))
        })
        container.appendChild(button)
      })
    })

    this.updateActiveSourceButton()
  }

  updateActiveSourceButton() {
    this.controlsTargets.forEach((container) => {
      const buttons = container.querySelectorAll(".source-button")
      buttons.forEach((btn) => {
        const id = Number(btn.dataset.captureId)
        btn.classList.toggle("is-active", id === this.currentIdValue)
      })
    })
  }

  applyRotation(capture) {
    const video = this.playerTarget
    if (!video) return
    const deg = Number.isFinite(capture?.rotation_degrees) ? capture.rotation_degrees : 0

    let transform = `rotate(${deg}deg)`

    // For 90/270 deg we need to scale down to fit container height
    if (deg === 90 || deg === 270) {
      const container = video.parentElement
      if (container && container.clientWidth > 0) {
        const scale = container.clientHeight / container.clientWidth
        transform += ` scale(${scale.toFixed(4)})`
      }
    }

    video.style.transformOrigin = 'center center'
    video.style.transform = transform
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

  seekAndMaybePlay(targetTime, autoPlay) {
    const video = this.playerTarget
    if (!video) return
    const duration = Number.isFinite(video.duration) ? video.duration : targetTime
    video.currentTime = Math.min(targetTime, duration || targetTime)
    if (autoPlay) {
      video.play().catch(() => {})
    }
  }
}
