---
version: 1
slug: "design-screens-index-html"
primary_target: "design/screens/index.html"
related_targets: []
---

# Surface: account screens (Log in, Sign up, My tasks, Settings)

Mode: Operate (auth is the app's front door, not marketing). Follows the system theme.
Audience/job: a teammate logging in or creating an account in under a minute; a portfolio reviewer who should reach the demo in one click. Inside the app: checking my own work across lists, and changing profile, notifications, workspace and members.
Scope: static review page with sample data before the React build. My tasks keeps its approved list structure; Log in, Sign up and Settings are redesigned (2026-11-24) because the user found auth generic, the ink decoration (team stripe, five flags, "Your ink" preview) distracting, and Settings plain. A split auth layout with a live board was tried the same day and rejected by the user: "should be focus on login only not the task design at the auth pages. it feel too force to look at the design."
Constraints: DESIGN.md unchanged. No product imagery, board, inks or animation on Log in or Sign up. Paste and password managers allowed, show/hide password, errors inline on blur plus a focusable summary on submit. No forgot-password route (out of build scope).

Open decisions for the user before DESIGN.md changes: form errors in brick (DESIGN.md reserves brick for overdue/urgent); Delete workspace stays a graphite secondary button; task-code prefixes are per space; your ink is assigned, not picked (an admin swaps inks).

## Direction contract

THESIS: The front door is only a door. Log in and Sign up are an open white page holding one form, with nothing to look at but the next field; calm comes from type and space, not from a card, a picture of the product or colour. Settings become one calm ledger of labelled sections instead of a stack of identical panels. Refuses the centred card on a grey wall, decorative ink, and selling the product on the sign-in screen.

OWN-WORLD: Quiet Planning Wall as written in DESIGN.md: paper ground for auth (paper in dark mode too), graphite primary button, hairline rules, Archivo wide cut only for the auth heading, normal width for everything else, Martian Mono only for task codes and keys. Inside the app, the stone wall, white sheets and graphite sidebar of the board prototype. No stripes, dots or flag rows as ornament.

STORY: A returning teammate types two fields and is in. A new person gives a name, email and password and gets a workspace. A reviewer takes the one quiet "Explore the demo workspace" line under the form. In Settings, each section says what it controls on the left and shows the controls on the right, with a live preview where the outcome is visual (how teammates see you, theme, sidebar name, task code).

FIRST VIEWPORT: Log in at 1440: an open paper page; the lockup top-left and "New to Taskora? Create an account" top-right; one 400px column centred: wide-cut h1 at 34px, one lead line, Email, Password with Show, the full-width graphite Log in button, then a hairline and one line "Just looking around? Explore the demo workspace →"; the portfolio note bottom-left. Nothing else on the page. At 390 the same column fills the width and the demo line stacks.

FORM: seed: none (pinned) "Open page" (user's pick from a three-option round, 2026-11-24) for Log in and Sign up; My tasks and Settings extend the app shell of design/prototype/index.html.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
