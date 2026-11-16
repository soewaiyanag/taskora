---
version: 1
slug: "design-prototype-index-html"
primary_target: "design/prototype/index.html"
related_targets: []
---

# Surface: app core loop (board, task panel, ⌘K)

Mode: Operate. Light first; dark ships later.
Audience/job: small-team members moving and updating tasks daily; portfolio reviewers opening the guest demo cold.
Scope: interactive prototype with demo data (sample, labelled), before the React build.

## Direction contract

FORM: Planning Wall (seed:cbe9ae09e8a85b14), assigned, refined by the user: "premium, far fewer colours, bigger cards, not generic".

THESIS: The quiet planning wall. A calm stone wall of white paper cards where each teammate owns one ink colour, shown only as a small paper flag on their cards, until you ask to see someone's work. Refuses the category default of grey lanes, avatar stacks and one blue accent, and refuses the loud all-colour sticky-note wall.

OWN-WORLD: Stone wall ground (cool-neutral), white paper cards with a soft two-layer paper shadow, a deep graphite sidebar. Five deep, desaturated owner inks (ochre, sage, harbour blue, rosewood, teal), each used only as a flag, an avatar ring and the lens wash. Archivo's wide cut only for the list title and the drawer task title (wall-signage voice); Archivo at normal width for card titles, dates and all UI; Martian Mono only for task codes. (2026-11-16: the user replaced Source Serif 4 + Geist with Archivo + Martian Mono, and chose the Flagged T mark; the sidebar header shows it with the signed-in person's ink on the flag.) (Amended after the finish review: the user approved card titles in the grotesk.) Neutrals from one 11-step ramp.

FIRST VIEWPORT: Graphite sidebar with the workspace tree; top bar with breadcrumb and the people key, whose avatars carry online-presence dots; four wide status lanes (about 300px) of generous cards (title 15px, code, flag, date rail, checklist, avatar). The task panel opens as a drawer over the board, never squeezing it.

SIGNATURE: The owner lens. Hover or press a teammate in the people key (or keys 1 to 5) and their cards wash in their ink while everyone else's step back. At rest the wall is white and quiet.

STORY: In one glance a visitor reads status lanes, then who holds what via flags, then discovers the lens. Opening a card shows the full task without losing the board.

RISK: The wide cut can turn shouty; keep it to the two titles, and keep controls standard at normal width.

Raises kept: one 11-step neutral ramp; task codes everywhere (WEB-142); one motion constant (220ms, slight overshoot); date rail drawn to the true start-to-due span.
