# Accessibility Report — WCAG 2.1 AA Assessment

**Project:** Todo App
**Date:** 2026-03-24 (Updated with automated audit results)
**Requirement:** NFR6 — Core journeys meet WCAG 2.1 AA for keyboard access, visible focus, and non-text contrast
**Method:** Automated axe-core audit via Playwright + manual code review
**Tools:** @axe-core/playwright (WCAG 2.0 A/AA + WCAG 2.1 A/AA rulesets)

---

## Executive Summary

The application **passes all automated WCAG 2.1 AA checks** across every UI state (empty, populated, completed, error, mobile). Eight dedicated accessibility tests verify compliance through axe-core audits, keyboard navigation, and focus indicator validation.

**Overall Assessment:** PASS — Full automated WCAG 2.1 AA compliance confirmed.

---

## Automated Audit Results

### axe-core WCAG 2.1 AA Scan — 0 Violations

| Test Scenario | Tags Tested | Violations | Status |
|---------------|-------------|------------|--------|
| Empty state (no todos) | wcag2a, wcag2aa, wcag21a, wcag21aa | **0** | PASS |
| Page with active todos | wcag2a, wcag2aa, wcag21a, wcag21aa | **0** | PASS |
| Page with completed todo | wcag2a, wcag2aa, wcag21a, wcag21aa | **0** | PASS |
| Form validation error state | wcag2a, wcag2aa, wcag21a, wcag21aa | **0** | PASS |
| Mobile viewport (375x667) | wcag2a, wcag2aa, wcag21a, wcag21aa | **0** | PASS |

### Keyboard Navigation — PASS

| Test | Result |
|------|--------|
| Logical tab order (input -> button -> toggle -> delete) | PASS |
| Skip-to-content link receives focus and activates | PASS |
| Focus-visible indicators present on input and buttons | PASS |

---

## Test Suite: `e2e/accessibility.spec.ts`

8 automated tests covering all WCAG 2.1 AA requirements:

| # | Test | What It Verifies |
|---|------|------------------|
| 1 | Empty state — no violations | axe-core full page scan on initial load |
| 2 | Populated state — no violations | axe-core scan with todo items rendered |
| 3 | Completed todo state — no violations | axe-core scan after marking todo complete |
| 4 | Validation error — no violations | axe-core scan with form error displayed |
| 5 | Keyboard tab order | Sequential focus: input -> add -> toggle -> delete |
| 6 | Skip-to-content link | Link receives focus, activates to main content |
| 7 | Focus indicators via keyboard | `focus-visible:ring` styling confirmed on input and button |
| 8 | Mobile viewport — no violations | axe-core scan at 375x667 viewport |

---

## Detailed Compliance Assessment

### 1. Keyboard Access

#### 1.1 Skip Navigation Link — PASS

- Skip-to-content link present, visually hidden until focused
- Target `#main-content` matches `<main id="main-content">` landmark
- Verified by automated test: focus + activation works

#### 1.2 Interactive Elements — All Keyboard Accessible — PASS

| Element | Component | Tab-reachable | Activatable | Notes |
|---------|-----------|:---:|:---:|-------|
| Text input | `TodoForm` | Yes | Yes | Native `<input>` |
| Add todo button | `TodoForm` | Yes | Yes | Native `<button>` |
| Mark complete/active | `TodoItem` | Yes | Yes | Native `<button>` |
| Delete button | `TodoItem` | Yes | Yes | Native `<button>` |
| Dismiss error | `TodoApp` | Yes | Yes | Native `<button>` |
| Try again button | `TodoApp` | Yes | Yes | Native `<button>` |

#### 1.3 Disabled State Handling — PASS

- Buttons use native `disabled` attribute when `isMutating` is true
- Disabled buttons show `disabled:cursor-not-allowed disabled:opacity-60`
- Input field disabled during form submission

---

### 2. Visible Focus Indicators — PASS

All interactive elements implement `focus-visible:ring-2` with appropriate ring colors:

| Element | Focus Ring Classes |
|---------|-------------------|
| Text input | `focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2` |
| Add todo button | `focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2` |
| Mark complete/active | `focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2` |
| Delete button | `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2` |
| Dismiss error | `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2` |
| Try again button | `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2` |
| Skip-to-content | Visible on focus via `focus:not-sr-only` with high-contrast styling |

- Uses `:focus-visible` (not `:focus`) to avoid showing rings on mouse click
- `ring-offset-2` provides visual separation
- Verified by automated test (computed styles checked on keyboard Tab)

---

### 3. Semantic HTML & ARIA — PASS

#### 3.1 Landmark Structure — PASS

- `<html lang="en">` — language declared
- `<main id="main-content">` — main content landmark
- `<header>` — page header within main
- `<form>` — form landmark for todo creation
- `<ul>` / `<li>` — list semantics for todo items

#### 3.2 ARIA Live Regions — PASS

| Region | Attribute | Purpose |
|--------|-----------|---------|
| Error banner | `role="alert" aria-live="assertive"` | Announces mutation errors immediately |
| Error panel | `role="status"` | Announces list fetch failure |
| Empty state | `role="status"` | Announces empty todo list |
| Loading skeleton | `aria-busy="true" aria-label="Loading todos"` | Announces loading state |
| Todo item | `aria-busy={isMutating}` | Indicates pending mutation |
| Todo list | `aria-live="polite"` | Announces list changes |

#### 3.3 Completion State Indicator — PASS

- Visual indicator (colored dot) has `role="img"` and `aria-label` for screen readers
- Text label ("Completed" / "Active") also shown visually as supplementary info
- Previously missing `role="img"` was identified by Lighthouse and fixed

#### 3.4 Form Labels — PASS

- Input has explicit `<label htmlFor="todo-description">Add a todo</label>`
- Form validation errors use `role="alert"` for immediate announcement

---

### 4. Color & Contrast — PASS (axe-core verified)

axe-core's color-contrast rule passed on all tested states. Estimated ratios:

| Element | Color | Background | Estimated Ratio | Target |
|---------|-------|------------|:---:|:---:|
| Heading | `slate-950` | gradient bg | ~18:1 | 4.5:1 |
| Body text | `slate-600` | white | ~5.7:1 | 4.5:1 |
| Active description | `slate-900` | white | ~15:1 | 4.5:1 |
| Completed description | `slate-500` | white | ~4.6:1 | 4.5:1 |
| Error text | `red-700` | `red-50` | ~6.5:1 | 4.5:1 |

---

### 5. Previous Issues — Resolved

| Issue | Status | Resolution |
|-------|--------|------------|
| `aria-label` on `<span>` without role (Lighthouse finding) | **Fixed** | Added `role="img"` to completion indicator |
| No automated accessibility testing | **Fixed** | Added 8 axe-core Playwright tests |
| No keyboard navigation testing | **Fixed** | Added tab order and focus indicator tests |

---

### 6. Remaining Recommendations

#### Before Release (Low Priority — all pass automated checks)

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 1 | Add `aria-label` to todo action buttons with todo description | Low | Improves screen reader UX for multi-item lists |
| 2 | Darken active dot from `bg-slate-300` to `bg-slate-400` | Low | Non-text contrast borderline (axe passes but manual review suggests improvement) |
| 3 | Add `prefers-reduced-motion` to disable `animate-pulse` | Low | Respect user motion preferences |

#### Post-Release

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 4 | Manual VoiceOver/NVDA screen reader testing | Low | Supplement automated testing |
| 5 | Focus management after error recovery | Low | Return focus to triggering button after mutation failure |
| 6 | Add Firefox and WebKit to accessibility E2E matrix | Low | Cross-browser a11y verification |

---

## Compliance Summary

| WCAG 2.1 AA Criterion | Status | Evidence |
|------------------------|--------|----------|
| 1.1.1 Non-text Content | PASS | `role="img"` + `aria-label` on indicators |
| 1.3.1 Info and Relationships | PASS | Semantic HTML, `<label>`, ARIA roles |
| 1.3.2 Meaningful Sequence | PASS | Logical DOM order matches visual |
| 1.4.1 Use of Color | PASS | Text labels supplement color indicators |
| 1.4.3 Contrast (Minimum) | PASS | axe-core contrast rule passes |
| 1.4.11 Non-text Contrast | PASS | axe-core passes; active dot borderline |
| 2.1.1 Keyboard | PASS | All interactive elements keyboard-operable |
| 2.4.1 Bypass Blocks | PASS | Skip-to-content link present |
| 2.4.3 Focus Order | PASS | Logical tab order verified |
| 2.4.6 Headings and Labels | PASS | Descriptive heading, explicit labels |
| 2.4.7 Focus Visible | PASS | `focus-visible:ring-2` on all controls |
| 3.1.1 Language of Page | PASS | `<html lang="en">` |
| 3.3.1 Error Identification | PASS | `role="alert"` on errors |
| 3.3.2 Labels or Instructions | PASS | `<label>` + placeholder |
| 4.1.2 Name, Role, Value | PASS | Native elements + ARIA attributes |

---

**Generated:** 2026-03-24
**Standard:** WCAG 2.1 Level AA
**Automated Tool:** @axe-core/playwright (tags: wcag2a, wcag2aa, wcag21a, wcag21aa)
**Test File:** `e2e/accessibility.spec.ts` (8 tests, all passing)
