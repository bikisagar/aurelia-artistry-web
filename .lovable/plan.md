

## Security Hardening Review -- Audit Report and Plan

### Current Security Posture Summary

This is a **static Vite + React SPA** with **no backend server, no API routes, no middleware, and no server-side rendering**. It connects to an external Supabase project for read-only data fetching. Many Next.js-specific security concepts (middleware.ts, API route protection, NEXT_PUBLIC_ prefixes) do not apply.

---

### 1. Supabase RLS Audit

**Finding:** The Supabase project is externally managed (not a Lovable Cloud instance), so RLS policies cannot be directly inspected or modified from here. However, the security scan returned **no issues found**.

**What the frontend does:**
- Reads from `design_assets` table with `.eq('is_active', true)` -- SELECT only
- No INSERT, UPDATE, or DELETE operations exist anywhere in the codebase
- The client uses the `anon` (public) role key, which is a **publishable key** by Supabase design

**Recommendation:** Verify in your Supabase dashboard that:
- RLS is enabled on `design_assets`
- A SELECT-only policy exists for `anon` role (e.g., `USING (is_active = true)`)
- No INSERT/UPDATE/DELETE policies exist for `anon`
- The `service_role` key is NOT stored anywhere in this codebase (confirmed: it is not)

---

### 2. Console Logs and Debug Output

**Finding:** The previous audit already removed `console.log` statements from `formService.ts`. Remaining console statements are all `console.error` or `console.warn` for error handling:

| File | Type | Purpose | Risk |
|------|------|---------|------|
| `supabaseDesign.ts` | `console.warn` | "Supabase not configured" | Low -- no user data |
| `supabaseDesign.ts` (x3) | `console.error` | DB fetch errors | Low -- Supabase error objects only |
| `formService.ts` (x3) | `console.error` | Form validation/submit errors | Low -- no user data logged |
| `GalleryDetail.tsx` (x2) | `console.error` | Item fetch errors | Low -- no user data |
| `useDesignAssets.ts` (x2) | `console.error` | Asset loading errors | Low -- no user data |
| `Contact.tsx` | `console.error` | Form error | Low -- error object only |
| `NotFound.tsx` | `console.error` | 404 route logging | Low -- logs URL path only |

**Plan:** Add Vite's `esbuild.drop` option to automatically strip all `console.log` and `console.debug` from production builds, while preserving `console.error` and `console.warn` for production debugging.

---

### 3. Credentials and Secrets

**Finding: SAFE**
- No `import.meta.env` usage anywhere -- no environment variables are used
- No `service_role`, `secret_key`, `private_key`, or `password` strings found
- The Supabase `anonKey` in `content.json` is a **publishable anon key** (role: "anon") -- this is intentionally public and safe per Supabase's security model
- No `.env` files exist in the project
- `.gitignore` includes `*.local` which covers `.env.local`

---

### 4. Vite Production Build Configuration

**Current state:**
- Source maps: `sourcemap: mode === 'development'` -- correctly disabled in production
- No console stripping configured

**Plan:** Add `esbuild.drop` to strip `console.log` and `debugger` statements from production builds:
```typescript
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],
}
```

**Note:** Using `drop: ['console']` removes ALL console methods including `console.error`. A more targeted approach using `pure` will be used instead to only drop `console.log` and `console.debug` while keeping `console.error` and `console.warn`.

---

### 5. .gitignore Hardening

**Finding:** The `.gitignore` is missing explicit `.env` entries. While `*.local` covers `.env.local`, it does not cover `.env`, `.env.production`, etc.

**Plan:** Add standard env file patterns to `.gitignore`:
```
.env
.env.*
!.env.example
```

---

### Implementation Steps

**Step 1 -- Harden Vite config** (`vite.config.ts`)
- Add `esbuild.pure` to drop `console.log` and `console.debug` in production (keeps `console.error`/`console.warn`)
- This is a one-line addition

**Step 2 -- Harden .gitignore**
- Add `.env` and `.env.*` patterns
- Add `!.env.example` exception

**Step 3 -- Remove the 404 console.error** (`NotFound.tsx`)
- The `console.error` logging the attempted route path is unnecessary and could expose URL patterns; remove it

---

### Final Security Posture

| Area | Status |
|------|--------|
| Private keys in codebase | None found |
| service_role exposure | Not present |
| import.meta.env secrets | No env vars used |
| Source maps in production | Disabled |
| Console data leaks | None (user data removed previously) |
| Supabase access pattern | Read-only, anon key (publishable) |
| Frontend mutations | None -- no INSERT/UPDATE/DELETE |
| .gitignore coverage | Will be hardened |
| Production console stripping | Will be added |

### Remaining Risks (Low Priority)
- **RLS verification**: Cannot be confirmed from this side -- must be checked in the Supabase dashboard
- **Google Form submission URL**: Stored in `content.json` and visible in the client bundle; this is a public form endpoint and is acceptable, but be aware it could receive spam submissions

