# Persona Twin

Persona Twin is an AI-powered project designed to create a digital twin or persona based on user data and interactions.

## Project Structure

```text
├── backend/                # FastAPI Backend
│   ├── app/                # Main application logic
│   │   ├── main.py         # Entry point
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Database models (SQLAlchemy/Pydantic)
│   │   ├── services/       # Business logic
│   │   ├── db/             # Database connection & session
│   │   └── utils/          # Utility functions
│   ├── requirements.txt    # Backend dependencies
│   └── config.py           # Configuration & Settings
├── frontend/               # Frontend (Upcoming)
└── README.md               # Project documentation
```

## Setup Instructions

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## Roadmap
- [x] Initial Project Structure
- [ ] Database Integration
- [ ] Authentication System
- [ ] UI/UX Design (Frontend)
- [ ] AI Persona Integration