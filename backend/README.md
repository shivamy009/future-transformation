# Future Transformation Backend (Auth + RBAC)

This backend implements a production-ready authentication slice using FastAPI, MySQL, JWT, and RBAC.

## Scope Implemented
- JWT authentication (`/api/v1/auth/login`)
- RBAC with `admin` and `user` roles
- Protected endpoints (`/api/v1/auth/me`, `/api/v1/auth/admin-check`)
- Admin-only user creation (`/api/v1/auth/register`)
- Relational MySQL schema for:
  - `roles`
  - `users`
  - `activity_logs`
- Activity logging for login events

## Quick Start
1. Create and activate a virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy env variables:
   - `cp .env.example .env`
4. Update `.env` with MySQL credentials and secure secrets.
5. Run server:
   - `uvicorn app.main:app --reload`

## Default Seed Data
On startup, service seeds:
- Roles: `admin`, `user`
- Admin user from env:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`

## API Summary
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register` (admin token required)
- `GET /api/v1/auth/me` (authenticated)
- `GET /api/v1/auth/admin-check` (admin only)
- `GET /health`

## Production Notes
- Always set a strong `SECRET_KEY` in production.
- Keep `ADMIN_PASSWORD` secure and rotate it.
- Place this service behind HTTPS and a reverse proxy.
- Move table creation to migrations (Alembic) for strict production workflows.
