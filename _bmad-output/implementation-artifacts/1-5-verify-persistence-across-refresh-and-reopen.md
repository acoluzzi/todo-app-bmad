# Story 1.5: Verify Persistence Across Refresh and Reopen

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want my todo state preserved after refresh or reopening the app,
so that I do not lose my task data.

## Acceptance Criteria

1. **Given** todos have been created via the API  
   **When** the backend service restarts (Prisma client disconnects and reconnects)  
   **Then** previously created todos are returned by `GET /api/v1/todos` with no data loss.

2. **Given** a todo has been marked as completed via the API  
   **When** the backend service restarts  
   **Then** the todo's `is_completed` state is still `true` after restart.

3. **Given** a todo has been deleted via the API  
   **When** the backend service restarts  
   **Then** the deleted todo does not appear in `GET /api/v1/todos` results.

4. **Given** the full stack is running (frontend + backend + database via Docker Compose)  
   **When** the user creates a todo in the frontend, then refreshes the browser  
   **Then** the todo is still visible in the rendered list after reload.

5. **Given** the backend integration tests exist and a PostgreSQL instance is available  
   **When** `npm run test:integration -w apps/backend` is executed  
   **Then** all persistence-verification tests pass, including the existing repository integration tests.

## Tasks / Subtasks

- [x] Add API-level persistence integration test (AC: 1, 2, 3)
  - [x] Create `apps/backend/src/test/integration/todo.api.integration.test.ts` that exercises the full `createApp` → API → DB pipeline.
  - [x] Test: create a todo via `POST /api/v1/todos`, close the Fastify app, create a new app instance, and verify `GET /api/v1/todos` returns the previously created todo.
  - [x] Test: toggle a todo to `is_completed: true` via `PATCH /api/v1/todos/:id`, restart the app, and verify the completion state persists.
  - [x] Test: delete a todo via `DELETE /api/v1/todos/:id`, restart the app, and verify the deleted todo is absent from the list.
  - [x] Gate tests on `DATABASE_URL_TEST` env var (same pattern as the existing `todo.repository.integration.test.ts`).

- [x] Add a `test:integration` script to backend package.json (AC: 5)
  - [x] Update `test:integration` script in `apps/backend/package.json` to set `DATABASE_URL_TEST` with fallback.
  - [x] Verify `npm run test:integration -w apps/backend` runs both the existing repository integration tests and the new API integration tests when a database is available.

- [x] Document manual full-stack persistence verification procedure (AC: 4)
  - [x] Add a section to `README.md` describing how to run Docker Compose, create a todo in the UI, refresh the page, and confirm the todo persists.
  - [x] Keep this concise — this is a manual verification checklist, not an automated E2E test (Playwright setup is Story 3.4).

- [x] Verify workspace checks pass after implementation (AC: all)
  - [x] `npm run test` (existing unit tests still pass, integration tests stay skipped without DB)
  - [x] `npm run lint`
  - [x] `npm run build`

## Dev Notes

### Architecture Compliance

- **PostgreSQL is the system of record.** All persistence verification must go through the database, not any in-memory or client-side cache. [Source: `architecture.md`#Core-Architectural-Decisions]
- **Backend layering: route → service → repository.** The new API-level integration test should exercise the full Fastify app (not just the repository), proving data survives through the real API contract. [Source: `architecture.md`#Architectural-Boundaries]
- **Docker Compose orchestrates FE + BE + DB.** The manual verification step requires `docker compose up` to be functional. [Source: `architecture.md`#Infrastructure-Deployment]
- **Playwright E2E tests are NOT in scope for this story.** Story 3.4 establishes the full E2E and orchestration baseline. Story 1.5 verifies persistence through backend integration tests and a manual UI check. [Source: `epics.md`#Story-3.4]
- **Integration tests gate on `DATABASE_URL_TEST`.** When the env var is absent, integration tests are automatically skipped. This preserves `npm run test` as a fast, no-infra-required command. [Source: existing `todo.repository.integration.test.ts`]

### Current Backend Contract

- `GET /api/v1/todos` returns `{ "data": TodoRecord[] }`
- `POST /api/v1/todos` accepts `{ "description": string }` and returns `{ "data": TodoRecord }` with status `201`
- `PATCH /api/v1/todos/:id` accepts `{ "is_completed": boolean }` and returns `{ "data": TodoRecord }`
- `DELETE /api/v1/todos/:id` returns `204` with no body

### Existing Code to Reuse (DO NOT Recreate)

- `apps/backend/src/test/integration/todo.repository.integration.test.ts` — Already tests repository-level persistence across Prisma client reinitialization. This file stays as-is; the new API-level test is additive.
- `apps/backend/src/app.ts` — `createApp({ prismaClient })` accepts an optional injected `PrismaClient`. For integration tests, construct a real `PrismaClient` connected to the test database instead of a mock.
- `docker-compose.yml` — Already defines `frontend`, `backend`, and `db` services with healthcheck. Use the `db` service for running integration tests locally.
- `apps/backend/prisma/migrations/20260320161000_init_todos/migration.sql` — The existing migration SQL used by the repository integration test to set up the schema.

### Integration Test Pattern

Follow the pattern already established in `todo.repository.integration.test.ts`:

```typescript
const testDatabaseUrl = process.env.DATABASE_URL_TEST;
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;
```

For the API-level test, create a real `PrismaClient` with `PrismaPg` adapter, pass it to `createApp({ prismaClient })`, inject requests via `app.inject()`, then close and recreate the app to verify persistence.

Clean up test data in `beforeAll` / `afterAll` to avoid cross-test contamination:
- `beforeAll`: Drop and recreate the `todos` table using the existing migration SQL.
- `afterAll`: Disconnect the Prisma client.

### Scope Boundaries / Anti-Patterns to Avoid

- Do **not** set up Playwright or any browser automation framework. That is Story 3.4.
- Do **not** add a new test database service to `docker-compose.yml`. Use a separate test database name on the same PostgreSQL instance, or use the existing database connection for integration tests.
- Do **not** change the existing unit test behavior. `npm run test` must still pass without a database.
- Do **not** add frontend tests in this story. The persistence guarantee is verified at the backend API level.
- Do **not** modify the existing `todo.repository.integration.test.ts` unless fixing a bug.

### Project Structure Notes

Files to create:

```text
apps/backend/src/test/integration/todo.api.integration.test.ts
```

Files to modify:

```text
apps/backend/package.json  (add test:integration script)
README.md                  (add manual persistence verification section)
```

### Previous Story Intelligence

**From Story 1.4**
- Frontend Vitest + Testing Library setup is complete. Frontend tests mock the API client and do not hit the backend.
- The `api-client.ts` layer handles `snake_case` ↔ `camelCase` mapping via `mappers.ts`.
- `vitest.config.ts` was excluded from frontend `tsconfig.json` to resolve a Vite type conflict during `next build`.
- Review findings included: unhandled promise rejection fix, conditional Content-Type, dark-mode gradient, centralized outbound mappers, and DOM-order assertion.

**From Story 1.3**
- `createApp()` accepts optional `{ prismaClient }` for dependency injection, enabling both mock and real database testing.
- The `onClose` hook conditionally disconnects the managed or injected Prisma client (reference counting for managed clients).
- Error handling was hardened: body parsing errors return 400, not 500.

**From Story 1.2**
- `PrismaClient` requires the `@prisma/adapter-pg` (`PrismaPg`) adapter for construction.
- Import paths for the generated Prisma client must use `../../generated/prisma/client.js` with explicit `.js` extension.
- The existing integration test uses `$executeRawUnsafe` to apply migration SQL directly, avoiding `prisma migrate` CLI complexity in test setup.

### Requirements Coverage

- **FR-9:** "Users can refresh or reopen the app and still see previously saved todo state with no data loss." — Verified through API-level integration tests (AC 1-3) and manual UI check (AC 4).
- **NFR-5:** "Across 100 consecutive refresh/reopen cycles in staging, todo state persists with 0 data-loss incidents." — The integration tests verify the fundamental persistence guarantee. Automated 100-cycle soak testing is deferred to the E2E baseline (Story 3.4).
- **SC-2:** "In 100 consecutive refresh/reopen checks, created and updated todos are preserved with 0 data-loss incidents." — Same deferral as NFR-5; the foundation is proven here.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story-1.5-Verify-Persistence-Across-Refresh-and-Reopen]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Testing-Strategy-Decisions]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Infrastructure-Deployment]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Architectural-Boundaries]
- [Source: `Product Requirement Document (PRD) for the Todo App.md`#FR-9]
- [Source: `Product Requirement Document (PRD) for the Todo App.md`#NFR-5]
- [Source: `_bmad-output/implementation-artifacts/1-4-build-todo-list-ui-and-core-interactions.md`]
- [Source: `_bmad-output/implementation-artifacts/1-3-expose-todo-crud-api-endpoints.md`]
- [Source: `apps/backend/src/test/integration/todo.repository.integration.test.ts`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Story selected automatically from sprint backlog order: `1-5-verify-persistence-across-refresh-and-reopen`.
- Epic 1 already in-progress; no epic status transition required.
- Context sources loaded: sprint status, epics, architecture, PRD, Story 1.4, Story 1.3, Story 1.2, existing integration tests, docker-compose.yml, README, recent commit history.
- Playwright/E2E setup explicitly deferred to Story 3.4; this story focuses on backend integration tests and manual verification.

### Completion Notes List

- API-level persistence integration test designed to exercise the full Fastify app lifecycle (create → close → reopen → verify).
- Existing repository integration test preserved and complemented, not replaced.
- Manual full-stack verification procedure scoped to document in README.
- NFR-5/SC-2 100-cycle soak testing acknowledged but deferred to E2E baseline story.
- 3 API integration tests implemented: create persistence, completion state persistence, deletion persistence.
- All tests gated on `DATABASE_URL_TEST` — `npm run test` remains fast and infrastructure-free.
- `test:integration` script updated with `DATABASE_URL_TEST` fallback for convenience.
- README updated with manual persistence verification checklist and integration test instructions.
- All workspace checks pass: `npm run test` (27/27), `npm run lint`, `npm run build`.

### File List

- `apps/backend/src/test/integration/todo.api.integration.test.ts` (new)
- `apps/backend/package.json` (modified — updated `test:integration` script)
- `README.md` (modified — added persistence verification section)
- `_bmad-output/implementation-artifacts/1-5-verify-persistence-across-refresh-and-reopen.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- 2026-03-20: Created Story 1.5 with implementation-ready context for persistence verification through backend integration tests and manual UI check.
- 2026-03-20: Implemented 3 API-level integration tests, updated `test:integration` script, and added manual verification docs to README. All workspace checks pass.
