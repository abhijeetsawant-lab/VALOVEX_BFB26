import { useState } from 'react'
import AudioPlayer from './AudioPlayer'
import Modal from './Modal'
import FeedbackButtons from './FeedbackButtons'
import ShareCard from './ShareCard'

// ── Shimmer skeleton ────────────────────────────────────────────────────────
export function ResponseCardSkeleton() {
  return (
    <div className="response-card shimmer-card" aria-busy="true" aria-label="Loading response">
      <div className="response-header">
        <div className="shimmer shimmer-icon" />
        <div><div className="shimmer shimmer-title" /></div>
      </div>
      <div className="transcript-box">
        <div className="shimmer shimmer-line short" style={{ marginBottom: 8 }} />
        <div className="shimmer shimmer-line" />
      </div>
      <div className="shimmer shimmer-audio" />
      <div className="shimmer shimmer-line" style={{ marginBottom: 8 }} />
      <div className="shimmer shimmer-line" />
      <div className="shimmer shimmer-line medium" style={{ marginTop: 8 }} />
      <div className="action-buttons" style={{ marginTop: 16 }}>
        {[1,2,3].map(i => <div key={i} className="shimmer shimmer-action-btn" />)}
      </div>
    </div>
  )
}

const LANG_LABELS = { 'mr-IN': 'Marathi', 'hi-IN': 'Hindi', 'en-IN': 'English' }

const CATEGORY_COLORS = {
  agriculture: '#22c55e', health: '#f43f5e', housing: '#f59e0b',
  identity: '#6366f1', food: '#ea580c', education: '#0ea5e9',
  transport: '#8b5cf6', civil: '#64748b', welfare: '#ec4899',
}

export default function ResponseCard({
  transcript, responseText, audioBase64, detectedLanguage, matchedScheme, language, onReset,
}) {
  const [modal, setModal] = useState(null)

  const detectedLabel = detectedLanguage ? LANG_LABELS[detectedLanguage] || detectedLanguage : null
  const hasScheme = !!matchedScheme

  const actionButtons = [
    {
      id: 'action-docs', icon: '📄', label: 'Required\nDocuments',
      onClick: () => hasScheme ? setModal('docs') : null,
      active: hasScheme,
    },
    {
      id: 'action-apply', icon: '🔗', label: 'Apply\nOnline',
      onClick: () => hasScheme ? window.open(matchedScheme.apply_url, '_blank', 'noopener,noreferrer') : null,
      active: hasScheme,
    },
    {
      id: 'action-eligibility', icon: '✅', label: 'Eligibility\nCheck',
      onClick: () => hasScheme ? setModal('eligibility') : null,
      active: hasScheme,
    },
  ]

  return (
    <>
      <div className="response-card" role="region" aria-label="Assistant response">
        {/* Header */}
        <div className="response-header">
          <div className="response-icon" aria-hidden="true">🤖</div>
          <div style={{ flex: 1 }}>
            <p className="response-title">NaamSeva Response</p>
            {detectedLabel && <span className="detected-badge">🔍 Detected: {detectedLabel}</span>}
          </div>
          <button id="response-reset-btn" onClick={onReset} className="btn-new" aria-label="Ask new">↩ New</button>
        </div>

        {/* Matched scheme badge */}
        {hasScheme && (
          <div className="scheme-matched-badge">
            <span className="scheme-category-dot" style={{ background: CATEGORY_COLORS[matchedScheme.id] || '#6366f1' }} />
            <span>📌 {matchedScheme.name}</span>
            <span className="scheme-category-chip">{matchedScheme.category}</span>
          </div>
        )}

        {/* Transcript */}
        <div className="transcript-box">
          <p className="transcript-label"><span>🎙️</span> You said</p>
          <p className="transcript-text">{transcript}</p>
        </div>

        {/* Audio */}
        <AudioPlayer audioBase64={audioBase64} />

        {/* Response text */}
        <div className="divider" style={{ marginBottom: '14px' }} />
        <p className="response-text">{responseText}</p>

        {/* Action buttons */}
        <div className="action-buttons">
          {actionButtons.map(({ id, icon, label, onClick, active }) => (
            <button key={id} id={id} className={`action-btn ${active ? 'action-btn-active' : ''}`} onClick={onClick}>
              <span className="action-icon">{icon}</span>
              <span className="action-label" style={{ whiteSpace: 'pre-line' }}>{label}</span>
              {active && <span className="action-live-dot" aria-hidden="true" />}
            </button>
          ))}
        </div>

        <div className="divider" style={{ margin: '14px 0 10px' }} />

        {/* Feedback + Share row */}
        <div className="response-footer-row">
          <FeedbackButtons
            transcript={transcript}
            language={language}
            schemeId={matchedScheme?.id}
          />
          <ShareCard scheme={matchedScheme} responseText={responseText} />
        </div>
      </div>

      {/* Documents Modal */}
      <Modal isOpen={modal === 'docs'} onClose={() => setModal(null)} title={`📄 Required Documents — ${matchedScheme?.name || ''}`}>
        <p className="modal-scheme-benefit">{matchedScheme?.benefit}</p>
        <ul className="modal-doc-list">
          {(matchedScheme?.documents || []).map((doc, i) => (
            <li key={i} className="modal-doc-item">
              <span className="modal-doc-num">{i + 1}</span>
              <span>{doc}</span>
            </li>
          ))}
        </ul>
        <a href={matchedScheme?.apply_url} target="_blank" rel="noopener noreferrer" className="modal-apply-link">
          🔗 Apply at {matchedScheme?.apply_url_label}
        </a>
      </Modal>

      {/* Eligibility Modal */}
      <Modal isOpen={modal === 'eligibility'} onClose={() => setModal(null)} title={`✅ Eligibility — ${matchedScheme?.name || ''}`}>
        <div className="modal-eligibility-box">
          <p className="modal-eligibility-text">{matchedScheme?.eligibility}</p>
        </div>
        <div className="modal-benefit-box">
          <p className="modal-benefit-label">💰 Benefit</p>
          <p className="modal-benefit-text">{matchedScheme?.benefit}</p>
        </div>
      </Modal>
    </>
  )
}
