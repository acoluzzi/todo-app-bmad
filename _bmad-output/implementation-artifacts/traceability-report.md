---
stepsCompleted:
  - step-01-load-context
  - step-02-discover-tests
  - step-03-map-criteria
  - step-04-analyze-gaps
  - step-05-gate-decision
lastStep: step-05-gate-decision
lastSaved: '2026-03-20'
workflowType: testarch-trace
inputDocuments:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/architecture.md
---

# Traceability Matrix & Gate Decision — Todo App (Full Project)

**Scope:** All Epics (1, 2, 3) — Full project coverage analysis
**Date:** 2026-03-20
**Evaluator:** TEA Agent (Master Test Architect)

---

> This workflow does not generate tests. If gaps exist, run `bmad-testarch-automate` or `bmad-testarch-atdd` to create coverage.

## PHASE 1: REQUIREMENTS TRACEABILITY

### Test Inventory Summary

| Test Level  | File                                        | Test Count |
| ----------- | ------------------------------------------- | ---------- |
| Unit (BE)   | `todo.route.test.ts`                        | 23         |
| Unit (BE)   | `todo.repository.test.ts`                   | 5          |
| Unit (BE)   | `health.test.ts`                            | 1          |
| Integration | `todo.api.integration.test.ts`              | 3          |
| Integration | `todo.repository.integration.test.ts`       | 2          |
| Unit (FE)   | `TodoApp.test.tsx`                           | 13         |
| E2E         | `todo-smoke.spec.ts`                        | 4          |
| **Total**   |                                             | **51**     |

### Coverage Summary

| Priority  | Total Criteria | FULL Coverage | Coverage % | Status |
| --------- | -------------- | ------------- | ---------- | ------ |
| P0        | 7              | 5             | 71%        | ❌ FAIL |
| P1        | 7              | 3             | 43%        | ❌ FAIL |
| P2        | 6              | 2             | 33%        | ⚠️ WARN |
| **Total** | **20**         | **10**        | **50%**    | ❌ FAIL |

**Legend:**

- ✅ PASS — Coverage meets quality gate threshold
- ⚠️ WARN — Coverage below threshold but not critical
- ❌ FAIL — Coverage below minimum threshold

---

### Detailed Mapping

#### FR1: Users can create a todo (1–120 chars) — P0

- **Coverage:** FULL ✅
- **Tests:**
  - `todo.route.test.ts` — "creates a todo and returns 201 with data envelope"
  - `todo.route.test.ts` — "returns 400 when description is empty"
  - `todo.route.test.ts` — "returns 400 when description contains only whitespace"
  - `todo.route.test.ts` — "returns 400 when description exceeds 120 characters"
  - `todo.route.test.ts` — "returns 400 when description field is missing"
  - `todo.route.test.ts` — "returns 400 when description is not a string"
  - `todo.route.test.ts` — "returns 400 when body is missing entirely"
  - `todo.route.test.ts` — "returns 400 validation error when body contains malformed JSON"
  - `TodoApp.test.tsx` — "creates a todo and updates the rendered list"
  - `todo-smoke.spec.ts` — "creates a todo and displays it in the list"
- **Gaps:** None

---

#### FR2: Users can view all existing todos when the app loads — P0

- **Coverage:** FULL ✅
- **Tests:**
  - `todo.route.test.ts` — "returns 200 with data array"
  - `todo.route.test.ts` — "returns 200 with empty array when no todos exist"
  - `TodoApp.test.tsx` — "renders todos returned by the API on initial load in API order"
  - `todo-smoke.spec.ts` — "loads the app and shows the heading"
- **Gaps:** None

---

#### FR3: Users can mark an active todo as completed — P0

- **Coverage:** FULL ✅
- **Tests:**
  - `todo.route.test.ts` — "updates completion state and returns 200"
  - `todo.route.test.ts` — "returns 404 when todo not found" (PATCH)
  - `TodoApp.test.tsx` — "optimistically toggles todo completion before API responds"
  - `todo-smoke.spec.ts` — "completes a todo and shows completion styling"
- **Gaps:** None

---

#### FR4: Users can delete a todo — P0

- **Coverage:** FULL ✅
- **Tests:**
  - `todo.route.test.ts` — "deletes a todo and returns 204 with no body"
  - `todo.route.test.ts` — "returns 404 when todo not found" (DELETE)
  - `TodoApp.test.tsx` — "optimistically deletes a todo before API responds"
  - `todo-smoke.spec.ts` — "deletes a todo and removes it from the list"
- **Gaps:** None

---

#### FR5: Display todo with description, completion state, and creation timestamp — P0

- **Coverage:** PARTIAL ⚠️
- **Tests:**
  - `todo.repository.test.ts` — "creates and lists todos with snake_case output fields" (verifies `created_at` ISO-8601)
  - `TodoApp.test.tsx` — "renders todos returned by the API on initial load in API order"
- **Gaps:**
  - Missing: No frontend test explicitly asserts that the creation timestamp is rendered in the UI
  - Missing: No component-level test for `TodoItem` verifying all three fields display
- **Recommendation:** Add a `TodoItem.test.tsx` unit test asserting description, completion indicator, and formatted timestamp are rendered.

---

#### FR8: Backend CRUD support for all user journeys — P0

- **Coverage:** FULL ✅
- **Tests:**
  - All route tests cover create/read/update/delete operations
  - `todo.repository.test.ts` covers repository-level CRUD
  - Integration tests verify full persistence path
- **Gaps:** None

---

#### FR9: Persistence across refresh/reopen with no data loss — P0

- **Coverage:** PARTIAL ⚠️
- **Tests:**
  - `todo.api.integration.test.ts` — "persists a created todo across app restart"
  - `todo.api.integration.test.ts` — "persists completion state across app restart"
  - `todo.api.integration.test.ts` — "persists deletion across app restart"
  - `todo.repository.integration.test.ts` — "persists todos across client reinitialization"
- **Gaps:**
  - Missing: No E2E test that creates a todo, refreshes the browser, and verifies it persists
- **Recommendation:** Add an E2E test: create todo → `page.reload()` → assert todo is still visible.

---

#### FR6: Visual distinction between completed and active todos — P1

- **Coverage:** PARTIAL ⚠️
- **Tests:**
  - `TodoApp.test.tsx` — "optimistically toggles todo completion" (checks button label changes)
  - `todo-smoke.spec.ts` — "completes a todo and shows completion styling" (checks button state)
- **Gaps:**
  - Missing: No assertion on visual styling (`line-through`, `text-slate-500`, `bg-emerald-500` indicator)
- **Recommendation:** Add a `TodoItem.test.tsx` test verifying CSS classes for completed vs active state.

---

#### FR7: Results reflected within 300ms after successful operation — P1

- **Coverage:** FULL ✅ (via optimistic updates)
- **Tests:**
  - `TodoApp.test.tsx` — "optimistically toggles todo completion before API responds" (UI updates before API)
  - `TodoApp.test.tsx` — "optimistically deletes a todo before API responds" (item removed before API)
  - `TodoApp.test.tsx` — "creates a todo and updates the rendered list" (list updates after API)
- **Gaps:** No explicit timing assertion, but optimistic updates guarantee sub-frame response.

---

#### FR10: Empty, loading, and error UI states — P1

- **Coverage:** FULL ✅
- **Tests:**
  - `TodoApp.test.tsx` — "shows empty state when the API returns no todos"
  - `TodoApp.test.tsx` — "shows loading skeleton before the initial fetch resolves"
  - `TodoApp.test.tsx` — "shows error state when the initial fetch fails"
  - `TodoApp.test.tsx` — "shows mutation loading state when toggling a todo"
- **Gaps:** None

---

#### FR11: Retry failed actions without reloading — P1

- **Coverage:** FULL ✅
- **Tests:**
  - `TodoApp.test.tsx` — "retries list fetch when clicking Try again after failure"
  - `TodoApp.test.tsx` — "shows loading skeleton during retry fetch"
  - `TodoApp.test.tsx` — "reverts optimistic toggle on API failure"
  - `TodoApp.test.tsx` — "reverts optimistic delete on API failure"
  - `TodoApp.test.tsx` — "dismisses the error banner when clicking Dismiss"
- **Gaps:** None

---

#### FR12: Core journeys work on viewports 320px+ without horizontal scrolling — P1

- **Coverage:** NONE ❌
- **Tests:** None
- **Gaps:**
  - Missing: No responsive viewport tests at any level
  - Missing: No Playwright tests with viewport configuration (320px, 600px, 1024px)
- **Recommendation:** Add Playwright E2E tests parameterized across `320×568`, `768×1024`, `1280×720` viewports verifying no horizontal scrollbar.

---

#### NFR5: 0 data-loss incidents across refresh/reopen cycles — P1

- **Coverage:** PARTIAL ⚠️
- **Tests:**
  - Integration tests verify persistence mechanism works (3 tests)
- **Gaps:**
  - Missing: No stress/loop test exercising multiple cycles
  - The mechanism is sound; the gap is in exhaustive verification
- **Recommendation:** Covered sufficiently by FR9 integration tests for MVP. Consider adding a loop E2E test post-release.

---

#### NFR6: WCAG 2.1 AA — keyboard, focus, contrast — P1

- **Coverage:** PARTIAL ⚠️
- **Tests:**
  - Frontend tests use ARIA roles (`getByRole`, `aria-busy`, `aria-live`, `role="alert"`, `role="status"`)
  - Implicit coverage of ARIA markup through testing library queries
- **Gaps:**
  - Missing: No automated axe-core accessibility audit
  - Missing: No keyboard-only E2E navigation test
  - Missing: No contrast ratio verification
- **Recommendation:** Add an axe-core audit step to E2E tests (`@axe-core/playwright`). See Accessibility Report for details.

---

#### NFR2: 95th percentile API latency ≤ 500ms — P2

- **Coverage:** NONE ❌
- **Tests:** None
- **Gaps:** No performance measurement or benchmark test
- **Recommendation:** Deferred — add `autocannon` or `k6` load test post-MVP.

---

#### NFR3: Core flows pass QA on all viewport ranges and browser matrix — P2

- **Coverage:** PARTIAL ⚠️
- **Tests:**
  - E2E smoke tests exist but only run on Chromium at default viewport
- **Gaps:**
  - Missing: No multi-browser E2E (Firefox, WebKit)
  - Missing: No multi-viewport parameterization
- **Recommendation:** Add `firefox` and `webkit` projects to `playwright.config.ts`.

---

#### Additional: Error envelope consistency — P2

- **Coverage:** FULL ✅
- **Tests:**
  - `todo.route.test.ts` — "returns consistent envelope for validation, not-found, and server errors"
  - `todo.route.test.ts` — "returns 500 via global error handler when service throws"
- **Gaps:** None

---

#### Additional: Zod boundary validation — P2

- **Coverage:** FULL ✅
- **Tests:**
  - Comprehensive validation tests for POST, PATCH, DELETE covering empty, missing, wrong-type, boundary-length, and malformed JSON inputs
- **Gaps:** None

---

#### Additional: CORS middleware — P2

- **Coverage:** NONE ❌
- **Tests:** None
- **Gaps:**
  - Missing: No test verifying CORS headers on responses
  - Missing: No test verifying cross-origin rejection
- **Recommendation:** Add a unit test verifying `Access-Control-Allow-Origin` header matches configured origin. See Security Report.

---

#### Additional: Helmet secure headers — P2

- **Coverage:** NONE ❌
- **Tests:** None
- **Gaps:**
  - Missing: No test verifying security headers are present (X-Content-Type-Options, etc.)
- **Recommendation:** Add a unit test verifying Helmet headers are set on responses. See Security Report.

---

### Gap Analysis

#### Critical Gaps (BLOCKER) ❌

2 gaps found. **Address before release.**

1. **FR5: Display fields including timestamp** (P0)
   - Current Coverage: PARTIAL
   - Missing: Frontend test asserting timestamp display
   - Recommend: Add `TodoItem.test.tsx` component test
   - Impact: Core display contract partially unverified at UI layer

2. **FR9: Persistence across refresh** (P0)
   - Current Coverage: PARTIAL (integration only)
   - Missing: E2E browser refresh test
   - Recommend: Add Playwright test with `page.reload()`
   - Impact: User-facing persistence journey unverified end-to-end

---

#### High Priority Gaps (PR BLOCKER) ⚠️

4 gaps found. **Address before PR merge.**

1. **FR12: Responsive layout** (P1)
   - Current Coverage: NONE
   - Missing: Any viewport-specific test
   - Recommend: Add multi-viewport E2E tests

2. **NFR6: Accessibility (WCAG 2.1 AA)** (P1)
   - Current Coverage: PARTIAL
   - Missing: Automated axe-core audit, keyboard-only test
   - Recommend: Integrate `@axe-core/playwright`

3. **FR6: Visual distinction** (P1)
   - Current Coverage: PARTIAL
   - Missing: CSS class assertions for completed styling
   - Recommend: Add `TodoItem.test.tsx` with class assertions

4. **NFR5: Persistence durability** (P1)
   - Current Coverage: PARTIAL
   - Missing: Stress/loop testing
   - Impact: Low — mechanism is proven, volume is not

---

#### Medium Priority Gaps ⚠️

4 gaps found. **Address in next iteration.**

1. **CORS middleware** (P2) — No coverage at all
2. **Helmet middleware** (P2) — No coverage at all
3. **NFR2: API latency** (P2) — No performance test
4. **NFR3: Cross-device QA** (P2) — Single browser only

---

### Coverage Heuristics Findings

#### Endpoint Coverage Gaps

- Endpoints without direct API tests: **0**
- All 5 API endpoints (POST, GET, PATCH, DELETE `/todos`, GET `/health`) have unit tests ✅

#### Auth/Authz Negative-Path Gaps

- Not applicable — no auth/authz requirements in this project

#### Happy-Path-Only Criteria

- Criteria missing error/edge scenarios: **0**
- All CRUD operations test both happy and error paths ✅

---

### Coverage by Test Level

| Test Level    | Tests   | Criteria Covered | Coverage %  |
| ------------- | ------- | ---------------- | ----------- |
| E2E           | 4       | 5 (FR1-4, partial FR3/4/9) | 25% |
| Integration   | 5       | 2 (FR8, FR9)     | 10%         |
| Unit (FE)     | 13      | 5 (FR1-4, FR7, FR10, FR11) | 35% |
| Unit (BE)     | 29      | 5 (FR1-4, FR8)   | 25%         |
| **Total**     | **51**  | **10 FULL / 20** | **50%**     |

---

### Traceability Recommendations

#### Immediate Actions (To reach 70% target)

1. **Add `TodoItem.test.tsx`** — Component test verifying description, completion indicator, timestamp display, and completed CSS classes. Closes FR5 and FR6 gaps. (~3 tests)
2. **Add E2E persistence test** — Create todo → `page.reload()` → assert visible. Closes FR9 gap. (~1 test)
3. **Add multi-viewport E2E test** — Parameterize E2E tests for 320px, 768px, 1280px viewports. Closes FR12 gap. (~3 tests)

These 3 actions would bring P0 to **100%** and P1 to **71%**, and overall to **75%** — exceeding your 70% target.

#### Short-term Actions (This milestone)

1. **Integrate axe-core** — Add `@axe-core/playwright` to E2E tests for automated WCAG audit. Closes NFR6 gap partially.
2. **Add CORS/Helmet header tests** — Two unit tests verifying middleware configuration. Closes security testing gaps.
3. **Add multi-browser E2E** — Add Firefox and WebKit to Playwright projects.

#### Long-term Actions (Backlog)

1. **Performance benchmark** — Add load test for NFR2 (≤500ms latency target).
2. **Persistence stress test** — Loop test for NFR5 durability.

---

## PHASE 2: QUALITY GATE DECISION

**Gate Type:** release
**Decision Mode:** deterministic

---

### Decision Criteria Evaluation

#### P0 Criteria (Must ALL Pass)

| Criterion         | Threshold | Actual | Status  |
| ----------------- | --------- | ------ | ------- |
| P0 Coverage       | 100%      | 71%    | ❌ FAIL |
| Security Issues   | 0         | 0      | ✅ PASS |

**P0 Evaluation:** ❌ ONE OR MORE FAILED

#### P1 Criteria (Required for PASS)

| Criterion         | Threshold | Actual | Status  |
| ----------------- | --------- | ------ | ------- |
| P1 Coverage       | ≥80%      | 43%    | ❌ FAIL |
| Overall Coverage  | ≥80%      | 50%    | ❌ FAIL |

**P1 Evaluation:** ❌ FAILED

---

### GATE DECISION: FAIL

---

### Rationale

P0 coverage is 71% (required: 100%). 2 critical requirements (FR5 display fields, FR9 persistence) have only PARTIAL coverage — missing frontend component tests and an E2E browser refresh test. P1 coverage is 43% (minimum: 80%), with FR12 (responsive) having NONE coverage and NFR6 (accessibility) lacking automated audits.

**However**, the gap to the user's stated **70% target** is achievable with 3 focused actions (see Immediate Actions above). The existing 51 tests provide strong behavioral coverage for all core CRUD journeys at multiple levels. The gaps are primarily in cross-cutting quality attributes (responsive, accessibility) and component-level granularity, not in functional correctness.

---

### Gate Recommendations (FAIL Decision)

1. **Block deployment** until P0 gaps are closed (FR5, FR9)
2. **Implement Immediate Actions** (3 items, ~7 new tests) to reach 70%+ target
3. **Re-run `bmad-testarch-trace`** after implementing new tests to verify gate improvement

---

### Next Steps

**Immediate Actions** (next session):

1. Create `TodoItem.test.tsx` with field display and styling assertions
2. Add E2E persistence-across-refresh test
3. Add multi-viewport E2E parameterization

**Follow-up Actions** (next milestone):

1. Integrate `@axe-core/playwright` for automated WCAG audit
2. Add CORS and Helmet header unit tests
3. Add Firefox/WebKit browser projects

---

## Related Artifacts

- **Epics:** `_bmad-output/planning-artifacts/epics.md`
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md`
- **Sprint Status:** `_bmad-output/implementation-artifacts/sprint-status.yaml`
- **Test Files:** `apps/backend/src/test/`, `apps/frontend/src/components/todo/`, `e2e/`

---

## Sign-Off

**Phase 1 — Traceability Assessment:**

- Overall Coverage: 50% (FULL)
- P0 Coverage: 71% ❌
- P1 Coverage: 43% ❌
- Critical Gaps: 2
- High Priority Gaps: 4

**Phase 2 — Gate Decision:**

- **Decision:** FAIL ❌
- **P0 Evaluation:** ❌ ONE OR MORE FAILED
- **P1 Evaluation:** ❌ FAILED

**Overall Status:** FAIL ❌

**Path to 70%:** 3 immediate actions adding ~7 tests → P0 100%, P1 71%, Overall 75%

**Generated:** 2026-03-20
**Workflow:** testarch-trace v4.0

---

<!-- Powered by BMAD-CORE™ -->
