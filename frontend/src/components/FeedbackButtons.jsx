import { useState } from 'react'

const API_BASE = '/api'

export default function FeedbackButtons({ transcript, language, schemeId }) {
  const [voted, setVoted] = useState(null)   // null | 1 | -1

  const handleVote = async (rating) => {
    if (voted !== null) return
    setVoted(rating)
    try {
      await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_text: transcript || '',
          rating,
          language: language || 'en-IN',
          scheme_id: schemeId || null,
        }),
      })
    } catch (_) {
      // Fire-and-forget — don't alarm user if feedback fails
    }
  }

  if (voted !== null) {
    return (
      <div className="feedback-thankyou" role="status" aria-live="polite">
        <span className="feedback-emoji">{voted === 1 ? '🙏' : '🙏'}</span>
        <span className="feedback-thanks-text">
          {voted === 1 ? 'Thank you for the positive feedback!' : 'We\'ll try to improve — thank you!'}
        </span>
      </div>
    )
  }

  return (
    <div className="feedback-row" role="group" aria-label="Rate this response">
      <span className="feedback-label">Was this helpful?</span>
      <button
        id="feedback-thumbsup"
        className="feedback-btn feedback-up"
        onClick={() => handleVote(1)}
        aria-label="Thumbs up - helpful"
      >
        👍
      </button>
      <button
        id="feedback-thumbsdown"
        className="feedback-btn feedback-down"
        onClick={() => handleVote(-1)}
        aria-label="Thumbs down - not helpful"
      >
        👎
      </button>
    </div>
  )
}
