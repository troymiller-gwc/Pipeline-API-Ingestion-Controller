# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/design-spec` (`@workspace/design-spec`)

React + Vite frontend-only application serving as the API Ingestion Control Plane design specification. Contains 7 navigable pages covering project overview, architecture, data model, execution flow, features, connectors, and open questions/recommendations. No backend required — all content is static.

Pages:
- **Overview** — Project purpose, users, capabilities, scope, definition of done
- **Architecture** — System layers, deployment topology, data flow diagrams, security boundary
- **Data Model** — All 6 BigQuery table schemas with column details, entity relationships, strategy enums
- **Execution Flow** — Manual/scheduled run flows, pagination engine, replay logic, checkpointing, failure handling
- **Features** — MVP feature map with UI screens and API endpoints, request builder rules, status model
- **Connectors** — NICE CXone get_contacts connector specification with parameters, pagination, and execution logic
- **Open Questions** — 9 identified design gaps with severity, descriptions, and recommendations

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`, error handler
- Routes: `src/routes/index.ts` mounts sub-routers
  - `health.ts` — `GET /healthz`
  - `source-systems.ts` — CRUD for source systems (list, get, create, update, soft-delete)
  - `endpoints.ts` — CRUD for endpoint definitions (list with filter, get with params, create, update, soft-delete)
  - `parameters.ts` — CRUD for endpoint parameters (list by endpoint, create, update, delete)
  - `runs.ts` — Run management (create with concurrency guard via SELECT...FOR UPDATE, list with filtering/pagination, get detail with events, cancel, replay), request preview
- Middleware: `src/middlewares/error-handler.ts` — AppError class, Zod validation error handling, 500 fallback
- Depends on: `@workspace/db`, `@workspace/api-zod`, `zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/source-system.ts` — `source_system` table (PK: source_system_id)
- `src/schema/endpoint-definition.ts` — `endpoint_definition` table (PK: endpoint_id, FK → source_system)
- `src/schema/endpoint-parameter.ts` — `endpoint_parameter` table (PK: endpoint_parameter_id, FK → endpoint_definition, UNIQUE(endpoint_id, parameter_name))
- `src/schema/extraction-run.ts` — `extraction_run` table (PK: run_id UUID, self-referencing parent_run_id FK, indexes on status/created)
- `src/schema/extraction-event.ts` — `extraction_event` table (PK: event_id UUID, FK → extraction_run, indexes on run/type)
- `src/schema/bigquery-api-payload.sql` — BigQuery DDL for `raw.api_payload` (partitioned by DATE(ingested_ts), clustered by source_system_id/endpoint_id/run_id)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Also contains hand-written enums and schemas for the control plane domain:

- `src/enums.ts` — AuthType, HttpMethod, PaginationStrategy, IncrementalStrategy, RunType, RunStatus, PageStatus, EventType, EventSeverity, ParameterLocation, ParameterDataType, BackoffStrategy
- `src/schemas.ts` — Zod schemas for CRUD operations (CreateSourceSystem, CreateEndpointDefinition, CreateEndpointParameter, TriggerRun) and response types (SourceSystemResponse, EndpointDefinitionResponse, etc.), plus RateLimitConfig, PaginationConfig, IncrementalConfig
- `src/generated/` — Orval-generated schemas from OpenAPI spec

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

- `seed` — Seeds NICE CXone source_system, get_contacts endpoint_definition, and 4 endpoint_parameters
- `verify-schema` — Verifies all tables exist and seed data is present

## Build Progress

Phase 1 (Foundation) is **complete**. All PostgreSQL tables, shared types/enums, BigQuery DDL, and database client are built. Seeded with NICE CXone data.

Phase 2 (Backend API) is **complete**. All CRUD endpoints for source systems, endpoints, parameters, extraction runs (with concurrency guard), monitoring events, cancel, and replay are built and tested.
