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
Same section card. Header row `mb-4 flex items-center justify-between gap-4`: title + right cluster `flex items-center gap-3` (optional `text-xs text-text-muted` "{n} min planned" sum, shadcn `Button variant="outline" size="sm"` with `Plus size-4` "Add task"). List: `ul.divide-y divide-border-light`; row `flex items-center gap-4 py-3`; time col `w-28 shrink-0 text-sm text-text-secondary` ("9:00 AM — 10:00 AM" via `formatTime`); title `min-w-0 flex-1 truncate text-sm font-medium` (`text-text-primary`, completed → `text-text-muted line-through`); trailing status badge. Row actions: two-step confirm — `Trash2` ghost icon button swaps to a confirm cluster (`text-xs text-text-muted` "Remove this block?" + `Button variant="ghost" size="xs"` Cancel + `Button variant="destructive" size="xs"` Remove); `Pencil` ghost icon button opens edit. Icon buttons: `variant="ghost" size="icon-xs"` with `aria-label`, icon `size-3.5`. Empty: `EmptyState` (Clock) "No tasks scheduled" with Add-task action.

**TopThreeCard** — `src/components/today/TopThreeCard.jsx`
Same section card. Props `{ items, onPick, onRemove, onMove, max = DEFAULT_VALUES.DAILY_TOP_THREE_MAX }`. Header row `mb-4 flex items-center justify-between gap-4`: title + right cluster `flex items-center gap-3` (`text-xs text-text-muted` "{n} of {max}" + shadcn `Button variant="outline" size="sm"` "Pick tasks" with `Star size-4`, disabled at max). List: `ol.space-y-2`; row `flex items-center gap-3`; rank circle `flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent` showing position; title `min-w-0 truncate text-sm font-medium` (same completed treatment as ScheduleCard); trailing controls `flex items-center gap-1`: `ChevronUp`/`ChevronDown` move buttons (`aria-label` "Move {title} up/down", disabled at edges) and `X` remove (`aria-label` "Remove {title} from Top 3"), all `variant="ghost" size="icon-xs"` with `size-3.5` icons. Empty: `EmptyState` (Star) "No top 3 set" with Pick-tasks action.

**TopThreePickerDialog** — `src/components/today/TopThreePickerDialog.jsx`
shadcn `Dialog` + `DialogContent sm:max-w-[440px]`. Title "Add to Daily Top 3"; description switches on `canAdd` (pick hint vs "Your Top 3 is full. Remove a task before adding another."). Props `{ open, onOpenChange, candidates, canAdd, isPending, onAdd }` — presentational, owns no data. List: `ul.divide-y divide-border-light`; row `flex items-center gap-4 py-3`; time col `w-28 shrink-0 text-sm text-text-secondary` (via `formatTime`), title `min-w-0 flex-1 truncate text-sm font-medium text-text-primary`, Add button `variant="ghost" size="sm"` (`Loader2 animate-spin` while `isPending`, `Star size-4` otherwise), disabled when `!canAdd || isPending`. Empty candidates: centered `text-sm text-text-muted` "Every available task is already in your Top 3."

**Top-three data layer** — `src/services/top-three.service.js` + `src/hooks/useTopThree.js`
`top-three.service.js` owns candidates/add/remove/move SQL (see progress-tracker 06 notes); `useTopThree.js` exposes `useTopThreeCandidates(date)` plus one `useMutation` hook per operation, each invalidating `["today"]`. Components never touch SQL directly.

**DailyProgressCard** — `src/components/today/DailyProgressCard.jsx`
Same section card. Per metric: label row `mb-1.5 flex justify-between text-sm` (label `text-text-secondary`, value `font-medium text-text-primary`), track `h-1 rounded-full bg-border-light`, fill `h-1 rounded-full bg-accent` with inline `style={{ width: "%" }}` capped at 100. Two metrics: "Tasks completed" (N of M) and "Planned time done" (N of M min).

**Task status badges** — `src/components/today/taskStatus.js`
`statusBadgeClass(status)` returns `rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap` + tone: not_started `bg-surface-secondary text-text-secondary`, in_progress `bg-accent-light text-accent`, completed `bg-success-light text-success-foreground`, paused `bg-warning-light text-warning-foreground`, cancelled `bg-surface-secondary text-text-muted`. `statusLabel(status)` maps to display text. Any new status badge must reuse this helper.

**Today page composition** — `src/pages/today/Today.jsx`
`space-y-6`: NowCard; then `grid grid-cols-2 gap-6` with TopThreeCard + DailyProgressCard; then ScheduleCard. Page-level loading: `LoadingState`; page-level error: `ErrorState` with retry (`refetch`), never raw error text. Feature 05 added schedule management: `ScheduleBlockDialog` controlled by a `dialog` state (`{ kind: "add" }` | `{ kind: "edit", block }`), mutations via `useAddScheduleBlock`/`useUpdateScheduleBlock`/`useRemoveScheduleBlock`, feedback via `toast.success`/`toast.error` from `sonner` (no raw error text). Feature 06 added Top 3 management: `TopThreePickerDialog` controlled by a boolean `pickerOpen`, candidates via `useTopThreeCandidates(date)`, mutations via `useAddTopThree`/`useRemoveTopThree`/`useMoveTopThree` (move is silent, add/remove toast). Today page handles its own loading/error inline (not the page-level primitives) because NowCard/progress depend on the same query.

### Schedule section (feature 05)

**ScheduleBlockDialog** — `src/components/schedule/ScheduleBlockDialog.jsx`
shadcn `Dialog` + `DialogContent sm:max-w-[440px]`. Title "Add task to schedule" / "Edit schedule block"; edit description shows the task title. react-hook-form + zod (`addSchema`: trimmed title + start/end; `editSchema`: times only): `TIME_REGEX /^([01]\d|2[0-3]):[0-5]\d$/`, cross-field refine `endTime > startTime` ("End time must be after start time"). Inputs: title `Input`, times `Input type="time" step={60}` in a `grid grid-cols-2 gap-4`; `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` primitives. Footer: Cancel `variant="outline"` + submit (default variant) with `Loader2 size-4 animate-spin` + "Saving…" while `isPending`. Form state resets on `open` via primitive `mode` deps (never the raw `mode` object). Controlled by parent; owns no data.

**Toasts** — `src/components/ui/sonner.jsx` (shadcn wrapper), mounted once in `src/App.jsx` as `<Toaster />`. Components toast via `import { toast } from "sonner"`. Never render raw error text to the page when a toast can carry it.

**Schedule data layer** — `src/services/schedule.service.js` + `src/hooks/useSchedule.js`
`schedule.service.js` owns add/edit/remove SQL (see progress-tracker 05 notes); `useSchedule.js` exposes one `useMutation` hook per operation, each invalidating TanStack Query key `["today"]` on success. Components never touch SQL directly.

**Time formatting** — `src/lib/datetime.js`
Stored times are `HH:mm` (24h) — display only via `formatTime(hhmm)` → `h:mm a` (date-fns `DATE_FORMATS.TIME`). Never format raw `HH:mm` inline in components.

### shadcn/ui primitives (generated, JS mode)

Live in `src/components/ui/` (button, input, badge, card, label, select, dialog, table, tabs, dropdown-menu, form). Generated by `npx shadcn@latest add` — do not hand-edit. `cn()` imports rewritten to `@/lib/utils`. shadcn v4 emits `import { Slot } from "radix-ui"` (unified radix package) — keep the `radix-ui` and `cn` npm dependencies for future CLI adds.

### Tokens

See `ui-tokens.md`. Tailwind v4 `@theme` block lives in `src/index.css`; shadcn semantic variables (`--primary`, `--card`, etc.) are mapped to the project palette in `:root` + `@theme inline` in the same file. Never add colors outside that file.
