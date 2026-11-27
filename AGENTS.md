<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SalonBook client — working notes

Single-package Next.js 16 App Router app (`src/`, `@/*` → `src/*`), React 19, strict TS, Tailwind 4 via `@tailwindcss/turbopack`. Auth is local (Better Auth + MongoDB at `src/app/api/auth/[...all]/route.ts`); dashboard data still comes from the Express API in `README.md`. No test runner or typecheck script.

## Commands

- `npm run dev`, `npm run lint` (ESLint 9 flat config), `npm run build`, `npm start`.
- Typecheck with `npx tsc --noEmit`; `npm run build` also typechecks.
- Dashboard data flows need the Express API locally (default `http://localhost:5000`); login/registration use MongoDB directly.

## Env / API boundary

- Copy `.env.example` → `.env.local`. Auth needs `MONGODB_URI`, `BETTER_AUTH_SECRET`, optional `BETTER_AUTH_URL`/`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`; the dashboard proxy uses `NEXT_PUBLIC_API_URL`. `.env*` is gitignored except `.env.example`.
- `next.config.ts` rewrites `/api/:path*` to `NEXT_PUBLIC_API_URL` for dashboard data; local route handlers (notably `/api/auth/*`) take precedence, so keep auth at `/api/auth/[...all]`. Fetch relative `/api/...` paths.
- `NEXT_PUBLIC_*` values are inlined at build time — rebuild/redeploy after changing them.

## Auth and data flow

- `src/lib/auth.ts` is the app's only client Better Auth instance (JWT plugin plus `role`/`isBlocked`/`phone` additional fields). `src/lib/auth-server.ts` holds the Mongo adapter and secret — import it only from the route handler, never from a client component.
- Registration stores a chosen profile image as a data URL via Better Auth's `image` field; there is no upload endpoint.
- Dashboard requests go through `authenticatedFetch`/`authenticatedFetchJson` in `src/lib/api.ts` (bearer token via `authClient.token()`); those still target the Express API, not local auth.
- Use `resolveAuthRedirect`/`resolveSocialRedirect` from `src/lib/auth-routing.ts` for post-login redirects; they enforce role separation and block open redirects.
- `DashboardShell` and `RoleGuard` are client-side UX guards only; enforce roles wherever data is served.
- `DashboardShell` deliberately reads `window.location.search` in an effect to preserve `?redirect=` without turning the shared shell into a `useSearchParams` CSR boundary.

## Next.js 16 quirks

- `cacheComponents: true` and `partialPrefetching: true` are enabled. Pages using `useSearchParams` put the hook in an inner component and wrap it in `<Suspense>` at the default export (see `auth/login`, `services`, `booking`); `dashboard/layout.tsx` wraps `DashboardShell` similarly. Follow these boundaries when adding pages.

## UI conventions

- Use `sonner` toasts and `src/components/ConfirmDialog.tsx` for destructive actions; avoid `alert`/`window.confirm`.
