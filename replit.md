# TarjimHub (ترجيم هاب)

A bilingual (Arabic/English) professional platform for Arabic interpreters with full RTL support, AI-powered glossary, job board, community feed, and in-session tools.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/tarjimhub run dev` — run the frontend (port 22366)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — JWT signing secret
- Required env: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Anthropic via Replit proxy

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, wouter (routing)
- API: Express 5 + Pino logger
- DB: PostgreSQL + Drizzle ORM
- AI: Claude (claude-sonnet-4-6) via Replit Anthropic integration
- Auth: JWT (HS256) — token stored in localStorage as `tarjimhub_token`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-client-react/src/custom-fetch.ts` — JWT injection in all requests
- `lib/db/src/schema/` — all Drizzle ORM table definitions
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware + signToken
- `artifacts/tarjimhub/src/contexts/` — LanguageContext (EN/AR RTL) + AuthContext
- `artifacts/tarjimhub/src/pages/` — all page components

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → React Query hooks. Never hand-write fetch calls.
- **Bilingual everywhere**: `useLang()` hook exposes `t(en, ar)` helper and `isRTL`. `document.dir` is set dynamically.
- **JWT in localStorage**: stored as `tarjimhub_token`, injected by `customFetch` on every request automatically.
- **Claude AI for glossary**: POSTs to Anthropic via Replit proxy; returns translations per 5 Arabic dialects (Egyptian, Levantine, Gulf, Moroccan, Iraqi).
- **No session middleware**: fully stateless REST API; auth state lives entirely in the client.

## Product

- **Landing page**: bilingual hero, feature grid, CTA
- **Auth**: register (interpreter or client role) and login with JWT
- **Dashboard**: stats card grid + quick-access links + recent activity feed
- **AI Glossary**: search by term + category → get translations across 5 Arabic dialects; save/history
- **Interpreter Tools**: session timer, quick notes (localStorage), quick phrases, OTP/Video/In-Person modes
- **Job Board**: browse/filter jobs; interpreters apply; clients post jobs with mode/specialty/rate
- **Community Feed**: bilingual posts, likes, comments, trending topics
- **Messages**: real-time-style conversation list + chat window
- **Profile**: view & edit profile with bilingual name/bio, certifications, stats

## Demo accounts

- `sara@tarjimhub.com` / `password` — interpreter (Egyptian Arabic)
- `omar@tarjimhub.com` / `password` — client (healthcare)

## Gotchas

- `lib/api-client-react/src/index.ts` must NOT re-export `setBaseUrl`/`setAuthTokenGetter` — those don't exist in custom-fetch.
- The `conversations` and `messages` tables in `lib/db/src/schema/messages.ts` are from the Anthropic template — don't delete them.
- Drizzle dynamic queries require explicit `import { and, eq } from 'drizzle-orm'` — avoid dynamic operators.
- Run `pnpm --filter @workspace/db run push` after any schema change before testing.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
