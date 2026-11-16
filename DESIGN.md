---
name: Taskora
description: The quiet planning wall. White paper cards on a cool stone wall, one ink per teammate.
colors:
  ramp-0: "#ffffff"
  ramp-1: "#f6f7f5"
  ramp-2: "#ecedea"
  ramp-3: "#e0e2de"
  ramp-4: "#cfd2cd"
  ramp-5: "#b1b6b0"
  ramp-6: "#8e948d"
  ramp-7: "#646a63"
  ramp-8: "#555b54"
  ramp-9: "#353a35"
  ramp-10: "#1a1e1b"
  wall: "#ecedea"
  paper: "#ffffff"
  paper-2: "#f6f7f5"
  line: "#e0e2de"
  line-2: "#cfd2cd"
  fg: "#1a1e1b"
  fg-2: "#555b54"
  fg-3: "#646a63"
  rail: "#cfd2cd"
  rail-bar: "#8e948d"
  shell: "#1b201d"
  shell-2: "#262c28"
  shell-line: "#323934"
  shell-fg: "#e9ece8"
  shell-muted: "#a9b0aa"
  primary: "#1a1e1b"
  on-primary: "#ffffff"
  danger: "#b5412c"
  toast: "#1b201d"
  on-toast: "#e9ece8"
  scrim: "rgba(26,30,27,.28)"
  ink-ochre: "#b8862b"
  ink-harbour: "#46698f"
  ink-rosewood: "#a4505e"
  ink-sage: "#5f8a5b"
  ink-teal: "#3c8580"
  wall-dark: "#141715"
  paper-dark: "#1d211e"
  paper-2-dark: "#242925"
  line-dark: "#2e342f"
  line-2-dark: "#3b423c"
  fg-dark: "#e8ebe7"
  fg-2-dark: "#b4bab3"
  fg-3-dark: "#959c94"
  rail-dark: "#343a35"
  rail-bar-dark: "#7d847c"
  shell-dark: "#0d0f0e"
  shell-2-dark: "#1a1e1b"
  shell-line-dark: "#262c28"
  shell-fg-dark: "#e9ece8"
  shell-muted-dark: "#a2a9a3"
  primary-dark: "#e8ebe7"
  on-primary-dark: "#141715"
  danger-dark: "#e07a63"
  toast-dark: "#e8ebe7"
  on-toast-dark: "#141715"
  scrim-dark: "rgba(0,0,0,.5)"
  ink-ochre-dark: "#d9a84a"
  ink-harbour-dark: "#7fa2c9"
  ink-rosewood-dark: "#cc7f8c"
  ink-sage-dark: "#8db889"
  ink-teal-dark: "#6bb5ae"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 640
    lineHeight: 1.08
    letterSpacing: "-0.018em"
    fontVariation: "\"wdth\" 116"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 640
    lineHeight: 1.15
    letterSpacing: "-0.015em"
    fontVariation: "\"wdth\" 116"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.38
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  body-long:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13.5px"
    fontWeight: 600
    lineHeight: 1.45
  meta:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "\"tnum\""
  code:
    fontFamily: "Martian Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "10.5px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.01em"
    fontVariation: "\"wdth\" 87.5"
    fontFeature: "\"tnum\""
rounded:
  xs: "4px"
  sm: "7px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklab, #1a1e1b 86%, #ecedea)"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-2}"
  button-small:
    padding: "0 12px"
    height: "32px"
  icon-button:
    textColor: "{colors.fg-2}"
    rounded: "{rounded.sm}"
    size: "30px"
  icon-button-hover:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.fg}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.fg}"
    typography: "{typography.title}"
    rounded: "{rounded.lg}"
    padding: "14px 16px 12px"
  card-done:
    backgroundColor: "color-mix(in oklab, #ffffff 55%, #ecedea)"
    textColor: "{colors.fg-2}"
    padding: "12px 16px"
  tag:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.fg-2}"
    rounded: "{rounded.full}"
    padding: "0 8px"
    height: "18px"
  avatar:
    textColor: "{colors.fg}"
    rounded: "{rounded.full}"
    size: "26px"
  select:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "0 30px 0 10px"
    height: "32px"
  textarea:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  nav-item:
    textColor: "{colors.shell-fg}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "32px"
  nav-item-active:
    backgroundColor: "{colors.shell-2}"
    textColor: "{colors.shell-fg}"
  sidebar-search:
    backgroundColor: "{colors.shell-2}"
    textColor: "{colors.shell-muted}"
    rounded: "{rounded.md}"
    height: "36px"
  people-key:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "0 6px 0 14px"
    height: "44px"
  drawer:
    backgroundColor: "{colors.paper}"
    width: "560px"
  palette:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    width: "620px"
  palette-option-selected:
    backgroundColor: "{colors.paper-2}"
    rounded: "{rounded.md}"
    height: "40px"
  toast:
    backgroundColor: "{colors.toast}"
    textColor: "{colors.on-toast}"
    rounded: "{rounded.lg}"
    padding: "10px 12px 10px 16px"
  kbd:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.fg-2}"
    rounded: "{rounded.xs}"
    padding: "3px 5px"
---

# Design System: Taskora

## Overview

**Creative North Star: "The Quiet Planning Wall"**

A calm, cool stone wall of white paper cards. Each teammate owns one deep, desaturated ink, and that ink appears only where it marks ownership: a small paper flag on their cards, a ring around their avatar, and the wash of the owner lens. At rest the wall is white, grey and graphite; colour arrives only when someone asks whose work is whose. A deep graphite sidebar frames the wall like the room it hangs in.

Density is generous rather than packed: wide status lanes (minimum 260px, about 300px on a laptop), cards with real breathing room, and one quiet layer of paper shadow. One family, Archivo, does all the talking. Its wide cut is the wall's signage, reserved for the list title and the open task's title; its normal width is the workhorse for everything else, including card titles; and only task codes are monospaced, in Martian Mono. Controls stay standard and legible so the system reads as premium through restraint, not ornament.

The world deliberately refuses the category default (grey lane columns, overlapping avatar stacks, one blue accent, colourful status pills) and equally refuses the loud all-colour sticky-note wall.

**Token naming.** Frontmatter keys map one-to-one onto Tailwind v4 `@theme` variables: `colors.paper` becomes `--color-paper`, `rounded.lg` becomes `--radius-lg`, `typography.code` fonts become `--font-mono`, the `"wdth" 116` of display and headline is written `font-stretch: 116%` (Tailwind's `font-stretch-*`), shadows in the sidecar become `--shadow-card` / `--shadow-lift` / `--shadow-drawer`, motion becomes `--ease-settle` / `--ease-out` / `--duration-base`. Keys ending in `-dark` are the dark-theme values of the same semantic token, not separate tokens: emit them as overrides of the base variable under the dark selector. The 11-step neutral ramp is named `ramp-*` on purpose, so it never collides with Tailwind's built-in `stone`, `neutral` or `gray` palettes.

**Key Characteristics:**
- Cool stone wall, white paper cards, graphite sidebar.
- Five owner inks, used only to mark whose work something is.
- One family: Archivo's wide cut for two titles only, normal width for everything else; Martian Mono for task codes only.
- The Flagged T mark: the T of Taskora wearing the owner flag.
- One soft two-layer paper shadow at rest, a deeper one on lift.
- One motion constant (220ms) with a slight settling overshoot; my moves settle, a teammate's moves glide.
- Light and dark are full themes built from the same semantic roles.

## Colors

A near-monochrome cool-stone system with five deep owner inks and one brick red for trouble.

### Primary
- **Graphite Ink** (`primary`): the single filled action per view (New task) and every "this is the strong thing" mark: focus rings, the selected-card outline, the drop marker, the today tick on date rails, the composer outline, checkbox accent. In dark mode it inverts to near-white (`primary-dark`).

### Secondary: the Owner Inks
One per teammate, in order: **Ochre** (`ink-ochre`), **Harbour Blue** (`ink-harbour`), **Rosewood** (`ink-rosewood`), **Sage** (`ink-sage`), **Teal** (`ink-teal`). Each has a lighter dark-theme twin (`-dark`). Components receive the owner's ink through a single local `--ink` variable, so every ownership mark draws from the same value. Where they appear in the build: the card flag, the avatar ring and its 18% tint fill, the lens wash on cards (13% fill, 38% inset ring) and their tags and date bars, the 3px top band of the task drawer, checklist progress segments, @mention highlights (20%), palette result dots and the pressed-person dot.

### Tertiary
- **Brick** (`danger`, dark `danger-dark`): overdue dates, overdue date-rail bars and the urgent-priority icon. Nothing else.

### Neutral
- **Stone Wall** (`wall`): the app canvas behind the lanes.
- **Paper** (`paper`): cards, the drawer, the palette, the people key, secondary buttons and fields.
- **Paper Shade** (`paper-2`): hover fills, tags, comment bubbles, kbd keys, the selected palette option.
- **Hairline** (`line`) and **Rule** (`line-2`): dividers inside paper surfaces, then control borders and scrollbar thumbs.
- **Ink Black / Pencil / Faint Pencil** (`fg`, `fg-2`, `fg-3`): primary text, secondary text and metadata, then task codes and priority icons.
- **Rail / Rail Bar** (`rail`, `rail-bar`): the date rail track and its start-to-due span.
- **Graphite Shell** (`shell`, `shell-2`, `shell-line`, `shell-fg`, `shell-muted`): the sidebar's own dark scale, kept separate from the wall so the sidebar stays dark in light mode.
- **Toast** (`toast`, `on-toast`): an inverted chip that is dark on light and light on dark.
- **Scrim** (`scrim`): behind the palette and the mobile sidebar.

All neutral roles in light mode are drawn from the 11-step `ramp-0` to `ramp-10` scale; the dark theme replaces them with its own values.

### Named Rules
**The Ink Means Owner Rule.** An owner ink appears only on something that belongs to, or points at, one specific teammate. Never use an ink for status, category, priority, tags or decoration.

**The White At Rest Rule.** With no lens active, the board shows no colour beyond small flags, avatar rings and brick for overdue. A full card turns colour only under the owner lens.

**The One Ramp Rule.** Light-theme neutrals come from the 11-step ramp. Add a role by pointing it at a ramp step, not by inventing a new grey.

## Typography

**Display Font:** Archivo, wide cut (`font-stretch: 116%`, weight 640)
**Body Font:** Archivo, normal width (with ui-sans-serif, system-ui)
**Label/Mono Font:** Martian Mono at its 87.5 width (with ui-monospace, SF Mono, Menlo)

**Character:** Wall signage. The wide cut reads like the room signs and planning boards a team works under: calm, sturdy and legible from across the wall. The same family at normal width does all the operating, so the two voices never clash. The mono is a label printer used only for task codes. Load one variable Archivo file (`wdth` 100–125, `wght` 400–700) and Martian Mono at `wdth` 87.5, `wght` 500–600.

### Hierarchy
- **Display** (640, 36px, 1.08, wide): the list title at the top of the board (28px under 880px). Balanced wrapping.
- **Headline** (640, 30px, 1.15, wide): the task title in the open drawer. Nowhere else in the app.
- **Title** (500, 15px, 1.38): card titles; done cards drop to 14px in `fg-2`. The composer input matches it.
- **Body** (400, 14px, 1.45): base UI text, checklist items, comment bubbles. Long-form descriptions use **Body Long** (14.5px, 1.6, max 62ch).
- **Label** (600, 13.5px): lane names and drawer section headings. Buttons and nav items use the same size at 500.
- **Meta** (400, 12.5px, tabular figures): card footers, dates, counts. Sidebar group labels and palette group labels sit at 12px 500 in sentence case.
- **Code** (Martian Mono 500, 10.5px, tabular): task codes like WEB-142 on cards, in the drawer header (11.5px) and in palette results (11px). kbd keys use Martian Mono 500 10px. Martian Mono runs large, so every mono size sits one step below the text beside it.
- **Wordmark** (690, wide at 114%, -0.02em, lowercase `taskora`): set beside the mark; see Components.

Marketing pages use a larger scale of the same roles, all in Archivo: **Hero** (640 wide, `clamp(40px, 5vw, 74px)`, 1.04, -0.022em, max 24ch), **Section headline** (640 wide, `clamp(32px, 3.6vw, 50px)`, 1.08, -0.02em), **Statement** (640 wide, 30px, 1.15), **Lede** (400, 18px, 1.55, `fg-2`, 46 to 52ch) and **Body** (400, 16px, 1.6, max 56ch). Code samples there use Martian Mono at 11 to 12px.

### Named Rules
**The Two Titles Rule.** In the app the wide cut sets exactly two things: the current list's title and the open task's title. Card titles, dates, buttons and every other piece of UI stay at normal width. Marketing pages extend it to their headlines and the wordmark.

**The Codes Only Mono Rule.** Martian Mono is for task codes, keyboard keys and code samples. Never set dates, counts or body text in mono; use Archivo with tabular figures instead.

**The Stretch After Shorthand Rule.** The `font` shorthand resets `font-stretch`, so declare `font-stretch` after it, never before.

## Layout

Two columns on desktop: a fixed 252px graphite sidebar and the main area. The main area stacks a top bar (breadcrumb, list title and subline on the left; the people key, Filter and New task on the right, bottom-aligned) over the board.

The board is a horizontal grid of status lanes, each at least 260px wide and sharing the remaining width equally, with 20px gutters and 32px side padding. Lanes have no fill at rest; they are just a heading and a column of cards on the wall. Cards stack with a 12px gap. Each lane scrolls vertically on its own; the board scrolls horizontally.

The task drawer is fixed to the right edge, `min(560px, 100%)` wide, and slides over the board without resizing it. The command palette sits 12vh from the top, `min(620px, 100%)` wide.

Spacing runs on a 4px base (the frontmatter steps map to Tailwind's default `--spacing: 0.25rem`), with 2px half-steps (6, 10, 14px) inside dense controls. Main rhythm: 32px page padding, 24px section spacing in the drawer, 20px lane gutters, 12px between cards, 14px/16px card padding.

Under 880px the sidebar becomes an off-canvas sheet (`min(288px, 86vw)`) behind a menu button and scrim; lanes become 84vw wide with horizontal scroll snapping; the title drops to 28px; the people key loses its note and button labels collapse to icons. On coarse pointers the people-key avatars spread to a 14px gap, each with a 44px hit area. Safe-area insets are respected on every fixed edge.

## Elevation & Depth

Depth is paper on a wall: soft, short, two-layer shadows that read as card stock lifted a millimetre off stone, never as floating panels. Every resting card carries the card shadow; hover and drag lift it to a deeper shadow with a 2px rise. Overlays (drawer, palette, toast) cast longer, softer shadows. Inside paper surfaces, separation uses hairlines and the paper shade, not more shadow. Done cards lose their shadow and sink toward the wall. In dark mode the same shadows switch to black at higher opacity. Exact values are in the sidecar.

### Shadow Vocabulary
- **Card** (`--sh-card`): every resting card and the people key.
- **Lift** (`--sh-lift`): card hover, drag preview, the new-task composer.
- **Drawer** (`--sh-drawer`): a hairline plus a wide, soft left-cast shadow on the task drawer.
- **Overlay**: the palette (hairline ring plus a deep 90px shadow) and the toast (a 40px drop). In the build these are written as raw values rather than tokens.

### Named Rules
**The Paper Not Glass Rule.** No blur, no glassmorphism, no glow. Depth is a soft paper shadow or a hairline.

## Shapes

Gently rounded and consistent: 10px for paper (cards, comment bubbles, fields, toast), 8px for controls (buttons, selects, sidebar search, palette options), 7px for small nav and icon buttons, 14px for the largest containers (palette, lane drop zone), 4px for kbd keys and mention highlights, and full pills for tags, the people key and the Demo chip. Avatars and presence dots are circles.

The flag is the one signature silhouette: a 20 by 9px tab in the owner's ink that sticks up 5px above the card's top edge, 18px in from the right, rounded 3px on its top corners and 1px at the base. Date rails are 4px bars with 2px ends and a 2px today tick that overshoots the track by 4px on each side.

## Components

### Buttons
Standard, quiet and precise.
- **Shape:** gently rounded (8px), 36px tall, 14px horizontal padding; small variant 32px tall.
- **Primary:** graphite fill with white text (inverted in dark mode). Hover mixes in 14% of the wall colour. It may carry its shortcut as a faded inline kbd.
- **Secondary:** paper fill, `line-2` border, Archivo 500 13.5px. Hover fills with the paper shade.
- **Icon button:** 30px square, 7px radius, `fg-2` icon at 16px with a 1.75 stroke; hover fills with the paper shade and darkens the icon.
- **Focus:** a 2px `fg` outline at 2px offset, used everywhere.

### Chips
- **Tags:** pill, paper-shade fill, hairline border, `fg-2` text at 11.5px, 18px tall. Under the owner lens they pick up a 10% ink tint.
- **Demo chip:** a pill in the shell scale, marking sample data in the sidebar header.

### Cards / Containers
The task card is the core object.
- **Corner Style:** 10px.
- **Background:** paper; done cards are paper mixed 55% toward the wall.
- **Shadow Strategy:** card shadow at rest, lift on hover with a 2px rise (see Elevation).
- **Border:** none. Selection is a 2px `fg` outline at 3px offset.
- **Internal Padding:** 14px top, 16px sides, 12px bottom.
- **Anatomy, top to bottom:** owner flag; task code with the priority icon on the right; title (Archivo 15px 500); tags; the date rail; a footer with the due date, checklist count and comment count in meta type, and the owner's avatar on the right. Done cards drop the rail and tags and show "Done" with a date.
- **Date rail:** a track spanning the list's date range, a bar drawn over the task's true start-to-due span, and a today tick. The bar turns brick when the task is overdue, and takes the owner's ink under the lens.
- **Drag:** the source dims to 35% with no shadow; the target lane gets a 5% `fg` wash; a 3px `fg` drop marker shows the landing spot.
- **My move (direct):** pointer-driven, not native HTML drag. Past a 5px threshold a copy of the card lifts under the pointer (scale 1.03, a deeper shadow), leans up to 5 degrees toward its horizontal speed, and on release settles into its slot in 320ms with the settle overshoot. Escape, or a drop outside a lane, flies it home. An Undo toast follows. Touch drag waits for a long-press sensor in the React build.
- **A teammate's move (remote):** it announces itself first. Their ink outlines the card and their first name sits on a tag, then the card glides flat for 600ms on `cubic-bezier(.45,0,.2,1)` with no lean and no overshoot. The outline and tag hold for 1.8s and fade over 300ms; the toast names the mover and has no Undo. The two motions must stay visibly different so a remote move never reads as a glitch.
- **Landing in Done:** whoever moved it, the card sinks from lifted paper into the wall (560ms) and its check draws (380ms). That is the whole celebration; add nothing louder.

### Inputs / Fields
- **Style:** paper fill, `line-2` border, 8px radius for selects (32px tall, custom chevron), 10px for textareas.
- **Focus:** the global 2px `fg` outline (1px offset on textareas).
- **Composer:** an inline new-card field shaped like a card, with the lift shadow and a 1.5px `fg` inset ring.

### Navigation
- **Sidebar:** graphite shell, 252px. Workspace header, then a search button that opens the palette, then Inbox and My tasks, then the Spaces tree (spaces carry a 16px lettered square; folders and lists use Lucide-style line icons; children indent 16px; the chevron rotates 90 degrees on expand).
- **Items:** 32px tall, 7px radius, 13.5px `shell-fg`. Hover fills `shell-2`; the current page adds a 1px `shell-line` inset ring.
- **Footer:** a dashed-border shortcut key card, then the signed-in user with the theme toggle.
- **Breadcrumb:** 13px `fg-2` with chevron separators above the list title.

### Mark and Wordmark
The **Flagged T**: the T of Taskora wearing the owner flag every card carries, at the flag's own proportions (a tab with rounded top corners, sitting on the crossbar's right arm with a hairline gap). Files: `design/brand/taskora-mark.svg` (graphite) and `design/brand/taskora-icon.svg` (app icon and favicon: paper mark on a graphite tile, 7/32 radius).
- **Lockup:** mark at 26px beside the lowercase wordmark `taskora` (Archivo 690, wide 114%, -0.02em) at 21px, 9px gap. The mark carries the capital T, so the wordmark stays lowercase.
- **Colour:** single-colour graphite (`fg`) on light, `shell-fg` on graphite and dark. Inside the app only, the flag takes the signed-in person's ink (the sidebar header shows Mai's ochre in the demo). It is never set in an ink anywhere else; the Ink Means Owner Rule still holds.
- **Minimum size:** 16px. Below 24px the hairline gap closes; that is expected.
- **Don't** redraw it as a card with a corner tab (the previous mark, too close to Tivazo's), add a checkmark, or put it on a tinted tile.

### People Key and Owner Lens (signature)
A paper pill in the top bar holding a status note and one avatar per teammate. Avatars are 26px circles filled with an 18% tint of the owner's ink and ringed 1.5px in full ink, with initials in Archivo 600 11px. Online teammates carry a 10px presence dot in `fg` (neutral graphite, never a colour) with a 2px paper ring.

Hovering, focusing or pressing a person (or keys 1 to 5) turns on the lens: the person rises 2px with a doubled ring, every other card fades to 36%, and that person's cards wash in their ink. Pressing pins the lens and shows a 4px ink dot under the avatar. The note line reports the person and their open-task count.

### Task Drawer
Slides in from the right over the board (340ms, `ease-out`). A 3px owner-ink band runs across its top. Header: task code, location, copy-link and close. Body: the wide headline title, a two-column property grid (112px labels in `fg-2`), then sections for description, checklist (segmented progress bar in the owner's ink), and activity plus comments (neutral 6px dots for events, paper-shade bubbles for comments, ink-tinted @mentions).

### Command Palette
A 14px-radius paper panel over a scrim, with a 58px search field at 17px, grouped results (12px 500 group labels), 40px options whose selected state is a paper-shade fill with a hairline inset, and a footer of kbd hints. Person and task results lead with a 10px ink square; actions use an outlined neutral square.

### Guided Tour (sidebar)
A four-step checklist pinned to the sidebar footer that teaches the core loop to a cold visitor: see a teammate's work, open a task, move a task to Done, jump anywhere with ⌘K. It sits in a `shell-2` panel with a `shell-line` hairline and 10px corners. The heading (13px 600) carries an "n of 4" count; under it, four 3px segments fill in `shell-fg` as steps complete. Each step is a 16px ringed circle with a title (12.5px) and a hint (12px `shell-mut`). Steps tick themselves off when the visitor does the thing, never by clicking the row: the circle fills, pops (380ms settle) and draws its check, and the segment fills (420ms ease-out). After the fourth step the panel becomes a short "That's the core loop" note with a shortcut key list.

### Inbox
A popover beside the Inbox nav item, not a page: paper, 14px corners, a hairline ring and a long soft shadow, `min(392px, 100vw - 32px)` wide and aligned to the nav item's top edge. Header: "Inbox" (15px 600) and a "Mark all read" text link. Each notification is a full-width row: a 24px avatar in the sender's ink (or a neutral circle icon for system notices), one line naming the person, the action and the task (with its code), an optional quoted comment in `fg-2`, and the time (12px) with a 7px `fg` unread dot. Read rows drop to `fg-2` and lose the dot. Opening a row marks it read, closes the popover and opens the task drawer. The nav badge bumps when the count changes. Escape or a click outside closes it.

### Toast
A centered inverted chip at the bottom (10px radius), with an underlined bold action such as Undo. It rises 16px into place on show.

## Do's and Don'ts

### Do:
- **Do** pass a teammate's colour through one `--ink` variable and derive every tint from it with `color-mix(in oklab, ...)`: 18% for avatar fills, 13% for the lens wash, 20% for mentions, 10% for tags under the lens.
- **Do** keep the board white at rest; let the owner lens be the only way a whole card turns colour.
- **Do** use the one motion constant: 220ms with `cubic-bezier(.34,1.32,.64,1)` for things that settle (cards, people, popovers), `cubic-bezier(.16,1,.3,1)` for sheets that slide (drawer 340ms, mobile sidebar 300ms), and collapse everything to 1ms under reduced motion.
- **Do** show a task code (Martian Mono) wherever a task is referenced: card, drawer header, palette result.
- **Do** draw date rails to the task's real start-to-due span against the list's date range.
- **Do** use Lucide-style line icons at 16px with a 1.75 stroke, in `currentColor`.
- **Do** keep presence dots neutral graphite (`fg`) with a paper ring.
- **Do** keep touch targets at 44px on coarse pointers, extending hit areas with an invisible inset rather than growing the visible control.

### Don't:
- **Don't** use an owner ink for status, priority, tags, categories or decoration. Status is carried by lane position and a neutral icon; priority by a neutral bar icon (brick only for urgent).
- **Don't** give lanes a tinted column background at rest; the only lane fill is the 5% drop-target wash during drag.
- **Don't** overlap avatars into stacks. Every person is a separate, ringed circle.
- **Don't** add a blue (or any) brand accent. The primary action is graphite.
- **Don't** set card titles, dates or controls in the wide cut.
- **Don't** set anything but task codes and keyboard keys in mono.
- **Don't** use blur, glass or glow for depth.
- **Don't** let the drawer squeeze the board; it always overlays.
