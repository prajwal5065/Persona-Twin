# SelfTwin 🧠

> **Your AI-powered Digital Twin — a system that learns who you are, remembers what you've done, and thinks the way you do.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## What is SelfTwin?

SelfTwin is a personal AI system that builds a **living digital model of you** — your thoughts, habits, preferences, and decision patterns — by learning from your own data. Unlike generic AI assistants, SelfTwin doesn't give you generic answers. It gives you *your* answers.

Feed it your notes, journal entries, chat logs, and activity history. Over time, it learns how you think, what you value, and how you make decisions — then becomes a searchable, conversational mirror of yourself.

---

## The Problem It Solves

We generate enormous amounts of personal data every day — notes, messages, tasks, decisions — but almost none of it is ever revisited or made useful. When we need to recall a past decision, find an old idea, or understand our own patterns, we're left digging through scattered files and fading memories.

SelfTwin transforms your personal data into a **queryable, intelligent extension of your mind**.

---

## Key Features

- **Persistent Memory** — Stores your notes, logs, and inputs as semantic embeddings that can be recalled naturally
- **Semantic Search** — Find past thoughts and entries using meaning, not just keywords
- **Chat with Your Twin** — Ask questions and get responses grounded in your actual past data
- **Personality Modeling** — Learns your communication style, tone, and preferences over time
- **Behavior Insights** — Detects patterns in your decisions, habits, and recurring themes
- **Decision Simulation** — Predicts how *you* would approach new scenarios based on past behavior *(Advanced)*

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend API** | FastAPI (Python) |
| **Structured Storage** | PostgreSQL |
| **Vector Memory** | FAISS / Pinecone |
| **Embeddings** | OpenAI `text-embedding-ada-002` / Sentence Transformers |
| **LLM Reasoning** | OpenAI GPT-4 / Anthropic Claude / Local LLM |
| **Frontend** | React + TailwindCSS |
| **Task Queue** | Celery + Redis |
| **Containerization** | Docker + Docker Compose |

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend (React)                  │
│           Chat UI · Dashboard · Data Upload              │
└───────────────────────────┬─────────────────────────────┘
                            │ REST / WebSocket
┌───────────────────────────▼─────────────────────────────┐
│                     FastAPI Backend                      │
│        Auth · Ingestion · Chat · Insights APIs           │
└──────┬──────────────────────────────────────┬───────────┘
       │                                      │
┌──────▼──────┐                    ┌──────────▼──────────┐
│  PostgreSQL  │                    │   Vector Store       │
│  (Structured │                    │   FAISS / Pinecone   │
│   metadata,  │                    │   (Semantic memory   │
│   user data) │                    │    embeddings)       │
└─────────────┘                    └──────────┬──────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │    LLM Reasoning     │
                                   │  GPT-4 / Claude API  │
                                   │  (RAG-grounded chat) │
                                   └─────────────────────┘
```

---

## How It Works

```
1. You submit data   →   Notes, journal entries, chat logs, documents
        │
2. Embedding pipeline →  Text is chunked, cleaned, and converted to vectors
        │
3. Storage           →   Vectors saved to FAISS; metadata saved to PostgreSQL
        │
4. You ask a question →  Query is embedded → nearest memory chunks retrieved
        │
5. LLM reasoning     →   Retrieved context + query sent to LLM with your persona prompt
        │
6. Response          →   Answer grounded in your actual data, styled in your tone
```

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (recommended)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/selftwin.git
cd selftwin

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your API keys and DB credentials

# 3. Start all services
docker-compose up --build

# 4. Run database migrations
docker exec -it selftwin-api alembic upgrade head

# 5. Access the app
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Manual Setup (without Docker)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Future Scope

- **Voice Interface** — Talk to your twin via speech-to-text
- **Mobile App** — iOS/Android for on-the-go data capture and chat
- **Multi-source Connectors** — Notion, Obsidian, Google Calendar, Slack integrations
- **Collaborative Twins** — Share a read-only view of your twin with trusted collaborators
- **Federated/Local Mode** — Run entirely on-device for maximum privacy
- **Temporal Awareness** — Track how your views and behaviors evolve over time

---

## Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

*Built with the belief that your own data should work for you.*