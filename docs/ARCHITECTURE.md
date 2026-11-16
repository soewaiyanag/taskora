# Taskora: architecture

Reference for how Taskora fits together. Progress and decisions live in
[`PROGRESS.md`](../PROGRESS.md); this file describes the target shape.

## Repository

```
taskora/
├── .github/workflows/        # backend-ci.yml, frontend-ci.yml
├── backend/                  # Go service
│   ├── cmd/api/main.go       # wiring: config → logger → db → router → server
│   ├── internal/
│   │   ├── auth/             # password hashing, JWT, auth middleware
│   │   ├── config/           # env config (caarlos0/env)
│   │   ├── database/         # pgx pool + sqlc-generated code
│   │   ├── handler/          # HTTP handlers
│   │   ├── middleware/       # logging, rate limiting, origin checks
│   │   ├── realtime/         # WebSocket hub (Phase 4)
│   │   └── service/          # business logic
│   ├── db/migrations/        # goose SQL migrations
│   ├── db/queries/           # SQL for sqlc
│   ├── Dockerfile
│   └── go.mod
├── frontend/                 # React SPA (Vite)
├── design/prototype/         # clickable design prototype (reference, not shipped)
├── docker-compose.yml        # Postgres now; Redis and MinIO when needed
├── DESIGN.md                 # design system: tokens, type, components, rules
├── PRODUCT.md                # users, positioning, product principles
├── PROGRESS.md
└── README.md
```

## Backend

| Concern | Choice |
|---|---|
| Language | Go (1.24+; 1.27 installed locally) |
| HTTP | `net/http` `ServeMux` first, then `go-chi/chi/v5` |
| Database | PostgreSQL 16 via `pgx/v5` + `pgxpool` |
| Queries | `sqlc` (hand-written SQL → typed Go) |
| Migrations | `goose` |
| Config | `caarlos0/env` |
| Logging | `log/slog`, JSON in production |
| Auth | JWT access token + rotating refresh token, both HttpOnly cookies |
| Passwords | argon2id (`golang.org/x/crypto/argon2`) |
| Rate limiting | `golang.org/x/time/rate` in memory, then Redis |
| Real-time | `coder/websocket` hub; Redis pub/sub across instances |
| Docs and ops | `swaggo/swag` OpenAPI, `pprof`, Prometheus |
| Tests | `testing`, `testify`, `testcontainers-go` |

## Data model

```
users ─┬─< workspace_members >── workspaces ─┬─< spaces ─┬─< folders ─< lists
       ├─< refresh_tokens                     │           └──────────< lists (no folder)
       └─< invites (by email/link)            └─< tags

lists ─< statuses            (name, color, category todo|active|done, position)
lists ─< tasks               (status_id, parent_task_id for subtasks, position)
tasks ─< checklist_items     (simple to-do items inside a task)
tasks >─< users via task_assignees      tasks >─< tags via task_tags
tasks ─< comments            tasks ─< attachments
workspaces ─< activity ─< notifications
lists ─< saved_views         (filters / sort / group-by as JSON)
```

- **IDs:** UUIDv7.
- **Ordering:** a fractional-index string `position`, so a drag writes one row.
- **Tenancy:** every workspace query is scoped by membership, and integration tests try to cross workspaces.
- **Search:** a generated `tsvector` column on tasks with a GIN index.

## API (`/api/v1`, JSON)

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/signup` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `GET /me` |
| Workspaces | `GET/POST /workspaces` · `GET/PATCH /workspaces/{ws}` · members · invites |
| Hierarchy | `GET /workspaces/{ws}/tree` · CRUD for spaces, folders, lists · move |
| Statuses | `GET/POST /lists/{id}/statuses` · `PATCH/DELETE /statuses/{id}` |
| Tasks | `GET/POST /lists/{id}/tasks` · `GET/PATCH/DELETE /tasks/{id}` · `POST /tasks/{id}/move` |
| Task parts | checklist, assignees, tags, comments, attachments |
| Power | search, saved views, notifications |
| Live | `GET /workspaces/{ws}/ws` (WebSocket events) |

Errors use RFC 9457 `application/problem+json`; lists use cursor pagination.

## Frontend

- **Stack:** React + TypeScript (strict, `noUncheckedIndexedAccess`) + Vite; TanStack Router with file-based, typed routes.
- **Data:** TanStack Query v5 for server state. Route loaders prefetch with `queryClient.ensureQueryData`, so pages open with data already loaded.
- **API client:** orval generates typed TanStack Query hooks and request types from the Go OpenAPI spec (`frontend/src/api/generated/`, never edited by hand). Until 6.4, a small hand-written client covers the same endpoints.
- **URL as state:** the open task (`?task=WEB-142`), filters, sort, group-by and the owner lens live in typed search params, so every view is a shareable link.
- **UI state:** Zustand for what the server doesn't own (sidebar, theme, pending composer).
- **UI:** Tailwind v4 with the `DESIGN.md` tokens in `@theme`; shadcn/ui (Radix) primitives; Lucide icons; `dnd-kit` for drag with keyboard support and screen-reader announcements; `cmdk` for the ⌘K palette; Tiptap; React Hook Form + zod for forms; Motion for the one motion style in `DESIGN.md`; TanStack Virtual for long lanes.
- **Real-time:** WebSocket events update the TanStack Query cache directly (`setQueryData`), so another person's move appears without refetching.
- **Folders:** by feature, `src/features/{auth,workspaces,board,tasks,comments,search}/` with `api/`, `components/` and `hooks/` inside each; shared UI in `src/components/ui/`.
- **Tests:** Vitest + React Testing Library + MSW (mocked API) for components and hooks; Playwright e2e with axe accessibility checks.
- **Server state vs UI state:** everything from the server goes through TanStack Query, including optimistic drag updates and WebSocket events. Zustand and the URL hold the rest.
- **Same origin:** Vercel rewrites `/api/*` to the Go service, so the browser only talks to one origin and cookies stay simple.

## Hosting

- **Frontend:** Vercel.
- **Backend:** a distroless container.
- **Database:** Postgres.
- **Later:** Redis, plus MinIO locally and S3 in production.

The specific providers are chosen in the deployment step (1.24).
