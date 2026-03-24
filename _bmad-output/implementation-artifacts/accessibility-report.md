# Accessibility Report — WCAG 2.1 AA Assessment

**Project:** Todo App
**Date:** 2026-03-20
**Requirement:** NFR6 — Core journeys meet WCAG 2.1 AA for keyboard access, visible focus, and non-text contrast
**Scope:** Manual code review of all frontend components

---

## Executive Summary

The application demonstrates **solid foundational accessibility** with proper ARIA attributes, semantic HTML, skip-to-content navigation, and visible focus indicators. However, **no automated accessibility auditing** is in place, and several areas require attention for full WCAG 2.1 AA compliance.

**Overall Assessment:** ⚠️ PARTIAL COMPLIANCE — Good foundations, needs automated verification and targeted fixes.

---

## 1. Keyboard Access

### 1.1 Skip Navigation Link ✅ PASS

```1:9:apps/frontend/src/app/layout.tsx
// skip-to-content link present
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-white"
>
  Skip to content
</a>
```

- Skip-to-content link present and visually hidden until focused
- Target `#main-content` correctly matches `<main id="main-content">` landmark
- Becomes visible on focus with adequate styling

### 1.2 Interactive Elements — All Keyboard Accessible ✅ PASS

| Element            | Component      | Tab-reachable | Activatable | Notes              |
| ------------------ | -------------- | ------------- | ----------- | ------------------ |
| Text input         | `TodoForm`     | ✅            | ✅          | Native `<input>`   |
| Add todo button    | `TodoForm`     | ✅            | ✅          | Native `<button>`  |
| Mark complete/active | `TodoItem`   | ✅            | ✅          | Native `<button>`  |
| Delete button      | `TodoItem`     | ✅            | ✅          | Native `<button>`  |
| Dismiss error      | `TodoApp`      | ✅            | ✅          | Native `<button>`  |
| Try again button   | `TodoApp`      | ✅            | ✅          | Native `<button>`  |

All interactive elements use native HTML elements (`<button>`, `<input>`, `<a>`), ensuring keyboard operability without custom handlers.

### 1.3 Disabled State Handling ✅ PASS

- Buttons use native `disabled` attribute when `isMutating` is true
- Disabled buttons show `disabled:cursor-not-allowed disabled:opacity-60`
- Input field disabled during form submission

### 1.4 Focus Order ⚠️ CONCERN

- **Issue:** No explicit `tabindex` management for focus restoration after mutation errors
- **Impact:** After a failed toggle/delete reverts, focus may be lost (browser default behavior)
- **Severity:** Low — native buttons retain focusability, but user's focus position may shift
- **Recommendation:** Consider programmatic focus management after error recovery (e.g., return focus to the triggering button)

---

## 2. Visible Focus Indicators

### 2.1 Focus-Visible Ring Styling ✅ PASS

All interactive elements implement `focus-visible:ring-2` with appropriate ring colors:

| Element           | Focus Ring Classes                                                    |
| ----------------- | --------------------------------------------------------------------- |
| Text input        | `focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2` |
| Add todo button   | `focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2` |
| Mark complete     | `focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2` |
| Delete button     | `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`   |
| Dismiss error     | `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`   |
| Try again button  | `focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`   |
| Skip-to-content   | Visible on focus via `focus:not-sr-only` with high-contrast styling           |

- All use `focus:outline-none` to suppress browser default, replaced by `focus-visible:ring`
- `ring-offset-2` ensures the ring has visual separation from the element
- Uses `:focus-visible` (not `:focus`) to avoid showing rings on mouse click

### 2.2 Focus Ring Contrast ⚠️ NEEDS VERIFICATION

- `ring-slate-500` (#64748b) on white background (#ffffff): estimated ratio ~4.6:1 — likely passes 3:1 non-text minimum
- `ring-red-500` (#ef4444) on white background: estimated ratio ~3.9:1 — borderline, needs measurement
- **Recommendation:** Run a contrast checker against actual rendered colors to confirm ≥3:1 for non-text contrast (WCAG 1.4.11)

---

## 3. Semantic HTML & ARIA

### 3.1 Landmark Structure ✅ PASS

- `<html lang="en">` — language declared
- `<main id="main-content">` — main content landmark present
- `<header>` — page header within main
- `<form>` — form landmark for todo creation
- `<ul>` / `<li>` — list semantics for todo items

### 3.2 ARIA Live Regions ✅ PASS

| Region         | Attribute                | Purpose                              |
| -------------- | ------------------------ | ------------------------------------ |
| Error banner   | `role="alert" aria-live="assertive"` | Announces mutation errors immediately |
| Error panel    | `role="status"`          | Announces list fetch failure         |
| Empty state    | `role="status"`          | Announces empty todo list            |
| Loading skeleton | `aria-busy="true" aria-label="Loading todos"` | Announces loading state |
| Todo item      | `aria-busy={isMutating}` | Indicates pending mutation           |

### 3.3 Completion State Indicator ✅ PASS

```27:31:apps/frontend/src/components/todo/TodoItem.tsx
<span
  aria-label={`Completion state: ${todo.isCompleted ? "completed" : "active"}`}
  className={`mt-1 inline-flex h-3.5 w-3.5 rounded-full ${
    todo.isCompleted ? "bg-emerald-500" : "bg-slate-300"
  }`}
/>
```

- Visual indicator (colored dot) has `aria-label` for screen readers
- Text label ("Completed" / "Active") also shown visually as supplementary info

### 3.4 Form Labels ✅ PASS

- Input has explicit `<label htmlFor="todo-description">Add a todo</label>`
- Form validation errors use `role="alert"` for immediate announcement

### 3.5 Button Labels ⚠️ CONCERN

- Toggle button: "Mark complete" / "Mark active" — descriptive but **not associated with the specific todo**
- Delete button: "Delete" — generic label, no indication of which todo
- **Issue:** Screen reader users with multiple todos cannot distinguish between buttons
- **Severity:** Medium — affects usability for screen reader users
- **Recommendation:** Add `aria-label` with the todo description, e.g., `aria-label={`Mark ${todo.description} complete`}` or use `aria-describedby` pointing to the description element

---

## 4. Color & Contrast

### 4.1 Text Contrast ✅ LIKELY PASS

| Element              | Color        | Background   | Estimated Ratio | Target |
| -------------------- | ------------ | ------------ | --------------- | ------ |
| Heading              | `slate-950`  | gradient bg  | ~18:1           | 4.5:1  |
| Body text            | `slate-600`  | white        | ~5.7:1          | 4.5:1  |
| Active description   | `slate-900`  | white        | ~15:1           | 4.5:1  |
| Completed description | `slate-500` | white        | ~4.6:1          | 4.5:1  |
| Timestamp / meta     | `slate-500`  | white        | ~4.6:1          | 4.5:1  |
| Error text           | `red-700`    | `red-50`     | ~6.5:1          | 4.5:1  |
| Small label text     | `slate-500`  | gradient bg  | ~4.6:1          | 4.5:1  |

**Note:** All estimates are based on Tailwind's default color palette. Actual values should be verified with a tool like the WebAIM contrast checker against rendered pixels.

### 4.2 Non-Text Contrast (WCAG 1.4.11) ⚠️ NEEDS VERIFICATION

| Element                | Color           | Background | Estimated Ratio | Target |
| ---------------------- | --------------- | ---------- | --------------- | ------ |
| Active dot indicator   | `slate-300`     | white      | ~1.9:1          | 3:1    |
| Completed dot indicator | `emerald-500`  | white      | ~3.4:1          | 3:1    |
| Input border           | `slate-300`     | white      | ~1.9:1          | 3:1    |
| Card border            | `slate-200`     | white      | ~1.5:1          | 3:1    |

- **FINDING:** The active-state dot indicator (`bg-slate-300` on white) and input/card borders likely **fail** the 3:1 non-text contrast minimum
- **Severity:** Medium — the active dot is supplemented by the text "Active", mitigating the issue. Borders are decorative.
- **Recommendation:** Darken `bg-slate-300` to `bg-slate-400` for the active dot. Border contrast failures are acceptable as borders are decorative, not the sole visual cue.

---

## 5. Motion & Animation

### 5.1 Loading Animation ✅ PASS

- Loading skeleton uses `animate-pulse` (CSS animation)
- Does not meet the "flashing more than 3 times per second" threshold (WCAG 2.3.1)
- Consider adding `prefers-reduced-motion` media query to disable pulse animation

---

## 6. Test Coverage for Accessibility

### Current State

- Frontend tests use `@testing-library/react` which encourages accessible queries (`getByRole`, `getByLabelText`)
- ARIA attributes are implicitly tested through role-based queries
- No dedicated accessibility test suite

### Missing

| Gap                           | Priority | Recommendation                                    |
| ----------------------------- | -------- | ------------------------------------------------- |
| Automated axe-core audit      | HIGH     | Add `@axe-core/playwright` to E2E tests           |
| Keyboard-only navigation test | HIGH     | Add Playwright test using only Tab/Enter/Space     |
| Contrast verification         | MEDIUM   | Use axe-core or manual spot-check                 |
| Screen reader testing         | LOW      | Manual test with VoiceOver/NVDA post-MVP          |

---

## Findings Summary

| Category              | Status    | Issues Found |
| --------------------- | --------- | ------------ |
| Keyboard Access       | ✅ PASS   | 1 low concern (focus restoration) |
| Visible Focus         | ✅ PASS   | 1 verification needed (contrast) |
| Semantic HTML & ARIA  | ⚠️ PARTIAL | 1 medium concern (button labels) |
| Text Contrast         | ✅ LIKELY PASS | Needs tool verification |
| Non-Text Contrast     | ⚠️ CONCERN | Active dot and borders may fail 3:1 |
| Animation             | ✅ PASS   | Consider `prefers-reduced-motion` |
| Test Coverage         | ❌ GAP    | No automated a11y testing |

---

## Recommended Actions

### Before Release (P0/P1)

1. **Add `aria-label` to todo action buttons** with the todo description for screen reader context
2. **Darken active-state dot** from `bg-slate-300` to `bg-slate-400` for 3:1 non-text contrast
3. **Integrate `@axe-core/playwright`** to E2E smoke tests for automated WCAG audit

### Post-Release (P2)

4. Add `prefers-reduced-motion` media query to disable `animate-pulse`
5. Add programmatic focus management after error recovery
6. Run manual screen reader test with VoiceOver

---

**Generated:** 2026-03-20
**Standard:** WCAG 2.1 Level AA
**Method:** Static code review (no runtime verification)

<!-- Powered by BMAD-CORE™ -->
