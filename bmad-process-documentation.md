# How BMAD Guided the Todo App Implementation

**Project:** Todo App
**Date:** 2026-03-20
**Author:** Generated from BMAD workflow artifacts

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Product Definition](#phase-1-product-definition)
3. [Phase 2: Architecture Design](#phase-2-architecture-design)
4. [Phase 3: Epic & Story Planning](#phase-3-epic--story-planning)
5. [Phase 4: Implementation Readiness](#phase-4-implementation-readiness)
6. [Phase 5: Sprint Execution](#phase-5-sprint-execution)
7. [Phase 6: Quality Assurance](#phase-6-quality-assurance)
8. [Artifacts Index](#artifacts-index)
9. [Lessons Learned](#lessons-learned)

---

## Overview

The Todo App was built end-to-end using the **BMAD (Build Measure Analyze Decide)** methodology, an AI-assisted product development workflow that structures the journey from idea to production-ready software through sequential, artifact-driven phases.

Each phase produced concrete artifacts that fed into the next, creating a traceable chain from requirements through architecture, planning, implementation, and quality assurance. The entire project — from PRD through 14 implemented stories across 3 epics — was completed in a single day using BMAD-guided AI agents.

### The BMAD Flow Used

```
PRD → Architecture → Epics & Stories → Implementation Readiness Check
  → Sprint Planning → Story-by-Story Implementation → Code Reviews → QA Reports
```

### Key Statistics

| Metric | Value |
| --- | --- |
| Functional Requirements | 12 (FR1–FR12) |
| Non-Functional Requirements | 6 (NFR1–NFR6) |
| Epics | 3 |
| Stories | 14 |
| Total Tests Written | 51 |
| Planning Artifacts | 4 |
| Implementation Artifacts | 14+ |
| QA Reports | 3 |

---

## Phase 1: Product Definition

### What Happened

The process began with a **Product Requirements Document (PRD)** that defined the complete scope of the Todo App MVP. The PRD was created following BMAD's structured requirements elicitation, producing measurable, testable requirements rather than vague feature descriptions.

### Artifact Produced

**`Product Requirement Document (PRD) for the Todo App.pdf`** (project root)

### Key Decisions Made

The PRD established 12 functional requirements and 6 non-functional requirements with explicit acceptance criteria. Critical scope boundaries were set:

- **In scope:** CRUD operations, persistence, error recovery, responsive layout, accessibility
- **Explicitly out of scope:** Authentication, multi-user, collaboration, search/filter, drag-and-drop

### How BMAD Added Value

BMAD's PRD creation workflow (`bmad-create-prd`) ensured every requirement was:

- **Measurable:** NFR2 specifies "95th percentile API-backed user actions complete in 500ms or less" rather than "the app should be fast"
- **Testable:** FR1 specifies "description between 1 and 120 characters" with explicit boundary values
- **Traceable:** Each FR was later mapped to specific epics and stories

The PRD also captured additional architectural requirements (monorepo structure, separate FE/BE, PostgreSQL + Prisma, REST API contract, testing baseline, Docker Compose) that would constrain architecture decisions in the next phase.

---

## Phase 2: Architecture Design

### What Happened

With the PRD complete, BMAD's architecture workflow (`bmad-create-architecture`) guided the creation of a comprehensive Architecture Decision Document through 8 collaborative steps:

1. Project context analysis
2. Starter template evaluation
3. Core architectural decisions
4. Implementation patterns & consistency rules
5. Project structure & boundaries
6. Architecture validation

### Artifact Produced

**`_bmad-output/planning-artifacts/architecture.md`**

### Key Decisions Made

| Decision Area | Choice | Rationale |
| --- | --- | --- |
| Frontend Framework | Next.js (App Router) | Full-stack baseline, fast DX, TypeScript-first |
| Backend Framework | Fastify (separate service) | Explicit FE/BE split per PRD requirements |
| Database | PostgreSQL 18.x + Prisma 7.5.x | Relational model, versioned migrations |
| Monorepo Layout | `apps/frontend`, `apps/backend`, `packages/shared` | Clear component boundaries |
| API Style | REST, `/api/v1/...`, JSON, `snake_case` payloads | Consistent contract with error envelopes |
| Unit Testing | Vitest | Fast, TypeScript-native, compatible with both FE and BE |
| E2E Testing | Playwright | Cross-browser support, reliable async handling |
| Orchestration | Docker Compose (FE + BE + DB) | Reproducible local environment |
| Security Baseline | Zod validation, CORS allowlist, Helmet headers | Defense-in-depth for MVP |

### How BMAD Added Value

The architecture workflow prevented common AI agent inconsistencies by codifying **implementation patterns** that all subsequent coding agents had to follow:

- **Naming patterns:** `snake_case` for DB/API, `camelCase` for TypeScript, `PascalCase` for components
- **Structure patterns:** `route → service → repository` layering in backend
- **Process patterns:** Every async operation modeled as `idle | loading | success | error`
- **Anti-patterns:** Explicitly documented what NOT to do (e.g., "no backend logic in Next.js route handlers")

The architecture document also defined a complete project directory structure upfront, which meant every story knew exactly where to place files.

---

## Phase 3: Epic & Story Planning

### What Happened

BMAD's epic creation workflow (`bmad-create-epics-and-stories`) decomposed the PRD into implementable units, ensuring full requirements coverage.

### Artifact Produced

**`_bmad-output/planning-artifacts/epics.md`**

### Epic Structure

**Epic 1: Core Todo Management** (5 stories)
Users can create, view, complete, and delete todos with persistent data across sessions.
- FRs covered: FR1, FR2, FR3, FR4, FR5, FR8, FR9

**Epic 2: Interaction Feedback and Recovery** (4 stories)
Users get clear state feedback, fast visible updates, and retry-safe recovery.
- FRs covered: FR6, FR7, FR10, FR11

**Epic 3: Cross-Device Quality and Release Readiness** (5 stories)
Users can reliably use the app across devices with accessibility and quality standards.
- FRs covered: FR12, NFR1–NFR6

### FR Coverage Map

Every functional requirement was explicitly mapped to one or more epics:

| FR | Epic | Stories |
| --- | --- | --- |
| FR1 (Create) | Epic 1 | 1.3, 1.4 |
| FR2 (View) | Epic 1 | 1.3, 1.4 |
| FR3 (Complete) | Epic 1 | 1.3, 1.4 |
| FR4 (Delete) | Epic 1 | 1.3, 1.4 |
| FR5 (Display fields) | Epic 1 | 1.2, 1.4 |
| FR6 (Visual distinction) | Epic 2 | 2.2 |
| FR7 (Fast update) | Epic 2 | 2.2 |
| FR8 (Backend CRUD) | Epic 1 | 1.2, 1.3 |
| FR9 (Persistence) | Epic 1 | 1.5 |
| FR10 (UI states) | Epic 2 | 2.1 |
| FR11 (Retry) | Epic 2 | 2.3 |
| FR12 (Responsive) | Epic 3 | 3.1 |

### How BMAD Added Value

The planning phase ensured:

- **100% requirement coverage:** Every FR had at least one epic/story mapping
- **Incremental delivery:** Epic 1 delivers a working app; Epics 2 and 3 add polish and quality
- **Testable acceptance criteria:** Every story had Given/When/Then acceptance criteria derived from the PRD
- **No circular dependencies:** Stories within each epic follow a logical sequence

---

## Phase 4: Implementation Readiness

### What Happened

Before writing any code, BMAD's implementation readiness check (`bmad-check-implementation-readiness`) validated that all planning artifacts were consistent, complete, and ready for development.

### Artifact Produced

**`_bmad-output/planning-artifacts/implementation-readiness-report-20260320.md`**

### Validation Results

| Check | Result |
| --- | --- |
| PRD completeness | ✅ Complete (12 FRs, 6 NFRs) |
| FR-to-epic coverage | ✅ 100% (12/12 covered) |
| Architecture consistency | ✅ Decisions compatible, no contradictions |
| Epic quality compliance | ✅ User-value-oriented, logically sequenced |
| Critical violations | ✅ None found |

**Overall Status: READY**

### Minor Concerns Identified

1. Story 1.1 might need splitting if setup complexity grows
2. No dedicated UX design artifact (PRD and architecture contain sufficient UX requirements)

### How BMAD Added Value

This phase acted as a quality gate preventing premature implementation. It caught potential issues before they became expensive to fix:

- Verified the architecture doc's decisions aligned with the PRD's requirements
- Confirmed epic acceptance criteria were testable
- Checked for circular dependencies or missing coverage
- Provided explicit go/no-go recommendation

---

## Phase 5: Sprint Execution

### What Happened

With readiness confirmed, BMAD's sprint planning workflow (`bmad-sprint-planning`) created a tracking file, and then each story was implemented using the `bmad-create-story` → `bmad-dev-story` → `bmad-code-review` cycle.

### Artifacts Produced

**Sprint tracking:** `_bmad-output/implementation-artifacts/sprint-status.yaml`
**Story files:** 12 individual story implementation files in `_bmad-output/implementation-artifacts/`

### The Story Lifecycle

Each story followed this BMAD-guided cycle:

```
1. CREATE STORY (bmad-create-story)
   └─ Generate story file with tasks, acceptance criteria, technical context

2. IMPLEMENT (bmad-dev-story)
   └─ Code the feature following architecture patterns
   └─ Write tests alongside implementation
   └─ Update story file with completion notes

3. CODE REVIEW (bmad-code-review)
   └─ Adversarial review with three parallel layers:
       ├─ Blind Hunter: finds bugs without seeing the spec
       ├─ Edge Case Hunter: finds unhandled boundary conditions
       └─ Acceptance Auditor: validates against acceptance criteria
   └─ Triage findings into: Critical / Patch / Minor / Noise
   └─ Apply approved patches

4. COMMIT
   └─ Story marked done in sprint-status.yaml
```

### Epic-by-Epic Execution

#### Epic 1: Core Todo Management

| Story | What Was Built | Tests Added |
| --- | --- | --- |
| 1.1: Project Setup | Monorepo scaffold, Next.js frontend, Fastify backend, Docker Compose, workspace scripts | — |
| 1.2: Data Model | PostgreSQL `todos` table, Prisma schema/migration, `TodoRepository` with in-memory test double | 5 unit + 2 integration |
| 1.3: CRUD API | REST endpoints (POST/GET/PATCH/DELETE `/api/v1/todos`), Zod validation, error envelopes | 16 unit + 3 integration |
| 1.4: Todo List UI | `TodoApp`, `TodoForm`, `TodoItem`, `TodoList` components, `api-client.ts` with typed fetch | 2 unit (FE) |
| 1.5: Persistence | Verification that data survives app restart (backend integration tests) | 2 unit + 3 integration |

**Key architectural patterns established:** Repository pattern, service layer, error handler middleware, API client with error envelope parsing, `snake_case` ↔ `camelCase` mapping layer.

#### Epic 2: Interaction Feedback and Recovery

| Story | What Was Built | Tests Added |
| --- | --- | --- |
| 2.1: UI States | `AsyncStatus` state machine, loading skeleton, empty state, error panel with ARIA live regions | 4 unit (FE) |
| 2.2: Fast Updates | Optimistic toggle/delete with rollback on failure, `isMutating` per-item tracking | 5 unit (FE) |
| 2.3: Error Recovery | "Try again" button for fetch failures, "Dismiss" for error banners, retry without page reload | 3 unit (FE) |
| 2.4: Error Envelope | `@fastify/cors`, `@fastify/helmet`, CORS origin parsing, error envelope consistency tests | 4 unit (BE) |

**Code review findings applied:** CORS origin parsing hardened (`.trim()` + `.filter(Boolean)`), error envelope tests strengthened with status code assertions.

#### Epic 3: Cross-Device Quality and Release Readiness

| Story | What Was Built | Tests Added |
| --- | --- | --- |
| 3.1: Responsive Layout | `break-words`, `min-w-0` for text overflow, cleaned dark mode CSS conflicts | — |
| 3.2: Accessibility | `focus-visible:ring-2` on all interactive elements, skip-to-content link, `<main>` landmark, ARIA labels | — |
| 3.3: Test Baseline | Validated existing coverage (21 BE unit + 5 integration + 13 FE unit) meets baseline | — |
| 3.4: E2E Baseline | Playwright setup, `playwright.config.ts`, 4 smoke tests covering core CRUD journeys | 4 E2E |
| 3.5: Documentation & CI | Updated README with testing instructions, GitHub Actions CI workflow (`ci.yml`) | — |

### Sprint Status Tracking

The `sprint-status.yaml` file tracked every story through its lifecycle:

```yaml
development_status:
  epic-1: done          # 5/5 stories complete
  epic-2: done          # 4/4 stories complete
  epic-3: done          # 5/5 stories complete
```

All 14 stories reached `done` status with no stories blocked or cancelled.

### How BMAD Added Value During Sprint Execution

1. **Story files provided implementation context:** Each story file included the specific FRs being addressed, acceptance criteria, technical guidance from the architecture doc, and a task checklist. This eliminated ambiguity for the coding agent.

2. **Code reviews caught real issues:** The adversarial review process (not a rubber-stamp) found and fixed:
   - CORS origin parsing vulnerability (whitespace and empty string handling)
   - Missing status code assertions in error envelope tests
   - A lint rule violation requiring careful `eslint-disable` placement

3. **Sprint tracking prevented drift:** The YAML status file provided a single source of truth for progress, preventing stories from being skipped or repeated.

---

## Phase 6: Quality Assurance

### What Happened

After all epics were complete, BMAD's test architecture workflows produced three comprehensive QA reports.

### Reports Produced

#### 1. Traceability & Coverage Report (`bmad-testarch-trace`)

**File:** `_bmad-output/implementation-artifacts/traceability-report.md`

Mapped all 20 testable requirements to their covering tests and identified gaps:

| Priority | Total | Fully Covered | Coverage |
| --- | --- | --- | --- |
| P0 (Critical) | 7 | 5 | 71% |
| P1 (High) | 7 | 3 | 43% |
| P2 (Medium) | 6 | 2 | 33% |
| **Total** | **20** | **10** | **50%** |

**Gate Decision: FAIL** (P0 requires 100%)

**Path to 70% target:** 3 actions adding ~7 tests would bring coverage to 75%:
1. Add `TodoItem.test.tsx` for field display and styling (closes FR5, FR6)
2. Add E2E persistence-across-refresh test (closes FR9)
3. Add multi-viewport E2E tests (closes FR12)

#### 2. Accessibility Report (WCAG 2.1 AA)

**File:** `_bmad-output/implementation-artifacts/accessibility-report.md`

**Assessment: PARTIAL COMPLIANCE**

| Category | Status |
| --- | --- |
| Keyboard Access | ✅ Pass |
| Visible Focus | ✅ Pass |
| Semantic HTML & ARIA | ⚠️ Partial (generic button labels) |
| Text Contrast | ✅ Likely Pass |
| Non-Text Contrast | ⚠️ Concern (active dot may fail 3:1) |
| Automated Testing | ❌ Gap (no axe-core) |

#### 3. Security Review

**File:** `_bmad-output/implementation-artifacts/security-review-report.md`

**Assessment: ACCEPTABLE FOR MVP**

| Category | Status |
| --- | --- |
| Input Validation (Zod) | ✅ Strong (16 test cases) |
| CORS Allowlist | ✅ Good (not tested) |
| Helmet Headers | ✅ Good (not tested) |
| SQL Injection | ✅ Safe (Prisma ORM) |
| XSS Prevention | ✅ Safe (React) |
| Rate Limiting | ❌ Missing |
| Error Info Leakage | ⚠️ Concern in non-production |

### How BMAD Added Value in QA

The traceability workflow revealed that while the app had 51 tests providing strong behavioral coverage, **the coverage was not evenly distributed across requirements**. Specifically:

- Core CRUD operations (FR1–FR4, FR8) had excellent multi-level coverage
- Cross-cutting quality attributes (responsive, accessibility) had zero or partial test coverage
- The gap analysis provided a prioritized, actionable remediation plan with specific test recommendations

Without this structured analysis, the team might have assumed "51 tests = good coverage" without realizing that entire requirement categories (FR12 responsive, NFR6 accessibility) had no automated verification.

---

## Artifacts Index

### Planning Artifacts (`_bmad-output/planning-artifacts/`)

| Artifact | BMAD Workflow | Purpose |
| --- | --- | --- |
| `Product Requirement Document (PRD).pdf` | `bmad-create-prd` | Defines what to build |
| `architecture.md` | `bmad-create-architecture` | Defines how to build it |
| `epics.md` | `bmad-create-epics-and-stories` | Breaks work into stories |
| `implementation-readiness-report-20260320.md` | `bmad-check-implementation-readiness` | Validates readiness |

### Implementation Artifacts (`_bmad-output/implementation-artifacts/`)

| Artifact | BMAD Workflow | Purpose |
| --- | --- | --- |
| `sprint-status.yaml` | `bmad-sprint-planning` | Tracks progress |
| `1-1-*.md` through `3-2-*.md` | `bmad-create-story` + `bmad-dev-story` | Story specs and completion notes |
| `traceability-report.md` | `bmad-testarch-trace` | Requirements-to-tests mapping |
| `accessibility-report.md` | Manual code review | WCAG 2.1 AA assessment |
| `security-review-report.md` | Manual code review | Security posture assessment |

### Source Code Structure

```
todo-app/
├── apps/frontend/          # Next.js UI (7 component/lib files)
├── apps/backend/           # Fastify API (10 source files)
├── e2e/                    # Playwright E2E tests (1 spec file)
├── docker-compose.yml      # Local orchestration
├── .github/workflows/      # CI quality gates
└── _bmad-output/           # All BMAD artifacts
```

---

## Lessons Learned

### What Worked Well

1. **Requirements traceability was maintained throughout.** Every line of code can be traced back to a specific FR/NFR through the story files and epic mappings. This made QA analysis straightforward.

2. **Architecture consistency rules prevented agent drift.** By codifying naming conventions, API formats, and structural patterns in the architecture document, all implementation stories produced code that looks like it was written by one person.

3. **Code reviews caught real issues.** The adversarial review model (Blind Hunter + Edge Case Hunter + Acceptance Auditor) found genuine bugs (CORS parsing, missing assertions) rather than just style nits.

4. **Sprint tracking kept execution on rails.** The `sprint-status.yaml` file provided a clear "what's next" signal, preventing skipped stories or duplicated work.

5. **The readiness check prevented premature coding.** Validating PRD → Architecture → Epics alignment before writing code ensured no wasted implementation effort.

### What Could Be Improved

1. **Test coverage distribution was uneven.** The traceability analysis revealed that while core CRUD had multi-level coverage, responsive and accessibility requirements had zero automated tests. Future projects should include test coverage targets per-requirement in the architecture phase.

2. **Rate limiting was specified in architecture but never implemented.** The security review caught this gap. BMAD's story planning should have included a dedicated story for security middleware or flagged its absence.

3. **No UX design artifact was created.** While the PRD contained sufficient UX requirements for this simple app, a dedicated UX specification would have provided clearer guidance for the accessibility and responsive stories.

4. **QA reports came after all implementation.** Running the traceability analysis after each epic (rather than at the end) would have surfaced coverage gaps earlier, allowing them to be addressed in the same sprint.

### BMAD Workflows Used (In Order)

| Phase | Workflow | Agent Role |
| --- | --- | --- |
| Define | `bmad-create-prd` | Product Manager |
| Design | `bmad-create-architecture` | Architect |
| Plan | `bmad-create-epics-and-stories` | Product Manager |
| Validate | `bmad-check-implementation-readiness` | Analyst |
| Track | `bmad-sprint-planning` | Scrum Master |
| Build | `bmad-create-story` → `bmad-dev-story` | SM → Developer |
| Review | `bmad-code-review` | QA / Developer |
| Assess | `bmad-testarch-trace` | Test Architect |

---

**Generated:** 2026-03-20
**Methodology:** BMAD (Build Measure Analyze Decide)

<!-- Powered by BMAD-CORE™ -->
