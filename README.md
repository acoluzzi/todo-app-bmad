# Todo App Monorepo

This repository contains the Todo app with a strict frontend/backend split from day one.

## Workspace Structure

- `apps/frontend`: Next.js app (UI only)
- `apps/backend`: Fastify API service
- `packages/shared`: Shared contracts, schemas, and utilities
- `tests/e2e`: End-to-end tests (to be expanded in later stories)
- `_bmad-output`: Planning and implementation artifacts

## Getting Started

1. Ensure Node.js `24.x` is installed.
2. Copy environment variables:
   - `cp .env.example .env`
3. Install workspace dependencies:
   - `npm install`

## Run Locally

- Start frontend:
  - `npm run dev:frontend`
- Start backend:
  - `npm run dev:backend`

## Docker Compose (Baseline)

Run the baseline FE/BE/DB stack:

- `docker compose up --build`

Services:
- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:3001/api/v1/health`
- Postgres: `localhost:5432`

## Architecture Guardrails

- Do not place backend business logic inside `apps/frontend`.
- Keep API/domain implementation in `apps/backend`.
- Keep shared package runtime-light and focused on contracts/schemas.
