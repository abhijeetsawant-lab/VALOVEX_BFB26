import { useRef, useState } from 'react'

/**
 * ShareCard — generates a PNG card and shares or downloads it.
 * Requires html2canvas loaded via CDN (added to index.html).
 * Falls back to Web Share API text if canvas capture fails.
 */
export default function ShareCard({ scheme, responseText }) {
  const cardRef = useRef(null)
  const [sharing, setSharing] = useState(false)

  const steps = (responseText || '')
    .split('\n')
    .filter((l) => l.trim())
    .slice(0, 3)

  const handleShare = async () => {
    if (sharing) return
    setSharing(true)
    try {
      let blob = null

      // ── Try html2canvas (CDN) ────────────────────────────────────
      if (window.html2canvas && cardRef.current) {
        try {
          const canvas = await window.html2canvas(cardRef.current, {
            backgroundColor: '#0f172a',
            scale: 2,
            useCORS: true,
            logging: false,
          })
          blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
        } catch (_) {
          blob = null
        }
      }

      // ── Web Share API ─────────────────────────────────────────────
      if (blob && navigator.share) {
        const file = new File([blob], 'naamseva-answer.png', { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `NaamSeva — ${scheme?.name || 'Government Services'}`,
            text: responseText?.slice(0, 120) || '',
            files: [file],
          })
          return
        }
      }

      // ── Download fallback ─────────────────────────────────────────
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href     = url
        a.download = `naamseva-${scheme?.id || 'answer'}.png`
        a.click()
        URL.revokeObjectURL(url)
        return
      }

      // ── Text share fallback if canvas not available ───────────────
      const text = [
        `🏛️ NaamSeva — ${scheme?.name || 'Government Service Info'}`,
        '',
        ...steps,
        '',
        scheme?.apply_url ? `Apply: ${scheme.apply_url}` : '',
        'via naamseva.app',
      ].filter(Boolean).join('\n')

      if (navigator.share) {
        await navigator.share({ title: 'NaamSeva', text })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed:', err)
    } finally {
      setSharing(false)
    }
  }

  return (
    <>
      {/* ── Hidden card used for html2canvas capture ─────────────── */}
      <div
        ref={cardRef}
        aria-hidden="true"
        style={{
          position: 'fixed', top: '-9999px', left: '-9999px',
          width: '360px', padding: '24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          fontFamily: '"Inter", "Noto Sans Devanagari", sans-serif',
          color: '#f1f5f9',
          border: '1px solid rgba(255,153,51,0.35)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '28px' }}>🏛️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff9933', lineHeight: 1.1 }}>NaamSeva</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>नामसेवा · सरकारी सहायक</div>
          </div>
          {/* QR code pointing to apply URL */}
          {scheme?.apply_url && (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(scheme.apply_url)}&bgcolor=1e293b&color=ff9933&margin=4`}
              alt="QR"
              crossOrigin="anonymous"
              style={{ width: '72px', height: '72px', borderRadius: '8px', border: '1px solid rgba(255,153,51,0.3)' }}
            />
          )}
        </div>

        {/* Scheme badge */}
        {scheme && (
          <div style={{
            background: 'rgba(255,153,51,0.1)',
            border: '1px solid rgba(255,153,51,0.25)',
            borderRadius: '8px', padding: '8px 12px', marginBottom: '14px',
            fontSize: '13px', fontWeight: 600, color: '#ffb866',
          }}>
            📌 {scheme.name}
          </div>
        )}

        {/* Steps */}
        <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.7 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
              <span style={{ color: '#ff9933', fontWeight: 700, minWidth: '18px' }}>{i + 1}.</span>
              <span>{step.replace(/^\d+\.\s*/, '')}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: '10px', fontSize: '10px', color: '#475569',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>naamseva.app</span>
          <span>Powered by Sarvam AI + Gemini</span>
        </div>
      </div>

      {/* ── Share button ──────────────────────────────────────────── */}
      <button
        id="share-response-btn"
        className="share-btn"
        onClick={handleShare}
        disabled={sharing}
        aria-label="Share this response as an image"
      >
        {sharing ? '⏳ Preparing…' : '📤 Share'}
      </button>
    </>
  )
}
