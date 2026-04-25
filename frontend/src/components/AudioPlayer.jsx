import { useEffect, useRef, useState } from 'react'

export default function AudioPlayer({ audioBase64 }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // Build audio src when base64 changes
  useEffect(() => {
    if (!audioBase64) return

    // Detect if it's already a data URL or raw base64
    const src = audioBase64.startsWith('data:')
      ? audioBase64
      : `data:audio/wav;base64,${audioBase64}`

    const audio = new Audio(src)
    audioRef.current = audio

    audio.onloadedmetadata = () => setDuration(audio.duration)

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }

    audio.onended = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    audio.onerror = (e) => {
      console.error('Audio playback error', e)
      setIsPlaying(false)
    }

    // Auto-play
    audio.play().then(() => setIsPlaying(true)).catch(() => {})

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [audioBase64])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!audioBase64) return null

  return (
    <div className="audio-player" role="region" aria-label="Audio response">
      <button
        id="audio-play-btn"
        className="audio-play-btn"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>

      <div className="audio-progress-wrap">
        <span className="audio-label">
          {isPlaying ? '🔊 Playing response…' : '🔇 Tap to replay'}
        </span>
        <div className="audio-progress-bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="audio-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
