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
2. Copy environment variables for backend/local tooling:
   - `cp .env.example .env`
3. (Optional) Add frontend app env file for local Next.js:
   - `cp .env.example apps/frontend/.env.local`
   - This lets Next.js read `NEXT_PUBLIC_API_BASE_URL` in `apps/frontend`.
4. Install workspace dependencies:
   - `npm install`

## Package Manager

- This repository uses **npm** as the canonical package manager.
- `pnpm-workspace.yaml` is present for compatibility only; use npm commands in docs and CI.

## Run Locally

- Start frontend:
  - `npm run dev:frontend`
- Start backend:
  - `npm run dev:backend`

## Persistence Workflow (Backend)

- Generate Prisma client:
  - `npm run prisma:generate`
- Create and apply a local migration:
  - `npm run prisma:migrate:dev -- --name init_todos`
- Apply committed migrations (non-dev environments):
  - `npm run prisma:migrate:deploy`
- Run integration checks against a real PostgreSQL instance:
  - `DATABASE_URL_TEST=postgresql://postgres:postgres@localhost:5432/todo_app npm run test:integration`

`DATABASE_URL` host conventions:
- Use `localhost` when running backend directly on your machine.
- Use `db` hostname when backend runs inside Docker Compose.

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
