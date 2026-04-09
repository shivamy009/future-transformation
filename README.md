# Future Transformation

Minimal working knowledge-assistant + task workflow system.

## Overview
This project provides:
- Admin workflow:
  - Create users
  - Upload `.txt`/`.pdf` documents
  - Create, assign, update, and delete tasks
  - View analytics and user activity logs
- User workflow:
  - Login and view assigned tasks
  - Update task status (`pending` <-> `completed`)
  - Run AI-powered semantic search on uploaded knowledge

## Tech Stack

### Backend
- Python, FastAPI
- MySQL (SQLAlchemy ORM + relational schema)
- JWT auth (`python-jose`) + RBAC
- Embeddings + LLM: OpenAI
- Vector DB: Pinecone
- Document parsing: `pypdf` (PDF), UTF-8 text loader
- Remote document storage: ImageKit

### Frontend
- React + Vite
- React Router
- Zustand (state management)
- Tailwind CSS v4
- Lucide icons + react-hot-toast

## Project Structure
- `backend/` FastAPI APIs, DB models, business services
- `frontend/` React app

## Features Implemented
- JWT authentication and role-based authorization (`admin`, `user`)
- MySQL relational schema with PK/FK
- Document upload and metadata persistence
- Embedding-based semantic retrieval pipeline
- Recursive + overlapping chunking for better RAG/search quality
- Task assignment and lifecycle management
- Dynamic filtering (`/tasks?status=...`, `/tasks?assigned_to=...`)
- Activity logging (login, task updates, document upload, search, delete actions)
- Basic analytics dashboard

## Backend Setup
1. Go to backend:
   - `cd backend`
2. Create venv and activate:
   - `python3 -m venv venv`
   - `source venv/bin/activate`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Configure env:
   - `cp .env.example .env`
   - Fill MySQL, OpenAI, Pinecone, ImageKit values
5. Run API:
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

## Frontend Setup
1. Go to frontend:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Configure env:
   - `cp .env.example .env`
   - Set `VITE_API_BASE_URL` (default: `http://localhost:8000/api/v1`)
4. Run frontend:
   - `npm run dev`

## Required Environment Variables (Backend)
See `backend/.env.example` for the full list.

Core values:
- MySQL: `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DB`
- JWT: `SECRET_KEY`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- Admin seed: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- CORS: `BACKEND_CORS_ORIGINS`
- ImageKit: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- Pinecone: `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `PINECONE_CLOUD`, `PINECONE_ENVIRONMENT`
- OpenAI: `OPENAI_API_KEY`, `OPENAI_EMBEDDING_MODEL`, `OPENAI_CHAT_MODEL`

## API Summary
Base prefix: `/api/v1`

- Auth:
  - `POST /auth/login`
  - `POST /auth/signup`
  - `POST /auth/register` (admin)
  - `GET /auth/me`
  - `GET /auth/users` (admin)
  - `GET /auth/users/{user_id}/activities` (admin)
  - `DELETE /auth/users/{user_id}` (admin)

- Tasks:
  - `GET /tasks`
  - `POST /tasks` (admin)
  - `PATCH /tasks/{task_id}`
  - `PATCH /tasks/{task_id}/admin` (admin)
  - `DELETE /tasks/{task_id}` (admin)

- Documents:
  - `POST /documents` (admin)

- Search:
  - `POST /search`

- Analytics:
  - `GET /analytics` (admin)

## Notes
- Backend creates tables and seeds default roles/admin on startup.
- For production, use migrations (Alembic), secure secrets, and HTTPS.
- Ensure Pinecone index dimension matches embedding output (code includes runtime safeguards).