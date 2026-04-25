import { useState, useCallback, useEffect } from 'react'
import LanguageSelector from './components/LanguageSelector'
import MicButton from './components/MicButton'
import ResponseCard, { ResponseCardSkeleton } from './components/ResponseCard'
import HistoryPanel from './components/HistoryPanel'
import TypingInput from './components/TypingInput'
import SchemeBrowser from './pages/SchemeBrowser'
import AboutPage from './pages/AboutPage'
import HelpPage from './pages/HelpPage'
import EligibilityChecker from './components/EligibilityChecker'
import DemoMode from './components/DemoMode'
import Modal from './components/Modal'
import StatsBar from './components/StatsBar'
import FloatingParticles from './components/FloatingParticles'

const API_BASE = '/api'

const TAGLINES = {
  'mr-IN': 'सरकारी सेवा, आता सोप्या भाषेत',
  'hi-IN': 'सरकारी सेवाएं, अब आसान भाषा में',
  'en-IN': 'Government services, now in simple language',
  'auto':  'Speak in any language — we understand',
}
const LANG_LABELS = {
  'mr-IN': 'Marathi', 'hi-IN': 'Hindi', 'en-IN': 'English', 'auto': 'Auto',
}
const DEMO_QUERIES = {
  'mr-IN': [
    { icon: '🍚', text: 'रेशन कार्ड कसे बनवायचे?' },
    { icon: '🏥', text: 'आयुष्मान भारत योजना काय आहे?' },
  ],
  'hi-IN': [
    { icon: '🪪', text: 'आधार कार्ड कैसे अपडेट करें?' },
    { icon: '🌾', text: 'पीएम किसान योजना में कैसे आवेदन करें?' },
  ],
  'en-IN': [
    { icon: '🌾', text: 'How do I apply for PM-KISAN scheme?' },
    { icon: '🎓', text: 'How do I apply for MahaDBT scholarship?' },
  ],
  'auto': [
    { icon: '🍚', text: 'रेशन कार्ड कसे बनवायचे?' },
    { icon: '🌾', text: 'How do I apply for PM-KISAN scheme?' },
  ],
}

export default function App() {
  const [language, setLanguage]       = useState('mr-IN')
  const [isProcessing, setProcessing] = useState(false)
  const [response, setResponse]       = useState(null)
  const [error, setError]             = useState(null)
  const [history, setHistory]         = useState([])
  const [view, setView]               = useState('main')   // 'main' | 'schemes' | 'about' | 'help' | 'eligibility'
  const [demoMode, setDemoMode]       = useState(false)
  const [isOnline, setIsOnline]       = useState(navigator.onLine)

  // ── Online/offline detection ──────────────────────────────────────────────
  useEffect(() => {
    const goOnline  = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const pushHistory = useCallback((entry) => {
    setHistory(prev => [...prev, { ...entry, timestamp: Date.now() }])
  }, [])

  const handleReset = () => { setResponse(null); setError(null) }
  const handleLangChange = (lang) => { setLanguage(lang); handleReset() }

  // ── Submit audio ────────────────────────────────────────────────────────
  const submitAudio = useCallback(async (audioBlob) => {
    setProcessing(true); setError(null); setResponse(null)
    try {
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'recording.webm')
      formData.append('language', language)
      const res = await fetch(`${API_BASE}/voice`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Please try again.')
      const data = await res.json()
      setResponse(data)
      pushHistory({ transcript: data.transcript, responseText: data.response_text, audioBase64: data.audio_base64, languageLabel: LANG_LABELS[data.detected_language || language] || 'Auto' })
    } catch (err) { setError(err.message || 'Please try again.') }
    finally { setProcessing(false) }
  }, [language, pushHistory])

  // ── Submit demo text ────────────────────────────────────────────────────
  const submitDemoText = useCallback(async (text) => {
    setProcessing(true); setError(null); setResponse(null)
    try {
      const blob = new Blob([text], { type: 'text/plain' })
      const formData = new FormData()
      formData.append('audio_file', blob, 'demo.txt')
      formData.append('language', language === 'auto' ? 'en-IN' : language)
      formData.append('demo_text', text)
      const res = await fetch(`${API_BASE}/voice`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Please try again.')
      const data = await res.json()
      setResponse(data)
      pushHistory({ transcript: data.transcript, responseText: data.response_text, audioBase64: data.audio_base64, languageLabel: LANG_LABELS[language] || 'Auto' })
    } catch (err) { setError(err.message || 'Please try again.') }
    finally { setProcessing(false) }
  }, [language, pushHistory])

  // ── Submit typed text ───────────────────────────────────────────────────
  const submitTypedText = useCallback(async (text) => {
    setProcessing(true); setError(null); setResponse(null)
    try {
      const effectiveLang = language === 'auto' ? 'en-IN' : language
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: effectiveLang }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Please try again.')
      const data = await res.json()
      setResponse(data)
      pushHistory({ transcript: data.transcript, responseText: data.response_text, audioBase64: data.audio_base64, languageLabel: LANG_LABELS[effectiveLang] || 'EN' })
    } catch (err) { setError(err.message || 'Please try again.') }
    finally { setProcessing(false) }
  }, [language, pushHistory])

  // ── Demo Mode callback (called by DemoMode component) ──────────────────
  const handleDemoResponse = useCallback((mockData, processing) => {
    setProcessing(processing)
    setError(null)
    if (!processing && mockData) setResponse(mockData)
    if (!processing && !mockData) setResponse(null)
  }, [])

  const demos = DEMO_QUERIES[language] || DEMO_QUERIES['en-IN']

  // ── Scheme browser view ──────────────────────────────────────────────────
  if (view === 'schemes') {
    return (
      <div className="app">
        <div className="main-content">
          <SchemeBrowser language={language} onBack={() => setView('main')} />
        </div>
      </div>
    )
  }

  // ── About page view ──────────────────────────────────────────────────────
  if (view === 'about') {
    return (
      <div className="app">
        <FloatingParticles />
        <div className="main-content">
          <AboutPage onBack={() => setView('main')} />
        </div>
      </div>
    )
  }

  // ── Help page view ───────────────────────────────────────────────────────
  if (view === 'help') {
    return (
      <div className="app">
        <FloatingParticles />
        <div className="main-content">
          <HelpPage onBack={() => setView('main')} />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <FloatingParticles />
      {/* ── Offline banner ────────────────────────────────────────── */}
      {!isOnline && (
        <div className="offline-banner" role="alert">
          📵 Offline mode — Scheme Browser available. Voice queries need internet.
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-emblem" aria-hidden="true">🏛️</div>
          <div className="logo-text">
            <h1>NaamSeva</h1>
            <p>नामसेवा · सरकारी सहायक</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            id="demo-mode-toggle"
            className={`demo-toggle-btn ${demoMode ? 'demo-toggle-active' : ''}`}
            onClick={() => setDemoMode(d => !d)}
            aria-pressed={demoMode}
            aria-label="Toggle demo mode"
          >
            🎭 Demo
          </button>
          <button id="schemes-nav-btn" className="schemes-nav-btn" onClick={() => setView('schemes')}>
            📋 Schemes
          </button>
          <button className="schemes-nav-btn" onClick={() => setView('about')}>
            ℹ️ About
          </button>
          <button className="schemes-nav-btn" onClick={() => setView('help')}>
            ❓ Help
          </button>
          <span className="beta-badge">v2.0</span>
        </div>
      </header>

      <p className="app-tagline" aria-live="polite">{TAGLINES[language]}</p>

      {/* ── Demo Mode Panel ───────────────────────────────────────── */}
      {demoMode && (
        <div className="main-content" style={{ paddingBottom: 0 }}>
          <DemoMode
            isActive={demoMode}
            onResponse={handleDemoResponse}
            onLanguageChange={setLanguage}
            onToggle={() => setDemoMode(false)}
          />
        </div>
      )}

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="main-content" id="main">
        <LanguageSelector selected={language} onSelect={handleLangChange} />

        {/* Stats bar */}
        {!response && !isProcessing && <StatsBar />}

        {/* Eligibility checker CTA */}
        {!response && !isProcessing && (
          <button
            id="eligibility-cta-btn"
            className="eligibility-cta"
            onClick={() => setView('eligibility')}
            aria-haspopup="dialog"
          >
            <span className="eligibility-cta-icon">✅</span>
            <div>
              <p className="eligibility-cta-title">Check My Eligibility</p>
              <p className="eligibility-cta-sub">3 questions → matching schemes</p>
            </div>
            <span className="eligibility-cta-arrow">→</span>
          </button>
        )}

        <div className="divider" />

        {/* Loading skeleton */}
        {isProcessing && <ResponseCardSkeleton />}

        {/* Response card */}
        {!isProcessing && response && (
          <ResponseCard
            transcript={response.transcript}
            responseText={response.response_text}
            audioBase64={response.audio_base64}
            detectedLanguage={response.detected_language}
            matchedScheme={response.matched_scheme}
            language={language}
            onReset={handleReset}
          />
        )}

        {/* Mic + controls */}
        {!isProcessing && !response && (
          <>
            <MicButton onAudioReady={submitAudio} isProcessing={isProcessing} />
            <TypingInput onSubmit={submitTypedText} isProcessing={isProcessing} language={language} />
            <div className="divider" />
            <div className="demo-queries">
              <p className="section-label">⚡ Quick Demo Queries</p>
              <div className="demo-pills">
                {demos.map(({ icon, text }) => (
                  <button
                    key={text}
                    id={`demo-${text.slice(0, 10).replace(/[\s?]/g, '-')}`}
                    className="demo-pill"
                    onClick={() => submitDemoText(text)}
                    disabled={isProcessing}
                  >
                    <span className="demo-pill-icon">{icon}</span>
                    <span className="demo-pill-text">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="error-toast" role="alert">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <p className="error-title">Something went wrong</p>
              <p className="error-message">{error}</p>
            </div>
            <button className="error-dismiss" onClick={() => setError(null)} aria-label="Dismiss">✕</button>
          </div>
        )}

        <div className="divider" />
        <HistoryPanel history={history} />
      </main>

      {/* ── Eligibility Checker modal-style view ─────────────────── */}
      <Modal
        isOpen={view === 'eligibility'}
        onClose={() => setView('main')}
        title="Eligibility Checker"
      >
        <EligibilityChecker
          language={language}
          onClose={() => setView('main')}
          onViewScheme={(schemeId) => {
            setView('main')
            setTimeout(() => {
              setView('schemes')
            }, 100)
          }}
        />
      </Modal>

      <footer className="app-footer">
        <p className="footer-text">Powered by Sarvam AI · Google Gemini · Made with ❤️ for Bharat</p>
        <p className="footer-text" style={{ marginTop: '4px', fontSize: '0.6rem' }}>Team VALOVEX · MIT BFB 26 Hackathon · 35+ Government Schemes</p>
        <div className="footer-flag">
          <span className="flag-saffron">▬▬▬</span>
          <span className="flag-white">▬▬▬</span>
          <span className="flag-green">▬▬▬</span>
        </div>
      </footer>
    </div>
  )
}
