# Story 2.3: Add Retry-Safe Error Recovery for Mutations

Status: done

## Story

As a user,
I want to retry failed actions without reloading the page,
so that temporary failures do not block my workflow.

## Acceptance Criteria

1. **Given** the initial list fetch fails
   **When** the user sees the error state
   **Then** a "Try again" button is available that re-triggers the fetch without a page reload.

2. **Given** a mutation (create, toggle, delete) fails
   **When** the error message is displayed
   **Then** the user can dismiss the error banner and retry the action using the existing controls (which remain enabled after error).

3. **Given** the error banner is visible
   **When** the user clicks the dismiss button
   **Then** the error message is cleared from the UI.

4. **Given** any failed operation
   **When** the user retries (via retry button or repeating the action)
   **Then** the retry uses the current screen state — no stale data, no page reload required.

5. **Given** a retry of the list fetch succeeds
   **When** the data loads
   **Then** the error state is replaced with the loaded todo list.

## Tasks / Subtasks

- [x] Add retry button for list fetch failure (AC: 1, 4, 5)
  - [x] Extract the fetch logic from useEffect into a reusable `fetchTodos` function accessible from the render scope.
  - [x] Add a "Try again" button to the list-area error panel in `TodoApp`.
  - [x] Wire the button to call `fetchTodos`, which resets `listStatus` to "loading" and re-fetches.

- [x] Add dismissible error banner (AC: 2, 3)
  - [x] Add a dismiss/close button to the global error banner in `TodoApp`.
  - [x] Wire the button to `setErrorMessage(null)`.

- [x] Add unit tests (AC: all)
  - [x] Test: retry button appears in list fetch error state.
  - [x] Test: clicking retry re-triggers fetch and shows loading skeleton.
  - [x] Test: successful retry replaces error with todo list.
  - [x] Test: dismiss button clears the error banner.
  - [x] Verify existing tests still pass.

- [x] Verify workspace checks (AC: all)
  - [x] `npm run test` passes.
  - [x] `npm run lint` passes.
  - [x] `npm run build` passes.

## Dev Notes

### Existing Code

- `TodoApp.tsx`: `loadTodos` is currently defined inside `useEffect`. Extract to component scope using `useCallback` so the retry button can call it.
- Error banner already has `role="alert"` and `aria-live="assertive"`.
- Mutation retry is implicit: after failure, controls re-enable (toggle/delete buttons, create form) so the user can simply click again.

### Scope Boundaries

- Do NOT change the API client or backend.
- Do NOT add automatic retry (exponential backoff etc.) — this is manual user-initiated retry only.
- Do NOT change optimistic update logic (Story 2.2).

## Dev Agent Record

### Completion Notes List

- Extracted `fetchTodos` from the `useEffect` into a standalone async function so both the mount effect and the "Try again" button can call it.
- Added "Try again" button to the list-area error panel for retrying failed initial fetch.
- Added "Dismiss" button to the global error banner for clearing mutation error messages.
- Updated existing test for error state to reflect new copy text and retry button.
- Added 3 new tests: retry fetch, loading skeleton during retry, and dismiss error banner.
- All 13 frontend tests pass. Lint and build clean.

### File List

- `apps/frontend/src/components/todo/TodoApp.tsx` — retry + dismiss buttons, extracted `fetchTodos`
- `apps/frontend/src/components/todo/TodoApp.test.tsx` — 3 new tests, 1 updated test

## Change Log

- 2026-03-20: Created Story 2.3 for retry-safe error recovery.
