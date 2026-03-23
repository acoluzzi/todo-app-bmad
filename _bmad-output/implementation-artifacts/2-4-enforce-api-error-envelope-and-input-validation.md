# Story 2.4: Enforce API Error Envelope and Input Validation

Status: done

## Story

As a developer,
I want backend validation and consistent error envelopes for all todo endpoints,
so that frontend recovery logic is deterministic and reliable.

## Acceptance Criteria

1. **Given** valid and invalid API requests
   **When** endpoints process input
   **Then** input is validated at API boundaries and invalid requests return structured error envelopes.

2. **Given** any error response from any todo operation
   **When** the frontend parses the response
   **Then** error format (`{ error: { code, message, details? } }`) remains consistent across all endpoints.

3. **Given** the architecture security baseline
   **When** the backend is deployed
   **Then** CORS allowlist and secure header defaults are configured.

## Tasks / Subtasks

- [x] Verify existing Zod validation covers all mutation endpoints (POST, PATCH, DELETE)
- [x] Verify error envelope consistency across all error paths (validation, not-found, server error, body parsing)
- [x] Add missing edge case tests for validation hardening
- [x] Configure CORS plugin per architecture spec
- [x] Configure helmet plugin for secure header defaults
- [x] Verify workspace checks

## Dev Notes

### Existing Coverage

- `todo.schema.ts`: Zod schemas for create (description string, trim, min 1, max 120), update (is_completed boolean), id params (uuid).
- `todo.route.ts`: All endpoints use `safeParse` + `formatZodError` for validation errors, `notFoundEnvelope` for 404s.
- `error-handler.ts`: Global handler for body parsing errors, 4xx, 5xx with consistent envelope format.
- `todo.route.test.ts`: 17 tests covering main validation paths.

### Scope Boundaries

- Do NOT add rate limiting (deferred to production hardening).
- Do NOT modify frontend code.

## Dev Agent Record

### Completion Notes List

- Existing Zod validation and error envelopes already covered all endpoints. No implementation gaps found.
- Added `@fastify/cors` with configurable `CORS_ORIGIN` env var (defaults to `http://localhost:3000`).
- Added `@fastify/helmet` for secure HTTP header defaults (X-Frame-Options, CSP, etc.).
- Added 4 new edge case tests: POST with no body, PATCH with empty body, PATCH with null is_completed, error envelope shape consistency test.
- Backend test suite now at 21 unit tests (up from 17). All pass.

### File List

- `apps/backend/src/app.ts` — registered CORS and helmet plugins
- `apps/backend/src/test/unit/todo.route.test.ts` — 4 new edge case tests
- `apps/backend/package.json` — added `@fastify/cors` and `@fastify/helmet` dependencies

## Change Log

- 2026-03-20: Created Story 2.4 for error envelope and validation hardening.
