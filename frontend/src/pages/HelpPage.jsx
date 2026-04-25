import { useState } from 'react'

const FAQ_DATA = [
  {
    q: 'What is NaamSeva?',
    a: 'NaamSeva is an AI-powered voice assistant that helps Indian citizens access government schemes in their own language — Marathi, Hindi, or English. Just speak or type your question and get step-by-step guidance.',
    icon: '🤖',
  },
  {
    q: 'How does voice input work?',
    a: 'Press and hold the microphone button, speak your query in any supported language. Our Sarvam AI engine transcribes your speech, matches it to relevant government schemes, and returns a detailed answer with audio playback.',
    icon: '🎤',
  },
  {
    q: 'Which government schemes are covered?',
    a: 'NaamSeva covers 35+ schemes including PM-KISAN, Ayushman Bharat, Ration Card, MahaDBT Scholarship, Aadhaar, PAN Card, Passport, Driving License, PM Ujjwala, Ladli Behna, and many more across agriculture, health, education, welfare, and identity categories.',
    icon: '📋',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes! Voice recordings are processed in real-time and not stored. We only save anonymous feedback ratings to improve the service. No personal data is collected or shared.',
    icon: '🔒',
  },
  {
    q: 'Can I use it without internet?',
    a: 'The Scheme Browser works offline as a Progressive Web App. Voice and AI features require internet connectivity for Sarvam AI and Google Gemini processing.',
    icon: '📵',
  },
  {
    q: 'How accurate are the answers?',
    a: 'Answers are generated from our verified database of 35+ government schemes with official eligibility criteria, required documents, and portal links. The AI contextualizes answers based on your specific query.',
    icon: '✅',
  },
  {
    q: 'How do I check my eligibility?',
    a: 'Click "Check My Eligibility" on the home screen. Answer 3 simple questions about your category, occupation, and income — NaamSeva will show you matching schemes with confidence scores.',
    icon: '🎯',
  },
  {
    q: 'Who built NaamSeva?',
    a: 'NaamSeva was built by Team VALOVEX for the MIT BFB 26 Hackathon. Our mission is to bridge the digital divide and make government services accessible to every citizen of India.',
    icon: '👥',
  },
]

export default function HelpPage({ onBack }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="help-page">
      <div className="help-header">
        <button className="scheme-back-btn" onClick={onBack}>← Back</button>
        <div>
          <h2 className="about-title">Help & FAQ</h2>
          <p className="about-subtitle">Frequently asked questions about NaamSeva</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="help-quick-actions">
        <div className="help-action-card" onClick={onBack}>
          <span className="help-action-icon">🎤</span>
          <span className="help-action-text">Ask via Voice</span>
        </div>
        <div className="help-action-card" onClick={onBack}>
          <span className="help-action-icon">⌨️</span>
          <span className="help-action-text">Type a Query</span>
        </div>
        <div className="help-action-card">
          <span className="help-action-icon">📞</span>
          <span className="help-action-text">Helpline: 1800-111-555</span>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="help-faq-section">
        <p className="section-label">❓ Frequently Asked Questions</p>
        <div className="faq-list">
          {FAQ_DATA.map((faq, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? 'faq-open' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="faq-q-icon">{faq.icon}</span>
                <span className="faq-q-text">{faq.q}</span>
                <span className="faq-chevron">{openIndex === i ? '▲' : '▼'}</span>
              </button>
              {openIndex === i && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="help-contact">
        <p className="section-label">📧 Need More Help?</p>
        <div className="help-contact-card">
          <p className="help-contact-text">
            📩 Email: <strong>support@naamseva.in</strong><br/>
            📞 Helpline: <strong>1800-111-555</strong> (Toll Free)<br/>
            🕐 Available: Mon–Sat, 9 AM – 6 PM
          </p>
        </div>
      </div>
    </div>
  )
}
