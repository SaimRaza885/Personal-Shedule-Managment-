# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Layout

**AppShell** — `src/components/layout/AppShell.jsx`
Root layout: `min-h-screen bg-background` + flex row; sidebar + `flex-1 flex flex-col` containing Topbar and `main.flex-1 p-6` rendering `<Outlet />`.

**Sidebar** — `src/components/layout/Sidebar.jsx`
`aside.w-64 bg-surface border-r border-border h-screen sticky top-0`. App title: `text-xl font-semibold text-text-primary`.
Nav item base: `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors`.
Active: `bg-accent-light text-accent`. Inactive: `text-text-secondary hover:bg-surface-secondary`. Icons: `lucide-react` at `size-4`.

**Topbar** — `src/components/layout/Topbar.jsx`
`header.h-16 border-b border-border bg-surface px-6 flex items-center justify-between`. Date text: `text-sm text-text-muted`. Icon button: `p-2 rounded-md hover:bg-surface-secondary`, icon `size-5 text-text-muted`.

### Pages

**Placeholder** — `src/pages/Placeholder.jsx`
`bg-surface border border-border rounded-lg p-6`, title `text-lg font-semibold text-text-primary`, body `text-sm text-text-muted mt-2`.

*Feature 02 (SQLite Database Foundation) added no UI components — data layer only (`src/lib/database.js`, `src/lib/migrations.js`, `src/lib/devDatabase.js`). Registry unchanged.*

### Feedback states (feature 03)

**LoadingState** — `src/components/feedback/LoadingState.jsx`
`flex flex-col items-center justify-center gap-3 py-16 text-text-muted`, spinner `Loader2 size-6 animate-spin text-accent`, message `text-sm`. `role="status"`.

**EmptyState** — `src/components/feedback/EmptyState.jsx`
`flex flex-col items-center justify-center gap-2 py-16 text-center`. Optional lucide icon `size-8 text-text-muted`; title `text-base font-semibold text-text-primary`; description `text-sm text-text-muted max-w-sm`; optional action slot `mt-3`.

**ErrorState** — `src/components/feedback/ErrorState.jsx`
Same layout as EmptyState with `role="alert"`; icon `CircleAlert size-8 text-destructive`; optional retry via shadcn `Button variant="outline" size="sm" mt-3`.

**AppErrorBoundary** — `src/components/feedback/AppErrorBoundary.jsx`
Class boundary wrapping `<Outlet />` in AppShell. Caught renders render `ErrorState` ("This screen crashed", error message, retry resets state).

### Today section (feature 04)

**NowCard** — `src/components/today/NowCard.jsx`
Section card: `rounded-lg border border-border bg-surface p-6`. Header: `mb-4 flex items-center justify-between gap-2`, title `text-base font-semibold text-text-primary`, status badge at right. Task body: `flex flex-wrap items-end justify-between gap-4`; label `text-sm text-text-muted` ("Current task" / "Up next"), title `text-xl font-semibold text-text-primary`, meta row `flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary` (time range via `formatTime`, steps remaining, planned minutes). Start action: shadcn `Button` with `Play size-4` (default variant = project accent), only when the block is current. Empty: `EmptyState` (CalendarPlus) "Nothing scheduled right now".

**ScheduleCard** — `src/components/today/ScheduleCard.jsx`
Same section card. List: `ul.divide-y divide-border-light`; row `flex items-center gap-4 py-3`; time col `w-28 shrink-0 text-sm text-text-secondary` ("9:00 AM — 10:00 AM" via `formatTime`); title `min-w-0 flex-1 truncate text-sm font-medium` (`text-text-primary`, completed → `text-text-muted line-through`); trailing status badge. Empty: `EmptyState` (Clock) "No tasks scheduled".

**TopThreeCard** — `src/components/today/TopThreeCard.jsx`
Same section card. List: `ol.space-y-2`; row `flex items-center gap-3`; rank circle `flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent` showing position; title `min-w-0 truncate text-sm font-medium` (same completed treatment as ScheduleCard). Empty: `EmptyState` (Star) "No top 3 set".

**DailyProgressCard** — `src/components/today/DailyProgressCard.jsx`
Same section card. Per metric: label row `mb-1.5 flex justify-between text-sm` (label `text-text-secondary`, value `font-medium text-text-primary`), track `h-1 rounded-full bg-border-light`, fill `h-1 rounded-full bg-accent` with inline `style={{ width: "%" }}` capped at 100. Two metrics: "Tasks completed" (N of M) and "Planned time done" (N of M min).

**Task status badges** — `src/components/today/taskStatus.js`
`statusBadgeClass(status)` returns `rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap` + tone: not_started `bg-surface-secondary text-text-secondary`, in_progress `bg-accent-light text-accent`, completed `bg-success-light text-success-foreground`, paused `bg-warning-light text-warning-foreground`, cancelled `bg-surface-secondary text-text-muted`. `statusLabel(status)` maps to display text. Any new status badge must reuse this helper.

**Today page composition** — `src/pages/today/Today.jsx`
`space-y-6`: NowCard; then `grid grid-cols-2 gap-6` with TopThreeCard + DailyProgressCard; then ScheduleCard. Page-level loading: `LoadingState`; page-level error: `ErrorState` with retry (`refetch`), never raw error text.

**Time formatting** — `src/lib/datetime.js`
Stored times are `HH:mm` (24h) — display only via `formatTime(hhmm)` → `h:mm a` (date-fns `DATE_FORMATS.TIME`). Never format raw `HH:mm` inline in components.

### shadcn/ui primitives (generated, JS mode)

Live in `src/components/ui/` (button, input, badge, card, label, select, dialog, table, tabs, dropdown-menu, form). Generated by `npx shadcn@latest add` — do not hand-edit. `cn()` imports rewritten to `@/lib/utils`. shadcn v4 emits `import { Slot } from "radix-ui"` (unified radix package) — keep the `radix-ui` and `cn` npm dependencies for future CLI adds.

### Tokens

See `ui-tokens.md`. Tailwind v4 `@theme` block lives in `src/index.css`; shadcn semantic variables (`--primary`, `--card`, etc.) are mapped to the project palette in `:root` + `@theme inline` in the same file. Never add colors outside that file.
