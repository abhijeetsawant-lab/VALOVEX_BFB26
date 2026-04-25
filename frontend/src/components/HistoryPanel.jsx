import { useState, useRef, useEffect } from 'react'
import AudioPlayer from './AudioPlayer'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function HistoryItem({ item, index }) {
  const [expanded, setExpanded] = useState(false)
  const [replayKey, setReplayKey] = useState(0)

  return (
    <div className="history-item" id={`history-item-${index}`}>
      <button
        className="history-summary"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        aria-controls={`history-detail-${index}`}
      >
        <div className="history-meta">
          <span className="history-time">{formatTime(item.timestamp)}</span>
          <span className="history-lang-tag">{item.languageLabel}</span>
        </div>
        <p className="history-query">{item.transcript}</p>
        <span className="history-chevron" aria-hidden="true">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="history-detail" id={`history-detail-${index}`}>
          <p className="history-response">{item.responseText}</p>
          <button
            className="history-replay-btn"
            onClick={() => setReplayKey(k => k + 1)}
            aria-label="Replay audio response"
          >
            🔊 Replay Audio
          </button>
          {/* Re-mount AudioPlayer on each replay */}
          {replayKey > 0 && (
            <AudioPlayer key={replayKey} audioBase64={item.audioBase64} />
          )}
        </div>
      )}
    </div>
  )
}

export default function HistoryPanel({ history }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history.length])

  if (!history.length) return null

  return (
    <div className="history-panel" role="region" aria-label="Conversation history">
      <p className="section-label">🕘 Conversation History ({history.length})</p>
      <div className="history-list">
        {[...history].reverse().map((item, i) => (
          <HistoryItem key={item.timestamp} item={item} index={history.length - 1 - i} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
