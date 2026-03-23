# Story 2.2: Add Fast Update and Visual Completion Feedback

Status: done

## Story

As a user,
I want operation results and completion styling to appear quickly and clearly,
so that task status changes are obvious and immediate.

## Acceptance Criteria

1. **Given** a successful toggle operation
   **When** the user clicks "Mark complete" or "Mark active"
   **Then** the todo's completion state flips immediately in the UI (optimistic update) before the server responds, and reconciles with the server response on success.

2. **Given** a failed toggle operation
   **When** the server returns an error after an optimistic toggle
   **Then** the todo reverts to its pre-toggle state and an error message is shown.

3. **Given** a successful delete operation
   **When** the user clicks "Delete"
   **Then** the todo is removed from the list immediately (optimistic delete) before the server responds.

4. **Given** a failed delete operation
   **When** the server returns an error after an optimistic delete
   **Then** the todo reappears in its original position in the list and an error message is shown.

5. **Given** completed and active todos in the list
   **When** the user views the list
   **Then** completed items are clearly distinguishable using text styling (line-through, muted color) and a completion indicator (colored dot) per FR6.

6. **Given** any add/complete/delete operation
   **When** the frontend receives confirmation from the server
   **Then** the visible list reflects the result within 300ms of the response (FR7).

## Tasks / Subtasks

- [x] Implement optimistic toggle in `TodoApp.handleToggleCompleted` (AC: 1, 2, 6)
  - [x] Immediately flip `isCompleted` in local `todos` state before the API call resolves.
  - [x] On success, reconcile with the server response (replace optimistic state with actual).
  - [x] On error, revert to pre-toggle state and show error message.
  - [x] Keep `isMutating` indicator during the API call (existing behavior).

- [x] Implement optimistic delete in `TodoApp.handleDelete` (AC: 3, 4, 6)
  - [x] Immediately remove the todo from local `todos` state before the API call resolves.
  - [x] On error, restore the todo to its original position and show error message.
  - [x] Keep `isMutating` indicator during the API call (existing behavior).

- [x] Verify FR6 completion styling (AC: 5)
  - [x] Confirm `TodoItem` has: line-through text, muted color, colored dot (emerald vs slate), "Completed"/"Active" label.
  - [x] No changes needed — existing styling from Story 1.4 satisfies FR6.

- [x] Update and add unit tests (AC: all)
  - [x] Test: optimistic toggle shows immediate UI change before API resolves.
  - [x] Test: optimistic toggle reverts on API failure.
  - [x] Test: optimistic delete removes item immediately before API resolves.
  - [x] Test: optimistic delete restores item on API failure.
  - [x] Update existing toggle/delete tests to match optimistic behavior.
  - [x] Verify existing tests still pass.

- [x] Verify workspace checks (AC: all)
  - [x] `npm run test` passes.
  - [x] `npm run lint` passes.
  - [x] `npm run build` passes.

## Dev Notes

### Architecture Patterns

- **FE handles optimistic UI:** Architecture explicitly states "FE handles rendering, interaction state, and optimistic UI". [Source: `architecture.md`#Component-Boundaries]
- **State management:** Local/component-first state. `TodoApp` owns all state and passes down via props. [Source: `architecture.md`#State-Management-Patterns]
- **Latency budget:** "update propagation to keep interaction latency low" and p95 ≤ 500ms. [Source: `architecture.md`#Cross-Cutting-Concerns]

### Existing Code to Modify

| File | What to change |
|------|---------------|
| `apps/frontend/src/components/todo/TodoApp.tsx` | `handleToggleCompleted`: flip state optimistically before API call, revert on error. `handleDelete`: remove from list optimistically, restore on error. |
| `apps/frontend/src/components/todo/TodoApp.test.tsx` | Update toggle/delete tests for optimistic behavior. Add rollback tests. |
| `apps/frontend/src/components/todo/TodoItem.tsx` | No changes expected — FR6 styling already present. |

### Scope Boundaries

- Do NOT change the API client or backend.
- Do NOT add optimistic create — creates need a server-generated ID, so they remain wait-for-response.
- Do NOT add retry logic (Story 2.3).
- Optimistic updates apply to toggle and delete only.

### References

- [Source: `architecture.md`#Component-Boundaries] — "FE handles rendering, interaction state, and optimistic UI"
- [Source: `epics.md`#Story-2.2] — FR6, FR7, NFR2 coverage
- [Source: FR6] — "distinguish completed tasks from active tasks using both text styling and a completion indicator"
- [Source: FR7] — "results reflected in the list within 300 ms after successful operation response"

## Dev Agent Record

### Completion Notes List

- Optimistic toggle: `handleToggleCompleted` captures `previousTodos` snapshot, immediately flips `isCompleted` in local state, then reconciles with server response on success or reverts on error.
- Optimistic delete: `handleDelete` captures `previousTodos` snapshot, immediately removes item from list, restores on error.
- Create is NOT optimistic (needs server-generated ID) — unchanged.
- FR6 completion styling verified: line-through text, muted color (`text-slate-500`), colored dot (`bg-emerald-500` vs `bg-slate-300`), "Completed"/"Active" labels — all present from Story 1.4.
- 4 new tests added (10 total): optimistic toggle before API, toggle revert on failure, optimistic delete before API, delete revert on failure.
- Existing toggle/delete tests replaced with optimistic-aware versions.
- All workspace checks pass: 33 tests (23 BE + 10 FE), lint, build.

### File List

- `apps/frontend/src/components/todo/TodoApp.tsx` (modified — optimistic toggle and delete)
- `apps/frontend/src/components/todo/TodoApp.test.tsx` (modified — optimistic tests + rollback tests)
- `_bmad-output/implementation-artifacts/2-2-add-fast-update-and-visual-completion-feedback.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- 2026-03-20: Created Story 2.2 with implementation-ready context for optimistic updates and completion feedback.
- 2026-03-20: Implemented optimistic toggle/delete with rollback, verified FR6 styling, added 4 tests. All workspace checks pass.
