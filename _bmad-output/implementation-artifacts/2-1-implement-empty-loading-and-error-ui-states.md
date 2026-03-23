# Story 2.1: Implement Empty, Loading, and Error UI States

Status: done

## Story

As a user,
I want clear UI feedback while data loads or fails,
so that I always understand the current app state.

## Acceptance Criteria

1. **Given** the todo list is empty (zero todos exist)
   **When** the list view renders after a successful fetch
   **Then** an explicit empty-state message is displayed (not a blank area) with guidance on how to add a todo.

2. **Given** the initial todo fetch is in progress
   **When** the list view renders before the response arrives
   **Then** a scoped loading indicator is shown in the list area (not a full-page blocker).

3. **Given** the initial todo fetch fails
   **When** the error is received
   **Then** an error message is displayed in the list area explaining the failure, and the user can see a retry option (retry itself is Story 2.3; for now, display the message with a manual reload hint).

4. **Given** a mutation (create, toggle, delete) is in progress
   **When** the user triggers the action
   **Then** the affected element shows a scoped loading indicator (button text change, spinner, or opacity reduction) and the control is disabled until the operation completes.

5. **Given** a mutation fails
   **When** the error is received
   **Then** a user-visible error message appears near the top of the list section and the UI remains in a usable state (no frozen controls, affected item reverts to pre-mutation state).

6. **Given** any async UI state (list fetch or mutation)
   **When** transitioning between idle → loading → success/error
   **Then** every transition produces a visible change — there are no silent failures or invisible loading states.

7. **Given** all state-feedback UI elements
   **When** rendered
   **Then** they use semantic HTML and ARIA attributes suitable for screen readers (e.g., `role="alert"` for error messages, `aria-busy` on loading regions, `aria-live` for dynamic content).

## Tasks / Subtasks

- [x] Add empty-state UI to `TodoList` (AC: 1)
  - [x] When `todos.length === 0` and list fetch succeeded, render an empty-state panel with a message like "No todos yet — add one above!" inside the `<ul>` region.
  - [x] Style consistently with the existing card design (rounded border, muted text, centered content).
  - [x] Add `role="status"` to the empty-state container.

- [x] Enhance loading state for initial fetch (AC: 2, 6)
  - [x] Replace the plain text "Loading todos..." in `TodoApp` with a styled loading skeleton or spinner component scoped to the list area.
  - [x] Add `aria-busy="true"` to the list container while loading, `aria-busy="false"` when done.
  - [x] Ensure the loading indicator is visually distinct and occupies the same space the list will.

- [x] Enhance error state for initial fetch (AC: 3, 6, 7)
  - [x] When `listStatus === "error"`, render a styled error panel in the list area with the error message and a hint to reload.
  - [x] Use `role="alert"` on the error container so screen readers announce the error.
  - [x] Style with the existing red border/bg pattern from the current error banner.

- [x] Enhance mutation loading indicators (AC: 4, 6)
  - [x] `TodoItem`: when `isMutating` is true, reduce item opacity and disable buttons.
  - [x] `TodoForm`: the button already shows "Adding..." — verified it also disables the input field.
  - [x] Add `aria-busy="true"` to the `<li>` element of a mutating item.

- [x] Enhance mutation error display (AC: 5, 6, 7)
  - [x] The global `errorMessage` banner in `TodoApp` now has `role="alert"` and `aria-live="assertive"`.
  - [x] Verified that after a mutation error, the affected item's buttons re-enable (status `"error"` does not block `isMutating`).
  - [x] Verified that a failed toggle does NOT flip the todo's local state (only updates on success).

- [x] Add accessibility attributes across state-feedback elements (AC: 7)
  - [x] Add `aria-live="polite"` to the todo list container so additions/removals are announced.
  - [x] Add `role="alert"` to all error message containers (`TodoApp` banner and `TodoForm` inline error).
  - [x] Add `aria-busy` to the list section during initial load.

- [x] Update and add unit tests (AC: all)
  - [x] Test: empty state renders when `listTodos` returns `[]`.
  - [x] Test: loading indicator renders before fetch resolves.
  - [x] Test: error state renders when `listTodos` rejects.
  - [x] Test: mutation loading indicator appears on toggle/delete.
  - [x] Test: error message appears when a mutation fails and item remains in pre-mutation state.
  - [x] Verify existing tests still pass after UI changes.

- [x] Verify workspace checks (AC: all)
  - [x] `npm run test` passes (all unit tests).
  - [x] `npm run lint` passes.
  - [x] `npm run build` passes.

## Dev Notes

### Architecture Patterns (MUST Follow)

- **State model:** Async operations are modeled as `idle | loading | success | error`. This is already implemented in `TodoApp.tsx` via `AsyncStatus` type. Do NOT change the state model — enhance the rendering of each state. [Source: `architecture.md`#State-Management-Patterns]
- **Loading indicators scoped to affected area:** Do not use full-page spinners or overlays. Loading feedback must be scoped to the list region or the individual item being mutated. [Source: `architecture.md`#Loading-State-Patterns]
- **No silent failures:** Every error must produce a visible change in the UI. Errors must be represented in UI state. [Source: `architecture.md`#Loading-State-Patterns]
- **FE shows actionable user messages:** Error messages should be human-readable, not raw error codes. The existing `getErrorMessage` helper in `TodoApp.tsx` already handles this. [Source: `architecture.md`#Error-Handling-Patterns]
- **WCAG 2.1 AA:** Accessibility is a systemic requirement. State-feedback elements must use semantic HTML and ARIA attributes. [Source: `architecture.md`#Frontend-Architecture]
- **Component-first state for MVP:** Do not introduce a global state store. All state lives in `TodoApp` and flows down via props. [Source: `architecture.md`#State-Management-Patterns]

### Existing Code to Modify (DO NOT Recreate)

| File | What exists | What to change |
|------|------------|----------------|
| `apps/frontend/src/components/todo/TodoApp.tsx` | Full CRUD state management with `AsyncStatus` for list, create, and per-item mutations. Renders a plain "Loading todos..." text and a global error banner. | Add ARIA attributes to containers. Replace plain loading text with styled skeleton/spinner. Render empty state when `listStatus === "success"` and `todos.length === 0`. Enhance error banner with `role="alert"`. |
| `apps/frontend/src/components/todo/TodoList.tsx` | Renders `<ul>` of `TodoItem` components. No empty-state handling. | Add empty-state rendering when `todos` array is empty. Add `aria-live="polite"` to `<ul>`. Accept and forward `listStatus` or `isEmpty` prop for conditional rendering. |
| `apps/frontend/src/components/todo/TodoItem.tsx` | Renders a single todo with toggle/delete buttons. Accepts `isMutating` prop that disables buttons. | Enhance `isMutating` visual feedback (opacity, text change). Add `aria-busy` to `<li>` when mutating. |
| `apps/frontend/src/components/todo/TodoForm.tsx` | Input + submit button. Button shows "Adding..." when submitting. Has local validation error display. | Add `role="alert"` to the inline error `<p>`. Verify input is disabled during submission (already implemented). |
| `apps/frontend/src/components/todo/TodoApp.test.tsx` | 4 tests: initial load, create, toggle, delete. All mock `api-client` functions. | Add 5+ new tests for empty state, loading state, error state (fetch), mutation loading, mutation error. Update existing tests if component output changes. |
| `apps/frontend/src/test/setup.ts` | Imports `@testing-library/jest-dom/vitest`, runs `cleanup` in `afterEach`. | No changes expected. |
| `apps/frontend/vitest.config.ts` | Vitest + React plugin + jsdom environment. | No changes expected. |

### Scope Boundaries / Anti-Patterns to Avoid

- **Do NOT implement retry buttons or retry logic.** That is Story 2.3. For now, error states show a message + a "try refreshing the page" hint.
- **Do NOT add optimistic updates.** That is Story 2.2. Mutations should still wait for server response before updating local state.
- **Do NOT create new component files for loading/error states** unless the component is genuinely reusable. Prefer inline JSX within the existing component tree (`TodoApp`, `TodoList`, `TodoItem`).
- **Do NOT introduce a loading spinner library.** Use a simple CSS animation or Tailwind `animate-pulse` / `animate-spin` utilities.
- **Do NOT change the API client or backend.** This story is frontend-only.
- **Do NOT change the `AsyncStatus` type or state management pattern.** Enhance what is rendered for each status, not how status is tracked.

### Previous Epic Intelligence (Epic 1 Patterns)

- **Testing pattern:** Tests mock `@/lib/api-client` using `vi.mock()` with `vi.importActual()` to preserve types. Follow this exact pattern.
- **Rendering assertion pattern:** Use `screen.findByText()` for async-loaded content, `screen.getByText()` for synchronous content, `screen.queryByText()` for asserting absence.
- **Test cleanup:** `@testing-library/react`'s `cleanup` runs in `afterEach` via `setup.ts` — no manual cleanup needed.
- **Component design:** Components use Tailwind CSS classes. Match existing border-radius (`rounded-xl`, `rounded-2xl`), color palette (`slate-*`, `red-*`, `emerald-*`), and spacing conventions.
- **Build check:** `vitest.config.ts` is excluded from `tsconfig.json` to avoid Vite type conflicts during `next build`.

### References

- [Source: `architecture.md`#State-Management-Patterns] — `idle|loading|success|error`, local state first
- [Source: `architecture.md`#Loading-State-Patterns] — scoped indicators, no silent failures
- [Source: `architecture.md`#Error-Handling-Patterns] — actionable user messages, retry option
- [Source: `architecture.md`#Frontend-Architecture] — WCAG 2.1 AA, component-first state
- [Source: `architecture.md`#Cross-Cutting-Concerns] — error/retry consistency, accessibility systemic
- [Source: `epics.md`#Story-2.1] — FR10 coverage, acceptance criteria
- [Source: `epics.md`#Story-2.3] — retry logic is separate story (scope boundary)
- [Source: `implementation-readiness-report`#FR10] — "explicit empty, loading, and error UI states for list and mutation flows"

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Story selected from sprint backlog: first backlog story in Epic 2 is `2-1-implement-empty-loading-and-error-ui-states`.
- Epic 2 status transitioned from `backlog` to `in-progress`.
- No PRD or UX specification files exist — all requirements derived from `epics.md`, `architecture.md`, and `implementation-readiness-report`.
- Previous story (1.5) was last in Epic 1; cross-epic intelligence extracted from Story 1.4 (frontend UI) and 1.5 (persistence verification).
- This story is frontend-only; no backend changes expected.

### Completion Notes List

- Empty state: `TodoList` renders a dashed-border panel with `role="status"` when todos array is empty, showing "No todos yet" with guidance text.
- Loading skeleton: Replaced plain "Loading todos..." text with 3 `animate-pulse` skeleton cards that mimic the shape of real todo items, wrapped in `aria-busy="true"` container.
- Fetch error panel: `TodoApp` renders a centered error panel with `role="alert"` when `listStatus === "error"`, showing "Failed to load todos" + refresh hint. The global error banner above shows the specific error message.
- Mutation loading: `TodoItem` reduces opacity to 60% and sets `aria-busy="true"` on the `<li>` when `isMutating`. Buttons remain disabled via existing `disabled` prop.
- Mutation error: Global error banner in `TodoApp` now has `role="alert"` and `aria-live="assertive"`. Verified buttons re-enable after mutation error (status `"error"` is not included in `pendingTodoIds` filter). Verified failed toggle does not flip local state.
- Accessibility: `aria-live="polite"` on `<ul>`, `role="alert"` on all error containers (`TodoApp` banner, `TodoForm` inline error, fetch error panel), `aria-busy` on loading skeleton and mutating items.
- 5 new tests added (9 total): empty state, loading skeleton with aria-busy, fetch error state, mutation loading with aria-busy, mutation error with item state preservation.
- All workspace checks pass: `npm run test` (32 tests: 23 backend + 9 frontend), `npm run lint`, `npm run build`.
- Code review applied 3 patches: P1 (create-after-error visibility — `setListStatus("success")` on create), P2 (initial idle frame — initialize to `"loading"`), P3 (dual alert — list error panel changed to `role="status"`).

### File List

- `apps/frontend/src/components/todo/TodoApp.tsx` (modified — loading skeleton, error panel, ARIA attributes on error banner)
- `apps/frontend/src/components/todo/TodoList.tsx` (modified — empty-state panel, `aria-live="polite"` on list)
- `apps/frontend/src/components/todo/TodoItem.tsx` (modified — `aria-busy`, opacity reduction when mutating)
- `apps/frontend/src/components/todo/TodoForm.tsx` (modified — `role="alert"` on inline error)
- `apps/frontend/src/components/todo/TodoApp.test.tsx` (modified — 5 new tests for state feedback)
- `_bmad-output/implementation-artifacts/2-1-implement-empty-loading-and-error-ui-states.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- 2026-03-20: Created Story 2.1 with implementation-ready context for empty, loading, and error UI state enhancements across frontend components.
- 2026-03-20: Implemented empty/loading/error UI states across TodoApp, TodoList, TodoItem, and TodoForm. Added ARIA attributes for WCAG 2.1 AA. Added 5 new unit tests. All workspace checks pass.
- 2026-03-20: Applied code review fixes: create-after-error visibility, initial loading state, dual alert reduction. All checks pass.
