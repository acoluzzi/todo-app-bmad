# Story 1.3: Expose Todo CRUD API Endpoints

Status: done

## Story

As a user,
I want backend endpoints that support creating, listing, updating completion state, and deleting todos,
so that the frontend can perform all core task actions.

## Acceptance Criteria

1. **Given** a valid POST to `/api/v1/todos` with `{ "description": "..." }` (1–120 chars)
   **When** the request is processed
   **Then** a new todo is created and the response is `{ "data": { "id": "...", "description": "...", "is_completed": false, "created_at": "..." } }` with HTTP 201.

2. **Given** a GET to `/api/v1/todos`
   **When** the request is processed
   **Then** all todos are returned as `{ "data": [...] }` ordered by `created_at` descending, with HTTP 200.

3. **Given** a PATCH to `/api/v1/todos/:id` with `{ "is_completed": true|false }`
   **When** the todo exists
   **Then** the completion state is updated and the response is `{ "data": { ...updated_todo } }` with HTTP 200.

4. **Given** a PATCH to `/api/v1/todos/:id`
   **When** the todo does not exist
   **Then** the response is `{ "error": { "code": "TODO_NOT_FOUND", "message": "..." } }` with HTTP 404.

5. **Given** a DELETE to `/api/v1/todos/:id`
   **When** the todo exists
   **Then** the todo is deleted and the response is HTTP 204 (no body).

6. **Given** a DELETE to `/api/v1/todos/:id`
   **When** the todo does not exist
   **Then** the response is `{ "error": { "code": "TODO_NOT_FOUND", "message": "..." } }` with HTTP 404.

7. **Given** a POST with invalid input (empty description, >120 chars, missing field, wrong type)
   **When** the request is processed
   **Then** the response is `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }` with HTTP 400.

8. **Given** any CRUD endpoint is called
   **When** an unexpected server error occurs
   **Then** the global error handler returns the standardized error envelope with HTTP 500.

## Tasks / Subtasks

- [x] Add Zod validation schemas for todo API boundaries (AC: 1, 3, 7)
  - [x] Create `apps/backend/src/modules/todos/todo.schema.ts` with Zod schemas for create input (`description` string 1–120 chars) and update input (`is_completed` boolean).
  - [x] Add a Zod schema for the `:id` path parameter (UUID format).
  - [x] Export inferred TypeScript types from schemas.
- [x] Implement todo service layer (AC: 1, 2, 3, 4, 5, 6)
  - [x] Create `apps/backend/src/modules/todos/todo.service.ts`.
  - [x] Inject `TodoRepository` via constructor.
  - [x] Implement `create(input)` — delegates to repository `create`.
  - [x] Implement `list()` — delegates to repository `list`.
  - [x] Implement `setCompleted(id, isCompleted)` — delegates to repository `setCompleted`, throws domain error if `null` returned (not found).
  - [x] Implement `delete(id)` — delegates to repository `delete`, throws domain error if `false` returned (not found).
- [x] Implement todo route handler (AC: 1, 2, 3, 4, 5, 6, 7, 8)
  - [x] Create `apps/backend/src/modules/todos/todo.route.ts` as a Fastify plugin.
  - [x] `POST /todos` — parse+validate body with Zod, call service `create`, return `{ "data": ... }` with 201.
  - [x] `GET /todos` — call service `list`, return `{ "data": [...] }` with 200.
  - [x] `PATCH /todos/:id` — validate params+body with Zod, call service `setCompleted`, return `{ "data": ... }` with 200 or error envelope with 404.
  - [x] `DELETE /todos/:id` — validate params with Zod, call service `delete`, return 204 or error envelope with 404.
  - [x] Wire Zod validation errors into `{ "error": { "code": "VALIDATION_ERROR", ... } }` with 400.
  - [x] Catch domain "not found" errors and return `{ "error": { "code": "TODO_NOT_FOUND", ... } }` with 404.
- [x] Register todo routes in app factory (AC: 1, 2, 3, 5, 8)
  - [x] Import and register `createTodoRoutes` in `apps/backend/src/app.ts` under prefix `/api/v1`.
  - [x] Wire `getPrismaClient()` into the repository → service → route chain during registration.
- [x] Add comprehensive route-level unit tests (AC: 1–8)
  - [x] Create `apps/backend/src/test/unit/todo.route.test.ts`.
  - [x] Test POST happy path (valid description, 201, correct response shape).
  - [x] Test POST validation errors (empty, >120, missing, wrong type → 400 with `VALIDATION_ERROR`).
  - [x] Test GET list returns `{ "data": [...] }` with 200.
  - [x] Test PATCH happy path (existing id, 200, updated `is_completed`).
  - [x] Test PATCH not-found (unknown id → 404 with `TODO_NOT_FOUND`).
  - [x] Test PATCH validation errors (non-boolean `is_completed`, invalid UUID).
  - [x] Test DELETE happy path (existing id → 204, no body).
  - [x] Test DELETE not-found (unknown id → 404 with `TODO_NOT_FOUND`).
  - [x] Test unexpected error returns 500 via global error handler.
- [x] Verify full workspace checks pass (AC: all)
  - [x] `npm run test`
  - [x] `npm run lint`
  - [x] `npm run build`

## Dev Notes

### Architecture Compliance

- **Backend layering is `route → service → repository`** — routes must not call repository directly. Service enforces domain rules; repository is the sole DB access layer. [Source: `architecture.md`#Service-Boundaries]
- **API response format:**
  - Success reads: `{ "data": ... }`
  - Success mutations: `{ "data": ..., "meta": { "request_id": "..." } }` — `meta.request_id` is optional for MVP but the envelope shape must be followed.
  - Errors: `{ "error": { "code": "TODO_NOT_FOUND", "message": "...", "details": {} } }` [Source: `architecture.md`#Format-Patterns]
- **Payload field casing:** API payloads use `snake_case` (e.g., `is_completed`, `created_at`). The repository already returns `TodoRecord` in `snake_case`. [Source: `architecture.md`#Data-Exchange-Formats]
- **Route file naming:** `todo.route.ts`, `todo.service.ts`, `todo.schema.ts` under `apps/backend/src/modules/todos/`. [Source: `architecture.md`#Pattern-Examples]
- **Validation at BE boundary:** Use Zod for all request validation. Do NOT validate inside the repository or service layer — schema validation happens at the route boundary only. [Source: `architecture.md`#API-Boundaries]
- **UUID format for `:id` params:** The `Todo.id` field is a UUID (`@db.Uuid` in Prisma schema). Validate incoming `:id` params as UUID strings in Zod schemas.
- **Error handling pattern:** Create a lightweight domain error class (e.g., `TodoNotFoundError`) that the service throws and the route catches. Do NOT use generic string matching. The global `errorHandler` in `middleware/error-handler.ts` handles unexpected errors (500).

### Existing Code to Reuse (DO NOT Recreate)

- **`TodoRepository`** at `apps/backend/src/modules/todos/todo.repository.ts` — already implements `create`, `list`, `setCompleted`, `delete`. Its return types (`TodoRecord`, `CreateTodoInput`) are already `snake_case`-compatible.
- **`getPrismaClient()`** at `apps/backend/src/config/prisma.ts` — singleton Prisma client with lifecycle management.
- **`errorHandler`** at `apps/backend/src/middleware/error-handler.ts` — global 500 handler already registered in `app.ts`.
- **`createApp()`** at `apps/backend/src/app.ts` — Fastify factory with health route registration pattern (use same `app.register(registerTodoRoutes, { prefix: "/api/v1" })` pattern).
- **Health route** at `apps/backend/src/modules/health.route.ts` — reference implementation for the Fastify plugin pattern used in this project.
- **Health test** at `apps/backend/src/test/unit/health.test.ts` — reference for `app.inject()` testing pattern.

### Anti-Patterns to Avoid

- Do NOT place validation logic inside the service or repository — Zod schemas validate at route boundary only.
- Do NOT create a new Prisma client per request — use `getPrismaClient()`.
- Do NOT use `camelCase` in API response payloads — `TodoRecord` from repository is already `snake_case`.
- Do NOT return raw Prisma/DB error details to clients — let the global error handler sanitize unexpected errors.
- Do NOT import from `@prisma/client` directly — import from `../../generated/prisma/client.js`.
- Do NOT add `pg` or `@types/pg` dependencies — `@prisma/adapter-pg` handles PostgreSQL connections internally.
- Do NOT skip `.js` extensions in relative imports — required for ESM resolution (`"type": "module"` in backend `package.json`).

### Project Structure Notes

Files to create:
```
apps/backend/src/modules/todos/todo.schema.ts
apps/backend/src/modules/todos/todo.service.ts
apps/backend/src/modules/todos/todo.route.ts
apps/backend/src/test/unit/todo.route.test.ts
```

Files to modify:
```
apps/backend/src/app.ts              (register todo routes)
```

### Previous Story Intelligence

**From Story 1.1:**
- Fastify plugin registration uses `app.register(handler, { prefix: "/api/v1" })` pattern.
- Tests use `app.inject()` for route testing — no HTTP server startup needed.
- Vitest config includes `src/test/**/*.test.ts` glob.
- Backend is ESM (`"type": "module"`) — all relative imports need `.js` extension.
- `dotenv` is loaded in `config/env.ts` with fallback path resolution.

**From Story 1.2:**
- Prisma 7 requires `prisma.config.ts` at backend root — do not add `url` to `schema.prisma` `datasource`.
- `PrismaClient` is constructed with `PrismaPg` adapter — do not use default constructor.
- Generated Prisma client lives at `apps/backend/src/generated/prisma/` — import from `../../generated/prisma/client.js`.
- Repository returns `TodoRecord` objects (already `snake_case`) — routes can pass through directly.
- `isNotFoundError()` helper exists in repository; the service layer should rely on repository return values (`null`/`false`) rather than catching errors directly.
- `Prisma.PrismaClientKnownRequestError` is available for error type narrowing.
- Review hardening: repository rethrows non-P2025 errors; service should NOT swallow unexpected errors either.

### Testing Requirements

- Use Vitest with `app.inject()` for route-level tests (follow `health.test.ts` pattern).
- **Mock the service layer** in route tests to isolate HTTP/validation concerns from DB logic. Use `vi.mock()` or manual dependency injection.
- Test matrix:
  - POST: valid input → 201, empty → 400, >120 chars → 400, missing field → 400, wrong type → 400.
  - GET: list → 200 with data array.
  - PATCH: valid → 200, not-found → 404, invalid body → 400, invalid UUID → 400.
  - DELETE: valid → 204, not-found → 404, invalid UUID → 400.
  - Unexpected error → 500 via global handler.
- Run `npm run test`, `npm run lint`, `npm run build` after implementation.

### Zod Dependency Note

- Zod is listed in the architecture as the validation library but is NOT yet installed. The dev agent must add `zod` to backend `dependencies` in `apps/backend/package.json` and run `npm install`.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story-1.3-Expose-Todo-CRUD-API-Endpoints]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#API-Communication-Patterns]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Format-Patterns]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Service-Boundaries]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Naming-Patterns]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Pattern-Examples]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Authentication-Security]
- [Source: `Product Requirement Document (PRD) for the Todo App.md`#Functional-Requirements]
- [Source: `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-starter-template.md`]
- [Source: `_bmad-output/implementation-artifacts/1-2-implement-todo-data-model-and-persistence-layer.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-high-thinking

### Debug Log References

- Story selected automatically from sprint backlog: `1-3-expose-todo-crud-api-endpoints` (first `ready-for-dev`).
- Epic 1 already in-progress; no epic status transition required.
- Zod 4.3.6 already installed in backend workspace; no additional dependency install needed.
- Refactored `createApp()` to accept optional `AppOptions` with `prismaClient` override for test isolation.
- Updated existing health test to pass mock PrismaClient to avoid DATABASE_URL requirement in unit tests.
- Route handler uses factory pattern: `createTodoRoutes(service)` accepts a `TodoService` for clean dependency injection.
- Dependency chain built in `app.ts`: `getPrismaClient() → TodoRepository → TodoService → createTodoRoutes`.
- All 21 unit tests pass, lint clean, build successful (both backend TypeScript and frontend Next.js).

### Completion Notes List

- Created `todo.schema.ts` with Zod validation schemas for create (description 1–120 chars), update (is_completed boolean), and id param (UUID).
- Created `todo.service.ts` with `TodoService` class that delegates to `TodoRepository` and throws `TodoNotFoundError` domain error.
- Created `todo.route.ts` with `createTodoRoutes` factory accepting a `TodoService`; implements POST/GET/PATCH/DELETE with standardized response envelopes.
- Updated `app.ts` to build repository → service → route dependency chain with optional PrismaClient override for testing.
- Updated `health.test.ts` to pass mock PrismaClient since `createApp()` now wires Prisma at construction time.
- Created comprehensive `todo.route.test.ts` with 15 test cases covering all CRUD operations, validation errors, not-found errors, and unexpected error handling.

### File List

- `_bmad-output/implementation-artifacts/1-3-expose-todo-crud-api-endpoints.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/backend/src/modules/todos/todo.schema.ts`
- `apps/backend/src/modules/todos/todo.service.ts`
- `apps/backend/src/modules/todos/todo.route.ts`
- `apps/backend/src/app.ts`
- `apps/backend/src/test/unit/todo.route.test.ts`
- `apps/backend/src/test/unit/health.test.ts`

## Change Log

- 2026-03-20: Implemented Story 1.3 — exposed Todo CRUD API endpoints (POST/GET/PATCH/DELETE) with Zod validation, service layer, domain error handling, and 15 route-level unit tests.
