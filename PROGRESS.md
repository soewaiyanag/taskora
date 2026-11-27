# Taskora: progress

Learning Go (backend) and TanStack Query (frontend data layer) by building
Taskora, a ClickUp-style task manager for small teams. The rest of the React
frontend is built by Claude Code from [`DESIGN.md`](DESIGN.md).
Architecture reference: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Time budget

About **2 hours a day**, usually two review gates per session. Roughly 3 months in total.

| Phase | Rough length |
|---|---|
| 0. Foundations | 3–4 days |
| 1. Go API skeleton + auth | 2.5–3 weeks |
| 2. Workspaces + hierarchy | 2 weeks |
| 3. Tasks on the server | 2 weeks |
| 4. Collaboration + real-time | 2 weeks |
| 5. Power-user tools + performance | 1.5–2 weeks |
| 6. Files, rich text, types, tests | 1.5–2 weeks |
| 7. Launch | 1 week |

## Workflow rules

Applies to Go backend work and the frontend steps marked **(you)**, which are the
TanStack Query pieces. Every other frontend step (scaffold, styling, components,
screens) is built by Claude Code from `DESIGN.md`, then reviewed visually.

1. One small, isolated piece per step: one schema change, one module, or one endpoint.
2. Generators, migrations and installs are never hand-written or run for me. I get the
   exact command (package-manager script form: `yarn …`, `go …`), an explanation of what
   it generates, I run it and paste the output, then code goes inside the generated files.
3. Every step stops at a review gate: what the code does, why the framework is shaped
   that way, and which commands ran. Then questions.
4. The next step starts only after "I understand, let's move to the next step."
5. After approval: one conventional commit on `main` (`feat(scope): …`), then `git push`.
6. Every step ends with 📚 Resources: 2–5 official docs links.
7. Code style: named constants instead of magic numbers and booleans; few comments,
   explaining only the why; readable standard APIs over clever tricks.
8. Security and abuse risks go into **Before going public** below as they come up.
9. A 3-question quiz at the end of each phase before moving on.
10. Deployment is its own reviewed step. I run the host steps myself.
11. No AI attribution anywhere: commits, code, README or PRs.
12. Items are ticked only after I approve them. Changed or dropped decisions are struck
    through with the reason, never silently deleted.

## Checklist

Later phases are coarse on purpose and get split into micro-steps when we reach them.
⭐ marks the features meant to stand out to reviewers.

### Phase 0: Foundations
- [x] 0.1 Plan files (`PROGRESS.md`, `docs/ARCHITECTURE.md`, `README.md`, `.gitignore`), `git init`, create the GitHub repo
- [x] 0.2 Design: `PRODUCT.md`, visual direction, clickable prototype (`design/prototype/`), `DESIGN.md` (approved 2026-11-15)
- [x] 0.3 Scaffold `frontend/` with Vite (React + TypeScript, strict mode), TanStack Router, ESLint, Prettier, Vitest
- [x] 0.4 Tailwind CSS v4 with the `DESIGN.md` tokens in `@theme`
- [x] 0.5 ~~shadcn/ui setup~~ (dropped, see Decisions 2026-11-26) + Lucide icons
- [x] 0.6 `frontend-ci.yml`: lint, type-check, test, build
- [ ] 0.7 Phase 0 quiz

### Phase 1: Go API skeleton + auth
- [ ] 1.1 `go mod init` for `backend/` (you run it)
- [ ] 1.2 `cmd/api/main.go`: HTTP server on `http.ServeMux` with `GET /healthz`
- [ ] 1.3 `internal/config`: typed env config with `caarlos0/env`
- [ ] 1.4 Structured logging with `log/slog` + a request-logging middleware written by hand
- [ ] 1.5 Graceful shutdown (`signal.NotifyContext`, `server.Shutdown`)
- [ ] 1.6 `docker-compose.yml` with Postgres 16
- [ ] 1.7 goose: install + first migration (`users`)
- [ ] 1.8 `pgxpool` connection, ping on startup
- [ ] 1.9 sqlc: `sqlc.yaml` + first queries (`CreateUser`, `GetUserByEmail`)
- [ ] 1.10 Password hashing (argon2id) + table-driven tests
- [ ] 1.11 `POST /api/v1/auth/signup`: validation + `problem+json` errors
- [ ] 1.12 JWT access tokens (`golang-jwt/jwt/v5`): sign + verify + tests
- [ ] 1.13 Migration: `refresh_tokens` (hashed, revocable)
- [ ] 1.14 `POST /auth/login`: issue access + refresh in HttpOnly cookies
- [ ] 1.15 Auth middleware + `GET /me`
- [ ] 1.16 `POST /auth/refresh` (rotation + reuse detection), `POST /auth/logout`
- [ ] 1.17 Login rate limiting with `golang.org/x/time/rate` (in-memory)
- [ ] 1.18 Integration tests with `testcontainers-go`
- [ ] 1.19 Switch `ServeMux` → `chi` and compare
- [ ] 1.20 `backend-ci.yml`: `go vet`, tests, `govulncheck`
- [ ] 1.21 Frontend **(you)**: TanStack Query setup (`QueryClient`, devtools)
- [ ] 1.22 Frontend **(you)**: signup/login with `useMutation`, `/me` with `useQuery`, protected routes (forms and screens built by Claude)
- [ ] 1.23 Multi-stage `Dockerfile` (distroless)
- [ ] 1.24 Deployment (own reviewed step)
- [ ] 1.25 Phase 1 quiz

### Phase 2: Workspaces + hierarchy
- [ ] 2.1 Workspaces + members (roles) + authorization middleware
- [ ] 2.2 Invites by link
- [ ] 2.3 Spaces, folders, lists; fractional ordering
- [ ] 2.4 Statuses per list (todo / active / done)
- [ ] 2.5 Frontend: app shell + sidebar tree (TanStack Query, route loaders)
- [ ] 2.6 ⭐ Guest demo workspace: one-click sign-in, seeded sample data, scheduled reset
- [ ] 2.7 Phase 2 quiz

### Phase 3: Tasks on the server
- [ ] 3.1 Task CRUD + move (status + position)
- [ ] 3.2 Checklists and child subtasks
- [ ] 3.3 Assignees, priority, dates, tags
- [ ] 3.4 ⭐ Frontend **(you)**: board on the API with optimistic drag (`onMutate` / rollback / undo; board UI built by Claude)
- [ ] 3.5 ⭐ Frontend: task drawer opened from the URL (`?task=WEB-142`), so any task is a shareable link
- [ ] 3.6 ⭐ Frontend: keyboard drag (dnd-kit) with screen-reader announcements; owner lens
- [ ] 3.7 Phase 3 quiz

### Phase 4: Collaboration + real-time
- [ ] 4.1 Comments + @mentions
- [ ] 4.2 Activity log
- [ ] 4.3 ⭐ WebSocket hub (goroutines, channels) + live cache updates: a move in one tab appears in another
- [ ] 4.4 ⭐ Presence: who's online, and who's viewing the open task
- [ ] 4.5 Redis pub/sub so the hub works across instances
- [ ] 4.6 Notifications inbox
- [ ] 4.7 Phase 4 quiz

### Phase 5: Power-user tools + performance
- [ ] 5.1 ⭐ Filters, sort, group-by + saved views, all kept in typed URL search params
- [ ] 5.2 Search (Postgres full-text)
- [ ] 5.3 ⭐ ⌘K command palette (`cmdk`) + keyboard shortcuts
- [ ] 5.4 Redis rate limiting for all write routes
- [ ] 5.5 ⭐ Performance at scale: 2,000-task seed, virtualised lanes (TanStack Virtual), route code-splitting, Lighthouse scores recorded
- [ ] 5.6 Phase 5 quiz

### Phase 6: Files, rich text, types, tests
- [ ] 6.1 Attachments: MinIO locally, S3 in production, presigned uploads
- [ ] 6.2 Tiptap rich text for descriptions and comments
- [ ] 6.3 OpenAPI docs (swaggo), `pprof`, Prometheus metrics
- [ ] 6.4 ⭐ End-to-end types: orval generates typed TanStack Query hooks from the OpenAPI spec; CI fails when they drift
- [ ] 6.5 Frontend tests: Vitest + React Testing Library + MSW for the board, drawer and auth flows
- [ ] 6.6 ⭐ Playwright e2e (signup, demo, board, mouse and keyboard drag, two-tab live update) with axe accessibility checks
- [ ] 6.7 Phase 6 quiz

### Phase 7: Launch
- [ ] 7.1 Landing page with a "Try the demo" button (design pass first)
- [ ] 7.2 ⭐ README: two-tab live-update GIF, architecture diagram, key decisions, Lighthouse and axe results
- [ ] 7.3 "Before going public" checklist complete; production deploy (own reviewed step)
- [ ] 7.4 Phase 7 quiz

### Parked
- Multiple views (List/Table, Calendar, Timeline), time tracking, automations
- Mobile app with Expo (React Native) on the same API

## Before going public

- [ ] No secrets in git: `.env` ignored, `.env.example` committed
- [ ] HttpOnly + Secure + SameSite cookies; short access-token lifetime
- [ ] Refresh-token rotation with reuse detection; logout revokes
- [ ] Rate limits on signup, login and refresh
- [ ] Request body size limits (`http.MaxBytesReader`)
- [ ] Every workspace query scoped by membership, with tests that try to cross workspaces
- [ ] Origin check (or CORS allow-list) on mutating requests
- [ ] `govulncheck` clean in CI
- [ ] Guest demo: rate limits, size caps and a scheduled reset, so the demo can't be filled with junk or abused

## Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-11-14 | Name: **Taskora** | Chosen in the stack spec |
| 2026-11-14 | ~~Grow the kanban repo into Taskora~~ → **new repo**, fresh scaffold | The kanban app is already a finished portfolio piece; Taskora has a different name and scope |
| 2026-11-14 | ~~Import boards from the kanban app's localStorage~~ (dropped) | Separate product; no shared users or data |
| 2026-11-14 | Layout: `backend/` + `frontend/` | Follows the stack spec |
| 2026-11-14 | Auth: JWT access + refresh in HttpOnly cookies | Spec choice; teaches token signing and rotation |
| 2026-11-14 | Router: `net/http` `ServeMux` first, then chi at 1.19 | See what a router does before using one |
| 2026-11-14 | Redis: added when needed (rate limits, pub/sub), not on day one | Each dependency arrives with a reason |
| 2026-11-14 | Multiple views parked | Not in the chosen feature groups |
| 2026-11-15 | Frontend: ~~Vue 3 + Pinia + shadcn-vue~~ → **React + Vite + TypeScript**, Zustand, shadcn/ui | The frontend stack recruiters ask for most; Go stays the backend |
| 2026-11-15 | Frontend routing: ~~React Router~~ → **TanStack Router** | Typed URL state (open task, filters, lens) and loaders that prefetch with TanStack Query |
| 2026-11-15 | Frontend built by Claude Code; I write the TanStack Query steps 1.21, 1.22 and 3.4 | Keep my time on Go, plus the layer where my API meets the UI |
| 2026-11-15 | Design: "quiet Planning Wall" (`PRODUCT.md`, `DESIGN.md`, `design/prototype/`) | Premium through restraint; one colour per teammate, shown by the owner lens |
| 2026-11-15 | Guest demo workspace (step 2.6) | Reviewers can try the app in one click without signing up |
| 2026-11-15 | End-to-end types: Go → OpenAPI → orval → typed hooks | One source of truth; a renamed field breaks the build instead of production |
| 2026-11-15 | ~~Time budget 1 hour a day~~ → **2 hours a day** | My actual available time; about 3 months in total |
| 2026-11-15 | Kept Go over NestJS for the backend | The portfolio already has a NestJS backend (snipsh); two ecosystems show more range |
| 2026-11-26 | Frontend first build runs on a mock API (MSW) seeded with the Northwind demo, saved in localStorage | The screens work end to end before the Go API exists; switch off with `VITE_API_MOCK=off` |
| 2026-11-26 | ~~I write the TanStack Query steps 1.21, 1.22, 3.4~~ → Claude built the Query layer with the first frontend build | Approved build plan (handoff, 2026-11-24); the steps stay in the plan as reading and review |
| 2026-11-26 | ~~dnd-kit, cmdk, shadcn/ui, Motion~~ → the prototype's own drag, palette and motion, ported to React | Keeps the approved feel (lift, lean, flight, glide); keyboard moves (⇧←/→) cover what dnd-kit's sensor would. Revisit if a feature needs a primitive |
| 2026-11-26 | TypeScript pinned to 6.0 | typescript-eslint does not support TypeScript 7 yet |
