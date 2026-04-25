/**
 * DemoMode — Judge-friendly scripted playback
 * Cycles through 3 realistic scenarios without needing a mic or API keys.
 * Simply calls onResponse() with mock data to drive the main UI.
 */
import { useState, useRef } from 'react'

const DELAY_MS = 1800  // Simulates backend processing time

const SCENARIOS = [
  {
    id: 'farmer',
    label: 'Marathi Farmer',
    sublabel: 'Ramesh Patil, Nashik',
    icon: '🌾',
    language: 'mr-IN',
    mockData: {
      transcript: 'रेशन कार्ड कसे बनवायचे?',
      response_text:
        '1. mahafood.gov.in वर जा\n' +
        '2. "रेशन कार्डसाठी ऑनलाइन अर्ज" वर क्लिक करा\n' +
        '3. आधार नंबर आणि मोबाईल नंबर द्या\n' +
        '4. सर्व कुटुंब सदस्यांचे तपशील भरा\n' +
        '5. कागदपत्रे अपलोड करा आणि सबमिट करा',
      audio_base64: null,
      detected_language: null,
      matched_scheme: {
        id: 'ration_card', name: 'Ration Card Application', name_mr: 'रेशन कार्ड',
        category: 'Food & Welfare',
        eligibility: 'All Indian families are eligible. Category depends on income.',
        benefit: 'Subsidized food grains: rice @ ₹3/kg, wheat @ ₹2/kg, coarse grains @ ₹1/kg',
        documents: ['Aadhaar card', 'Proof of residence', 'Income certificate', 'Photographs'],
        apply_url: 'https://mahafood.gov.in', apply_url_label: 'mahafood.gov.in',
      },
    },
  },
  {
    id: 'elderly',
    label: 'Hindi Elder',
    sublabel: 'Savitri Devi, 67, Delhi',
    icon: '🏥',
    language: 'hi-IN',
    mockData: {
      transcript: 'आयुष्मान भारत के बारे में बताइए, मुझे अस्पताल जाना है',
      response_text:
        '1. pmjay.gov.in पर जाएं और "Am I Eligible" पर क्लिक करें\n' +
        '2. अपना मोबाइल नंबर डालें और OTP दर्ज करें\n' +
        '3. नजदीकी CSC केंद्र या सूचीबद्ध अस्पताल जाएं\n' +
        '4. आधार और राशन कार्ड दिखाएं\n' +
        '5. आयुष्मान गोल्डन कार्ड प्राप्त करें — 5 लाख तक मुफ्त इलाज',
      audio_base64: null,
      detected_language: null,
      matched_scheme: {
        id: 'ayushman_bharat', name: 'Ayushman Bharat (PM-JAY)', name_hi: 'आयुष्मान भारत',
        category: 'Health',
        eligibility: 'Poor & vulnerable families from SECC 2011 database.',
        benefit: 'Rs 5 lakh health insurance cover per family per year.',
        documents: ['Aadhaar card', 'Ration card', 'Mobile number for OTP'],
        apply_url: 'https://pmjay.gov.in', apply_url_label: 'pmjay.gov.in',
      },
    },
  },
  {
    id: 'student',
    label: 'English Student',
    sublabel: 'Priya Pawar, Engineer, Pune',
    icon: '🎓',
    language: 'en-IN',
    mockData: {
      transcript: 'How do I apply for scholarship in Maharashtra for engineering students?',
      response_text:
        '1. Visit mahadbt.maharashtra.gov.in\n' +
        '2. Click "Student Login" and register with Aadhaar + mobile\n' +
        '3. Complete your profile: academic, bank, and family income details\n' +
        '4. Upload all required documents clearly\n' +
        '5. Apply before the deadline — scholarship credited directly to your bank',
      audio_base64: null,
      detected_language: null,
      matched_scheme: {
        id: 'mahaDbt', name: 'MahaDBT Scholarship',
        category: 'Education',
        eligibility: 'SC/ST/OBC/VJNT/SBC/EWS students with family income below ₹8 lakh.',
        benefit: 'Tuition fee, exam fee, maintenance allowance — up to ₹1 lakh+/year.',
        documents: ['Aadhaar', 'Caste certificate', 'Income certificate', 'Marksheet', 'Fee receipt'],
        apply_url: 'https://mahadbt.maharashtra.gov.in', apply_url_label: 'mahadbt.maharashtra.gov.in',
      },
    },
  },
]

export default function DemoMode({ isActive, onResponse, onLanguageChange, onToggle }) {
  const [running, setRunning] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [status, setStatus] = useState('')
  const abortRef = useRef(false)

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  const runScenario = async (scenario) => {
    abortRef.current = false
    setRunning(true)
    setStatus(`🎭 ${scenario.label} — "${scenario.mockData.transcript}"`)

    onLanguageChange(scenario.language)
    await sleep(600)

    if (abortRef.current) { setRunning(false); return }

    // Trigger processing skeleton
    onResponse(null, true)   // isProcessing = true
    await sleep(DELAY_MS)

    if (abortRef.current) { setRunning(false); onResponse(null, false); return }

    // Deliver mock response
    onResponse(scenario.mockData, false)
    setStatus(`✅ Showing: ${scenario.label}`)
    setRunning(false)
  }

  const handlePlay = () => {
    const scenario = SCENARIOS[currentIdx]
    runScenario(scenario)
    setCurrentIdx((i) => (i + 1) % SCENARIOS.length)
  }

  const handleStop = () => {
    abortRef.current = true
    setRunning(false)
    setStatus('⏹ Demo stopped')
    onResponse(null, false)
  }

  const handleRunAll = async () => {
    abortRef.current = false
    for (let i = 0; i < SCENARIOS.length; i++) {
      if (abortRef.current) break
      setCurrentIdx((i + 1) % SCENARIOS.length)
      await runScenario(SCENARIOS[i])
      if (!abortRef.current) await sleep(2000)
    }
  }

  return (
    <div className={`demo-mode-panel ${isActive ? 'demo-mode-active' : ''}`}>
      <div className="demo-mode-header">
        <div className="demo-mode-title-row">
          <span className="demo-mode-badge">🎭 DEMO MODE</span>
          <button className="demo-mode-close" onClick={onToggle} aria-label="Close demo mode">✕</button>
        </div>
        <p className="demo-mode-subtitle">Judge-friendly scripted playback — no mic needed</p>
      </div>

      {/* Scenario cards */}
      <div className="demo-scenarios">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            id={`demo-scenario-${s.id}`}
            className={`demo-scenario-btn ${currentIdx % SCENARIOS.length === (i + 1) % SCENARIOS.length && !running ? 'demo-scenario-next' : ''}`}
            onClick={() => { abortRef.current = true; setTimeout(() => runScenario(s), 100) }}
            disabled={running}
          >
            <span className="demo-scenario-icon">{s.icon}</span>
            <div>
              <p className="demo-scenario-label">{s.label}</p>
              <p className="demo-scenario-sub">{s.sublabel}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="demo-controls">
        <button
          id="demo-play-next"
          className="demo-ctrl-btn demo-ctrl-play"
          onClick={handlePlay}
          disabled={running}
        >
          {running ? '⌛ Playing…' : '▶ Play Next'}
        </button>
        <button
          id="demo-run-all"
          className="demo-ctrl-btn demo-ctrl-all"
          onClick={handleRunAll}
          disabled={running}
        >
          ⏭ Run All 3
        </button>
        {running && (
          <button className="demo-ctrl-btn demo-ctrl-stop" onClick={handleStop}>
            ⏹ Stop
          </button>
        )}
      </div>

      {status && <p className="demo-status">{status}</p>}
    </div>
  )
}
