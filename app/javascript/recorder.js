// Circular video recording with ActionCable integration
import { createConsumer } from "@rails/actioncable"

// Create ActionCable consumer
const consumer = createConsumer()


export class RecorderApp {
    constructor() {
        this.mediaRecorder = null
        this.stream = null
        this.chunks = [] // Circular buffer for video chunks
        this.isRecording = false
        this.uploadCount = 0
        this.cable = null

        // DOM elements
        this.startBtn = document.getElementById('startBtn')
        this.preview = document.getElementById('preview')
        this.status = document.getElementById('status')
        this.recordingIndicator = document.getElementById('recordingIndicator')
        this.bufferInfo = document.getElementById('bufferInfo')
        this.uploadCountEl = document.getElementById('uploadCount')
        this.wsStatus = document.getElementById('wsStatus')
        this.logContent = document.getElementById('logContent')

        this.init()
    }

    init() {
        this.startBtn.addEventListener('click', () => this.toggleRecording())
        this.connectWebSocket()
        this.log('Приложение запущено')
    }

    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording()
        } else {
            this.stopRecording()
        }
    }

    async startRecording() {
        try {
            this.log('Запрос разрешений на камеру и микрофон...')

            // Request all permissions upfront
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            })

            this.log('Разрешения получены', 'success')

            // Show preview
            this.preview.srcObject = this.stream

            // Set up MediaRecorder with 1-second chunks
            const options = {
                mimeType: 'video/webm;codecs=vp8,opus',
                videoBitsPerSecond: 2500000 // 2.5 Mbps
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options)

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.addChunk(event.data)
                }
            }

            this.mediaRecorder.onerror = (error) => {
                this.log(`Ошибка MediaRecorder: ${error}`, 'error')
            }

            // Start recording in 1-second chunks
            this.mediaRecorder.start(1000) // timeslice: 1 second
            this.isRecording = true

            this.updateUI()
            this.log('Запись началась', 'success')

        } catch (error) {
            this.log(`Ошибка: ${error.message}`, 'error')
            console.error('Recording error:', error)
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop()
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop())
        }

        this.isRecording = false
        this.chunks = []
        this.updateUI()
        this.log('Запись остановлена')
    }

    addChunk(blob) {
        const now = Date.now()
        this.chunks.push({ blob, timestamp: now })

        // Remove chunks older than 30 seconds
        const cutoff = now - 30000
        this.chunks = this.chunks.filter(chunk => chunk.timestamp >= cutoff)

        this.updateBufferInfo()
    }

    updateBufferInfo() {
        const seconds = this.chunks.length
        this.bufferInfo.textContent = `${seconds} сек`
    }

    connectWebSocket() {
        this.log('Подключение к WebSocket...')

        try {
            this.cable = consumer.subscriptions.create("RecordingChannel", {
                connected: () => {
                    this.log('WebSocket подключен', 'success')
                    this.wsStatus.textContent = 'Подключено'
                    this.wsStatus.style.color = 'var(--success)'
                    this.status.classList.add('connected')
                },

                disconnected: () => {
                    this.log('WebSocket отключен', 'error')
                    this.wsStatus.textContent = 'Отключено'
                    this.wsStatus.style.color = 'var(--danger)'
                    this.status.classList.remove('connected')
                },

                received: (data) => {
                    if (data.action === 'capture') {
                        this.log('Получен сигнал захвата!', 'success')
                        this.uploadBufferedVideo()
                    }
                }
            })
        } catch (error) {
            this.log(`Ошибка WebSocket: ${error.message}`, 'error')
        }
    }

    async uploadBufferedVideo() {
        if (this.chunks.length === 0) {
            this.log('Буфер пуст, нечего загружать', 'error')
            return
        }

        try {
            this.log(`Загрузка последних ${this.chunks.length} секунд видео...`)

            // Combine all chunks into one blob
            const blobs = this.chunks.map(chunk => chunk.blob)
            const combinedBlob = new Blob(blobs, { type: 'video/webm' })

            this.log(`Размер видео: ${(combinedBlob.size / 1024 / 1024).toFixed(2)} МБ`)

            // Upload to server
            const formData = new FormData()
            formData.append('video', combinedBlob, 'recording.webm')

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

            const response = await fetch('/recorder/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-Token': csrfToken
                }
            })

            const result = await response.json()

            if (result.success) {
                this.uploadCount++
                this.uploadCountEl.textContent = this.uploadCount
                this.log(`Видео загружено: ${result.filename}`, 'success')
            } else {
                this.log(`Ошибка загрузки: ${result.message}`, 'error')
            }

        } catch (error) {
            this.log(`Ошибка при загрузке: ${error.message}`, 'error')
            console.error('Upload error:', error)
        }
    }

    updateUI() {
        if (this.isRecording) {
            this.startBtn.classList.add('recording')
            this.startBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"></rect>
        </svg>
        <span>Остановить запись</span>
      `
            this.recordingIndicator.classList.add('active')
            this.status.classList.add('recording')
            this.status.querySelector('.status-text').textContent = 'Идет запись'
        } else {
            this.startBtn.classList.remove('recording')
            this.startBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
        </svg>
        <span>Включить запись</span>
      `
            this.recordingIndicator.classList.remove('active')
            this.status.classList.remove('recording')
            this.status.querySelector('.status-text').textContent = this.cable ? 'Подключено' : 'Не подключено'
        }
    }

    log(message, type = 'info') {
        const time = new Date().toLocaleTimeString('ru-RU')
        const entry = document.createElement('div')
        entry.className = `log-entry ${type}`
        entry.innerHTML = `<span class="time">${time}</span>${message}`

        this.logContent.insertBefore(entry, this.logContent.firstChild)

        // Keep only last 20 entries
        while (this.logContent.children.length > 20) {
            this.logContent.removeChild(this.logContent.lastChild)
        }
    }
}
