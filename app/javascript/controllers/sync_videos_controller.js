import { Controller } from "@hotwired/stimulus"

// Synchronizes multiple videos using a manually selected anchor frame per video.
// Flow:
// 1) User sets an anchor on each video (stores currentTime).
// 2) "Play" aligns all videos so anchors appear at the same playback moment.
// 3) Buffering ("waiting") pauses everyone; resume happens together once data arrives.
export default class extends Controller {
  static targets = ["video", "status"]

  connect() {
    this.anchorTimes = new Map() // index -> seconds
    this.manuallyPaused = true
    this.blockedByBuffering = false
    this.waitingVideos = new Set()
    this.applyOffsetsFromDataset()
  }

  setAnchor(event) {
    const index = Number(event.params.index)
    const video = this.findVideo(index)

    if (!video) return

    if (video.readyState < 1) {
      this.updateStatus(index, "Жду метаданные, чтобы зафиксировать контрольный кадр…")
      video.addEventListener("loadedmetadata", () => this.storeAnchor(video, index), { once: true })
      video.load()
      return
    }

    this.storeAnchor(video, index)
  }

  markReady(event) {
    const index = this.indexFor(event.currentTarget)
    if (this.anchorTimes.has(index)) {
      this.updateStatus(index, this.anchorText(this.anchorTimes.get(index)))
    } else {
      this.updateStatus(index, "Видео готово. Выберите контрольный кадр.")
    }
  }

  playAll(event) {
    event?.preventDefault()

    if (!this.allAnchorsSet()) {
      this.notify("Сначала задайте контрольный кадр для каждого видео.")
      return
    }

    this.manuallyPaused = false
    this.alignToAnchors().then(() => {
      if (!this.blockedByBuffering) this.startPlayback()
    })
  }

  pauseAll(event) {
    event?.preventDefault()
    this.manuallyPaused = true
    this.blockedByBuffering = false
    this.videoTargets.forEach((video) => video.pause())
  }

  resetAnchors() {
    this.anchorTimes.clear()
    this.pauseAll()
    this.statusTargets.forEach((status) => (status.textContent = "Контрольный кадр не выбран"))
  }

  handleWaiting(event) {
    if (this.manuallyPaused) return
    this.blockedByBuffering = true
    this.waitingVideos.add(event.currentTarget)
    this.videoTargets.forEach((video) => video.pause())
  }

  handlePlaying(event) {
    this.waitingVideos.delete(event.currentTarget)
    if (this.manuallyPaused) return

    if (this.waitingVideos.size === 0 && this.blockedByBuffering) {
      this.blockedByBuffering = false
      this.startPlayback()
    }
  }

  handleEnded() {
    this.manuallyPaused = true
    this.videoTargets.forEach((video) => video.pause())
  }

  // Helpers
  storeAnchor(video, index) {
    const time = video.currentTime
    this.anchorTimes.set(index, time)
    this.updateStatus(index, this.anchorText(time))
  }

  anchorText(time) {
    return `Контрольный кадр: ${time.toFixed(2)}s`
  }

  applyOffsetsFromDataset() {
    const offsets = this.videoTargets
      .map((video) => {
        const rawOffset = video.dataset.syncVideosOffsetValue
        if (rawOffset === undefined || rawOffset === "") return null

        const parsed = Number(rawOffset)
        if (!Number.isFinite(parsed)) return null

        return { index: this.indexFor(video), offset: parsed }
      })
      .filter(Boolean)

    if (offsets.length === 0) return

    const maxOffset = Math.max(...offsets.map(({ offset }) => offset))
    offsets.forEach(({ index, offset }) => {
      const anchor = Math.max(maxOffset - offset, 0)
      this.anchorTimes.set(index, anchor)
      this.updateStatus(index, this.anchorText(anchor))
    })
  }

  alignToAnchors() {
    const earliest = Math.min(...Array.from(this.anchorTimes.values()))
    const seekPromises = this.videoTargets.map((video) => {
      const index = this.indexFor(video)
      const anchorTime = this.anchorTimes.get(index)
      const startTime = Math.max(anchorTime - earliest, 0)
      return this.seekTo(video, startTime)
    })

    return Promise.all(seekPromises)
  }

  seekTo(video, time) {
    return new Promise((resolve) => {
      const safeTime = isFinite(video.duration) ? Math.min(time, video.duration) : time

      const finish = () => {
        video.removeEventListener("seeked", finish)
        video.removeEventListener("error", finish)
        resolve()
      }

      if (video.readyState < 1) {
        video.addEventListener(
          "loadedmetadata",
          () => {
            video.currentTime = safeTime
          },
          { once: true }
        )
      } else {
        video.currentTime = safeTime
      }

      video.addEventListener("seeked", finish, { once: true })
      video.addEventListener("error", finish, { once: true })
    })
  }

  startPlayback() {
    this.videoTargets.forEach((video) => {
      if (video.paused) {
        video.play().catch(() => {
          // Autoplay could be blocked; let the user press play again.
        })
      }
    })
  }

  allAnchorsSet() {
    return this.videoTargets.every((video) => this.anchorTimes.has(this.indexFor(video)))
  }

  findVideo(index) {
    return this.videoTargets.find((video) => this.indexFor(video) === index)
  }

  indexFor(element) {
    return Number(element.dataset.syncVideosIndexValue)
  }

  updateStatus(index, text) {
    const status = this.statusTargets.find(
      (node) => Number(node.dataset.syncVideosIndexValue) === index
    )
    if (status) status.textContent = text
  }

  notify(message) {
    window?.alert ? window.alert(message) : console.warn(message)
  }
}
