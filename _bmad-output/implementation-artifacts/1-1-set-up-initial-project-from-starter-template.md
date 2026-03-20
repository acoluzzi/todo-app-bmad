# Story 1.1: Set Up Initial Project from Starter Template

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want to initialize the project from the approved starter template and establish the monorepo skeleton,  
so that feature development starts on a stable architectural foundation.

## Acceptance Criteria

1. Given the architecture-approved starter command is available, when initial setup is executed, then frontend starter app is created using create-next-app and integrated into monorepo structure.
2. Given the repository root, when initialization is complete, then `apps/frontend`, `apps/backend`, and `packages/shared` exist with runnable entry points.
3. Given workspace configuration, when dependencies are installed, then root and package scripts run successfully for targeted app commands.
4. Given local developer setup, when documentation is read, then a new developer can start the project structure and understand app boundaries.
5. Given sprint tracking, when this story is prepared, then it is marked ready-for-dev with implementation boundaries aligned to architecture decisions.

## Tasks / Subtasks

- [x] Bootstrap monorepo workspace layout (AC: 2, 3)
  - [x] Create root workspace/package manager configuration.
  - [x] Create `apps/frontend`, `apps/backend`, and `packages/shared` folders.
  - [x] Add minimal package manifests for backend and shared package.
- [x] Initialize frontend from approved starter template (AC: 1, 2)
  - [x] Run starter command in `apps/frontend` (or scaffold then move preserving config).
  - [x] Ensure Next.js app remains UI-only (no backend business logic routes).
  - [x] Keep starter defaults aligned with architecture (TypeScript, linting, Tailwind, app router, src-dir).
- [x] Scaffold backend baseline service (AC: 2, 3)
  - [x] Add backend app entry point and minimal health route.
  - [x] Add baseline directories: `src/config`, `src/middleware`, `src/modules`.
  - [x] Add BE test scaffold for Vitest.
- [x] Scaffold shared package baseline (AC: 2, 3)
  - [x] Add shared package for contracts/schemas/types only.
  - [x] Export minimal placeholder modules for future API contracts.
- [x] Add local orchestration baseline placeholder (AC: 3)
  - [x] Add/prepare root `docker-compose.yml` for FE/BE/DB service definitions.
  - [x] Add `.env.example` with baseline variables required by FE and BE.
- [x] Add developer run documentation (AC: 4)
  - [x] Update root README with workspace structure and startup instructions.
  - [x] Include notes on FE/BE separation and where to implement future stories.

## Dev Notes

- Enforce architecture boundary from day one: FE is a UI component, BE is a separate API component.
- Keep naming and structure consistent with architecture document:
  - monorepo layout under `apps/` and `packages/`
  - snake_case payload contract expectation for API layer (to be implemented in later stories)
- Do not implement business CRUD logic in this story; this story is foundation setup only.
- Ensure generated structure supports later stories:
  - Story 1.2 (data model and persistence)
  - Story 1.3 (CRUD API endpoints)
  - Story 1.4 (UI interactions)

### Project Structure Notes

- Required structure target (minimum for this story):
  - `apps/frontend` (Next.js)
  - `apps/backend` (separate API app skeleton)
  - `packages/shared` (contracts/schemas)
  - root workspace config
  - root `docker-compose.yml`
  - root `.env.example`
- If starter bootstrap happens first at root, reorganize immediately to preserve agreed architecture boundaries.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story-1.1-Set-Up-Initial-Project-from-Starter-Template]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Starter-Template-Evaluation]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Core-Architectural-Decisions]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Project-Structure-and-Boundaries]
- [Source: `Product Requirement Document (PRD) for the Todo App.md`#Non-Functional-Requirements]

## Dev Agent Record

### Agent Model Used

gpt-5.3-codex

### Debug Log References

- Story generated from sprint-status backlog detection (`1-1-set-up-initial-project-from-starter-template`).
- Architecture constraints prioritized over generic starter defaults.
- Updated sprint status: `ready-for-dev -> in-progress` for `1-1-set-up-initial-project-from-starter-template`.
- Frontend scaffolded with `create-next-app` under `apps/frontend` (TypeScript, ESLint, Tailwind, App Router, src-dir).
- Monorepo workspace scripts validated via `npm run test`, `npm run lint`, and `npm run build`.
- Applied code-review follow-up fixes for runtime hardening, Docker readiness, and monorepo documentation consistency.
- Added frontend `test` and `test:watch` commands so workspace test execution includes frontend.

### Completion Notes List

- Story context includes technical guardrails to avoid FE/BE boundary regressions.
- Task list is scoped to setup only and intentionally excludes CRUD/domain features.
- Implemented root workspace setup (`package.json`, `pnpm-workspace.yaml`) and installed dependencies with workspace-aware scripts.
- Implemented backend skeleton in `apps/backend` with Fastify app factory, `/api/v1/health` route, and Vitest unit test.
- Implemented shared package baseline in `packages/shared` for contracts/schemas/utils placeholders.
- Added root `docker-compose.yml` and `.env.example` to establish FE/BE/DB local orchestration baseline.
- Added root `README.md` with structure, startup commands, and architecture guardrails.
- Verified acceptance criteria through successful lint/test/build commands.
- Completed code-review remediation: sanitized production error messages, strict env parsing, Docker health checks, and frontend docs alignment.

### File List

- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `.env.example`
- `README.md`
- `docker-compose.yml`
- `package-lock.json`
- `package.json`
- `pnpm-workspace.yaml`
- `apps/frontend/AGENTS.md`
- `apps/frontend/CLAUDE.md`
- `apps/frontend/eslint.config.mjs`
- `apps/frontend/next-env.d.ts`
- `apps/frontend/next.config.ts`
- `apps/frontend/package.json`
- `apps/frontend/README.md`
- `apps/frontend/postcss.config.mjs`
- `apps/frontend/public/file.svg`
- `apps/frontend/public/globe.svg`
- `apps/frontend/public/next.svg`
- `apps/frontend/public/vercel.svg`
- `apps/frontend/public/window.svg`
- `apps/frontend/src/app/favicon.ico`
- `apps/frontend/src/app/globals.css`
- `apps/frontend/src/app/layout.tsx`
- `apps/frontend/src/app/page.tsx`
- `apps/frontend/tsconfig.json`
- `apps/backend/package.json`
- `apps/backend/tsconfig.json`
- `apps/backend/vitest.config.js` (deleted)
- `apps/backend/vitest.config.ts`
- `apps/backend/src/app.ts`
- `apps/backend/src/main.ts`
- `apps/backend/src/config/env.ts`
- `apps/backend/src/config/logger.ts`
- `apps/backend/src/middleware/error-handler.ts`
- `apps/backend/src/modules/health.route.ts`
- `apps/backend/src/test/unit/health.test.ts`
- `packages/shared/package.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/api-contracts/index.ts`
- `packages/shared/src/schemas/index.ts`
- `packages/shared/src/utils/index.ts`

## Change Log

- 2026-03-20: Completed Story 1.1 implementation; scaffolded monorepo frontend/backend/shared baseline with Docker Compose/env/docs and validated with test/lint/build.
- 2026-03-20: Applied Story 1.1 code-review fixes and added frontend test scripts for workspace-level test command consistency.
