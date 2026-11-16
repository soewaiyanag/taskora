# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Small teams (3–15 people)** planning and tracking shared work day to day: a lead who sets up spaces and lists, and members who pick up, move and comment on tasks.
- **Portfolio reviewers** (recruiters, hiring managers, engineers) who open the app cold. They must understand what it does and enjoy using it within about 60 seconds, without creating an account.

Taskora is built as a real tool for the first group. The first-run experience is tuned for the second.

## Product Purpose

A task manager for small teams, in the ClickUp family: Workspace → Space → Folder → List → Task. It exists as a full-stack portfolio piece (Go backend, React frontend) that is also a usable product. Success means a team can run real work in it, and a reviewer leaves convinced of both the product thinking and the engineering.

## Positioning

**Calm and fast.** It has ClickUp's hierarchy and depth, but it's quiet by default: fewer settings, keyboard-first, and every edit appears instantly (optimistic updates) and live for teammates (WebSocket). Power is available on demand, not shown all at once.

## Operating Context

- Mostly desktop and laptop, in long working sessions next to chat and code tools. On phones people check and update tasks, but don't plan.
- **Guest demo:** one click opens a seeded workspace with sample spaces, lists, tasks, teammates, comments and activity. Signup remains available.
- Evolves from the author's earlier kanban app (multi-board, drag-and-drop, nested subtasks, light/dark theme). Taskora is a strict superset of it.

## Capabilities and Constraints

- **Hierarchy:** workspaces with members (roles) and invite links; spaces, folders, lists; custom statuses per list (todo / active / done categories).
- **Tasks:** board with drag between statuses; task detail panel; checklists and child subtasks; assignees, priority, start/due dates, tags.
- **Collaboration:** comments with @mentions, activity log, live updates, notifications inbox.
- **Power:** filters, sort, group-by, saved views; full-text search; ⌘K command palette and keyboard shortcuts.
- **Content:** file attachments; rich text (Tiptap) in descriptions and comments.
- **Stack:** React + TypeScript (Vite), Tailwind CSS v4, shadcn/ui (Radix) primitives, Lucide icons; Go API. The UI must be buildable from these.
- **Parked:** list/table, calendar and timeline views; time tracking; automations. Board is the only view for now.

## Brand Commitments

- Name: **Taskora**.
- Must not reuse a visual world already shown on soewaiyanag.dev: the Balatro felt/CRT portfolio (dark teal, pixel type), Tiebreak (cream with rust), snipsh (near-black with a blue glow), the kanban app (lavender/purple), or the entertainment app (navy with red).
- Must read as premium.
- Mark: the Flagged T (the T of Taskora wearing the owner flag every card carries), with the lowercase wordmark `taskora` in Archivo's wide cut. Type: Archivo + Martian Mono. Chosen 2026-11-16.

## Evidence on Hand

- **Board prototype:** `design/prototype/index.html`, a clickable demo of the board with sample data, the guided tour, the Inbox and teammates' live moves. Published at https://claude.ai/artifact/1PtDkDhexTtmmVB13yAZLb.
- **Landing page:** `design/landing/index.html` ("Two screens, one board"), published at https://claude.ai/artifact/WxRGV59SdZe1AYRTKXnFSM.
- **Brand files:** `design/brand/taskora-mark.svg` (the Flagged T) and `design/brand/taskora-icon.svg` (app icon and favicon). `design/brand/alternates/` holds a mark saved for other projects, not Taskora.
- No users, testimonials, metrics or logos exist. Demo content is sample data and must read as such, never as real customers.

## Product Principles

1. **Quiet until asked.** Show the work first. Settings, metadata and power tools come forward only when someone reaches for them.
2. **Instant is the default.** Every action feels done the moment it's taken; sync happens behind it.
3. **Keyboard and mouse are equals.** Everything is clickable, and everything has a shortcut.
4. **Explain itself in a minute.** A cold visitor in the demo should grasp the hierarchy and the core loop without reading docs.
5. **Team presence, not noise.** Show who's doing what, and keep it out of the way.

## Accessibility & Inclusion

WCAG 2.2 AA: full keyboard operation (including drag alternatives for moving tasks), visible focus, sufficient contrast in light and dark themes, and reduced-motion support.
