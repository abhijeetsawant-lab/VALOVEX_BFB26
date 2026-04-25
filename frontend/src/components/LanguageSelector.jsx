const LANGUAGES = [
  { code: 'mr-IN', name: 'मराठी',  subtitle: 'Marathi', flag: '🏛️' },
  { code: 'hi-IN', name: 'हिंदी',  subtitle: 'Hindi',   flag: '🇮🇳' },
  { code: 'en-IN', name: 'English', subtitle: 'English', flag: '💬' },
  { code: 'auto',  name: 'Auto',    subtitle: 'Detect',  flag: '🔍' },
]

export default function LanguageSelector({ selected, onSelect }) {
  return (
    <div className="language-selector">
      <p className="section-label">🌐 Select Language · भाषा निवडा</p>
      {/* 2×2 grid to fit 4 options cleanly on mobile */}
      <div className="lang-buttons lang-buttons-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            id={`lang-btn-${lang.code}`}
            className={`lang-btn ${selected === lang.code ? 'active' : ''} ${lang.code === 'auto' ? 'lang-btn-auto' : ''}`}
            onClick={() => onSelect(lang.code)}
            aria-pressed={selected === lang.code}
            aria-label={`Select ${lang.subtitle}`}
          >
            <span className="lang-flag">{lang.flag}</span>
            <span className="lang-name">{lang.name}</span>
            <span className="lang-subtitle">{lang.subtitle}</span>
            {selected === lang.code && (
              <span className="lang-check" aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
