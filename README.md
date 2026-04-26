# SelfTwin (Persona-Twin)

SelfTwin is an AI-powered project designed to create a digital twin or persona based on user data and interactions. It uses a FastAPI backend with RAG (Retrieval-Augmented Generation) and a modern React frontend.

## 🧩 Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL (Neon), FAISS (Vector DB), Gemini AI.
- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Zustand, Axios, Lucide React.
- **Design**: Premium glassmorphism UI built with **Stitch UI**.

## 🏗️ Project Structure

```text
├── backend/                # FastAPI Backend
│   ├── app/                # Main application logic
│   │   ├── routes/         # Auth, Chat, Notes, Insights, Digest
│   │   ├── services/       # RAG, Personality analysis, VectorDB
│   │   └── models/         # Database schemas
│   └── main.py             # Entry point
├── frontend/               # React + TS Frontend
│   ├── src/
│   │   ├── components/     # UI Components & Layout
│   │   ├── pages/          # Login, Chat, Notes, Insights, Profile
│   │   ├── store/          # Zustand State Management
│   │   └── api/            # Axios API layer
└── README.md
```

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to `backend/`.
2. Create virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/Scripts/activate
   pip install -r requirements.txt
   ```
3. Set up `.env` file (see `.env.example`).
4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

## ✨ Features

- **Authentication**: JWT-based login and registration.
- **Memories (Notes)**: Save thoughts and experiences to train your twin.
- **AI Chat**: Interact with your digital twin powered by Gemini and your memories.
- **Insights**: Personality analysis (OCEAN profile) and behavioral patterns.
- **Simulation**: Predict your own decisions in hypothetical scenarios.
- **Weekly Digest**: Automated summaries of your week (email/UI).