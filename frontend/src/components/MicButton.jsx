import { useRef, useState, useCallback } from 'react'

export default function MicButton({ onAudioReady, isProcessing }) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : MediaRecorder.isTypeSupported('audio/webm')
        ? { mimeType: 'audio/webm' }
        : {}

      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        stream.getTracks().forEach((t) => t.stop())
        onAudioReady(blob)
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Microphone access denied:', err)
      alert('Microphone access is required. Please allow microphone permission and try again.')
    }
  }, [onAudioReady])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const handleMouseDown = () => {
    if (!isProcessing && !isRecording) startRecording()
  }

  const handleMouseUp = () => {
    if (isRecording) stopRecording()
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    if (!isProcessing && !isRecording) startRecording()
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    if (isRecording) stopRecording()
  }

  const getMicClass = () => {
    if (isProcessing) return 'mic-btn mic-btn-processing'
    if (isRecording) return 'mic-btn mic-btn-recording'
    return 'mic-btn'
  }

  const getMicIcon = () => {
    if (isProcessing) return '⏳'
    if (isRecording) return '⏹️'
    return '🎙️'
  }

  return (
    <div className="mic-section">
      <div className={`mic-wrapper ${isRecording ? 'mic-btn-recording' : ''}`}>
        {/* Pulse rings – only visible while recording */}
        <span className="pulse-ring pulse-ring-1" aria-hidden="true" />
        <span className="pulse-ring pulse-ring-2" aria-hidden="true" />
        <span className="pulse-ring pulse-ring-3" aria-hidden="true" />

        <button
          id="mic-button"
          className={getMicClass()}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={isProcessing}
          aria-label={isRecording ? 'Stop recording' : 'Hold to speak'}
          aria-pressed={isRecording}
        >
          <span className="mic-icon">{getMicIcon()}</span>
        </button>
      </div>

      {/* Animated waveform while recording */}
      {isRecording && (
        <div className="waveform" aria-label="Recording in progress">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="wave-bar" />
          ))}
        </div>
      )}

      <p className="mic-label">
        {isProcessing ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Processing…
          </>
        ) : isRecording ? (
          'Release to send'
        ) : (
          'Hold mic to speak'
        )}
      </p>
    </div>
  )
}
