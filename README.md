# Taskora

A task manager for small teams, inspired by ClickUp: workspaces with spaces,
folders and lists, rich tasks, live collaboration and keyboard-first tools.

Built with a **Go** backend and a **React** frontend. Status: early development.

## Stack

- **Backend:** Go, `net/http` (then chi), PostgreSQL 16 with `pgx` and `sqlc`, goose migrations, JWT auth, `log/slog`
- **Frontend:** React + TypeScript + Vite, TanStack Router + TanStack Query, Zustand, Tailwind CSS v4, shadcn/ui, dnd-kit, Tiptap
- **Types end to end:** SQL → Go (`sqlc`) → OpenAPI → TypeScript hooks (orval)
- **Infrastructure:** Docker Compose for local development, GitHub Actions CI

More detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Design system: [`DESIGN.md`](DESIGN.md).

## Roadmap

Step-by-step progress lives in [`PROGRESS.md`](PROGRESS.md).

| Phase | Focus | Status |
|---|---|---|
| 0 | Repo, design direction and prototype, frontend scaffold, CI | In progress |
| 1 | Go API skeleton, Postgres, JWT auth; TanStack Query in the frontend | Planned |
| 2 | Workspaces, members, invites; Space → Folder → List hierarchy | Planned |
| 3 | Tasks: assignees, priority, dates, tags, checklists, subtasks | Planned |
| 4 | Comments, activity, real-time updates, notifications | Planned |
| 5 | Filters, saved views, search, ⌘K command palette, performance at scale | Planned |
| 6 | Attachments, rich text, observability, generated API types, tests | Planned |
| 7 | Landing page, guest demo polish, launch | Planned |
