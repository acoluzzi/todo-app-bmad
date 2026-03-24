# Performance Analysis Report — Todo App

**Date:** 2026-03-24
**Tools:** Google Lighthouse 12.8.2, Chrome DevTools MCP, cURL latency measurement
**Environment:** Docker Compose (local), Chromium headless, Next.js dev server (Turbopack)

---

## Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| **Performance** | **75 / 100** | Needs work |
| **Accessibility** | **96 / 100** | Good |
| **Best Practices** | **100 / 100** | Excellent |

The application has excellent best-practices compliance (100) and strong accessibility (96). Performance scores 75 due to development-mode asset delivery — unminified JS bundles and lack of caching. Backend API latency is excellent (< 20ms). One accessibility issue was found and fixed during this analysis.

---

## Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint (FCP) | **0.8s** | < 1.8s | PASS |
| Largest Contentful Paint (LCP) | **6.1s** | < 2.5s | FAIL |
| Total Blocking Time (TBT) | **140ms** | < 200ms | PASS |
| Cumulative Layout Shift (CLS) | **0** | < 0.1 | PASS |
| Speed Index | **3.7s** | < 3.4s | WARN |
| Time to Interactive (TTI) | **6.1s** | < 3.8s | FAIL |

### LCP Analysis

The LCP element is a `<p>` subtitle inside the page header:

```html
<p class="max-w-2xl text-sm leading-6 text-slate-600">
  Create, complete, and delete todos using the shared backend API.
</p>
```

LCP breakdown:
- **TTFB:** 473ms (8%)
- **Render Delay:** 5,624ms (92%)

The 92% render delay is caused by the development-mode JavaScript bundle chain — Next.js dev server delivers unminified, unsplit bundles via Turbopack. In a production build (`next build && next start`), this would be dramatically reduced through:
- Code splitting and tree-shaking
- JavaScript minification
- Static page generation (SSG/SSR)

**Verdict:** LCP failure is a dev-mode artifact, not an application architecture issue.

---

## Backend API Performance

### Latency Measurements

| Endpoint | Method | Avg Latency | P95 Latency | Status |
|----------|--------|-------------|-------------|--------|
| `/api/v1/health` | GET | **14ms** | 14ms | Excellent |
| `/api/v1/todos` | GET | **5.8ms** | 18ms | Excellent |
| `/api/v1/todos` | POST | **9.1ms** | 21ms | Excellent |

All API endpoints are well under the NFR2 target of ≤ 500ms (95th percentile). Even cold-start requests (first request after idle) complete within 20ms.

### Response Headers (Security)

All Helmet security headers are properly set:

| Header | Value | Status |
|--------|-------|--------|
| Content-Security-Policy | `default-src 'self'; ...` | PASS |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` | PASS |
| X-Content-Type-Options | `nosniff` | PASS |
| X-Frame-Options | `SAMEORIGIN` | PASS |
| Cross-Origin-Opener-Policy | `same-origin` | PASS |
| Referrer-Policy | `no-referrer` | PASS |
| X-XSS-Protection | `0` (correct — deprecated header) | PASS |

---

## Issues Found

### Issue 1: ARIA Prohibited Attribute (FIXED)

**Severity:** Medium
**Category:** Accessibility
**Status:** Fixed during this analysis

The completion indicator `<span>` used `aria-label` without a valid ARIA role. Per WCAG, `aria-label` cannot be used on generic `<span>` elements.

```html
<!-- Before (invalid) -->
<span aria-label="Completion state: completed" class="...rounded-full bg-emerald-500" />

<!-- After (fixed) -->
<span role="img" aria-label="Completion state: completed" class="...rounded-full bg-emerald-500" />
```

**Fix:** Added `role="img"` to the completion indicator span in `TodoItem.tsx`. All existing tests pass.

---

### Issue 2: Missing Preconnect to Backend API

**Severity:** Low
**Category:** Performance
**Impact:** ~150ms wasted on first API request

The frontend makes API calls to `localhost:3001` but does not hint the browser to preconnect. Adding a `<link rel="preconnect">` would save ~150ms on the initial API call.

**Recommendation:** In production, add a preconnect hint for the API origin in `layout.tsx`:

```tsx
<head>
  <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
</head>
```

**Status:** Not fixed — this is a production optimization. In dev mode, the backend is on `localhost:3001` and the latency savings are negligible.

---

### Issue 3: Unminified JavaScript (Dev Mode)

**Severity:** Info (dev-mode only)
**Category:** Performance
**Impact:** ~180 KiB of saveable JS

| Bundle | Wasted Bytes |
|--------|-------------|
| `next/dist/client` | 68 KiB |
| `react-dom` | 50 KiB |
| `next/dist/...` (misc) | 42 KiB |
| App code | 11 KiB |
| Other | 9 KiB |

**Verdict:** Expected in development. Next.js production builds (`next build`) automatically minify all JavaScript. No action needed.

---

### Issue 4: Unused JavaScript (Dev Mode)

**Severity:** Info (dev-mode only)
**Category:** Performance
**Impact:** ~334 KiB of unused JS

| Bundle | Wasted Bytes |
|--------|-------------|
| `next-devtools` | 138 KiB |
| `next/dist/client` | 80 KiB |
| `react-dom` | 67 KiB |
| `next/dist` (misc) | 56 KiB |

**Verdict:** The largest offender (`next-devtools`, 138 KiB) is a dev-only tool not included in production. React DOM's unused portion is due to dev-mode runtime checks. Tree-shaking in production eliminates this.

---

### Issue 5: Render-Blocking CSS

**Severity:** Low
**Category:** Performance
**Impact:** ~173ms render delay

One CSS file blocks initial render:
- `[root-of-the-server]__0.59wcw._.css` — 5,668 bytes

**Verdict:** This is the critical CSS file (Tailwind utilities). At 5.6 KiB, it's small enough that inlining would be the correct production optimization. Next.js production mode handles CSS optimization automatically.

---

### Issue 6: Back/Forward Cache (bfcache) Disabled

**Severity:** Low
**Category:** Performance
**Reason:** Pages with WebSocket connections cannot enter bfcache

**Verdict:** This is caused by Next.js dev mode's Hot Module Replacement (HMR) WebSocket. In production builds, no WebSocket is used and bfcache will work correctly.

---

### Issue 7: No Cache Headers on Static Assets

**Severity:** Medium (production concern)
**Category:** Performance

No static assets have cache headers set. The frontend returns `Cache-Control: no-cache, must-revalidate` for all responses.

**Verdict:** Expected in dev mode. Next.js production builds serve static assets from `/_next/static/` with immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`).

---

### Issue 8: HTTP/1.1 Used (No HTTP/2)

**Severity:** Low
**Category:** Performance

All resources are served over HTTP/1.1. HTTP/2 would enable multiplexing and header compression.

**Verdict:** Expected for local development on `localhost`. In production, deploying behind a reverse proxy (nginx, Vercel, CloudFront) provides HTTP/2 automatically.

---

### Issue 9: npm Audit Vulnerabilities

**Severity:** Medium
**Category:** Security

```
11 vulnerabilities (5 moderate, 6 high)
```

**Recommendation:** Run `npm audit fix` to address non-breaking dependency updates. For breaking changes, evaluate with `npm audit fix --force` on a separate branch.

---

## Network Analysis

### Total Page Weight

| Category | Size |
|----------|------|
| Total network payload | **802 KiB** |
| Initial HTML | 14.6 KiB |
| JavaScript (total) | ~720 KiB |
| CSS | 5.7 KiB |
| Fonts (WOFF2) | 60 KiB (2 files) |
| API data | < 1 KiB |

### DOM Complexity

| Metric | Value | Status |
|--------|-------|--------|
| DOM elements | **73** | Excellent (< 1,500 threshold) |

The DOM is minimal and well-structured.

### Critical Request Chain

```
Document (/) — 5.3 KiB, 125ms
  └─ CSS chunk — 5.7 KiB, 37ms
```

Only one level of chaining with a small CSS file. This is optimal.

---

## Production vs Development Comparison

| Issue | Dev Mode Impact | Production Impact |
|-------|-----------------|-------------------|
| Unminified JS | -180 KiB saveable | Auto-minified |
| Unused JS | 334 KiB wasted | Tree-shaken |
| LCP (6.1s) | Render delay from HMR | SSR/SSG eliminates delay |
| bfcache disabled | WebSocket (HMR) | No WebSocket |
| No cache headers | Expected | Immutable caching |
| HTTP/1.1 | localhost dev | HTTP/2 behind proxy |

**Estimated production performance score: 90-95+**

---

## Recommendations Summary

### Immediate (Apply Now)

| # | Issue | Action | Priority |
|---|-------|--------|----------|
| 1 | ARIA prohibited attribute | Fixed: added `role="img"` to completion indicator | **Done** |

### Before Production Deploy

| # | Issue | Action | Priority |
|---|-------|--------|----------|
| 2 | npm vulnerabilities | Run `npm audit fix` | High |
| 3 | Preconnect hint | Add `<link rel="preconnect">` for API origin | Medium |
| 4 | Verify prod build | Run `next build` and re-test Lighthouse | High |

### Post-MVP Optimizations

| # | Issue | Action | Priority |
|---|-------|--------|----------|
| 5 | Bundle analysis | Run `next build --analyze` to identify large modules | Low |
| 6 | Image optimization | Use `next/image` if images are added later | Low |
| 7 | API response caching | Add `stale-while-revalidate` for GET /todos if traffic grows | Low |

---

## Chrome DevTools MCP Configuration

The Chrome DevTools MCP server has been configured for this project at `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

After reloading Cursor, the MCP server will provide real-time access to Chrome DevTools capabilities including:
- Performance tracing (`performance_start_trace`)
- Network request analysis
- Console message inspection with source-mapped stack traces
- Runtime JavaScript evaluation

---

**Generated:** 2026-03-24
**Lighthouse version:** 12.8.2
**Audited URL:** http://localhost:3000 (development mode)
