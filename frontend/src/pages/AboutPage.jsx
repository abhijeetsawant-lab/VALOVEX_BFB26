export default function AboutPage({ onBack }) {
  const features = [
    { icon: '🎤', title: 'Voice-First', desc: 'Speak in Marathi, Hindi, or English — NaamSeva understands your language and accent.' },
    { icon: '🤖', title: 'AI-Powered', desc: 'Google Gemini AI generates step-by-step answers customized to your query.' },
    { icon: '📋', title: '25+ Schemes', desc: 'Covers PM-KISAN, Ayushman Bharat, Ration Card, Scholarships, and more.' },
    { icon: '✅', title: 'Eligibility Checker', desc: 'Answer 3 simple questions to find schemes you qualify for.' },
    { icon: '🗣️', title: 'Audio Response', desc: 'Hear the answer spoken back in your language using Sarvam AI TTS.' },
    { icon: '📵', title: 'Offline Ready', desc: 'Browse schemes even without internet — built as a Progressive Web App.' },
  ]

  const techStack = [
    { name: 'React', role: 'Frontend UI', color: '#61dafb' },
    { name: 'FastAPI', role: 'Backend API', color: '#009688' },
    { name: 'Google Gemini', role: 'AI / LLM', color: '#4285f4' },
    { name: 'Sarvam AI', role: 'Voice STT/TTS', color: '#ff9933' },
    { name: 'SQLite', role: 'Feedback DB', color: '#003b57' },
    { name: 'Vite', role: 'Build Tool', color: '#646cff' },
  ]

  return (
    <div className="about-page">
      <div className="about-header">
        <button className="scheme-back-btn" onClick={onBack}>← Back</button>
        <div>
          <h2 className="about-title">About NaamSeva</h2>
          <p className="about-subtitle">AI Voice Assistant for Indian Government Services</p>
        </div>
      </div>

      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-icon">🏛️</div>
        <h3 className="about-hero-title">सरकारी सेवा, आता सोप्या भाषेत</h3>
        <p className="about-hero-desc">
          NaamSeva bridges the digital divide by helping rural citizens access government schemes
          through voice interaction in their native language. No forms, no jargon — just speak and get answers.
        </p>
      </div>

      {/* Features */}
      <div className="about-section">
        <p className="section-label">✨ Key Features</p>
        <div className="about-features-grid">
          {features.map((f, i) => (
            <div key={i} className="about-feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="about-feature-icon">{f.icon}</span>
              <h4 className="about-feature-title">{f.title}</h4>
              <p className="about-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="about-section">
        <p className="section-label">🔄 How It Works</p>
        <div className="about-flow">
          {[
            { step: '1', emoji: '🎤', label: 'Speak or Type', detail: 'Ask in any language' },
            { step: '2', emoji: '🧠', label: 'AI Processes', detail: 'Gemini + Scheme Matcher' },
            { step: '3', emoji: '📋', label: 'Find Scheme', detail: 'From 25+ government schemes' },
            { step: '4', emoji: '🔊', label: 'Get Answer', detail: 'Text + Voice response' },
          ].map((s, i) => (
            <div key={i} className="about-flow-step" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="about-flow-num">{s.emoji}</div>
              <p className="about-flow-label">{s.label}</p>
              <p className="about-flow-detail">{s.detail}</p>
              {i < 3 && <span className="about-flow-arrow">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="about-section">
        <p className="section-label">🛠️ Tech Stack</p>
        <div className="about-tech-grid">
          {techStack.map((t, i) => (
            <div key={i} className="about-tech-chip" style={{ borderColor: `${t.color}40` }}>
              <span className="about-tech-dot" style={{ background: t.color }} />
              <span className="about-tech-name">{t.name}</span>
              <span className="about-tech-role">{t.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="about-section about-team">
        <p className="section-label">👥 Built By</p>
        <p className="about-team-text">Team VALOVEX — MIT BFB 26 Hackathon</p>
        <p className="about-team-sub">Made with ❤️ for Bharat</p>
      </div>
    </div>
  )
}
