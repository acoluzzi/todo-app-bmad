---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '/Users/andreacoluzzi/Projects/nearform/bmad/todo-app/Product Requirement Document (PRD) for the Todo App.md'
  - '/Users/andreacoluzzi/Projects/nearform/bmad/todo-app/validation-report-20260320-112038.md'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-03-20T11:48:26Z'
project_name: 'todo-app'
user_name: 'Andrea'
date: '2026-03-20T11:20:38Z'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The product requires a focused, single-user Todo capability set: create, view, complete, and delete tasks, plus robust state handling (empty/loading/error), persistence across sessions, and responsive usability from 320px upward. Architecturally, this implies:
- A clear task domain model with stable identifiers and timestamps
- A predictable application state model for list and mutation flows
- API/application service capabilities aligned directly to user journeys
- Explicit handling of update propagation to keep interaction latency low

**Non-Functional Requirements:**
The architecture must satisfy measurable quality constraints:
- Performance: p95 user actions <= 500ms under normal load
- Reliability: 0 data-loss in repeated refresh/reopen validation runs
- Responsiveness: core flows verified across defined breakpoints and supported browser matrix
- Accessibility: WCAG 2.1 AA for key journeys
- Maintainability: developer onboarding/run/test experience <= 30 minutes with project docs/scripts

These NFRs are first-class architecture drivers, not secondary implementation notes.

**Scale and Complexity:**
The system is a low-to-medium complexity full-stack web application with minimal feature breadth but strict quality expectations.

- Primary domain: full-stack web app
- Complexity level: low-to-medium
- Estimated architectural components: 5-7 core components (UI app shell, task interaction layer, API/service layer, persistence layer, quality/observability support)

### Technical Constraints and Dependencies

- MVP is single-user and intentionally excludes auth/collaboration
- Responsive support required for 320px+ viewport range
- Browser support matrix must be respected in design/testing strategy
- SEO is minimal for MVP, but baseline metadata handling is still required
- Architecture should preserve extension seams for future auth and multi-user support
- No special regulated-domain compliance sections required for MVP

### Cross-Cutting Concerns Identified

- Error and retry handling consistency across all mutation/read flows
- End-to-end latency budget enforcement for user-visible actions
- Data durability guarantees across refresh and reopen scenarios
- Accessibility as a systemic requirement (not component-by-component afterthought)
- Traceability from user journeys to architecture components to implementation artifacts

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application based on project requirements and quality constraints (performance, accessibility, responsive support, maintainability).

### Starter Options Considered

1. **Next.js (`create-next-app`)**
   - Strong full-stack baseline (UI + server routes in one codebase)
   - TypeScript, linting, app router, and modern build tooling out of the box
   - Good fit for MVP speed plus future expansion (auth/multi-user)

2. **Vite + React TypeScript**
   - Excellent frontend DX and performance
   - Requires separate backend/API setup for full-stack needs
   - Better when backend architecture is intentionally split from day one

3. **Remix / React Router framework starters**
   - Strong routing/data loading model
   - Good option, but team familiarity and ecosystem momentum often favors Next.js for this project profile

4. **create-t3-app**
   - Powerful opinionated stack for TypeScript-heavy teams
   - Potentially heavier than needed for this MVP

### Selected Starter: create-next-app (Next.js)

**Rationale for Selection:**
- Matches full-stack requirements with minimal setup overhead
- Reduces architectural fragmentation for MVP
- Provides modern defaults aligned with maintainability and developer onboarding goals
- Keeps extension seams open for future auth, multi-user support, and richer domain features

**Initialization Command:**

```bash
npx create-next-app@latest todo-app --typescript --eslint --tailwind --app --src-dir --use-npm
```

**Architectural Decisions Provided by Starter:**

**Language and Runtime:**
TypeScript-first React/Node setup with current Next.js runtime conventions.

**Styling Solution:**
Tailwind CSS preconfigured for rapid UI implementation and consistent utility-first styling.

**Build Tooling:**
Modern Next.js build pipeline and development server with production optimization defaults.

**Testing Framework:**
No full test suite scaffold by default; architecture should define unit/integration/e2e tooling in later decisions.

**Code Organization:**
`src/`-based structure with App Router conventions, clear route/component boundaries.

**Development Experience:**
Fast local dev server, linting defaults, TypeScript checks, and straightforward onboarding workflow.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- FE/BE split architecture with separate backend service (no Next.js API module as primary BE)
- PostgreSQL as system of record
- Prisma ORM for data access and migrations
- REST API contract between frontend and backend
- Test strategy from day one (Vitest for unit tests, Playwright for E2E)
- Docker Compose orchestration for FE, BE, and DB services

**Important Decisions (Shape Architecture):**
- Error contract and retry semantics
- Input validation and security middleware baseline
- Deployment model (separate FE and BE components)
- CI quality gates and test execution strategy

**Deferred Decisions (Post-MVP):**
- Authentication provider selection and user identity model
- Distributed caching layer
- Service decomposition beyond single backend API service

### Data Architecture

- **Database:** PostgreSQL `18.x` (current stable line)
- **ORM:** Prisma `7.5.x`
- **Schema approach:** relational model centered on `todos` table, with extension fields reserved for future user ownership
- **Validation:** Zod at API boundaries for request/response validation
- **Migrations:** Prisma Migrate with versioned SQL migrations committed to repo
- **Caching:** no distributed cache in MVP; use query optimization and selective response caching only when needed

### Authentication & Security

- **Auth model (MVP):** deferred by product scope (single-user mode)
- **Security baseline now:**
  - strict input validation on all mutation endpoints
  - centralized error handling with safe error envelopes
  - CORS allowlist policy for frontend origin(s)
  - lightweight rate limiting for mutation endpoints
  - secure header middleware defaults
- **Future seam:** backend service boundaries remain auth-ready for later user/account introduction

### API & Communication Patterns

- **Frontend-backend communication:** HTTP/JSON over explicit REST endpoints
- **API style:** REST with versioned route namespace (`/api/v1/...`) in backend service
- **Error format:** standardized envelope (`code`, `message`, optional `details`)
- **Idempotency expectations:** safe retries for read operations and controlled retries for writes
- **Documentation:** lightweight API contract docs in repo for MVP; OpenAPI generation can be added later

### Frontend Architecture

- **Framework:** Next.js app (UI layer only)
- **State management:** local/component-first state for MVP, escalate to global state only when complexity proves need
- **Data fetching:** typed client calls to backend API with explicit loading/error states
- **Accessibility:** WCAG 2.1 AA compliance patterns baked into core components
- **Responsive strategy:** layout behavior validated across defined breakpoints and browser matrix

### Infrastructure & Deployment

- **Component topology:** separate FE and BE services plus managed PostgreSQL
- **Container orchestration:** Docker Compose for local development and orchestration of FE + BE + DB
- **Runtime baseline:** Node.js `24.x` LTS for FE/BE parity
- **Hosting strategy:** separate FE and BE deployables; backend can be container-hosted independent of frontend hosting platform
- **CI/CD baseline:** lint + typecheck + unit tests + E2E smoke as required quality gates

### Testing Strategy Decisions

- **Unit tests (FE + BE):** Vitest `4.1.x` as primary unit runner
- **E2E tests:** Playwright (`@playwright/test` `1.50.x` line) from project start
- **Integration tests (BE):** Vitest-driven API integration tests against test database
- **Test execution tiers:**
  - PR: lint, typecheck, unit tests, E2E smoke
  - Main/nightly: full E2E suite

### Decision Impact Analysis

**Implementation Sequence:**
1. Scaffold frontend (Next.js)
2. Scaffold backend service (separate API component)
3. Add Docker Compose for FE/BE/DB orchestration
4. Implement shared API contract and domain model
5. Wire unit/integration/E2E test baselines before feature expansion

**Cross-Component Dependencies:**
- Frontend depends on backend API contract and availability
- Backend depends on database schema/migrations
- E2E stability depends on Compose startup ordering and service health checks
- Security and error contracts must stay consistent across FE and BE boundaries

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 areas where AI agents could make different choices

### Naming Patterns

**Database Naming Conventions:**
- Tables: `snake_case` plural (for example `todos`)
- Columns: `snake_case` (for example `created_at`, `is_completed`)
- Primary keys: `id` (UUID)
- Foreign keys: `<entity>_id` (for example `user_id`)
- Indexes: `idx_<table>_<column>` (for example `idx_todos_created_at`)

**API Naming Conventions:**
- REST resources: plural lowercase paths (for example `/api/v1/todos`)
- Route params: `/:id` format
- Query params: `snake_case` (for example `created_before`)
- Headers: standard headers plus `X-Request-Id` for traceability

**Code Naming Conventions:**
- TypeScript variables/functions: `camelCase`
- TS types/interfaces/components: `PascalCase`
- File names: `kebab-case` for feature files, `PascalCase` for React component files
- Test files: `<name>.test.ts` or `<name>.spec.ts` consistently per package

### Structure Patterns

**Project Organization:**
- Monorepo layout:
  - `apps/frontend` (Next.js UI)
  - `apps/backend` (API service)
  - `packages/shared` (types/contracts/validation if shared)
- Feature-first organization inside each app where practical
- Services/repositories separated in backend (`routes` -> `service` -> `repository`)

**File Structure Patterns:**
- FE tests co-located with source for unit/component tests
- BE unit tests co-located; integration tests in dedicated `tests/integration`
- E2E tests in top-level `tests/e2e`
- Infrastructure files at repo root (`docker-compose.yml`, `.env.example`, CI config)

### Format Patterns

**API Response Formats:**
- Success:
  - Reads: `{ "data": ... }`
  - Mutations: `{ "data": ..., "meta": { "request_id": "..." } }`
- Error:
  - `{ "error": { "code": "TODO_NOT_FOUND", "message": "...", "details": {} } }`

**Data Exchange Formats:**
- API payload fields: `snake_case`
- FE internal models can use `camelCase` with explicit mapping layer
- Date/time: ISO-8601 UTC strings in API (`created_at`)
- Booleans: `true/false` only

### Communication Patterns

**Event System Patterns (MVP-light):**
- Internal domain events named `<entity>.<action>` (for example `todo.created`)
- Event payload includes `event_name`, `occurred_at`, `request_id`, and `data`

**State Management Patterns:**
- FE local state first, avoid global store unless a clear need emerges
- Async operations modeled as `idle|loading|success|error`
- Mutations must always define retry behavior and user-visible error state

### Process Patterns

**Error Handling Patterns:**
- Backend maps domain/validation errors to standardized error envelope
- No raw stack traces in API responses
- FE shows actionable user messages and retry option where safe
- Structured logging with request correlation (`request_id`) across FE -> BE

**Loading State Patterns:**
- Every async UI action must expose loading and terminal state
- Loading indicators should be scoped to affected UI area when possible
- No silent failures; errors must be represented in UI state

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming conventions exactly across FE, BE, DB, and tests
- Use shared API/error envelope shapes and ISO date formatting
- Add/update tests alongside behavior changes (unit plus integration/E2E as appropriate)

**Pattern Enforcement:**
- PR checks enforce lint, typecheck, unit tests, and E2E smoke
- Contract drift is a blocker (API shape changes require shared contract update)
- Pattern changes must be documented in architecture artifacts before adoption

### Pattern Examples

**Good Examples:**
- `GET /api/v1/todos` -> `{ "data": [{ "id": "...", "description": "...", "created_at": "..." }] }`
- Backend file split: `todo.route.ts`, `todo.service.ts`, `todo.repository.ts`
- FE mutation flow sets `loading` then handles success/error explicitly

**Anti-Patterns:**
- Mixing `camelCase` and `snake_case` in API payload fields
- Returning ad-hoc error objects without `error.code`
- Creating backend logic inside Next.js route handlers when BE is a separate component
- Adding features without corresponding tests

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
todo-app/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── apps/
│   ├── frontend/
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.ts
│   │   ├── vitest.config.ts
│   │   ├── playwright.config.ts
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── globals.css
│   │   │   ├── components/
│   │   │   │   ├── todo/
│   │   │   │   └── ui/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── env.ts
│   │   │   │   └── mappers.ts
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── test/
│   │   └── public/
│   └── backend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.ts
│       │   ├── config/
│       │   │   ├── env.ts
│       │   │   └── logger.ts
│       │   ├── middleware/
│       │   │   ├── cors.ts
│       │   │   ├── rate-limit.ts
│       │   │   └── error-handler.ts
│       │   ├── modules/
│       │   │   └── todos/
│       │   │       ├── todo.route.ts
│       │   │       ├── todo.service.ts
│       │   │       ├── todo.repository.ts
│       │   │       ├── todo.schema.ts
│       │   │       └── todo.types.ts
│       │   └── test/
│       │       ├── unit/
│       │       └── integration/
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
├── packages/
│   └── shared/
│       ├── package.json
│       └── src/
│           ├── api-contracts/
│           ├── schemas/
│           └── utils/
├── tests/
│   └── e2e/
│       ├── todo.spec.ts
│       ├── fixtures/
│       └── support/
├── .github/
│   └── workflows/
│       └── ci.yml
└── _bmad-output/
    └── planning-artifacts/
        └── architecture.md
```

### Architectural Boundaries

**API Boundaries:**
- External FE->BE contract: `/api/v1/todos` endpoints only
- No business logic in FE route handlers
- Validation at BE boundary via Zod schemas

**Component Boundaries:**
- FE handles rendering, interaction state, and optimistic UI
- BE handles domain logic, validation, persistence, and error envelopes
- Shared package contains contracts/schemas only, no runtime side effects

**Service Boundaries:**
- Backend layering: `route -> service -> repository`
- Repository is sole DB access layer
- Service layer enforces domain rules and idempotency behavior

**Data Boundaries:**
- PostgreSQL is system of record
- Prisma is the only ORM/DB access mechanism
- API payloads are `snake_case`; FE maps to internal `camelCase` as needed

### Requirements to Structure Mapping

**Feature Mapping (Todos):**
- FE components: `apps/frontend/src/components/todo/`
- FE API integration: `apps/frontend/src/lib/api-client.ts`
- BE routes/services/repository: `apps/backend/src/modules/todos/`
- DB schema/migrations: `apps/backend/prisma/`
- Unit/integration tests: co-located in FE/BE test directories
- E2E tests: `tests/e2e/todo.spec.ts`

**Cross-Cutting Concerns:**
- Error handling: `apps/backend/src/middleware/error-handler.ts` and FE error state handling
- Request tracing: BE middleware and response meta (`request_id`)
- Accessibility patterns: FE `ui/` primitives and test assertions
- Runtime config/env: `apps/*/src/config/env.ts` and root `.env.example`

### Integration Points

**Internal Communication:**
- FE calls BE over HTTP using typed client wrapper
- Shared contracts package ensures request/response consistency

**External Integrations:**
- Managed PostgreSQL as BE dependency
- Optional logging/monitoring providers integrated at BE middleware layer

**Data Flow:**
1. FE action triggers API client call
2. BE route validates input and invokes service
3. Service executes domain logic and repository operation
4. Repository persists/query data via Prisma
5. BE returns standardized success/error envelope
6. FE maps response and updates UI state

### File Organization Patterns

**Configuration Files:**
- Root: workspace, compose, CI, env template
- App-level: framework/test/tool configs
- Backend config centralized under `src/config`

**Source Organization:**
- FE by UI feature and shared UI primitives
- BE by domain module with strict layer boundaries
- Shared contracts isolated in `packages/shared`

**Test Organization:**
- Unit tests near source where possible
- Backend integration tests in `apps/backend/src/test/integration`
- Cross-app E2E in top-level `tests/e2e`

**Asset Organization:**
- FE static assets in `apps/frontend/public`
- Test fixtures under `tests/e2e/fixtures`

### Development Workflow Integration

**Development Server Structure:**
- Docker Compose orchestrates `frontend`, `backend`, `db`
- Local dev can also run per-app scripts when containerization is not required

**Build Process Structure:**
- Each app builds independently
- Shared package builds first when contracts change
- CI enforces lint/typecheck/unit and E2E smoke before merge

**Deployment Structure:**
- FE and BE deploy as separate components
- DB remains managed service
- Environment-specific configs injected per component

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All major decisions are compatible and non-contradictory:
- FE/BE split aligns with separate deployment and Docker Compose orchestration
- Next.js frontend, separate backend component, PostgreSQL, and Prisma are compatible
- Vitest and Playwright strategy aligns with monorepo and CI quality gates

**Pattern Consistency:**
Implementation patterns support the architecture:
- Naming conventions are consistent across DB, API, and code
- API format rules align with FE/BE boundary decisions
- Error/loading/retry process patterns reinforce cross-cutting concerns from project context

**Structure Alignment:**
Project structure supports all decisions:
- Explicit component boundaries (`apps/frontend`, `apps/backend`, `packages/shared`)
- Test locations align with agreed unit/integration/E2E strategy
- Infrastructure files at root support Docker Compose and CI workflows

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
No epics were provided; feature-level mapping is complete for Todo CRUD plus state handling and resilience concerns.

**Functional Requirements Coverage:**
All PRD functional requirements are architecturally supported:
- CRUD and persistence handled by BE API plus DB layer
- Empty/loading/error and retry behavior supported by FE patterns and BE error contract
- Responsive and accessibility requirements represented in FE architecture and validation strategy

**Non-Functional Requirements Coverage:**
NFRs are covered architecturally:
- Performance: API/service boundaries and test gates support p95 targets
- Reliability: persistence strategy plus migration discipline plus integration tests
- Maintainability: monorepo structure, consistency rules, CI gates
- Accessibility: explicit FE pattern requirements
- Responsiveness/browser support: project structure and testing strategy include these concerns

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions are documented with versions/ranges and rationale.

**Structure Completeness:**
Concrete project tree, boundaries, integration points, and data flow are all defined.

**Pattern Completeness:**
Major AI conflict points are addressed (naming, structure, format, communication, process).

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps (Non-blocking):**
- Backend framework final lock (Fastify vs Nest vs Express) should be explicitly written as final selected framework label.
- FE/BE local startup scripts should be explicitly named (`dev:frontend`, `dev:backend`, `dev:all`) in implementation docs.

**Nice-to-Have Gaps:**
- Add a compact API endpoint matrix table in architecture appendix.
- Add an initial DB schema snippet for `todos` and migration naming examples.

### Validation Issues Addressed

- Confirmed FE/BE split supersedes any implicit Next.js full-stack assumption.
- Confirmed testing is first-class from project start (Vitest plus Playwright).
- Confirmed Docker Compose is part of baseline architecture, not an optional add-on.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clear FE/BE separation with explicit boundaries
- Strong consistency rules for multi-agent implementation
- Testing and orchestration included from day one
- Coherent mapping from PRD requirements to technical structure

**Areas for Future Enhancement:**
- Add optional observability stack details (metrics/tracing) once traffic profile is known
- Add auth architecture extension section when moving beyond MVP scope

### Implementation Handoff

**AI Agent Guidelines:**
- Follow architecture decisions and consistency rules exactly
- Keep BE logic out of frontend route handlers
- Enforce API contract and error envelope formats
- Add tests with every behavior change

**First Implementation Priority:**
Initialize monorepo and scaffold FE plus BE plus DB orchestration with Docker Compose, then establish contracts and test baselines before feature implementation.
