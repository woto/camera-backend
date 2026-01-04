import { Controller } from "@hotwired/stimulus"
import { Turbo } from "@hotwired/turbo-rails"
import * as HlsModule from "hls.js"

// Shows one video at a time and keeps playback aligned using stored offsets.
// Offsets are relative to a base capture (offset_seconds = 0 for base).
export default class extends Controller {
  static targets = ["player", "label", "controls", "progress", "progressBar", "progressHandle", "currentTime", "duration", "playIcon", "pauseIcon", "volumeIcon", "muteIcon", "volumeSlider", "controlsOverlay", "speedButton", "speedMenu", "speedBadge", "speedBadgeValue", "preview", "previewImage", "previewTime", "prevEventLink", "nextEventLink", "switcherData"]
  static values = {
    captures: Array,
    currentId: Number,
    prevEventUrl: String,
    nextEventUrl: String,
    loadingText: String,
    baseLabel: String,
    offsetLabel: String,
    cameraLabel: String
  }

  connect() {
    console.log("[video-switcher] connect", {
      capturesCount: this.capturesValue.length,
      hasPlayerTarget: this.hasPlayerTarget,
      currentIdValue: this.currentIdValue
    })
    this.isScrubbing = false
    this.isSpeedBoosting = false
    this.isReverseBoosting = false
    this.suppressNextClick = false
    this.speedBoostTimer = null
    this.speedBoostStartX = 0
    this.speedBoostCenterRate = 2
    this.basePlaybackRate = 1
    this.reverseBoostTimer = null
    this.reverseBoostStartX = 0
    this.reverseWasPlaying = false
    this.badgeHideTimer = null
    this.speedOptions = [0.25, 0.5, 1, 2, 3]
    this.previewUrls = []
    this.capturesById = new Map(this.capturesValue.map((c) => [c.id, this.normalizeCapture(c)]))
    if (!this.hasPlayerTarget) {
      this.waitForPlayerTarget()
      return
    }
    this.finishConnect()
  }

  finishConnect() {
    if (!this.currentIdValue && this.capturesValue.length > 0) {
      this.currentIdValue = this.capturesValue[0].id
    }
    this.renderSourceButtons()
    this.updateEventNav()
    this.loadCurrent(false)
    this.restoreVolume()
    this.updateVolumeUI()
    this.updateSpeedUI()
    this.showControls()
    this.syncFromSwitcherData()
    this.bindGlobalHandlers()
  }

  switcherDataTargetConnected() {
    this.syncFromSwitcherData()
  }

  syncFromSwitcherData() {
    if (!this.hasSwitcherDataTarget) return
    const data = this.switcherDataTarget.dataset
    let captures = this.capturesValue
    if (data.videoSwitcherCapturesValue) {
      try {
        captures = JSON.parse(data.videoSwitcherCapturesValue)
      } catch (e) { /* ignore */ }
    }
    const currentIdRaw = data.videoSwitcherCurrentIdValue
    const currentId = Number(currentIdRaw)
    const prevUrl = data.videoSwitcherPrevEventUrlValue || ""
    const nextUrl = data.videoSwitcherNextEventUrlValue || ""

    const signature = JSON.stringify([captures.map((c) => c.id), currentId, prevUrl, nextUrl])
    if (signature === this.lastSwitcherSignature) return
    this.lastSwitcherSignature = signature

    this.capturesValue = captures
    if (Number.isFinite(currentId) && currentId > 0) {
      this.currentIdValue = currentId
    } else if (captures.length > 0) {
      this.currentIdValue = captures[0].id
    }
    this.prevEventUrlValue = prevUrl
    this.nextEventUrlValue = nextUrl
    this.capturesById = new Map(this.capturesValue.map((c) => [c.id, this.normalizeCapture(c)]))
    if (!this.capturesById.has(this.currentIdValue) && this.capturesValue.length > 0) {
      this.currentIdValue = this.capturesValue[0].id
    }
    this.renderSourceButtons()
    this.updateEventNav()
    if (this.hasPlayerTarget) {
      if (this.hasLabelTarget) {
        this.labelTarget.textContent = this.loadingText()
      }
      this.loadCurrent(false)
      this.syncPlayPauseUI()
    }
  }

  labelTargetConnected() {
    const current = this.capturesById?.get(this.currentIdValue)
    if (current) {
      this.updateLabel(current)
    }
  }

  waitForPlayerTarget() {
    if (this.playerTargetWait) return
    this.playerTargetWait = true
    const tick = () => {
      if (this.hasPlayerTarget) {
        this.playerTargetWait = false
        this.finishConnect()
        return
      }
      this.playerTargetWait = requestAnimationFrame(tick)
    }
    this.playerTargetWait = requestAnimationFrame(tick)
  }

  updateEventNav() {
    this.updateEventLink(this.hasPrevEventLinkTarget ? this.prevEventLinkTarget : null, this.prevEventUrlValue)
    this.updateEventLink(this.hasNextEventLinkTarget ? this.nextEventLinkTarget : null, this.nextEventUrlValue)
  }

  updateEventLink(link, url) {
    if (!link) return
    if (url && url.length > 0) {
      link.href = url
      link.classList.remove("hidden")
      link.setAttribute("aria-hidden", "false")
    } else {
      link.removeAttribute("href")
      link.classList.add("hidden")
      link.setAttribute("aria-hidden", "true")
    }
  }

  navigateEvent(event) {
    event.preventDefault()
    event.stopPropagation()
    const link = event.currentTarget
    const url = link?.getAttribute("href")
    if (!url || url === "#") return
    if (this.isNavigating) return
    this.isNavigating = true
    if (this.hasLabelTarget) {
      this.labelTarget.textContent = this.loadingText()
    }
    fetch(url, {
      headers: {
        Accept: "text/vnd.turbo-stream.html",
        "X-Event-Stream": "1"
      }
    })
      .then((response) => response.text())
      .then((html) => {
        Turbo.renderStreamMessage(html)
        history.pushState({}, "", url)
      })
      .catch(() => {})
      .finally(() => {
        this.isNavigating = false
      })
  }

  showControls() {
    if (!this.hasControlsOverlayTarget) return

    this.controlsOverlayTarget.classList.remove("opacity-0", "invisible")
    this.controlsOverlayTarget.classList.remove("pointer-events-none")

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
    this.controlsOverlayTarget.classList.add("pointer-events-none")
    this.hideSpeedMenu()
  }

  // Playback Controls
  togglePlay() {
    if (this.suppressNextClick) {
      this.suppressNextClick = false
      return
    }
    const video = this.playerTarget
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  onPlay() {
    this.playIconTarget.classList.add("hidden")
    this.pauseIconTarget.classList.remove("hidden")
    this.showControls()
  }

  onPause() {
    this.playIconTarget.classList.remove("hidden")
    this.pauseIconTarget.classList.add("hidden")
    this.showControls()
  }

  syncPlayPauseUI() {
    if (!this.hasPlayIconTarget || !this.hasPauseIconTarget || !this.hasPlayerTarget) return
    if (this.playerTarget.paused) {
      this.playIconTarget.classList.remove("hidden")
      this.pauseIconTarget.classList.add("hidden")
    } else {
      this.playIconTarget.classList.add("hidden")
      this.pauseIconTarget.classList.remove("hidden")
    }
  }

  startSpeedBoost(event) {
    if (event.pointerType === "mouse" && event.button === 2) {
      this.startReverseBoost(event)
      return
    }
    if (event.pointerType === "mouse" && event.button !== 0) return
    if (event.target?.closest?.(".player-nav")) return
    if (event.target?.closest?.(".player-controls")) return
    this.showControls()
    this.speedBoostStartX = event.clientX ?? 0
    try {
      this.playerTarget.setPointerCapture(event.pointerId)
    } catch (e) { /* ignore */ }
    if (this.speedBoostTimer) {
      clearTimeout(this.speedBoostTimer)
    }
    this.speedBoostTimer = setTimeout(() => {
      this.speedBoostTimer = null
      this.enableSpeedBoost()
    }, 200)
  }

  updateSpeedBoost(event) {
    if (this.isReverseBoosting) {
      this.updateReverseBoost(event)
      return
    }
    if (!this.isSpeedBoosting) return
    if (event.target?.closest?.(".player-nav")) return
    if (event.target?.closest?.(".player-controls")) return
    const video = this.playerTarget
    if (!video) return
    const container = video.parentElement
    const width = container?.clientWidth || 1
    const delta = (event.clientX ?? 0) - this.speedBoostStartX
    const normalized = Math.max(Math.min(delta / (width / 2), 1), -1)
    const centerIndex = this.speedOptions.indexOf(this.speedBoostCenterRate)
    const maxLeft = centerIndex
    const maxRight = this.speedOptions.length - 1 - centerIndex
    const step = normalized < 0
      ? -Math.round(Math.abs(normalized) * maxLeft)
      : Math.round(normalized * maxRight)
    const nextIndex = Math.min(Math.max(centerIndex + step, 0), this.speedOptions.length - 1)
    const target = this.speedOptions[nextIndex]
    video.playbackRate = target
    this.basePlaybackRate = target
    this.updateSpeedUI()
    this.updateSpeedBadge(target)
  }

  stopSpeedBoost(event) {
    if (this.isReverseBoosting) {
      this.stopReverseBoost(event, { keepBadge: true })
      return
    }
    if (this.speedBoostTimer) {
      clearTimeout(this.speedBoostTimer)
      this.speedBoostTimer = null
    }
    if (!this.isSpeedBoosting) return
    this.isSpeedBoosting = false
    this.hideSpeedBadge()
    this.suppressNextClick = true
    if (event?.pointerId) {
      try {
        this.playerTarget.releasePointerCapture(event.pointerId)
      } catch (e) { /* ignore */ }
    }
  }

  enableSpeedBoost() {
    const video = this.playerTarget
    if (!video || this.isSpeedBoosting) return
    this.basePlaybackRate = video.playbackRate || 1
    const closest = this.speedOptions.reduce((best, rate) => {
      return Math.abs(rate - this.basePlaybackRate) < Math.abs(best - this.basePlaybackRate) ? rate : best
    }, this.speedOptions[0])
    this.speedBoostCenterRate = closest
    this.isSpeedBoosting = true
    this.updateSpeedBadge(video.playbackRate)
  }

  startReverseBoost(event) {
    if (event.pointerType === "mouse" && event.button !== 2) return
    if (event.target?.closest?.(".player-nav")) return
    if (event.target?.closest?.(".player-controls")) return
    event.preventDefault()
    this.showControls()
    this.reverseBoostStartX = event.clientX ?? 0
    try {
      this.playerTarget.setPointerCapture(event.pointerId)
    } catch (e) { /* ignore */ }
    if (this.reverseBoostTimer) {
      clearTimeout(this.reverseBoostTimer)
    }
    this.reverseBoostTimer = setTimeout(() => {
      this.reverseBoostTimer = null
      this.enableReverseBoost()
    }, 200)
  }

  updateReverseBoost(event) {
    if (!this.isReverseBoosting) return
    if (event.target?.closest?.(".player-nav")) return
    if (event.target?.closest?.(".player-controls")) return
  }

  stopReverseBoost(event, options = {}) {
    if (this.reverseBoostTimer) {
      clearTimeout(this.reverseBoostTimer)
      this.reverseBoostTimer = null
    }
    if (!this.isReverseBoosting) return
    this.isReverseBoosting = false
    if (!options.keepBadge) {
      this.hideSpeedBadge()
    }
    const video = this.playerTarget
    if (video && this.reverseWasPlaying) {
      video.play().catch(() => {})
    }
    if (event?.pointerId) {
      try {
        this.playerTarget.releasePointerCapture(event.pointerId)
      } catch (e) { /* ignore */ }
    }
  }

  enableReverseBoost() {
    const video = this.playerTarget
    if (!video || this.isReverseBoosting) return
    this.basePlaybackRate = video.playbackRate || 1
    this.reverseWasPlaying = !video.paused
    video.pause()
    this.isReverseBoosting = true
    this.showRewindBadge(this.rewindSeconds())
    this.stepReverseOnce()
    setTimeout(() => this.stopReverseBoost(null, { keepBadge: true }), 200)
  }

  stepReverseOnce() {
    const video = this.playerTarget
    if (!video) return
    const step = this.rewindSeconds()
    const nextTime = Math.max(0, video.currentTime - step)
    video.currentTime = nextTime
    if (Number.isFinite(video.duration) && this.hasProgressTarget) {
      const percent = (nextTime / video.duration) * 100
      if (Number.isFinite(percent)) {
        this.progressTarget.value = percent
        this.updateProgressUI(percent)
      }
    }
    if (this.hasCurrentTimeTarget) {
      this.currentTimeTarget.textContent = this.formatTime(video.currentTime)
    }
  }

  preventContextMenu(event) {
    event.preventDefault()
  }

  updateProgress() {
    const video = this.playerTarget
    if (!video || !this.hasProgressTarget) return

    // Avoid fighting user input while they are scrubbing the seek bar
    if (this.isScrubbing) return

    const percent = (video.currentTime / video.duration) * 100
    if (Number.isFinite(percent)) {
      this.progressTarget.value = percent
      this.updateProgressUI(percent)
    }
    this.currentTimeTarget.textContent = this.formatTime(video.currentTime)
  }

  onProgressInput(e) {
    this.showControls()
    this.isScrubbing = true
    const percent = parseFloat(e.target.value)
    this.updateProgressUI(percent)

    const video = this.playerTarget
    if (video && video.duration) {
      const time = (percent / 100) * video.duration
      this.currentTimeTarget.textContent = this.formatTime(time)
    }
  }

  onProgressChange(e) {
    this.showControls()
    this.isScrubbing = false
    const percent = parseFloat(e.target.value)
    this.seekToPercent(percent)
  }

  onProgressClick(event) {
    this.showControls()
    if (event.target === this.progressTarget) return

    const track = this.progressBarTarget?.parentElement || this.progressTarget
    if (!track) return

    const clientX = event.clientX ?? event.touches?.[0]?.clientX
    if (clientX === undefined) return

    const rect = track.getBoundingClientRect()
    if (!rect.width) return

    const percent = ((clientX - rect.left) / rect.width) * 100
    this.seekToPercent(percent)
  }

  updateProgressUI(percent) {
    if (this.hasProgressBarTarget) {
      this.progressBarTarget.style.width = `${percent}%`
    }
    if (this.hasProgressHandleTarget) {
      this.progressHandleTarget.style.left = `${percent}%`
    }
  }

  seekToPercent(percent) {
    const clamped = Math.min(Math.max(percent, 0), 100)
    if (this.hasProgressTarget) {
      this.progressTarget.value = clamped
    }
    this.updateProgressUI(clamped)

    const video = this.playerTarget
    if (video && Number.isFinite(video.duration)) {
      video.currentTime = (clamped / 100) * video.duration
      this.currentTimeTarget.textContent = this.formatTime(video.currentTime)
    }
  }

  onLoadedMetadata() {
    this.durationTarget.textContent = this.formatTime(this.playerTarget.duration)
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

  toggleSpeedMenu() {
    this.showControls()
    if (!this.hasSpeedMenuTarget) return
    this.speedMenuTarget.classList.toggle("hidden")
  }

  setPlaybackRate(event) {
    this.showControls()
    const rate = parseFloat(event.params.rate || event.currentTarget?.dataset?.rate)
    if (!Number.isFinite(rate)) return
    this.basePlaybackRate = rate
    if (!this.isSpeedBoosting && this.playerTarget) {
      this.playerTarget.playbackRate = rate
    }
    this.updateSpeedUI()
    this.hideSpeedMenu()
  }

  hideSpeedMenu() {
    if (!this.hasSpeedMenuTarget) return
    this.speedMenuTarget.classList.add("hidden")
  }

  bindGlobalHandlers() {
    if (this.boundGlobalPointerDown) return
    this.boundGlobalPointerDown = (event) => {
      if (!this.hasSpeedMenuTarget || this.speedMenuTarget.classList.contains("hidden")) return
      const inMenu = this.speedMenuTarget.contains(event.target)
      const inButton = this.hasSpeedButtonTarget && this.speedButtonTarget.contains(event.target)
      if (inMenu || inButton) return
      this.hideSpeedMenu()
    }
    document.addEventListener("pointerdown", this.boundGlobalPointerDown, true)
  }

  updateSpeedUI() {
    if (this.hasSpeedButtonTarget) {
      this.speedButtonTarget.textContent = `${this.basePlaybackRate || 1}x`
    }
    if (this.hasSpeedMenuTarget) {
      const buttons = this.speedMenuTarget.querySelectorAll("button[data-video-switcher-rate-param]")
      buttons.forEach((button) => {
        const rate = parseFloat(button.dataset.videoSwitcherRateParam)
        const isActive = Number.isFinite(rate) && Math.abs(rate - (this.basePlaybackRate || 1)) < 0.001
        button.classList.toggle("bg-white/10", isActive)
        button.classList.toggle("text-white", isActive)
        button.classList.toggle("text-white/70", !isActive)
      })
    }
  }

  updateSpeedBadge(rate) {
    if (!this.hasSpeedBadgeTarget || !this.hasSpeedBadgeValueTarget) return
    this.clearBadgeTimer()
    this.speedBadgeValueTarget.textContent = `${rate.toFixed(2)}x`
    this.speedBadgeTarget.classList.remove("opacity-0", "invisible")
  }

  showRewindBadge(seconds) {
    if (!this.hasSpeedBadgeTarget || !this.hasSpeedBadgeValueTarget) return
    this.clearBadgeTimer()
    this.speedBadgeValueTarget.textContent = `⟲ ${seconds.toFixed(0)}s`
    this.speedBadgeTarget.classList.remove("opacity-0", "invisible")
    this.badgeHideTimer = setTimeout(() => this.hideSpeedBadge(), 450)
  }

  clearBadgeTimer() {
    if (this.badgeHideTimer) {
      clearTimeout(this.badgeHideTimer)
      this.badgeHideTimer = null
    }
  }

  hideSpeedBadge() {
    if (!this.hasSpeedBadgeTarget) return
    this.clearBadgeTimer()
    this.speedBadgeTarget.classList.add("opacity-0", "invisible")
  }

  onProgressHover(event) {
    this.showControls()
    if (this.isScrubbing) return
    if (!this.previewUrls.length) return
    const track = this.progressBarTarget?.parentElement || this.progressTarget
    if (!track) return
    const clientX = event.clientX ?? event.touches?.[0]?.clientX
    if (clientX === undefined) return
    const rect = track.getBoundingClientRect()
    if (!rect.width) return
    const percent = ((clientX - rect.left) / rect.width) * 100
    this.showPreviewAtPercent(percent, rect)
  }

  showPreviewAtPercent(percent, trackRect) {
    if (!this.previewUrls.length) return
    const video = this.playerTarget
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return
    const clamped = Math.min(Math.max(percent, 0), 100)
    const time = (clamped / 100) * video.duration
    const index = Math.min(Math.floor((time / video.duration) * this.previewUrls.length), this.previewUrls.length - 1)
    const url = this.previewUrls[index]
    if (!url || !this.hasPreviewTarget || !this.hasPreviewImageTarget || !this.hasPreviewTimeTarget) return

    this.previewImageTarget.src = url
    this.previewTimeTarget.textContent = this.formatTime(time)
    this.previewTarget.classList.remove("opacity-0", "invisible")

    const trackWidth = trackRect?.width || this.previewTarget.parentElement?.clientWidth || 1
    const previewWidth = this.previewTarget.getBoundingClientRect().width || 1
    const leftPx = (clamped / 100) * trackWidth
    const boundedLeft = Math.min(Math.max(leftPx, previewWidth / 2), trackWidth - previewWidth / 2)
    const leftPercent = (boundedLeft / trackWidth) * 100
    this.previewTarget.style.left = `${leftPercent}%`
  }

  hidePreview() {
    if (!this.hasPreviewTarget) return
    this.previewTarget.classList.add("opacity-0", "invisible")
  }

  stopEvent(event) {
    const target = event.target
    const isRange = target?.tagName === "INPUT" && target.type === "range"
    event.stopPropagation()
    if (!isRange) {
      event.preventDefault()
    }
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
    this.persistVolume()
    this.updateVolumeUI()
  }

  onVolumeChange() {
    this.persistVolume()
    this.updateVolumeUI()
  }

  updateVolumeUI() {
    const video = this.playerTarget
    if (!video) return
    const isMuted = video.muted || video.volume === 0

    this.volumeIconTarget.classList.toggle("hidden", isMuted)
    this.muteIconTarget.classList.toggle("hidden", !isMuted)
    if (this.hasVolumeSliderTarget) {
      this.volumeSliderTarget.value = video.muted ? 0 : video.volume
    }
  }

  persistVolume() {
    const video = this.playerTarget
    if (!video) return
    const payload = { volume: video.volume, muted: video.muted }
    try {
      localStorage.setItem("playerVolume", JSON.stringify(payload))
    } catch (e) { /* ignore */ }
  }

  restoreVolume() {
    const video = this.playerTarget
    if (!this.hasPlayerTarget) return
    if (!video) return
    try {
      const raw = localStorage.getItem("playerVolume")
      if (!raw) return
      const data = JSON.parse(raw)
      const volume = parseFloat(data?.volume)
      if (Number.isFinite(volume)) {
        video.volume = Math.min(Math.max(volume, 0), 1)
      }
      if (typeof data?.muted === "boolean") {
        video.muted = data.muted
      }
    } catch (e) { /* ignore */ }
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
    let current = this.capturesById.get(this.currentIdValue)
    if (!current && this.capturesValue.length > 0) {
      this.currentIdValue = this.capturesValue[0].id
      current = this.capturesById.get(this.currentIdValue)
    }
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

    this.setPreviewForCapture(capture)

    return this.loadNative(video, capture.url, capture)
      .finally(() => {
        this.applyBasePlaybackRate()
        this.seekAndMaybePlay(targetTime, autoPlay)
        this.syncPlayPauseUI()
      })
  }

  updateLabel(capture) {
    if (!this.hasLabelTarget) return
    const offset = this.offsetSeconds(capture)
    const basePart = offset === 0 ? this.baseLabel() : this.formatTemplate(this.offsetLabel(), { offset: offset.toFixed(3) })
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
        button.appendChild(this.buildCameraIcon())
        const label = document.createElement("span")
        label.textContent = String(capture.id)
        button.appendChild(label)
        button.addEventListener("pointerdown", (e) => {
          e.stopPropagation()
        })
        button.addEventListener("pointerup", (e) => {
          e.stopPropagation()
        })
        button.addEventListener("click", (e) => {
          e.stopPropagation()
          this.switchTo(Number(capture.id))
        })
        container.appendChild(button)
      })
    })

    this.updateActiveSourceButton()
  }

  buildCameraIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("viewBox", "0 0 488.3 488.3")
    svg.setAttribute("aria-hidden", "true")
    svg.setAttribute("class", "w-3 h-3 shrink-0")
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("fill", "currentColor")
    path.setAttribute("d", "M488.3,142.5v203.1c0,15.7-17,25.5-30.6,17.7l-84.6-48.8v13.9c0,41.8-33.9,75.7-75.7,75.7H75.7C33.9,404.1,0,370.2,0,328.4V159.9c0-41.8,33.9-75.7,75.7-75.7h221.8c41.8,0,75.7,33.9,75.7,75.7v13.9l84.6-48.8C471.3,117,488.3,126.9,488.3,142.5z")
    svg.appendChild(path)
    return svg
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
      preview_thumbnails: Array.isArray(capture.preview_thumbnails) ? capture.preview_thumbnails : []
    }
  }

  loadingText() {
    return this.hasLoadingTextValue ? this.loadingTextValue : "Loading…"
  }

  baseLabel() {
    return this.hasBaseLabelValue ? this.baseLabelValue : "Base"
  }

  offsetLabel() {
    return this.hasOffsetLabelValue ? this.offsetLabelValue : "Offset: %{offset}s"
  }

  cameraLabel() {
    return this.hasCameraLabelValue ? this.cameraLabelValue : "CAM %{id}"
  }

  formatTemplate(template, vars) {
    return String(template).replace(/%\{(\w+)\}/g, (_match, key) => {
      const value = vars[key]
      return value === undefined || value === null ? "" : String(value)
    })
  }

  setPreviewForCapture(capture) {
    this.previewUrls = Array.isArray(capture?.preview_thumbnails) ? capture.preview_thumbnails : []
    if (!this.previewUrls.length) {
      this.hidePreview()
    }
  }

  applyBasePlaybackRate() {
    if (!this.playerTarget || this.isSpeedBoosting) return
    this.playerTarget.playbackRate = this.basePlaybackRate || 1
    this.updateSpeedUI()
  }

  loadNative(video, src, capture) {
    return new Promise((resolve) => {
      const isHls = /\.m3u8($|\?)/i.test(String(src))

      const cleanup = () => {
        clearTimeout(timeout)
        video.removeEventListener("loadedmetadata", done)
      }

      const done = () => {
        if (finished) return
        finished = true
        cleanup()
        resolve()
      }

      // timeout fallback in case loadedmetadata never fires
      const timeout = setTimeout(done, 5000)

      // destroy any previous hls instance
      if (this.hls) {
        try { this.hls.destroy() } catch (e) { /* ignore */ }
        this.hls = null
      }

      let finished = false

      // If source looks like HLS and hls.js is supported, use it
      const Hls = HlsModule.default ?? HlsModule.Hls ?? HlsModule
      if (isHls && Hls && Hls.isSupported && Hls.isSupported()) {
        this.mediaErrorRecoveries = 0
        this.hls = new Hls({
          enableWorker: true,
          capLevelToPlayerSize: true,
          startLevel: -1,
          overrideNative: true,
          backBufferLength: 10,
          maxBufferLength: 12,
          maxBufferHole: 0.5
        })
        this.hls.attachMedia(video)
        // When media is attached, load the source
        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          try {
            this.hls.loadSource(src)
          } catch (e) {
            // fallback to native src assignment on error
            video.src = src
            video.load()
          }
        })
        this.setupHlsErrorRecovery(this.hls, video, src)

        // resolve when native loadedmetadata fires
        video.addEventListener("loadedmetadata", done, { once: true })
      } else {
        video.addEventListener("loadedmetadata", done, { once: true })
        video.src = src
        video.load()
        if (video.readyState >= 1) done()
      }
    })
  }

  disconnect() {
    if (this.speedBoostTimer) {
      clearTimeout(this.speedBoostTimer)
      this.speedBoostTimer = null
    }
    if (this.playerTargetWait) {
      cancelAnimationFrame(this.playerTargetWait)
      this.playerTargetWait = null
    }
    if (this.boundGlobalPointerDown) {
      document.removeEventListener("pointerdown", this.boundGlobalPointerDown, true)
      this.boundGlobalPointerDown = null
    }
    this.hidePreview()
    if (this.hls) {
      try { this.hls.destroy() } catch (e) { /* ignore */ }
      this.hls = null
    }
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

  setupHlsErrorRecovery(hls, video, src) {
    if (!hls) return

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data?.fatal) return

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad()
        return
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        this.mediaErrorRecoveries = (this.mediaErrorRecoveries || 0) + 1
        if (this.mediaErrorRecoveries <= 3) {
          hls.recoverMediaError()
          return
        }
      }

      // Fallback to native playback if recovery failed
      try { hls.destroy() } catch (e) { /* ignore */ }
      this.hls = null
      video.src = src
      video.load()
    })
  }
}
