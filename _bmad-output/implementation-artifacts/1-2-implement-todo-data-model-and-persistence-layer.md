# Story 1.2: Implement Todo Data Model and Persistence Layer

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,  
I want a persisted todo model in PostgreSQL with Prisma migrations,  
so that todo records are durable and consistently retrievable.

## Acceptance Criteria

1. Given the backend service is running with DB connectivity, when the initial migration is applied, then a `todos` table exists with required fields (`id`, `description`, `is_completed`, `created_at`).
2. Given the persistence layer is implemented, when repository operations run, then create/read/update/delete operations for todos are supported through repository methods.
3. Given naming and data contract rules, when schema and repository are implemented, then DB/API field naming follows `snake_case` conventions for persisted fields.
4. Given reliability requirements, when data is created and app/backend is restarted or page is refreshed, then todo data remains persisted without loss.

## Tasks / Subtasks

- [x] Add Prisma and PostgreSQL persistence dependencies (AC: 1, 2)
  - [x] Add Prisma CLI/client dependencies to backend package.
  - [x] Add backend scripts for Prisma generate/migrate workflows.
  - [x] Ensure `DATABASE_URL` is consumed from backend runtime environment.
- [x] Create initial Prisma schema for todos (AC: 1, 3)
  - [x] Add `apps/backend/prisma/schema.prisma` with PostgreSQL datasource and Prisma client generator.
  - [x] Define `Todo` model mapped to `todos` table with fields:
    - [x] `id` (UUID primary key)
    - [x] `description` (`String`, 1-120 length validation handled in service/API layer later)
    - [x] `is_completed` (`Boolean`, default false)
    - [x] `created_at` (`DateTime`, default now)
  - [x] Apply explicit Prisma `@map`/`@@map` where needed to preserve `snake_case`.
- [x] Create and apply initial migration (AC: 1)
  - [x] Run Prisma migration command to generate first SQL migration.
  - [x] Commit generated migration files under `apps/backend/prisma/migrations`.
  - [x] Verify DB contains expected `todos` schema after migration.
- [x] Implement backend repository layer for todos (AC: 2, 3)
  - [x] Add `apps/backend/src/modules/todos/todo.repository.ts`.
  - [x] Implement repository methods for create/list/update completion/delete.
  - [x] Keep DB access in repository only (no DB calls in route layer).
- [x] Add Prisma client bootstrap for backend (AC: 2)
  - [x] Add a reusable Prisma client module under backend infrastructure (for example `src/config/prisma.ts`).
  - [x] Ensure lifecycle-safe usage in app context for current story scope.
- [x] Add persistence-focused tests (AC: 1, 2, 4)
  - [x] Add repository unit/integration tests validating CRUD behavior against DB.
  - [x] Validate field mapping and defaults (`is_completed=false`, `created_at` set).
  - [x] Include at least one persistence/reload verification test scenario.
- [x] Update developer docs for persistence workflow (AC: 4)
  - [x] Document migration and local DB setup commands in root and/or backend README.
  - [x] Clarify Docker/host `DATABASE_URL` expectations (`db` host in compose, `localhost` on host runtime).

## Dev Notes

- This story is persistence-only. Do not implement HTTP CRUD endpoints here (that belongs to Story 1.3).
- Keep architecture boundary intact:
  - FE remains UI-only.
  - BE owns persistence/domain logic.
  - Shared package holds contracts/schemas only; no DB runtime logic there.
- Apply established naming rules:
  - DB table and columns in `snake_case`.
  - API payload convention remains `snake_case` for BE boundaries.
- Repository is the sole DB access layer (`route -> service -> repository` pattern).
- Prisma is the only allowed ORM/DB access mechanism for this project.

### Project Structure Notes

- Expected files/directories introduced or updated in this story:
  - `apps/backend/prisma/schema.prisma`
  - `apps/backend/prisma/migrations/*`
  - `apps/backend/src/modules/todos/todo.repository.ts`
  - `apps/backend/src/config/prisma.ts` (or equivalent backend config location)
  - backend tests for repository/persistence behavior
- Keep consistency with Story 1.1 scaffolding and review hardening:
  - Existing backend env handling and Docker health/readiness should remain intact.
  - Do not re-introduce duplicate config files (for example duplicate Vitest config variants).

### Previous Story Intelligence

- Story 1.1 established monorepo structure and backend baseline under `apps/backend`.
- Story 1.1 review remediation already hardened:
  - runtime env loading,
  - production-safe error messages,
  - Docker DB health checks and startup ordering.
- Reuse the existing backend layout (`src/config`, `src/modules`, `src/test`) instead of creating parallel structures.

### Git Intelligence Summary

- Recent commits indicate Story 1.1 implementation + review hardening are complete:
  - `feat: story 1 implemented`
  - `fix: apply story 1 review hardening`
- Preserve current conventions from those commits (workspace scripts, env handling, docker-compose flow, test command behavior).

### Testing Requirements

- Use Vitest for backend tests.
- Prefer deterministic repository tests with explicit setup/teardown.
- Validate:
  - create and list returns persisted data,
  - update completion state persists,
  - delete removes record,
  - defaults and timestamp behavior are correct.
- Run full workspace checks after implementation:
  - `npm run test`
  - `npm run lint`
  - `npm run build`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story-1.2-Implement-Todo-Data-Model-and-Persistence-Layer]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Data-Architecture]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Project-Structure-and-Boundaries]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Naming-Patterns]
- [Source: `Product Requirement Document (PRD) for the Todo App.md`#Functional-Requirements]
- [Source: `Product Requirement Document (PRD) for the Todo App.md`#Non-Functional-Requirements]
- [Source: `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md`]

## Dev Agent Record

### Agent Model Used

gpt-5.3-codex

### Debug Log References

- Story selected automatically from sprint backlog order: `1-2-implement-todo-data-model-and-persistence-layer`.
- Epic 1 already in-progress; no epic status transition required.
- Context sources loaded: epics, architecture, PRD, Story 1.1, recent commit history.
- Implemented Prisma 7 configuration with `prisma.config.ts` and generated client output under backend source tree.
- Added initial migration SQL via Prisma migrate diff command and schema-backed `todos` model.
- Completed verification commands: `npm run test`, `npm run lint`, `npm run build`.

### Completion Notes List

- Comprehensive developer guardrails added for Prisma/PostgreSQL implementation.
- Explicitly scoped this story to persistence/model/repository work only.
- Added cross-story continuity notes from Story 1.1 to reduce rework/regressions.
- Added repository implementation with snake_case output mapping and CRUD operations.
- Added persistence-focused backend tests (repository behavior, defaults, migration artifact coverage, reload simulation).
- Updated root docs and workspace scripts for Prisma generate/migrate workflows.

### File List

- `_bmad-output/implementation-artifacts/1-2-implement-todo-data-model-and-persistence-layer.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `README.md`
- `package.json`
- `package-lock.json`
- `apps/backend/package.json`
- `apps/backend/prisma.config.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/migrations/migration_lock.toml`
- `apps/backend/prisma/migrations/20260320161000_init_todos/migration.sql`
- `apps/backend/src/app.ts`
- `apps/backend/src/config/prisma.ts`
- `apps/backend/src/modules/todos/todo.repository.ts`
- `apps/backend/src/test/unit/todo.repository.test.ts`
- `apps/backend/src/generated/prisma/`

## Change Log

- 2026-03-20: Implemented Story 1.2 persistence layer with Prisma/PostgreSQL schema, migration artifacts, repository CRUD, and validation tests.
