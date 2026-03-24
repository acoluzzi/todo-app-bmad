# Security Review Report — Todo App

**Project:** Todo App
**Date:** 2026-03-20
**Scope:** Backend API, frontend client, infrastructure configuration
**Method:** Static code review and configuration analysis

---

## Executive Summary

The application implements a **reasonable security baseline** for an MVP: input validation at API boundaries via Zod, CORS origin allowlisting, Helmet secure headers, and a centralized error handler that suppresses internal details in production. No authentication/authorization is required by the PRD. Key areas for improvement include adding rate limiting, strengthening error information leakage controls, and adding security-focused test coverage.

**Overall Assessment:** ⚠️ ACCEPTABLE FOR MVP — Good foundations with identified hardening opportunities.

---

## 1. Input Validation

### 1.1 Backend Zod Validation ✅ STRONG

All API input is validated at the boundary before reaching business logic:

**POST /api/v1/todos:**

```3:9:apps/backend/src/modules/todos/todo.schema.ts
export const createTodoSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Description must be at least 1 character")
    .max(120, "Description must be at most 120 characters")
});
```

- Type validation: `z.string()` rejects non-string types
- Length boundaries: min 1, max 120 characters
- Whitespace normalization: `.trim()` prevents whitespace-only input
- Applied via `safeParse()` with structured error response on failure

**PATCH /api/v1/todos/:id:**

- `is_completed`: `z.boolean()` — rejects null, string, number
- `id`: `z.string().uuid()` — rejects non-UUID path parameters

**DELETE /api/v1/todos/:id:**

- `id`: `z.string().uuid()` — same validation

**Test coverage:** 16 validation test cases covering empty, whitespace, too long, wrong type, missing field, missing body, null values, invalid UUID, and malformed JSON. ✅

### 1.2 Frontend Client-Side Validation ✅ DEFENSE IN DEPTH

```17:27:apps/frontend/src/components/todo/TodoForm.tsx
const trimmedDescription = description.trim();
if (trimmedDescription.length < 1) {
  setErrorMessage("Enter a todo description.");
  return;
}
if (trimmedDescription.length > 120) {
  setErrorMessage("Todo descriptions must be 120 characters or less.");
  return;
}
```

- Client-side validation mirrors backend rules (trim, 1–120 chars)
- Prevents unnecessary API calls for invalid input
- Backend validation remains the authoritative boundary

### 1.3 Missing: Request Body Size Limit ⚠️ CONCERN

- Fastify's default body size limit is 1 MiB (`bodyLimit: 1048576`)
- No explicit override configured — default is adequate for this app
- **Recommendation:** Consider adding explicit `bodyLimit` in Fastify options for documentation clarity

---

## 2. CORS Configuration

### 2.1 Origin Allowlist ✅ GOOD

```14:17:apps/backend/src/app.ts
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN?.trim() || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
```

- Origins parsed from `CORS_ORIGIN` env var with proper trimming and filtering
- Defaults to `http://localhost:3000` for local development
- Applied via `@fastify/cors` with explicit method allowlist

### 2.2 Method Restriction ✅ GOOD

```31:31:apps/backend/src/app.ts
app.register(cors, { origin: ALLOWED_ORIGINS, methods: ["GET", "POST", "PATCH", "DELETE"] });
```

- Only necessary HTTP methods are allowed
- HEAD, OPTIONS handled implicitly by the CORS plugin

### 2.3 Missing: Credentials Configuration ⚠️ LOW

- `credentials` option not set (defaults to `false`)
- Acceptable since no auth cookies/tokens are used
- If auth is added later, `credentials: true` and specific origins (no wildcards) will be needed

### 2.4 Missing: CORS Test Coverage ❌ GAP

- No test verifies CORS headers appear on responses
- No test verifies cross-origin rejection
- **Recommendation:** Add 2 unit tests:
  1. Request from allowed origin → `Access-Control-Allow-Origin` header present
  2. Request from disallowed origin → header absent or request rejected

---

## 3. Secure Headers (Helmet)

### 3.1 Helmet Configuration ✅ GOOD

```32:32:apps/backend/src/app.ts
app.register(helmet, { global: true });
```

- `@fastify/helmet` registered with `global: true`
- Default Helmet configuration sets:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN` (via `frameguard`)
  - `X-XSS-Protection: 0` (deprecated, correctly disabled)
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` (restrictive default)
  - `X-Download-Options: noopen`
  - `X-Permitted-Cross-Domain-Policies: none`
  - `Referrer-Policy: no-referrer`

### 3.2 CSP Considerations ⚠️ NEEDS REVIEW

- Default Helmet CSP is very restrictive (`default-src 'self'`)
- The frontend is a separate Next.js app making API calls — CSP only applies to API responses
- If the backend ever serves HTML (e.g., documentation), CSP may need tuning
- **Current risk:** None — API responses are JSON

### 3.3 Missing: Helmet Test Coverage ❌ GAP

- No test verifies security headers are present on responses
- **Recommendation:** Add a unit test asserting key headers (`X-Content-Type-Options`, `Strict-Transport-Security`) are set on a sample response

---

## 4. Error Handling & Information Leakage

### 4.1 Centralized Error Handler ✅ GOOD

```7:47:apps/backend/src/middleware/error-handler.ts
export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): void => {
  const isProduction = process.env.NODE_ENV === "production";
  // ...
  reply.status(500).send({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isProduction ? "Internal server error" : error.message
    }
  });
};
```

- Production mode suppresses internal error messages → good ✅
- Development mode exposes full error messages for debugging
- Structured error envelope used consistently

### 4.2 Information Leakage — Development vs Production ⚠️ CONCERN

- **Issue:** In non-production mode, raw error messages (including potential stack traces, database error details) are returned to the client
- **Current state:** `isProduction` check uses `process.env.NODE_ENV === "production"`
- **Risk:** If `NODE_ENV` is not explicitly set to `"production"` in deployed environments, internal details leak
- **Severity:** Low for MVP (expected local/dev use), Medium if deployed
- **Recommendation:** Default to suppressing details unless explicitly in development mode:

```typescript
const isDevelopment = process.env.NODE_ENV === "development";
message: isDevelopment ? error.message : "Internal server error"
```

### 4.3 Validation Error Details ✅ ACCEPTABLE

- Validation errors expose field paths and messages — this is expected and useful for client-side form handling
- Body parsing errors in production show generic message: `"Request body must contain valid JSON."` ✅
- Not-found errors include the requested ID: `Todo with id "..." not found` — acceptable, no sensitive data

### 4.4 Error Envelope Consistency ✅ TESTED

- Dedicated test verifying consistent envelope structure across validation, not-found, and server errors
- Status codes are asserted alongside envelope shape

---

## 5. Rate Limiting

### 5.1 Status: NOT IMPLEMENTED ⚠️ CONCERN

- The architecture document specifies "rate limiting on mutation endpoints" as a requirement
- No `@fastify/rate-limit` or equivalent is installed or configured
- **Risk:** API is susceptible to:
  - Excessive todo creation (storage exhaustion)
  - Rapid toggle/delete operations (database load)
- **Severity:** Medium for MVP, High if publicly deployed
- **Recommendation:** Install `@fastify/rate-limit` with sensible defaults:

```typescript
app.register(rateLimit, {
  max: 100,      // requests per window
  timeWindow: '1 minute',
  allowList: [],
  hook: 'onRequest'
});
```

---

## 6. Database Security

### 6.1 Parameterized Queries ✅ GOOD

- All database access goes through Prisma ORM
- Prisma uses parameterized queries internally — no SQL injection risk
- No raw SQL in application code (only in integration test setup)

### 6.2 Connection String ✅ ACCEPTABLE

- `DATABASE_URL` loaded from environment variable (not hardcoded)
- `.env` file is gitignored
- `.env.example` contains placeholder credentials (standard practice)

### 6.3 Missing: Connection Pooling Configuration ⚠️ LOW

- `PrismaPg` adapter creates a single connection per client instance
- For production deployments, consider configuring connection pool limits
- Not critical for MVP with expected low traffic

---

## 7. Frontend Security

### 7.1 XSS Prevention ✅ GOOD

- React's JSX escapes all rendered content by default
- No use of `dangerouslySetInnerHTML`
- User input (todo descriptions) rendered as text content, not HTML

### 7.2 API Client ✅ GOOD

- `Content-Type: application/json` set explicitly on requests with bodies
- Error response parsing is wrapped in try/catch with fallback
- No sensitive data stored in localStorage or cookies

### 7.3 Missing: API Base URL Validation ⚠️ LOW

- `NEXT_PUBLIC_API_BASE_URL` is used directly without validation
- If misconfigured, API calls could be misdirected
- **Risk:** Low — environment variable is set at build time
- **Recommendation:** Add runtime validation of the URL format

---

## 8. Infrastructure Security

### 8.1 Docker Compose ✅ ACCEPTABLE FOR DEV

- Database credentials configured via environment variables
- Default credentials (`postgres/postgres`) are for local development only
- Port mapping exposes services on localhost only
- No volume permission issues

### 8.2 Missing: Production Hardening ⚠️ NOT APPLICABLE

- No production Dockerfiles or deployment configs exist (expected for MVP)
- When production deployment is added: use multi-stage builds, non-root users, secrets management

---

## 9. Dependency Security

### 9.1 Known Vulnerabilities ⚠️ CONCERN

- Docker logs show: "11 vulnerabilities (5 moderate, 6 high)"
- These are from the npm dependency tree
- **Recommendation:** Run `npm audit` and address fixable vulnerabilities. For non-fixable ones, assess whether they affect runtime paths.

---

## Findings Summary

| Category                    | Status        | Severity | Test Coverage |
| --------------------------- | ------------- | -------- | ------------- |
| Input Validation (Zod)      | ✅ Strong     | —        | ✅ 16 tests   |
| CORS Allowlist              | ✅ Good       | —        | ❌ No tests   |
| Helmet Secure Headers       | ✅ Good       | —        | ❌ No tests   |
| Error Info Leakage          | ⚠️ Concern    | Low      | ✅ Tested     |
| Rate Limiting               | ❌ Missing    | Medium   | ❌ N/A        |
| SQL Injection               | ✅ Safe       | —        | N/A (Prisma)  |
| XSS Prevention              | ✅ Safe       | —        | N/A (React)   |
| Dependency Vulnerabilities  | ⚠️ Concern    | Medium   | ❌ No audit   |

---

## Risk Matrix

| Finding                      | Probability | Impact | Risk Score | Priority |
| ---------------------------- | ----------- | ------ | ---------- | -------- |
| Rate limiting not implemented | High       | Medium | HIGH       | P1       |
| Error details leak in non-prod | Medium    | Low    | LOW        | P2       |
| CORS not tested              | Low         | Medium | LOW        | P2       |
| Helmet not tested            | Low         | Low    | LOW        | P3       |
| npm vulnerabilities          | Medium      | Medium | MEDIUM     | P2       |
| No API base URL validation   | Low         | Low    | LOW        | P3       |

---

## Recommended Actions

### Before Public Deployment (P1)

1. **Add rate limiting** — Install `@fastify/rate-limit` with per-IP throttling on mutation endpoints (POST, PATCH, DELETE)
2. **Run `npm audit fix`** — Address fixable dependency vulnerabilities

### Before Release (P2)

3. **Flip error suppression default** — Default to suppressing error details unless `NODE_ENV === "development"`
4. **Add CORS unit tests** — Verify allowed/disallowed origin behavior
5. **Add Helmet unit tests** — Verify key security headers are present

### Backlog (P3)

6. Add API base URL validation in frontend
7. Add explicit `bodyLimit` to Fastify configuration
8. Configure connection pooling for production database adapter

---

**Generated:** 2026-03-20
**Method:** Static code review, configuration analysis
**Note:** No runtime penetration testing or dynamic analysis was performed.

<!-- Powered by BMAD-CORE™ -->
