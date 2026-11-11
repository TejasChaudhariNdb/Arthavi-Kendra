# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Internal admin dashboard for Arthavi (Next.js 16 App Router, React 19, Tailwind 4, recharts). It covers users, activity/retention metrics, GA4 analytics, email campaigns, push notifications, feedback, AI chat logs, stock master data, and in-app updates. It has no database access of its own: everything goes through the FastAPI backend in `../backend` (separate git repo; see `../backend/CLAUDE.md`), mostly under `/admin/*`, `/admin/campaigns/*`, `/admin/stocks/*`, `/analytics/*`, and `/notifications/send`. Response types are hand-written to match the Python routes. `DATABASE_URL` in `.env.local` is unused.

## Commands

```bash
npm install
npm run dev       # next dev, port 3000 by default; fintech-app also defaults to 3000, so use `npm run dev -- -p 3001` when running both
npm run build
npm run lint
npx tsc --noEmit
```

There are no tests. Env: `NEXT_PUBLIC_API_URL` (backend, defaults to `http://localhost:8000`) and `NEXT_PUBLIC_USER_APP_URL` (fintech-app, used for impersonation). The backend's CORS allows `localhost:3000/3001`.

## Architecture

**Auth**: `/login` posts to `/admin/auth/login` and stores the JWT in a JS-set `admin_token` cookie (`src/app/login/page.tsx`). `src/middleware.ts` only checks that the cookie exists and redirects to `/login` otherwise; the backend's `get_current_admin` does the real validation (`role: "admin"` claim). Logout clears the cookie in `DashboardLayout.tsx`. New admins are created from `/settings` via `/admin/auth/register` (requires an existing admin).

**Two API clients; pick by where the code runs:**
- `src/lib/api.ts`: **server-only** (imports `next/headers` `cookies()`). Used by `async` page components, which are mostly `export const dynamic = "force-dynamic"` and fetch with `cache: "no-store"`. Do not import it from a `"use client"` file.
- `src/lib/auth-client.ts`: **browser** functions, reading the token from `document.cookie`. Used by client components for mutations (campaigns, templates, notifications, updates, stock edits, impersonation, CSV exports via blob download).
- `src/app/api/analytics/*/route.ts`: server route handlers that proxy the backend's GA4 `/analytics/*` endpoints with the cookie token.

**Page pattern**: `src/app/<section>/page.tsx` is a server component that reads `searchParams`, calls `lib/api.ts`, and passes data to a `*Client.tsx` component in `src/components/` for interactivity. Filters and pagination live in the URL query string. `src/app/layout.tsx` wraps everything in `DashboardLayout` (sidebar + `ThemeProvider`).

**Impersonation**: `impersonateUser()` calls `POST /admin/users/{id}/impersonate` and opens `${NEXT_PUBLIC_USER_APP_URL}/auth?impersonate_token=<jwt>`; fintech-app's `/auth` page stores that token as the user's session.

**Shared with fintech-app**: `src/lib/feedbackStatus.ts` mirrors `../fintech-app/lib/feedbackStatus.ts` (same status keys, different labels and styling). Status keys must match the backend `routes/feedback.py`.

`.agents/skills/` contains design/UI skills (design-system, ui-styling, ui-ux-pro-max, etc.) for agent use.
