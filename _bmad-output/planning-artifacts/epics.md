---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - '/Users/andreacoluzzi/Projects/nearform/bmad/todo-app/Product Requirement Document (PRD) for the Todo App.md'
  - '/Users/andreacoluzzi/Projects/nearform/bmad/todo-app/_bmad-output/planning-artifacts/architecture.md'
---

# todo-app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo-app, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can create a todo by submitting a description between 1 and 120 characters.  
FR2: Users can view all existing todos when the app loads.  
FR3: Users can mark an active todo as completed.  
FR4: Users can delete a todo.  
FR5: Users can see each todo with description, completion state, and creation timestamp.  
FR6: Users can distinguish completed tasks from active tasks using both text styling and a completion indicator.  
FR7: Users can see add/complete/delete results reflected in the list within 300 ms after successful operation response.  
FR8: The system can create, read, update, and delete todo records to support all defined user journeys.  
FR9: Users can refresh or reopen the app and still see previously saved todo state with no data loss.  
FR10: Users can see explicit empty, loading, and error UI states for list and mutation flows.  
FR11: Users can recover from failed operations by retrying the action without needing to reload the page.  
FR12: Users can complete all core journeys on supported viewport ranges (320 px and above) without horizontal scrolling.

### NonFunctional Requirements

NFR1: The MVP includes only listed in-scope capabilities; release scope review must show 0 out-of-scope features added.  
NFR2: In normal load conditions, 95th percentile API-backed user actions complete in 500 ms or less, measured via application telemetry in staging.  
NFR3: Core flows pass manual QA on all defined viewport ranges (320-599, 600-1023, >=1024) and supported browser matrix before release.  
NFR4: Project setup, run, and test instructions can be followed by a new developer in under 30 minutes using project documentation and scripts.  
NFR5: Across 100 consecutive refresh/reopen cycles in staging, todo state persists with 0 data-loss incidents.  
NFR6: Core journeys meet WCAG 2.1 AA checks for keyboard access, visible focus, and non-text contrast in release QA.

### Additional Requirements

- FE/BE split architecture: backend is a separate component (not Next.js module).
- Monorepo structure with `apps/frontend`, `apps/backend`, and optional shared contracts package.
- API boundary contract: REST endpoints under `/api/v1/...`, JSON over HTTP.
- Standardized API error envelope format (`error.code`, `error.message`, optional details).
- Data layer: PostgreSQL plus Prisma with versioned migrations committed to repo.
- Boundary validation: Zod validation at backend API boundaries.
- Security baseline: CORS allowlist, rate limiting on mutation endpoints, secure header middleware defaults.
- Testing baseline from day one:
  - Unit tests: Vitest for FE and BE
  - Integration tests: backend API integration tests
  - E2E tests: Playwright
- Delivery quality gates: lint, typecheck, unit tests, E2E smoke in CI.
- Docker Compose orchestration for FE, BE, and DB as local/dev baseline.
- Naming and format consistency rules:
  - API payload fields in `snake_case`
  - ISO-8601 UTC date strings
  - Shared response wrappers for success/error
- Explicit component boundaries:
  - FE: rendering, local state, user interaction flows
  - BE: domain logic, persistence, validation, error contract

### UX Design Requirements

No dedicated UX design document was provided for extraction at this step.

### FR Coverage Map

FR1: Epic 1 - Create todo with validated description length  
FR2: Epic 1 - View existing todos on load  
FR3: Epic 1 - Mark todo as completed  
FR4: Epic 1 - Delete todo  
FR5: Epic 1 - Display todo fields (description/state/timestamp)  
FR6: Epic 2 - Clear completed vs active visual distinction  
FR7: Epic 2 - Fast visible UI update after operations  
FR8: Epic 1 - Backend CRUD support for journeys  
FR9: Epic 1 - Persistence across refresh/reopen  
FR10: Epic 2 - Empty/loading/error state UX  
FR11: Epic 2 - Retry/recovery behavior on failure  
FR12: Epic 3 - Supported viewport usability without horizontal scrolling

## Epic List

### Epic 1: Core Todo Management
Users can create, view, complete, and delete todos with persistent data across sessions.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR8, FR9

### Epic 2: Interaction Feedback and Recovery
Users get clear state feedback (empty/loading/error), fast visible updates, and retry-safe recovery when operations fail.
**FRs covered:** FR6, FR7, FR10, FR11

### Epic 3: Cross-Device Quality and Release Readiness
Users can reliably use the app across supported devices/browsers with accessibility and quality standards enforced from day one.
**FRs covered:** FR12

## Epic 1: Core Todo Management

Users can create, view, complete, and delete todos with persistent data across sessions.

### Story 1.1: Set Up Initial Project from Starter Template

As a developer,  
I want to initialize the project from the approved starter template and establish the monorepo skeleton,  
So that feature development starts on a stable architectural foundation.

**Requirements covered:** Additional Requirements (starter template, monorepo structure), NFR4

**Acceptance Criteria:**

**Given** the architecture-approved starter command is available  
**When** the initial project setup is executed  
**Then** the frontend starter app is created using `create-next-app` and integrated into monorepo structure  
**And** `apps/frontend`, `apps/backend`, and `packages/shared` exist with runnable entry points and workspace configuration.

### Story 1.2: Implement Todo Data Model and Persistence Layer

As a developer,  
I want a persisted todo model in PostgreSQL with Prisma migrations,  
So that todo records are durable and consistently retrievable.

**Requirements covered:** FR5, FR8, FR9, Additional Requirements (PostgreSQL, Prisma), NFR5

**Acceptance Criteria:**

**Given** the backend service is running with DB connectivity  
**When** the initial migration is applied  
**Then** a `todos` table exists with required fields (`id`, `description`, `is_completed`, `created_at`)  
**And** repository-level data access supports create/read/update/delete operations for todos.

### Story 1.3: Expose Todo CRUD API Endpoints

As a user,  
I want backend endpoints that support creating, listing, updating completion state, and deleting todos,  
So that the frontend can perform all core task actions.

**Requirements covered:** FR1, FR2, FR3, FR4, FR8

**Acceptance Criteria:**

**Given** valid requests to `/api/v1/todos` endpoints  
**When** CRUD actions are invoked  
**Then** responses follow the agreed success/error envelope format  
**And** API behavior covers FR1, FR2, FR3, FR4, and FR8 use cases.

### Story 1.4: Build Todo List UI and Core Interactions

As a user,  
I want to create, view, complete, and delete todos in the frontend,  
So that I can manage my tasks end to end.

**Requirements covered:** FR1, FR2, FR3, FR4, FR5

**Acceptance Criteria:**

**Given** the frontend is connected to backend APIs  
**When** the user performs create/view/complete/delete actions  
**Then** the UI reflects todo description, completion state, and creation timestamp  
**And** interactions align with FR1, FR2, FR3, FR4, and FR5.

### Story 1.5: Verify Persistence Across Refresh and Reopen

As a user,  
I want my todo state preserved after refresh or reopening the app,  
So that I do not lose my task data.

**Requirements covered:** FR9, NFR5

**Acceptance Criteria:**

**Given** todos have been created or updated  
**When** the user refreshes the page or restarts the app session  
**Then** previously saved todos are still present  
**And** persistence behavior satisfies FR9 and NFR5 durability expectations.

## Epic 2: Interaction Feedback and Recovery

Users get clear state feedback (empty/loading/error), fast visible updates, and retry-safe recovery when operations fail.

### Story 2.1: Implement Empty, Loading, and Error UI States

As a user,  
I want clear UI feedback while data loads or fails,  
So that I always understand the current app state.

**Requirements covered:** FR10

**Acceptance Criteria:**

**Given** list and mutation flows in the frontend  
**When** data is empty, loading, or request errors occur  
**Then** explicit empty/loading/error states are shown  
**And** state handling satisfies FR10.

### Story 2.2: Add Fast Update and Visual Completion Feedback

As a user,  
I want operation results and completion styling to appear quickly and clearly,  
So that task status changes are obvious and immediate.

**Requirements covered:** FR6, FR7, NFR2

**Acceptance Criteria:**

**Given** a successful add/complete/delete operation  
**When** the frontend receives confirmation  
**Then** the visible list updates within defined latency targets  
**And** completed items are distinguishable using styling plus completion indicator per FR6 and FR7.

### Story 2.3: Add Retry-Safe Error Recovery for Mutations

As a user,  
I want to retry failed actions without reloading the page,  
So that temporary failures do not block my workflow.

**Requirements covered:** FR11

**Acceptance Criteria:**

**Given** a mutation request fails  
**When** the user chooses retry  
**Then** the operation can be retried from the current screen state  
**And** behavior satisfies FR11 with standardized API error handling.

### Story 2.4: Enforce API Error Envelope and Input Validation

As a developer,  
I want backend validation and consistent error envelopes for all todo endpoints,  
So that frontend recovery logic is deterministic and reliable.

**Requirements covered:** Additional Requirements (error envelope, boundary validation, security baseline)

**Acceptance Criteria:**

**Given** valid and invalid API requests  
**When** endpoints process input  
**Then** input is validated at API boundaries and invalid requests return structured error envelopes  
**And** error format remains consistent across all todo operations.

## Epic 3: Cross-Device Quality and Release Readiness

Users can reliably use the app across supported devices/browsers with accessibility and quality standards enforced from day one.

### Story 3.1: Apply Responsive Layout Across Supported Viewports

As a user,  
I want to use the Todo app on mobile, tablet, and desktop without layout breakage,  
So that task management works consistently across devices.

**Requirements covered:** FR12, NFR3

**Acceptance Criteria:**

**Given** supported viewport ranges (320-599, 600-1023, >=1024)  
**When** core journeys are executed on each range  
**Then** no horizontal scrolling is required for core flows  
**And** responsive behavior satisfies FR12 and NFR3.

### Story 3.2: Implement Accessibility Baseline (WCAG 2.1 AA)

As a keyboard and assistive technology user,  
I want accessible interactions for all core todo actions,  
So that I can complete journeys without accessibility barriers.

**Requirements covered:** NFR6

**Acceptance Criteria:**

**Given** core create/view/complete/delete journeys  
**When** accessibility checks are executed  
**Then** keyboard operability, visible focus, and required contrast rules pass baseline checks  
**And** release quality satisfies NFR6 requirements.

### Story 3.3: Establish Unit and Integration Test Baseline

As a developer,  
I want FE and BE unit tests plus backend integration tests in place from the start,  
So that regressions are caught early and implementation stays stable.

**Requirements covered:** Additional Requirements (Vitest baseline, integration tests), NFR4

**Acceptance Criteria:**

**Given** Vitest-based test setup in frontend and backend  
**When** test suites are executed  
**Then** representative tests cover core todo behaviors and backend API logic  
**And** test execution is integrated into workspace scripts and CI gating.

### Story 3.4: Establish E2E and Local Orchestration Baseline

As a developer,  
I want Playwright E2E tests and Docker Compose orchestration for FE/BE/DB,  
So that end-to-end behavior can be validated in a realistic environment.

**Requirements covered:** Additional Requirements (Playwright, Docker Compose), NFR4

**Acceptance Criteria:**

**Given** docker-compose services for frontend, backend, and database  
**When** the local stack is started and E2E smoke tests run  
**Then** core journeys pass through the full FE->BE->DB flow  
**And** the baseline supports CI smoke execution.

### Story 3.5: Document Run/Test Workflow and CI Quality Gates

As a new developer,  
I want clear run/test documentation and enforced CI checks,  
So that I can contribute quickly while maintaining project quality standards.

**Requirements covered:** NFR1, NFR4, Additional Requirements (CI quality gates)

**Acceptance Criteria:**

**Given** project documentation and CI workflow configuration  
**When** a developer follows setup instructions  
**Then** they can run the project and tests successfully within onboarding constraints  
**And** CI enforces lint, typecheck, unit tests, and E2E smoke checks before merge.

