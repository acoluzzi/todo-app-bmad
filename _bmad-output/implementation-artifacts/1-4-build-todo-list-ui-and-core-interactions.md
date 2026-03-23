# Story 1.4: Build Todo List UI and Core Interactions

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to create, view, complete, and delete todos in the frontend,
so that I can manage my tasks end to end.

## Acceptance Criteria

1. **Given** the frontend is connected to the backend API  
   **When** the page loads  
   **Then** it requests `GET /api/v1/todos` and renders the returned todos in UI order matching the API response.

2. **Given** a user enters a valid todo description and submits the form  
   **When** the backend returns success from `POST /api/v1/todos`  
   **Then** the new todo appears in the rendered list without a full page reload.

3. **Given** a user marks a todo complete or active  
   **When** the backend returns success from `PATCH /api/v1/todos/:id`  
   **Then** the completion state updates in the list and the UI reflects the changed state.

4. **Given** a user deletes a todo  
   **When** the backend returns success from `DELETE /api/v1/todos/:id`  
   **Then** the todo is removed from the rendered list without a full page reload.

5. **Given** todos are rendered in the frontend  
   **When** the user views the list  
   **Then** each row shows the todo description, completion state, and creation timestamp in the UI.

## Tasks / Subtasks

- [x] Add frontend API boundary utilities and local Todo models (AC: 1, 2, 3, 4, 5)
  - [x] Create `apps/frontend/src/lib/env.ts` to resolve `NEXT_PUBLIC_API_BASE_URL` for browser-safe API calls.
  - [x] Create `apps/frontend/src/types/todo.ts` with a frontend-facing `Todo` type using `camelCase`.
  - [x] Create `apps/frontend/src/lib/mappers.ts` to map backend `snake_case` payloads (`id`, `description`, `is_completed`, `created_at`) into frontend `camelCase` models.
  - [x] Create `apps/frontend/src/lib/api-client.ts` with typed functions for `listTodos`, `createTodo`, `setTodoCompleted`, and `deleteTodo`.
  - [x] Keep all HTTP contract details (`snake_case`, status code handling, envelopes) inside the API layer, not in React components.

- [x] Replace the starter page with a Todo app shell connected to the backend (AC: 1, 5)
  - [x] Remove the starter-template content from `apps/frontend/src/app/page.tsx`.
  - [x] Render a focused Todo app entry point instead of template marketing links/assets.
  - [x] Load todos on initial render using the API client.
  - [x] Render the list from fetched state and show each item's description, completion indicator, and created timestamp.

- [x] Build Todo UI components for core happy-path interactions (AC: 2, 3, 4, 5)
  - [x] Add a create form component with a controlled input and submit action.
  - [x] Add a todo list component and a todo item component (or equivalent split) under `apps/frontend/src/components/todo/`.
  - [x] Add a completion toggle control that calls the PATCH endpoint with `is_completed`.
  - [x] Add a delete action that calls the DELETE endpoint.
  - [x] Format the timestamp for readable display in the UI while preserving the API's ISO-8601 value in state.

- [x] Manage local UI state for successful CRUD flows without overreaching into later UX stories (AC: 1, 2, 3, 4, 5)
  - [x] Use local/component-first state for todos and in-flight actions.
  - [x] Update rendered state immediately after successful create, complete, and delete responses.
  - [x] Keep mutation and loading state explicit in code (`idle|loading|success|error`) even if the visible UX remains minimal in this story.
  - [x] Do **not** implement the richer empty/loading/error/retry UX reserved for Epic 2 stories beyond whatever minimal handling is required to avoid broken rendering.

- [x] Add frontend test coverage appropriate for this story's UI behavior (AC: 1, 2, 3, 4, 5)
  - [x] If frontend unit test tooling is still missing, add the minimal Vitest/testing-library setup required for Story 1.4 only.
  - [x] Add tests for initial list rendering from API data.
  - [x] Add tests for successful create flow updating rendered state.
  - [x] Add tests for successful completion toggle updating rendered state.
  - [x] Add tests for successful delete flow removing the item from rendered state.
  - [x] Mock the API client in frontend tests; do not hit the real backend from unit/component tests.

- [x] Verify workspace checks pass after implementation (AC: all)
  - [x] `npm run test`
  - [x] `npm run lint`
  - [x] `npm run build`

## Dev Notes

### Architecture Compliance

- **Frontend stays UI-only.** Do not add backend/domain logic to `apps/frontend`; the backend service remains the single API component. [Source: `README.md`#Architecture-Guardrails]
- **Frontend/backend communication is explicit HTTP/JSON.** Use typed client calls to the backend API; do not call the database or embed server logic in UI components. [Source: `architecture.md`#API-Communication-Patterns]
- **State management is local/component-first for MVP.** Avoid introducing a global state library for this story. [Source: `architecture.md`#Frontend-Architecture, `architecture.md`#State-Management-Patterns]
- **API payloads use `snake_case`; frontend models may use `camelCase` with an explicit mapper layer.** Keep that conversion centralized in `src/lib/mappers.ts`. [Source: `architecture.md`#Data-Exchange-Formats]
- **Every async action must have explicit state in code.** Model fetch/mutation state intentionally, but keep the visible UX scope limited: Story 2.x owns richer empty/loading/error/retry experiences. [Source: `architecture.md`#Loading-State-Patterns, `epics.md`#Epic-2]
- **Do not change the backend contract in this story.** Consume the current `/api/v1/todos` API as implemented in Story 1.3.

### Current Backend Contract to Consume

- `GET /api/v1/todos` returns `{ "data": TodoRecord[] }`
- `POST /api/v1/todos` accepts `{ "description": string }` and returns `{ "data": TodoRecord }`
- `PATCH /api/v1/todos/:id` accepts `{ "is_completed": boolean }` and returns `{ "data": TodoRecord }`
- `DELETE /api/v1/todos/:id` returns `204` with no body on success
- Validation failures return `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`
- Not-found failures return `{ "error": { "code": "TODO_NOT_FOUND", "message": "..." } }`
- Backend todo payload shape is:
  - `id: string`
  - `description: string`
  - `is_completed: boolean`
  - `created_at: string` (ISO-8601 UTC)

### Existing Code to Reuse (DO NOT Recreate)

- `apps/frontend/src/app/page.tsx` is still the default Next.js starter page and should be replaced, not worked around.
- `apps/frontend/src/app/layout.tsx` already provides the app shell, fonts, and metadata.
- `apps/frontend/src/app/globals.css` already contains the Tailwind import and base tokens.
- `apps/backend/src/modules/todos/todo.route.ts` is the current API contract source of truth for endpoint shapes and status codes.
- `apps/backend/src/modules/todos/todo.repository.ts` defines the backend todo record shape that the frontend must map from.
- `README.md` already documents `NEXT_PUBLIC_API_BASE_URL` usage via `apps/frontend/.env.local`.

### Frontend Implementation Guidance

- Prefer a server `page.tsx` that renders a client Todo app component rather than marking the whole route file as a client component unless there is a clear reason.
- Keep API calls in `src/lib/api-client.ts`; React components should consume typed functions, not raw `fetch` blocks duplicated across files.
- Add a mapper layer so UI components work with `camelCase` fields like `isCompleted` and `createdAt`, while requests/responses stay aligned with the backend's `snake_case` contract.
- Use built-in browser/JavaScript formatting (`Intl.DateTimeFormat`) for timestamp display; do not add a date library for this story.
- Keep styling simple and functional. Story 1.4 is about core interactions; visual distinction polish, responsive refinement, and accessibility hardening are addressed in later stories.

### Scope Boundaries / Anti-Patterns to Avoid

- Do **not** implement LocalStorage, IndexedDB, or any frontend persistence layer. Story 1.5 verifies persistence through the backend system of record.
- Do **not** build the richer empty/loading/error/retry UX for Epic 2 in this story.
- Do **not** add Next.js API routes as a proxy layer; call the separate backend service directly.
- Do **not** hardcode `http://localhost:3001` in components. Read the frontend API base URL from a dedicated env helper.
- Do **not** mix `snake_case` payload handling into JSX components.
- Do **not** add a global store, form library, or design system dependency for this story.
- Do **not** change backend endpoints or response shapes as part of frontend UI work unless a blocker is discovered and explicitly documented.

### Project Structure Notes

Likely files to create:

```text
apps/frontend/src/components/todo/TodoApp.tsx
apps/frontend/src/components/todo/TodoForm.tsx
apps/frontend/src/components/todo/TodoList.tsx
apps/frontend/src/components/todo/TodoItem.tsx
apps/frontend/src/lib/api-client.ts
apps/frontend/src/lib/env.ts
apps/frontend/src/lib/mappers.ts
apps/frontend/src/types/todo.ts
```

Likely files to modify:

```text
apps/frontend/src/app/page.tsx
apps/frontend/src/app/globals.css
apps/frontend/package.json
```

If frontend unit test tooling is added in this story, expected additional files may include:

```text
apps/frontend/vitest.config.ts
apps/frontend/src/test/setup.ts
apps/frontend/src/components/todo/*.test.tsx
```

### Previous Story Intelligence

**From Story 1.1**
- The frontend is still the default Next.js starter scaffold, so Story 1.4 should replace placeholder content rather than layering on top of template UI.
- The repo uses npm workspaces and `npm run test`, `npm run lint`, and `npm run build` as workspace-level verification commands.
- `NEXT_PUBLIC_API_BASE_URL` is expected to be provided through frontend env configuration.

**From Story 1.3**
- The backend CRUD API already exists and is the contract this story should consume.
- Backend validation and parser errors now return proper 400-class envelopes; the frontend should treat validation failures as user-facing API errors, not infrastructure crashes.
- Delete success returns `204` with no response body; the frontend API client must handle that case explicitly.
- Whitespace-only descriptions are rejected by the backend after trim-based validation; frontend form validation should align to avoid needless failing requests.

### Testing Requirements

- Prefer frontend unit/component tests with mocked API client calls rather than backend integration in this story.
- Cover the happy-path flows for:
  - initial list load
  - successful create
  - successful completion toggle
  - successful delete
- Keep automated test scope aligned to Story 1.4. Rich empty/loading/error/retry UX assertions belong to later stories unless a minimal visible indicator is introduced here.
- Run the full workspace validation commands after implementation:
  - `npm run test`
  - `npm run lint`
  - `npm run build`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`#Story-1.4-Build-Todo-List-UI-and-Core-Interactions]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Frontend-Architecture]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#API-Communication-Patterns]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Format-Patterns]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#State-Management-Patterns]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Loading-State-Patterns]
- [Source: `_bmad-output/planning-artifacts/architecture.md`#Complete-Project-Directory-Structure]
- [Source: `Product Requirement Document (PRD) for the Todo App.md`#Functional-Requirements]
- [Source: `README.md`#Getting-Started]
- [Source: `_bmad-output/implementation-artifacts/1-3-expose-todo-crud-api-endpoints.md`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Story selected automatically from sprint backlog order: `1-4-build-todo-list-ui-and-core-interactions`.
- Epic 1 already in-progress; no epic status transition required.
- Context sources loaded: sprint status, epics, architecture, PRD, Story 1.3, current frontend scaffold, backend route contract, README, recent commit history.
- Story scope intentionally limited to frontend happy-path CRUD UI and API consumption; Epic 2 handles richer loading/error/retry UX, and Story 1.5 handles persistence verification.

### Completion Notes List

- Comprehensive frontend implementation guidance prepared for Todo CRUD UI integration.
- Backend contract and current scaffold constraints captured to reduce reinvention and accidental backend drift.
- Scope boundaries documented to prevent premature work on Epic 2, accessibility, or responsive polish stories.
- All frontend UI components implemented: `TodoApp`, `TodoForm`, `TodoList`, `TodoItem`.
- API client layer with typed functions and `snake_case`→`camelCase` mapper layer in place.
- Frontend Vitest + Testing Library setup added; 4 component tests covering initial load, create, toggle, and delete.
- `vitest.config.ts` excluded from Next.js `tsconfig.json` to resolve Vite type conflicts during `next build`.
- All workspace checks pass: `npm run test` (27/27), `npm run lint`, `npm run build`.

### File List

- `apps/frontend/src/types/todo.ts` (new)
- `apps/frontend/src/lib/env.ts` (new)
- `apps/frontend/src/lib/mappers.ts` (new)
- `apps/frontend/src/lib/api-client.ts` (new)
- `apps/frontend/src/components/todo/TodoApp.tsx` (new)
- `apps/frontend/src/components/todo/TodoForm.tsx` (new)
- `apps/frontend/src/components/todo/TodoList.tsx` (new)
- `apps/frontend/src/components/todo/TodoItem.tsx` (new)
- `apps/frontend/src/components/todo/TodoApp.test.tsx` (new)
- `apps/frontend/src/test/setup.ts` (new)
- `apps/frontend/vitest.config.ts` (new)
- `apps/frontend/src/app/page.tsx` (modified)
- `apps/frontend/src/app/globals.css` (modified)
- `apps/frontend/package.json` (modified)
- `apps/frontend/tsconfig.json` (modified)
- `_bmad-output/implementation-artifacts/1-4-build-todo-list-ui-and-core-interactions.md` (modified)

## Change Log

- 2026-03-20: Created Story 1.4 with implementation-ready context for frontend Todo CRUD UI, API integration, and scoped frontend testing.
- 2026-03-20: Implemented frontend Todo CRUD UI, API client, mapper layer, Vitest/Testing Library setup, and 4 component tests. All workspace checks pass.
