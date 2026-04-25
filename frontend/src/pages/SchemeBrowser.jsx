import { useState, useEffect, useMemo } from 'react'
import Modal from '../components/Modal'

const CATEGORY_COLORS = {
  agriculture: '#22c55e', health: '#f43f5e', housing: '#f59e0b',
  identity: '#6366f1', food: '#ea580c', education: '#0ea5e9',
  transport: '#8b5cf6', civil: '#64748b', welfare: '#ec4899',
}

const CATEGORY_ICONS = {
  agriculture: '🌾', health: '🏥', housing: '🏠', identity: '🪪',
  food: '🍚', education: '🎓', transport: '🚗', civil: '📋', welfare: '🤝',
}

function SchemeCard({ scheme, onClick }) {
  const color = CATEGORY_COLORS[scheme.category?.toLowerCase()] || '#6366f1'
  const icon = CATEGORY_ICONS[scheme.category?.toLowerCase()] || '📄'

  return (
    <button
      className="scheme-card"
      onClick={() => onClick(scheme)}
      aria-label={`View details for ${scheme.name}`}
      id={`scheme-card-${scheme.id}`}
    >
      <div className="scheme-card-header" style={{ borderColor: color + '44' }}>
        <span className="scheme-card-icon">{icon}</span>
        <span className="scheme-card-badge" style={{ color, background: color + '18', borderColor: color + '33' }}>
          {scheme.category_label || scheme.category}
        </span>
      </div>
      <p className="scheme-card-name">{scheme.name}</p>
      <p className="scheme-card-benefit">{scheme.benefit}</p>
      <span className="scheme-card-arrow" aria-hidden="true">→</span>
    </button>
  )
}

function SchemeDetail({ scheme, language }) {
  const langSuffix = language === 'mr-IN' ? 'mr' : language === 'hi-IN' ? 'hi' : 'en'
  const steps = scheme[`steps_${langSuffix}`] || scheme['steps_en'] || []
  const name = scheme[`name_${langSuffix}`] || scheme.name
  const color = CATEGORY_COLORS[scheme.category?.toLowerCase()] || '#6366f1'
  const icon = CATEGORY_ICONS[scheme.category?.toLowerCase()] || '📄'

  return (
    <div className="scheme-detail">
      <div className="scheme-detail-hero" style={{ borderColor: color + '44' }}>
        <span className="scheme-detail-icon">{icon}</span>
        <div>
          <h3 className="scheme-detail-name">{name}</h3>
          <span className="scheme-card-badge" style={{ color, background: color + '18', borderColor: color + '33' }}>
            {scheme.category_label || scheme.category}
          </span>
        </div>
      </div>

      <div className="scheme-detail-section">
        <p className="scheme-detail-label">💰 Benefit</p>
        <p className="scheme-detail-text">{scheme.benefit}</p>
      </div>

      <div className="scheme-detail-section">
        <p className="scheme-detail-label">✅ Eligibility</p>
        <p className="scheme-detail-text">{scheme.eligibility}</p>
      </div>

      {steps.length > 0 && (
        <div className="scheme-detail-section">
          <p className="scheme-detail-label">📋 Steps to Apply</p>
          <ol className="scheme-detail-steps">
            {steps.map((step, i) => (
              <li key={i} className="scheme-detail-step">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {scheme.documents && (
        <div className="scheme-detail-section">
          <p className="scheme-detail-label">📄 Required Documents</p>
          <ul className="scheme-detail-docs">
            {scheme.documents.map((doc, i) => (
              <li key={i} className="scheme-detail-doc-item">✔ {doc}</li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={scheme.apply_url}
        target="_blank"
        rel="noopener noreferrer"
        className="scheme-detail-apply-btn"
      >
        🔗 Apply at {scheme.apply_url_label || scheme.apply_url}
      </a>
    </div>
  )
}

export default function SchemeBrowser({ language, onBack }) {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedScheme, setSelectedScheme] = useState(null)

  useEffect(() => {
    fetch('/api/schemes')
      .then(r => r.json())
      .then(data => { setSchemes(data.schemes || []); setLoading(false) })
      .catch(() => { setError('Could not load schemes. Is the backend running?'); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return schemes
    return schemes.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.name_mr?.includes(q) ||
      s.name_hi?.toLowerCase().includes(q) ||
      s.category_label?.toLowerCase().includes(q) ||
      s.benefit?.toLowerCase().includes(q)
    )
  }, [schemes, search])

  // Group by category
  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(s => {
      const cat = s.category_label || s.category
      if (!g[cat]) g[cat] = []
      g[cat].push(s)
    })
    return g
  }, [filtered])

  return (
    <div className="scheme-browser">
      {/* Header */}
      <div className="scheme-browser-header">
        <button className="scheme-back-btn" onClick={onBack} aria-label="Go back">← Back</button>
        <div>
          <h2 className="scheme-browser-title">Scheme Browser</h2>
          <p className="scheme-browser-sub">योजना ब्राउझर · {schemes.length} schemes</p>
        </div>
      </div>

      {/* Search */}
      <div className="scheme-search-wrap">
        <span className="scheme-search-icon">🔍</span>
        <input
          id="scheme-search-input"
          className="scheme-search-input"
          type="search"
          placeholder="Search schemes… (e.g. health, किसान, housing)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search government schemes"
        />
        {search && (
          <button className="scheme-search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className="scheme-loading">
          {[1,2,3,4].map(i => <div key={i} className="shimmer scheme-card-shimmer" />)}
        </div>
      )}

      {error && (
        <div className="error-toast" role="alert">
          <span className="error-icon">⚠️</span>
          <div className="error-content">
            <p className="error-title">Failed to load schemes</p>
            <p className="error-message">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="scheme-empty">No schemes found for "{search}"</p>
      )}

      {!loading && !error && Object.entries(grouped).map(([cat, catSchemes]) => (
        <div key={cat} className="scheme-category-group">
          <p className="section-label">{CATEGORY_ICONS[catSchemes[0]?.category?.toLowerCase()] || '📄'} {cat}</p>
          <div className="scheme-grid">
            {catSchemes.map(s => (
              <SchemeCard key={s.id} scheme={s} onClick={setSelectedScheme} />
            ))}
          </div>
        </div>
      ))}

      {/* Detail modal */}
      <Modal
        isOpen={!!selectedScheme}
        onClose={() => setSelectedScheme(null)}
        title={selectedScheme?.name || ''}
      >
        {selectedScheme && <SchemeDetail scheme={selectedScheme} language={language} />}
      </Modal>
    </div>
  )
}
