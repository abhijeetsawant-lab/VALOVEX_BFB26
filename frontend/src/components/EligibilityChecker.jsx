import { useState } from 'react'

// ── Eligibility matching rules ───────────────────────────────────────────────
const OCCUPATIONS = [
  { id: 'farmer',     label: 'Farmer',      label_mr: 'शेतकरी',    label_hi: 'किसान',    icon: '🌾', weight: { pm_kisan: 3, ration_card: 2, pmay: 1, ayushman_bharat: 1 } },
  { id: 'student',    label: 'Student',     label_mr: 'विद्यार्थी', label_hi: 'छात्र',   icon: '🎓', weight: { mahaDbt: 3, pan_card: 1 } },
  { id: 'unemployed', label: 'Unemployed',  label_mr: 'बेरोजगार',  label_hi: 'बेरोजगार', icon: '💼', weight: { unemployment_allowance: 3, ration_card: 2, ayushman_bharat: 1 } },
  { id: 'other',      label: 'Other',       label_mr: 'इतर',        label_hi: 'अन्य',    icon: '👤', weight: { ration_card: 2, pan_card: 1, aadhaar_update: 1, driving_license: 1 } },
]

const INCOME_RANGES = [
  { id: 'below_1.5', label: 'Below ₹1.5L/yr', label_mr: '₹1.5L पेक्षा कमी', weight: { ration_card: 3, ayushman_bharat: 3, unemployment_allowance: 2, pmay: 1 } },
  { id: '1.5_to_3',  label: '₹1.5L – ₹3L/yr',  label_mr: '₹1.5L-₹3L',      weight: { ayushman_bharat: 2, pmay: 2, ration_card: 1, mahaDbt: 1 } },
  { id: '3_to_6',    label: '₹3L – ₹6L/yr',    label_mr: '₹3L-₹6L',        weight: { pmay: 2, mahaDbt: 2, pm_kisan: 1 } },
  { id: 'above_6',   label: 'Above ₹6L/yr',     label_mr: '₹6L पेक्षा जास्त', weight: { pan_card: 2, driving_license: 1, pm_kisan: 1 } },
]

const STATES = [
  { id: 'maharashtra', label: 'Maharashtra', label_mr: 'महाराष्ट्र', weight: { mahaDbt: 2, unemployment_allowance: 2 } },
  { id: 'other_state', label: 'Other State',  label_mr: 'इतर राज्य',  weight: {} },
]

const SCHEME_META = {
  pm_kisan:              { name: 'PM-KISAN',                    icon: '🌾', color: '#22c55e' },
  ayushman_bharat:       { name: 'Ayushman Bharat',             icon: '🏥', color: '#f43f5e' },
  pmay:                  { name: 'PM Awas Yojana',              icon: '🏠', color: '#f59e0b' },
  ration_card:           { name: 'Ration Card',                 icon: '🍚', color: '#ea580c' },
  mahaDbt:               { name: 'MahaDBT Scholarship',         icon: '🎓', color: '#0ea5e9' },
  unemployment_allowance:{ name: 'Unemployment Allowance',      icon: '💼', color: '#ec4899' },
  pan_card:              { name: 'PAN Card',                   icon: '🪪', color: '#6366f1' },
  aadhaar_update:        { name: 'Aadhaar Update',             icon: '🔵', color: '#06b6d4' },
  driving_license:       { name: 'Driving License',            icon: '🚗', color: '#8b5cf6' },
  birth_certificate:     { name: 'Birth Certificate',          icon: '📋', color: '#64748b' },
}

function computeMatches(occupation, income, state) {
  const scores = {}

  const addWeights = (weights) => {
    for (const [id, w] of Object.entries(weights || {})) {
      scores[id] = (scores[id] || 0) + w
    }
  }

  addWeights(occupation.weight)
  addWeights(income.weight)
  addWeights(state.weight)

  const maxScore = Math.max(...Object.values(scores), 1)
  return Object.entries(scores)
    .filter(([, s]) => s >= 2)
    .sort(([, a], [, b]) => b - a)
    .map(([id, score]) => ({
      id,
      ...SCHEME_META[id],
      confidence: score / maxScore >= 0.7 ? 'High Match' : 'Possible Match',
      score,
    }))
}

// ── Step components ──────────────────────────────────────────────────────────
function StepOccupation({ language, onSelect }) {
  const lang = language === 'mr-IN' ? 'mr' : language === 'hi-IN' ? 'hi' : 'en'
  return (
    <div className="eq-step-content">
      <p className="eq-step-question">
        {lang === 'mr' ? 'तुमचा व्यवसाय काय आहे?' : lang === 'hi' ? 'आपका व्यवसाय क्या है?' : 'What is your occupation?'}
      </p>
      <div className="eq-options">
        {OCCUPATIONS.map((o) => (
          <button key={o.id} className="eq-option-btn" onClick={() => onSelect(o)} id={`eq-occ-${o.id}`}>
            <span className="eq-option-icon">{o.icon}</span>
            <span className="eq-option-label">{lang === 'mr' ? o.label_mr : lang === 'hi' ? o.label_hi : o.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepIncome({ language, onSelect }) {
  const lang = language === 'mr-IN' ? 'mr' : 'en'
  return (
    <div className="eq-step-content">
      <p className="eq-step-question">
        {lang === 'mr' ? 'तुमचे वार्षिक कौटुंबिक उत्पन्न किती आहे?' : 'What is your annual family income?'}
      </p>
      <div className="eq-options eq-options-income">
        {INCOME_RANGES.map((r) => (
          <button key={r.id} className="eq-option-btn eq-option-btn-wide" onClick={() => onSelect(r)} id={`eq-inc-${r.id}`}>
            <span className="eq-option-label">{lang === 'mr' ? r.label_mr : r.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepState({ language, onSelect }) {
  const lang = language === 'mr-IN' ? 'mr' : 'en'
  return (
    <div className="eq-step-content">
      <p className="eq-step-question">
        {lang === 'mr' ? 'तुमचे राज्य कुठले आहे?' : 'Which state are you from?'}
      </p>
      <div className="eq-options">
        {STATES.map((s) => (
          <button key={s.id} className="eq-option-btn" onClick={() => onSelect(s)} id={`eq-state-${s.id}`}>
            <span className="eq-option-label">{lang === 'mr' ? s.label_mr : s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ResultScreen({ matches, onBack, onViewScheme }) {
  return (
    <div className="eq-results">
      <p className="eq-results-title">
        🎯 {matches.length > 0 ? `${matches.length} Matching Schemes Found` : 'No specific matches — try a different profile'}
      </p>
      <div className="eq-result-list">
        {matches.map((m) => (
          <div key={m.id} className="eq-result-card" style={{ borderColor: m.color + '44' }}>
            <div className="eq-result-header">
              <span className="eq-result-icon">{m.icon}</span>
              <div className="eq-result-info">
                <p className="eq-result-name">{m.name}</p>
                <span
                  className="eq-confidence-badge"
                  style={{
                    background: m.confidence === 'High Match' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)',
                    borderColor: m.confidence === 'High Match' ? '#22c55e55' : '#fbbf2455',
                    color: m.confidence === 'High Match' ? '#4ade80' : '#fbbf24',
                  }}
                >
                  {m.confidence === 'High Match' ? '✅' : '🔶'} {m.confidence}
                </span>
              </div>
            </div>
            <button
              className="eq-view-btn"
              onClick={() => onViewScheme(m.id)}
              aria-label={`View ${m.name} details`}
            >
              View Scheme Details →
            </button>
          </div>
        ))}
      </div>
      <button className="eq-back-btn" onClick={onBack}>← Check Again</button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EligibilityChecker({ language, onViewScheme, onClose }) {
  const [step, setStep]             = useState(1)           // 1, 2, 3, 'result'
  const [occupation, setOccupation] = useState(null)
  const [income, setIncome]         = useState(null)
  const [state, setState]           = useState(null)
  const [matches, setMatches]       = useState([])

  const STEPS = [
    { num: 1, label: 'Job' },
    { num: 2, label: 'Income' },
    { num: 3, label: 'State' },
  ]

  const handleOccupation = (o) => { setOccupation(o); setStep(2) }
  const handleIncome     = (i) => { setIncome(i);     setStep(3) }
  const handleState      = (s) => {
    setState(s)
    const results = computeMatches(occupation, income, s)
    setMatches(results)
    setStep('result')
  }

  return (
    <div className="eq-container">
      {/* Header */}
      <div className="eq-header">
        <div>
          <h2 className="eq-title">✅ Eligibility Checker</h2>
          <p className="eq-subtitle">पात्रता तपासा · 3 quick questions</p>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Progress bar */}
      {step !== 'result' && (
        <div className="eq-progress-wrap">
          {STEPS.map((s) => (
            <div key={s.num} className={`eq-progress-step ${step >= s.num ? 'active' : ''}`}>
              <div className="eq-progress-dot">{step > s.num ? '✓' : s.num}</div>
              <span className="eq-progress-label">{s.label}</span>
            </div>
          ))}
          <div className="eq-progress-line" style={{ width: `${((Math.min(step, 3) - 1) / 2) * 100}%` }} />
        </div>
      )}

      {/* Step content */}
      {step === 1 && <StepOccupation language={language} onSelect={handleOccupation} />}
      {step === 2 && <StepIncome     language={language} onSelect={handleIncome}     />}
      {step === 3 && <StepState      language={language} onSelect={handleState}      />}
      {step === 'result' && (
        <ResultScreen
          matches={matches}
          onBack={() => { setStep(1); setOccupation(null); setIncome(null); setState(null) }}
          onViewScheme={onViewScheme}
        />
      )}
    </div>
  )
}
