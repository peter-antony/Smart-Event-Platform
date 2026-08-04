# 🎟️ Smart Event Platform AI (Eventora)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_AI-FF6F61.svg?style=flat)](https://python.langchain.com/docs/langgraph)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

**Smart Event Platform AI** (Eventora) is a production-grade, AI-driven event discovery and ticket reservation platform. Built with a modern **FastAPI** backend and **React 19 + TypeScript** frontend, it features a stateful **LangGraph AI Assistant** with **Human-in-the-Loop (HITL)** safety pauses for automated ticket pass creation and real-time event recommendations.

---

## 🌟 Key Features

- 🤖 **LangGraph Agentic AI Engine**: Multi-turn conversational event assistant with persistent session thread state, NLU intent classification, and automatic parameter extraction.
- 🛑 **Human-in-the-Loop (HITL) Safety Controls**: Pauses workflow execution before executing high-stakes ticket pass bookings, requiring explicit user approval (`CONFIRM`, `CANCEL`, `CHANGE_EVENT`).
- ⚡ **FastAPI Asynchronous Backend**: Async REST endpoints, Pydantic v2 data validation, SQLAlchemy ORM with SQLite (Development) / PostgreSQL (Production) support, and Alembic migrations.
- 🎨 **Modern Glassmorphic Dark UI**: React frontend featuring vibrant color palettes, glassmorphism card components, interactive event discovery filters, and live progress indicators.
- 🔒 **Enterprise JWT Security & RBAC**: Bearer token authentication with Role-Based Access Control (`ATTENDEE`, `ORGANIZER`, `ADMIN`) and backend-enforced user context.
- 📡 **Real-Time Step Progress**: Real-time agent execution pipeline notifications (`UNDERSTANDING_REQUEST`, `SEARCHING_EVENTS`, `WAITING_FOR_CONFIRMATION`, `CREATING_BOOKING`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18/19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios |
| **Backend Framework** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2, PyJWT |
| **AI & Orchestration** | LangGraph, LangChain, OpenAI GPT-4o / GPT-4.1-mini |
| **Database & ORM** | SQLAlchemy ORM, SQLite (Dev) / PostgreSQL (Prod), Alembic Migrations |
| **Real-time & WebSockets** | Socket.IO / WebSockets |

---

## 📁 Repository Architecture

```
Smart-Event-Platform-AI/
├── backend/
│   ├── app/
│   │   ├── agents/          # LangGraph Agent, State Definition, & Node Graph
│   │   ├── api/             # FastAPI API Routers (v1 & Direct Endpoint Spec)
│   │   ├── core/            # App Configuration, JWT Security, & Auth Dependencies
│   │   ├── db/              # SQLAlchemy Database Engine & Base Models
│   │   ├── models/          # Database Models (Event, Booking, User, AgentHistory)
│   │   ├── repositories/    # Data Access Objects (DAOs)
│   │   ├── schemas/         # Pydantic v2 Request & Response Validation Schemas
│   │   ├── services/        # Business Logic (EventService, BookingService, AgentService)
│   │   └── tools/           # LangChain Tools (search_events, create_booking, etc.)
│   ├── alembic/             # Alembic Database Migration Scripts
│   ├── test_*.py            # Comprehensive Automated Integration & Unit Tests
│   ├── requirements.txt     # Python Backend Dependencies
│   └── .env                 # Backend Environment Variables
└── frontend/
    ├── src/
    │   ├── components/      # UI Components (ChatMessage, ChatWindow, Sidebar, etc.)
    │   ├── pages/           # Pages (EventDiscoveryPage, AIEventAssistantPage, MyBookingsPage)
    │   ├── services/        # Axios API Client & Agent Service Integration
    │   ├── types/           # TypeScript Event & Booking Type Declarations
    │   └── vite-env.d.ts    # Ambient Vite Client Declarations
    ├── package.json         # Frontend Dependencies & Scripts
    ├── tsconfig.json        # TypeScript Compiler Configuration
    └── vite.config.ts       # Vite Bundler Configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0 or higher)
- **Python** (v3.10 or higher)
- **OpenAI API Key** (for AI agent chat turns)

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in `backend/` (or copy `.env.example`):
   ```env
   APP_NAME="Smart Event Platform API"
   ENVIRONMENT="development"
   DEBUG=true
   API_V1_PREFIX="/api/v1"
   DATABASE_URL="sqlite:///./smart_event.db"
   OPENAI_API_KEY="your_openai_api_key_here"
   OPENAI_MODEL="gpt-4.1-mini"
   JWT_SECRET_KEY="smart-event-local-development-secret"
   JWT_ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   FRONTEND_URL="http://localhost:5173"
   BACKEND_CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
   ```

5. **Seed Database with Initial Sample Data**:
   ```bash
   python test_db_seed.py
   ```

6. **Start the FastAPI Development Server**:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   - **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_SOCKET_URL=http://localhost:8000
   ```

4. **Launch Vite Development Server**:
   ```bash
   npm run dev
   ```
   - **Web Application URL**: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/health` | Service health status check | ❌ |
| `GET` | `/api/events/search` | Search & filter event inventory | ❌ |
| `GET` | `/api/events/{id}` | Retrieve detailed event information | ❌ |
| `POST` | `/api/bookings` | Book ticket passes for an event | 🔑 |
| `GET` | `/api/bookings/my-bookings` | Fetch authenticated user's ticket passes | 🔑 |
| `DELETE` | `/api/bookings/{id}` | Cancel an existing booking pass | 🔑 |
| `POST` | `/api/agent/chat` | Send user message to AI LangGraph Agent | 🔑 (Optional Fallback) |

---

## 🧪 Running Automated Tests

Run backend unit and integration workflow test scripts from the `backend/` directory:

```bash
# Test Agent Chat LangGraph Execution
python test_agent_chat.py

# Test Human-in-the-Loop (HITL) Pauses & Confirmation
python test_human_in_loop.py

# Test REST API Endpoints & Authentication
python test_fastapi_endpoints.py

# Run All Integrated System Workflows
python test_all_workflows.py
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.


# One-Line Explanation
React shows the application,
FastAPI handles the backend,
SQLite stores the data,
OpenAI understands the user,
LangChain gives tools to the AI,
LangGraph manages the AI workflow,
and Socket.IO provides real-time updates.

## For your project, the most important concept to remember is:

OpenAI = Brain

LangChain = Tools given to the brain

LangGraph = Workflow/controller that manages the brain and tools

FastAPI = Bridge between frontend, AI, and database

SQLite = Stores events and bookings

React = User interface

Socket.IO = Sends live notifications

## One-Line Project Explanation

Smart Event Platform is an AI-powered event application where users can discover events, book tickets, manage bookings, and use an AI Agent to complete event-related tasks.

## One-Line Technology Explanation

React builds the UI, FastAPI handles the backend, SQLite stores data, OpenAI understands users, LangChain provides tools, and LangGraph manages the AI Agent workflow.
