# 🏛️ NaamSeva — सरकारी सेवा AI सहायक

> **AI-powered multilingual voice assistant for Indian Government Services**  
> Built for MIT BFB 26 Hackathon | Team VALOVEX

[![Live Demo](https://img.shields.io/badge/Live%20Demo-NaamSeva-ff9933?style=for-the-badge)](https://github.com/abhijeetsawant-lab/VALOVEX_BFB26)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20v1.3-009688?style=for-the-badge)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?style=for-the-badge)](https://vitejs.dev)

---

## 🎯 Problem Statement

Millions of rural Indians struggle to access government schemes due to:
- **Language barriers** — government portals are English-only
- **Literacy gaps** — complex jargon and multi-step processes
- **Information overload** — 100s of schemes, no single interface
- **Connectivity limits** — spotty internet in rural areas

**NaamSeva** solves this with a voice-first, multilingual AI assistant that explains government services in the user's own language — Marathi, Hindi, or English.

---

## 🏗️ Architecture

```
User speaks/types
        │
        ▼
┌──────────────┐     Audio      ┌─────────────────┐
│   React App  │ ──────────────▶│  FastAPI Backend │
│  (Vite PWA)  │               └────────┬────────┘
└──────────────┘                        │
                              ┌─────────┼─────────┐
                              ▼         ▼         ▼
                        Sarvam STT  Scheme    Sarvam TTS
                        (Speech →   Matcher  (Text → Audio)
                         Text)      (JSON KB)
                              │         │
                              └────┬────┘
                                   ▼
                           Google Gemini
                         (Context-Aware LLM)
                                   │
                                   ▼
                          Response + Audio
                      returned to React App
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS, PWA (Service Worker) |
| **Backend** | FastAPI 0.111, Python 3.11+, Uvicorn |
| **STT** | Sarvam AI (`saarika:v2`) |
| **TTS** | Sarvam AI (`bulbul:v1`) |
| **LLM** | Google Gemini 1.5 Flash |
| **Database** | SQLite (aiosqlite) for feedback |
| **Knowledge Base** | JSON (10 schemes, multilingual) |

---

## 📁 Project Structure

```
naamseva/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, lifespan
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # API keys template
│   ├── data/
│   │   └── schemes_data.json      # Knowledge base (10 schemes)
│   ├── database/
│   │   └── feedback.py            # SQLite async feedback storage
│   └── routes/
│       ├── voice.py               # POST /api/voice (STT → LLM → TTS)
│       ├── query.py               # POST /api/query (text-only)
│       ├── schemes.py             # GET /api/schemes, GET /api/schemes/{id}
│       └── feedback.py            # POST /api/feedback, GET /api/admin/feedback
├── services/
│   ├── sarvam_stt.py              # Speech-to-text + language detection
│   ├── sarvam_tts.py              # Text-to-speech synthesis
│   ├── gemini_llm.py              # Context-aware Gemini prompting
│   └── scheme_matcher.py          # Keyword → scheme matching
└── frontend/
    ├── public/
    │   ├── manifest.json          # PWA manifest
    │   └── sw.js                  # Service worker (offline support)
    ├── index.html                 # Entry point (html2canvas CDN)
    └── src/
        ├── App.jsx                # Main app, routing, state
        ├── main.jsx               # React entry, SW registration
        ├── index.css              # Global styles (2,200+ lines)
        ├── components/
        │   ├── LanguageSelector.jsx    # 4-language grid
        │   ├── MicButton.jsx           # Animated recording button
        │   ├── ResponseCard.jsx        # Response + feedback + share
        │   ├── AudioPlayer.jsx         # Custom audio player
        │   ├── HistoryPanel.jsx        # Collapsible conversation history
        │   ├── TypingInput.jsx         # Text fallback input
        │   ├── Modal.jsx               # Bottom-sheet modal
        │   ├── EligibilityChecker.jsx  # 3-step wizard
        │   ├── FeedbackButtons.jsx     # Thumbs up/down
        │   ├── ShareCard.jsx           # PNG share via html2canvas
        │   └── DemoMode.jsx            # Judge-friendly demo playback
        └── pages/
            └── SchemeBrowser.jsx       # Scheme grid + search + detail
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys for [Sarvam AI](https://sarvam.ai) and [Google AI Studio](https://aistudio.google.com)

### 1. Clone & Setup

```bash
git clone https://github.com/abhijeetsawant-lab/VALOVEX_BFB26.git
cd VALOVEX_BFB26/naamseva
```

### 2. Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload --port 8000
```

**Backend runs at:** `http://localhost:8000`  
**API Docs:** `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## 🔑 API Keys Setup

Create `naamseva/backend/.env`:

```env
# Sarvam AI — https://sarvam.ai (free tier available)
SARVAM_API_KEY=your_sarvam_api_key_here

# Google Gemini — https://aistudio.google.com/app/apikey (free tier available)
GEMINI_API_KEY=your_gemini_api_key_here

# CORS origin for frontend (default: Vite dev server)
CORS_ORIGIN=http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/voice` | Full pipeline: STT → Scheme Match → Gemini → TTS |
| `POST` | `/api/query` | Text-only: Scheme Match → Gemini → TTS |
| `GET`  | `/api/schemes` | List all 10 schemes (summary) |
| `GET`  | `/api/schemes/{id}` | Full scheme detail with steps |
| `POST` | `/api/feedback` | Save thumbs up/down rating |
| `GET`  | `/api/admin/feedback` | Feedback statistics |
| `GET`  | `/api/health` | Service health check |
| `GET`  | `/docs` | Interactive API documentation |

---

## 📋 Supported Schemes (Knowledge Base)

| # | Scheme | Category | Benefit |
|---|---|---|---|
| 1 | **PM-KISAN** | Agriculture | ₹6,000/year for farmers |
| 2 | **Ayushman Bharat** | Health | ₹5 lakh health insurance |
| 3 | **PMAY (Housing)** | Housing | Home loan subsidy |
| 4 | **PAN Card** | Identity | 10-digit tax ID |
| 5 | **Aadhaar Update** | Identity | Address/biometric update |
| 6 | **Ration Card** | Food | Subsidized food grains |
| 7 | **MahaDBT Scholarship** | Education | Up to ₹1 lakh/year |
| 8 | **Driving License** | Transport | Official driving permit |
| 9 | **Birth Certificate** | Civil | Official birth proof |
| 10 | **Unemployment Allowance** | Welfare | ₹1,000–1,500/month |

---

## 🎭 Demo Script (For Judges)

### Option 1: Demo Mode (No API keys needed)
1. Open the app at `http://localhost:5173`
2. Click **🎭 Demo** in the top-right header
3. Click **▶ Play Next** to cycle through 3 scripted personas:
   - 🌾 **Marathi Farmer** — Ramesh Patil asking about Ration Card
   - 🏥 **Hindi Elder** — Savitri Devi asking about Ayushman Bharat
   - 🎓 **English Student** — Priya Pawar asking about MahaDBT Scholarship
4. Or click **⏭ Run All 3** for fully automated demo

### Option 2: Live Voice (Requires API keys)
1. Select language: **मराठी / हिंदी / English**
2. Tap the orange mic button and say:
   - *"रेशन कार्ड कसे बनवायचे?"* (Marathi — Ration Card)
   - *"आयुष्मान भारत के बारे में बताइए"* (Hindi — Health)
   - *"How do I apply for PM-KISAN?"* (English — Farming)
3. Response loads with scheme context, audio playback, and action buttons

### Option 3: Eligibility Checker
1. Tap **✅ Check My Eligibility** button
2. Answer 3 questions: Occupation → Income → State
3. See matching schemes with **High Match / Possible Match** confidence badges

### Option 4: Scheme Browser
1. Tap **📋 Schemes** in header
2. Browse 10 schemes in 2-column grid
3. Search by name, language, or category
4. Tap any card for full detail with steps in your language

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🎙️ **Voice Input** | Browser mic API → Sarvam STT |
| 🌐 **Auto Language Detection** | Sarvam detects spoken language |
| 🧠 **Context-Aware AI** | Gemini with scheme knowledge injection |
| 🔊 **Audio Responses** | Sarvam TTS in selected language |
| 📋 **Scheme Browser** | 10 schemes, searchable, categorized |
| ✅ **Eligibility Wizard** | 3-question → scheme matching |
| 🎭 **Demo Mode** | Scripted playback for judges |
| 📤 **Share Cards** | PNG export via html2canvas + QR code |
| 👍 **Feedback System** | SQLite-backed thumbs up/down |
| 📵 **PWA / Offline** | Service worker caches scheme data |
| 🕘 **History Panel** | Collapsible past conversations |
| ⌨️ **Typing Fallback** | Skip mic, type your question |

---

## 👥 Team Credits

**Team VALOVEX — MIT BFB 26**

| Role | Contribution |
|---|---|
| Project Lead | Architecture, backend API design |
| Full-Stack Dev | React frontend, FastAPI backend |
| AI Integration | Sarvam AI + Gemini LLM pipeline |
| UI/UX Design | Mobile-first dark theme, component system |

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

*Built with ❤️ for Bharat · Powered by Sarvam AI + Google Gemini*  
*नामसेवा — सरकारी सेवा, आता सोप्या भाषेत*
