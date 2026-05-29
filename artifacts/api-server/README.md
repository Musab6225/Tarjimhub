# API Server (`artifacts/api-server`)

This package contains the Express backend for Tarjimhub, including request validation, structured logging, and route definitions.

## Folder structure

- `src/index.ts` — application bootstrap and server startup.
- `src/app.ts` — Express app wiring, middleware, security, and rate limiting.
- `src/lib/env.ts` — environment validation with Zod.
- `src/lib/logger.ts` — structured `pino` logging configuration.
- `src/lib/validation.ts` — reusable request validation middleware for body/query/params.
- `src/lib/schemas.ts` — route-level Zod schemas for backend validation.
- `src/middlewares/auth.ts` — JWT authentication middleware.
- `src/middlewares/errorHandler.ts` — global error handler for JSON responses and Zod errors.
- `src/routes/*.ts` — feature routers: auth, glossary, users, feed, terminologies, jobs, messages, dashboard, health.

## Recommended organization

Currently the backend package is located under `artifacts/api-server` and shared packages are in `lib/`.

For improved monorepo clarity:

- consider moving backend packages into a `packages/` namespace, e.g. `packages/api-server`.
- move shared models and helpers into `packages/shared` or `packages/lib`.
- keep `artifacts/` reserved for generated deployment or build assets rather than source-level packages.

This backend now validates every incoming route payload using Zod and logs important actions with structured metadata.
