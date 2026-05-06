# PersonaTwin — Your AI-Powered Digital Twin

<div align="center">

![PersonaTwin](https://img.shields.io/badge/PersonaTwin-v1.0_Beta-10b981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTVMMTIgMnpNMiAxN2wxMCA1IDEwLTVNMiAxMmwxMCA1IDEwLTUiLz48L3N2Zz4=)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![FAISS](https://img.shields.io/badge/FAISS-Vector_DB-FF6F00?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br/>

**An AI system that learns your thinking patterns, predicts your decisions, and reflects your personality back to you.**

[**Live Demo**](https://persona-twin-five.vercel.app) · [**API Docs**](https://persona-twin.onrender.com/docs) · [**Report Bug**](https://github.com/prajwal5065/Persona-Twin/issues)

<br/>

</div>

---

## What is PersonaTwin?

PersonaTwin is not a chatbot. It is a **digital twin** — an AI system that builds a model of *you* from your own words, memories, and behavioral patterns.

You write notes. The system embeds them, stores them in a personal vector database, and uses them to answer questions *as you* — from your perspective, referencing your actual memories, in your thinking style.

Over time it builds a personality profile, tracks your behavioral patterns, and can simulate how you would decide in hypothetical scenarios.

```
You write memories → AI indexes them → You chat with your twin
                                      ↓
                          Twin responds using YOUR memories
                          + YOUR personality profile
                          + YOUR past behavioral patterns
```

---

## Screenshots

| Dashboard | Chat |
|-----------|------|
| ![Dashboard](og-chat.png) | ![Chat](
og-chat.png) |

| Memories | Insights |
|----------|----------|
| ![Memories](og-notes.png) | ![Insights](og-insights.png) |

> Live at **[persona-twin-five.vercel.app](https://persona-twin-five.vercel.app)**

---

## Core Features

### 🧠 Semantic Memory System
Write notes about yourself — your values, opinions, experiences, goals. Each note is embedded using **Gemini text-embedding-04** (768 dimensions) and stored in a **per-user FAISS vector index** on disk. Memories are isolated per user — no data leaks between accounts.

### 💬 RAG-Powered Digital Twin Chat
When you ask your twin something, it:
1. Embeds your query
2. Searches your personal FAISS index for the top-5 most semantically relevant memories
3. Fetches those note rows from PostgreSQL (filtered by your user_id)
4. Builds a personalised prompt: *"You are this user's digital twin. Here are their memories..."*
5. Sends it to Gemini 1.5 Flash and returns the response

The result is a chat that actually knows you — not a generic AI.

### 🔬 OCEAN Personality Profiling
After you have enough memories, run a personality analysis. The system reads your 30 most recent notes, sends them to Gemini with a structured prompt, and returns validated **Big Five (OCEAN) scores** as floats between 0.0 and 1.0:

| Trait | Description |
|-------|-------------|
| **Openness** | Curiosity, creativity, openness to new ideas |
| **Conscientiousness** | Organisation, discipline, goal-directedness |
| **Extraversion** | Social energy, assertiveness |
| **Agreeableness** | Empathy, cooperation, trust |
| **Neuroticism** | Emotional sensitivity, stress response |

### ⚡ Decision Simulation
Describe a hypothetical scenario. The system retrieves past memories similar to the situation, analyses your style profile, and predicts the decision you would most likely make — with reasoning grounded in your actual behavioral history.

### 📊 Behavioral Insights
Tracks when you write (Morning / Afternoon / Evening / Night), your note frequency, and generates 3 AI-observed behavioral patterns from your recent memories using the LLM.

### 🔐 JWT Authentication
Full auth system — register, login, protected endpoints. Every piece of data is scoped to the authenticated user. Passwords hashed with bcrypt, tokens signed with HS256.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (async) |
| Database | PostgreSQL on Neon via asyncpg + SQLAlchemy AsyncSession |
| Migrations | Alembic with async engine support |
| Authentication | python-jose (JWT) + passlib (bcrypt) |
| LLM | Google Gemini 1.5 Flash — auto-discovered via `list_models()` |
| Embeddings | Gemini `text-embedding-04` — 768-dim vectors |
| Vector DB | FAISS `IndexFlatL2` — per-user namespaced index files |
| Rate Limiting | slowapi — keyed by JWT user identity |
| Logging | structlog JSON with `request_id` and `user_id` context |
| Scheduler | APScheduler — weekly digest every Sunday 9am |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript, Vite |
| Styling | TailwindCSS 3.4 + custom CSS variables |
| State | Zustand with localStorage token persistence |
| HTTP | Axios with JWT interceptor + auto-logout on 401 |
| Animation | Framer Motion |
| Routing | React Router v7 with protected route guard |
| Deployment | Vercel with SPA rewrites |

---

## Architecture

### RAG Pipeline (the core)

```
POST /add-note
    │
    ├── Save to PostgreSQL (notes table, user_id scoped)
    │
    └── Generate embedding via Gemini text-embedding-04
            │
            └── Store in FAISS index: ./faiss_indexes/user_{id}.bin


POST /chat  { query: "..." }
    │
    ├── Embed query via Gemini text-embedding-04
    │
    ├── FAISS search → top-5 note IDs (from user's personal index)
    │
    ├── Fetch Note rows from PostgreSQL WHERE id IN [...] AND user_id = me
    │
    ├── Build prompt:
    │       "You are the digital twin of this user.
    │        Here are their memories: [1. ... 2. ... 3. ...]
    │        Answer as them, in first person."
    │
    └── Gemini 1.5 Flash → response
```

### Per-User Data Isolation
Every user gets:
- Their own FAISS index file: `user_{id}.bin` + `user_{id}.pkl`
- All DB queries filtered by `user_id`
- JWT token scopes all API calls to that user only

---

## Project Structure

```
Persona-Twin/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, lifespan, LLM singleton
│   │   ├── routes/
│   │   │   ├── auth.py              # /auth/register, /auth/login, /auth/me
│   │   │   ├── note.py              # /add-note, /notes, /notes/reindex, /notes/voice
│   │   │   ├── chat.py              # /chat (RAG endpoint)
│   │   │   ├── insights.py          # /insights
│   │   │   ├── simulation.py        # /simulate
│   │   │   ├── profile.py           # /profile/personality
│   │   │   └── digest.py            # /digest/latest
│   │   ├── services/
│   │   │   ├── llm.py               # Gemini wrapper (singleton via app.state)
│   │   │   ├── rag.py               # Full RAG pipeline
│   │   │   ├── embedding.py         # Gemini text-embedding-04
│   │   │   ├── vector_db.py         # Per-user FAISS management + process cache
│   │   │   ├── retrieval.py         # Embedding ↔ VectorDB bridge
│   │   │   ├── personality.py       # OCEAN analysis + validation
│   │   │   ├── insights.py          # Behavioral pattern analysis
│   │   │   ├── decision.py          # Decision simulation engine
│   │   │   ├── digest.py            # Weekly digest generation
│   │   │   └── voice.py             # Whisper transcription
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── dependencies/
│   │   │   └── auth.py              # get_current_user JWT dependency
│   │   ├── middleware/
│   │   │   └── logging.py           # structlog request middleware
│   │   └── tasks/
│   │       └── weekly_digest.py     # APScheduler job
│   ├── alembic/                     # Database migrations
│   ├── config.py                    # pydantic-settings config
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios API layer (auth, chat, notes, insights)
│   │   ├── store/                   # Zustand stores (auth, chat, notes)
│   │   ├── pages/                   # Dashboard, Chat, Notes, Insights, Profile
│   │   └── components/              # Sidebar, ProtectedRoute, UI components
│   ├── vite.config.ts
│   └── package.json
├── vercel.json                      # SPA rewrites for React Router
└── .env.example
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create account, returns JWT |
| `POST` | `/auth/login` | OAuth2 password flow, returns JWT |
| `GET` | `/auth/me` | Get current user profile |

### Memories
| Method | Endpoint | Rate Limit | Description |
|--------|----------|-----------|-------------|
| `POST` | `/add-note` | 30/min | Save memory + index in FAISS |
| `GET` | `/notes` | — | List all memories for user |
| `POST` | `/notes/reindex` | — | Rebuild FAISS from DB notes |
| `POST` | `/notes/voice` | — | Transcribe audio → note (Whisper) |

### AI Endpoints
| Method | Endpoint | Rate Limit | Description |
|--------|----------|-----------|-------------|
| `POST` | `/chat` | 10/min | RAG chat with digital twin |
| `GET` | `/insights` | 10/min | Behavioral patterns + AI observations |
| `POST` | `/simulate` | 5/min | Decision simulation for scenario |
| `GET` | `/profile/personality` | — | Get stored OCEAN profile |
| `POST` | `/profile/personality/analyze` | — | Run fresh OCEAN analysis |
| `GET` | `/digest/latest` | — | Get latest weekly AI digest |

> All endpoints except `/auth/*` require `Authorization: Bearer <token>` header.

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL database ([Neon](https://neon.tech) free tier works)
- [Google Gemini API key](https://aistudio.google.com) (free)

### 1. Clone & Backend Setup

```bash
git clone https://github.com/prajwal5065/Persona-Twin.git
cd Persona-Twin

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see below)

# Run database migrations
cd backend
alembic upgrade head

# Start backend
cd ..
uvicorn backend.app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

### 2. Frontend Setup

```bash
# In a new terminal
cd frontend
npm install

# Set backend URL
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
# → http://localhost:5173
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# AI
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_key_here      # Optional — only for voice notes

# Security
SECRET_KEY=your-random-32-char-secret-key-here

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app

# Vector DB
FAISS_INDEX_PATH=./faiss_index
```

---

## Deployment

### Backend → Render

| Setting | Value |
|---------|-------|
| Root Directory | *(leave blank)* |
| Build Command | `pip install -r backend/requirements.txt` |
| Start Command | `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT` |

Add all environment variables in Render Dashboard → Environment.

> **Important:** Add `GEMINI_API_KEY` (not `GOOGLE_API_KEY`) — the config reads `GEMINI_API_KEY`.

### Frontend → Vercel

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variable | `VITE_API_URL` = your Render backend URL |

The `vercel.json` in the root handles SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## Key Engineering Decisions

**Why per-user FAISS indexes instead of a shared index?**
A shared FAISS index has no concept of ownership — a search returns results from all users. Namespacing to `user_{id}.bin` gives complete data isolation at zero extra cost. A process-level LRU cache means each user's index loads from disk only once per server lifetime.

**Why Gemini embeddings instead of sentence-transformers?**
sentence-transformers requires PyTorch (~500MB) which is slow to install and breaks on some deployment platforms. Gemini `text-embedding-04` is an API call — zero local dependencies, 768-dim vectors, better multilingual support.

**Why `LLMService` as a singleton via FastAPI lifespan?**
`genai.list_models()` is a live network call. Instantiating `LLMService` per-request added 500ms+ latency on every chat. The lifespan pattern creates it once at startup and shares it via `app.state.llm`.

**Why async SQLAlchemy with asyncpg?**
FastAPI is async. Blocking DB calls in an async event loop starve other requests. `AsyncSession` + `asyncpg` keeps the entire request path non-blocking.

---

## What I Learned Building This

- Building a real RAG pipeline from scratch — not using LangChain, just the primitives
- FastAPI async patterns: `AsyncSession`, `asyncpg`, lifespan context managers
- FAISS internals: how `IndexFlatL2` works, why L2 distance works for cosine-similar embeddings
- JWT auth implementation with proper 401 interceptor patterns on the frontend
- Why per-user vector isolation matters for privacy in multi-tenant AI systems
- structlog for production-grade structured logging with request context
- Pydantic v2 validators and the difference between `field_validator` and `model_validator`
- Vercel SPA routing — why `vercel.json` rewrites are required for React Router

---

## Roadmap

- [x] JWT Authentication
- [x] Semantic memory storage with FAISS
- [x] RAG-powered chat
- [x] OCEAN personality profiling
- [x] Decision simulation
- [x] Behavioral insights
- [x] Voice notes (Whisper)
- [x] Weekly AI digest (APScheduler)
- [ ] Memory timeline with semantic clustering
- [ ] Contradiction detection between old and new beliefs
- [ ] Export your twin as a system prompt
- [ ] Mobile app (React Native)
- [ ] Shared/public twin profiles

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built by **[Prajwal Kamte](https://github.com/prajwal5065)**

⭐ Star this repo if you found it interesting

</div>
