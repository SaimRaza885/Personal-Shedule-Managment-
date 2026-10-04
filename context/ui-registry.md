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
`space-y-6`: NowCard; then `grid grid-cols-2 gap-6` with TopThreeCard + DailyProgressCard; then ScheduleCard. Page-level loading: `LoadingState`; page-level error: `ErrorState` with retry (`refetch`), never raw error text. Feature 05 added schedule management: `ScheduleBlockDialog` controlled by a `dialog` state (`{ kind: "add" }` | `{ kind: "edit", block }`), mutations via `useAddScheduleBlock`/`useUpdateScheduleBlock`/`useRemoveScheduleBlock`, feedback via `toast.success`/`toast.error` from `sonner` (no raw error text). Feature 06 added Top 3 management: `TopThreePickerDialog` controlled by a boolean `pickerOpen`, candidates via `useTopThreeCandidates(date)`, mutations via `useAddTopThree`/`useRemoveTopThree`/`useMoveTopThree` (move is silent, add/remove toast). Feature 12 passes `energy`/`onSelectEnergy` (`setEnergy` from the energy store) and `lighterOptions` (from `useTodayData`) to NowCard. Today page handles its own loading/error inline (not the page-level primitives) because NowCard/progress depend on the same query.

### Schedule section (feature 05)

**ScheduleBlockDialog** — `src/components/schedule/ScheduleBlockDialog.jsx`
shadcn `Dialog` + `DialogContent sm:max-w-[440px]`. Title "Add task to schedule" / "Edit schedule block"; edit description shows the task title. react-hook-form + zod (`addSchema`: trimmed title + start/end; `editSchema`: times only): `TIME_REGEX /^([01]\d|2[0-3]):[0-5]\d$/`, cross-field refine `endTime > startTime` ("End time must be after start time"). Inputs: title `Input`, times `Input type="time" step={60}` in a `grid grid-cols-2 gap-4`; `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` primitives. Footer: Cancel `variant="outline"` + submit (default variant) with `Loader2 size-4 animate-spin` + "Saving…" while `isPending`. Form state resets on `open` via primitive `mode` deps (never the raw `mode` object). Controlled by parent; owns no data.

**Toasts** — `src/components/ui/sonner.jsx` (shadcn wrapper), mounted once in `src/App.jsx` as `<Toaster />`. Components toast via `import { toast } from "sonner"`. Never render raw error text to the page when a toast can carry it.

**Schedule data layer** — `src/services/schedule.service.js` + `src/hooks/useSchedule.js`
`schedule.service.js` owns add/edit/remove SQL (see progress-tracker 05 notes); `useSchedule.js` exposes one `useMutation` hook per operation, each invalidating TanStack Query key `["today"]` on success. Components never touch SQL directly.

**Time formatting** — `src/lib/datetime.js`
Stored times are `HH:mm` (24h) — display only via `formatTime(hhmm)` → `h:mm a` (date-fns `DATE_FORMATS.TIME`). Stored dates are ISO `yyyy-MM-dd` — display via `formatDate(iso)` → `MMM d, yyyy` (`DATE_FORMATS.DAY`, feature 07). Never format raw `HH:mm` or ISO strings inline in components.

### Goals section (feature 07)

**Goals page** — `src/pages/goals/Goals.jsx`
Header row always visible: `h1 text-xl font-semibold text-text-primary` "Goals" + `text-sm text-text-muted` subtitle + right `Button size="sm"` "New goal". Body: page-level `LoadingState` / `ErrorState` (retry = `refetch`) / `EmptyState` (Target icon) when zero goals; otherwise `grid grid-cols-1 gap-6 xl:grid-cols-2` of `GoalCard`s. Owns `dialog` state and goal mutations; success → `toast.success` ("Goal created/updated/removed"), failures → `toast.error` with friendly message.

**GoalCard** — `src/components/goals/GoalCard.jsx`
Section card `rounded-lg border border-border bg-surface p-6`. Title `text-base font-semibold text-text-primary` + `line-clamp-2 text-sm text-text-muted` description. Meta chips `flex flex-wrap items-center gap-2`: year chip `rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary` (only when `goal.year`), status badge via `goalStatus.js`. Progress row `mt-4` (only when milestones exist): `flex justify-between text-xs text-text-muted` "N of M milestones complete" + "N%", track `mt-1.5 h-1 rounded-full bg-border-light` fill `bg-accent` inline width. Footer `mt-4 flex items-center justify-between`: two-step-confirm edit/trash icons (`variant="ghost" size="icon-xs"`, icons `size-3.5`, aria-labels "Edit {title}" / "Remove {title}", confirm text "Remove goal and its milestones?" + Cancel/Remove `size="xs"`) + `<Button variant="outline" size="sm" asChild><Link to={"/goals/" + id}>View milestones</Link></Button>`. No milestones → `text-xs text-text-muted` "No milestones yet".

**GoalFormDialog** — `src/components/goals/GoalFormDialog.jsx`
Same dialog conventions as `ScheduleBlockDialog`. Title "New goal" / "Edit goal". Fields: Title `Input`; Description (optional) `Textarea rows={3}`; `grid grid-cols-2 gap-4` with Year (optional) `Input type="number" min 2000 max 2100` and Status shadcn `Select` fed by `goalStatusLabel`. zod: title trimmed required; description trimmed `max 500`; year `""` or 4-digit string (converted to `null`/`Number` on submit); status enum. Footer submit "Create goal" / "Save changes".

**MilestoneList** — `src/components/goals/MilestoneList.jsx`
"Milestones" section card. Header `mb-4 flex items-center justify-between gap-4`: title + right cluster `text-xs text-text-muted` "N of M complete" + `Button variant="outline" size="sm"` "Add milestone" (`Plus size-4`). Rows `ul.divide-y divide-border-light`, row `flex items-center gap-3 py-3`: title `min-w-0 flex-1 truncate text-sm font-medium text-text-primary` (completed → `text-text-muted line-through`) + optional `text-xs text-text-muted` description; period chip `bg-surface-tertiary text-text-secondary` ("Year"/"Month"/"Week" via `periodLabel`); target date `text-xs text-text-muted` via `formatDate` when present; milestone status badge; edit/trash two-step confirm with aria-labels ("Edit {title}" / "Remove {title}", confirm "Remove this milestone?"). Empty: `EmptyState` (Flag) "No milestones yet" + Add action.

**MilestoneFormDialog** — `src/components/goals/MilestoneFormDialog.jsx`
Same conventions. Title "New milestone" / "Edit milestone". Fields: Title; Description (optional) `Textarea rows={2}`; `grid grid-cols-2 gap-4` with Period `Select` (Year/Month/Week, default Month on add) and Target date (optional) `Input type="date"`; Status `Select` (Planned/In Progress/Completed, default Planned on add). zod: date `""` or `yyyy-MM-dd` (converted to `null` on submit). Footer submit "Add milestone" / "Save changes".

**Status helpers** — `src/components/goals/goalStatus.js`
Mirrors `taskStatus.js`. `goalStatusBadgeClass` / `milestoneStatusBadgeClass` share base `rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap`; tones: planned `bg-surface-secondary text-text-secondary`, in_progress `bg-accent-light text-accent`, completed `bg-success-light text-success-foreground`, archived `bg-surface-secondary text-text-muted` (goals only). `periodLabel` maps `year|month|week` → display text. New goal/milestone status UI must reuse these helpers.

**GoalDetails page** — `src/pages/goals/GoalDetails.jsx`
Route `/goals/:id`. Back link `inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary` with `ChevronLeft size-4` "All goals". Header card (same section card): `h1 text-xl font-semibold` title, description, year chip + goal status badge. Then `MilestoneList`. Loading = combined `isLoading` of goal + milestones; error = combined `ErrorState` (retry refetches both); missing goal → `EmptyState` "Goal not found" + "Back to goals" link (not an error).

**Goals data layer** — `src/services/goal.service.js` + `src/hooks/useGoals.js`
`goal.service.js` owns goals + milestones SQL (see progress-tracker 07 notes); `useGoals.js` exposes `useGoals`, `useGoal(id)`, `useGoalMilestones(goalId)` and one `useMutation` per operation (goal CRUD invalidates `["goals"]`; milestone mutations invalidate `["goal", goalId, "milestones"]` + `["goals"]`). Components never touch SQL directly.

**Route registration** — `src/routes/index.jsx`
`/goals` → Goals, `/goals/:id` → GoalDetails (child of the AppShell layout route, so both render inside the sidebar shell).

### Projects section (feature 08)

**Projects page** — `src/pages/work/Projects.jsx`
Same composition as Goals page: header row (`h1 text-xl font-semibold text-text-primary` "Projects" + `text-sm text-text-muted` subtitle + right `Button size="sm"` "New project" with `Plus size-4`), page-level `LoadingState` / `ErrorState` (retry = `refetch`) / `EmptyState` (FolderKanban icon) when zero projects; otherwise `grid grid-cols-1 gap-6 xl:grid-cols-2` of `ProjectCard`s. Owns `dialog` state + project mutations; success → `toast.success` ("Project created/updated/removed"). Form options come from `useGoals()` mapped to `{ id, title }` — the dialog itself owns no data.

**ProjectCard** — `src/components/projects/ProjectCard.jsx`
Section card `rounded-lg border border-border bg-surface p-5` (grid density). Title `truncate text-base font-semibold text-text-primary` + `line-clamp-2 text-sm text-text-muted` description. Meta chips `flex flex-wrap items-center gap-2`: linked-goal chip `max-w-40 truncate rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary` (only when `goalTitle`), status badge via `projectStatus.js`. Progress row (only when tasks exist): `flex justify-between text-xs text-text-muted` "N of M tasks complete" + "N%", track `mt-1.5 h-1 rounded-full bg-border-light` fill `bg-accent` inline width; no tasks → `text-xs text-text-muted` "No tasks yet". Footer `flex items-center justify-between`: two-step-confirm edit/trash icons (`variant="ghost" size="icon-xs"`, icons `size-3.5`, aria-labels "Edit {name}" / "Remove {name}", confirm "Remove project? Its tasks will be kept." + Cancel/Remove `size="xs"`) + `<Button variant="outline" size="sm" asChild><Link to={"/projects/" + id}>View tasks</Link></Button>`.

**ProjectFormDialog** — `src/components/projects/ProjectFormDialog.jsx`
Same dialog conventions as `GoalFormDialog`. Title "New project" / "Edit project"; description "Create a project to group the tasks that move a goal forward." Fields: Name `Input` (placeholder "e.g. Personal website rebuild"); Description (optional) `Textarea rows={3}`; Goal (optional) `Select` — options list `goalOptions` prop plus a leading "No goal" item with sentinel value `NO_GOAL = "none"` (**Radix Select rejects empty-string values**; mapped to `null` on submit); Status `Select` fed by `projectStatusLabel` (default Active on add). zod: name trimmed required; description trimmed `max 500`; goalId string; status enum of `Object.values(PROJECT_STATUS)`. Footer submit "Create project" / "Save changes".

**ProjectTasks** — `src/components/projects/ProjectTasks.jsx`
"Tasks" section card. Props `{ items, onAdd }` — still a read-only list (full management lives on the Tasks page); `onAdd` opens the shared `TaskFormDialog` from the parent. Header `mb-4 flex items-center justify-between gap-4`: title + right cluster `flex items-center gap-3` (`text-xs text-text-muted` "{n} of {m} complete" only when tasks exist + `Button variant="outline" size="sm"` "Add task" with `Plus size-4`). Rows `ul.divide-y divide-border-light`, row `flex items-center gap-4 py-3`: title `truncate text-sm font-medium text-text-primary` + meta `mt-0.5 text-xs text-text-muted` "{schedule} · {plannedMinutes} min planned", where schedule = `formatDate(scheduledDate) · formatTime(startTime) — formatTime(endTime)` or "Not scheduled"; trailing task status badge reusing `statusBadgeClass`/`statusLabel` from `taskStatus.js`. Empty: `EmptyState` (ListTodo) "No tasks in this project yet" with the same "Add task" action. Task order: scheduled first by date, unscheduled last (SQL `ORDER BY scheduled_date IS NULL, scheduled_date, created_at DESC`).

**Status helpers** — `src/components/projects/projectStatus.js`
Mirrors `goalStatus.js` for `PROJECT_STATUS`. `projectStatusLabel` / `projectStatusBadgeClass` share base `rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap`; tones: active `bg-accent-light text-accent`, completed `bg-success-light text-success-foreground`, paused `bg-warning-light text-warning-foreground`, archived `bg-surface-secondary text-text-muted`. New project status UI must reuse these helpers.

**ProjectDetails page** — `src/pages/work/ProjectDetails.jsx`
Route `/projects/:id`. Back link `inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary` with `ChevronLeft size-4` "All projects". Header card (same section card): `h1 text-xl font-semibold` name, description, right cluster: linked-goal chip as a `<Link to={"/goals/" + goalId}>` styled `rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary hover:text-text-primary` + status badge. Then `ProjectTasks`. Loading = combined `isLoading` of project + tasks; error = combined `ErrorState` (retry refetches both); missing project → `EmptyState` "Project not found" + "Back to projects" link. Feature 09 added an `addingTask` boolean state: `ProjectTasks onAdd` opens the shared `TaskFormDialog` with `defaultProjectId` pre-filled, using the same `useCreateTask` mutation and `toast.success("Task created")` as the Tasks page — the project card's task count updates via query invalidation.

**Projects data layer** — `src/services/project.service.js` + `src/hooks/useProjects.js`
`project.service.js` owns projects SQL (see progress-tracker 08 notes); `useProjects.js` exposes `useProjects`, `useProject(id)`, `useProjectTasks(projectId)` and one `useMutation` per operation (mutations invalidate `["projects"]` + `["project"]` prefix). Components never touch SQL directly.

**Route registration** — `src/routes/index.jsx`
`/projects` → Projects, `/projects/:id` → ProjectDetails.

### Tasks section (feature 09)

**Tasks page** — `src/pages/work/Tasks.jsx`
Header row: `h1 text-xl font-semibold text-text-primary` "Tasks" + `text-sm text-text-muted` subtitle "Everything you need to do, broken into steps." + right cluster `flex items-center gap-3`: status filter `Select` (`SelectTrigger className="w-40" aria-label="Filter by status"`, options "All statuses" + the 5 `TASK_STATUS` values via `statusLabel`; changing it also clears `expandedTaskId`) and `Button size="sm"` "New task" with `Plus size-4`. Body: `LoadingState` "Loading tasks…" / `ErrorState` "Couldn't load your tasks" (retry = `refetch`) / unfiltered empty `EmptyState` (ListTodo) "No tasks yet" + "New task" / filtered empty "No tasks with this status" + "Clear filter" (`variant="outline"`) and "New task"; otherwise `grid grid-cols-1 gap-6 xl:grid-cols-2` of `TaskCard`s. State `{ statusFilter, dialog, expandedTaskId }`; one expanded card at a time (`useTaskSteps(expandedTaskId)` enabled only when set). Owns 7 mutations (create/update/delete/setStatus + step add/toggle/remove) and toasts "Task created/updated/removed/completed/reopened"; step query failures surface via their own toast calls. Options for the dialog come from `useProjects()` / `useGoals()` mapped to `{ id, name }` / `{ id, title }`.

**TaskCard** — `src/components/tasks/TaskCard.jsx`
Card `flex flex-col gap-3 rounded-lg border border-border bg-surface p-5` (grid density). Top row `flex items-start gap-3`: `TaskStatus` toggle (`pt-0.5` wrapper) + body `min-w-0 flex-1` (title `h3 text-sm font-medium text-text-primary`, completed → `text-text-muted line-through`; description `mt-1 line-clamp-2 text-sm text-text-secondary`) + trailing badge via `statusBadgeClass`/`statusLabel` from `taskStatus.js`. Chip row `mt-2 flex flex-wrap items-center gap-x-2 gap-y-1`: project/goal chips as `<Link>` `max-w-40 truncate rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary` (only when linked) + meta `text-xs text-text-muted` = `"{Priority} priority · {n} min planned"` plus `energyLabel` when set. Expanded → `border-t border-border-light pt-3` wrapping `TaskSteps`. Footer `mt-auto pt-1`: two-step confirm "Remove task? Its steps and schedule will be removed." + Cancel/Remove `size="xs"`, else edit/trash `variant="ghost" size="icon-xs"` (icons `size-3.5`, aria-labels "Edit {title}" / "Remove {title}") + `Button variant="outline" size="sm"` with `ListChecks size-4` and `aria-expanded`, label "{stepsCompleted} of {stepsTotal} steps" or "Add steps".

**TaskSteps** — `src/components/tasks/TaskSteps.jsx`
Rendering only — parent owns queries/mutations. Props `{ steps, isLoading, disabled, onAdd (returns Promise<boolean>, input cleared only on true), onToggle, onRemove }`. Loading → `text-xs text-text-muted` "Loading steps…"; empty → "No steps yet. Break this task into smaller pieces."; list `ul.space-y-1.5`, row `flex items-center gap-2`: square toggle `size-4` (completed `border-transparent bg-success-light text-success-foreground` with `Check size-3`, else `border border-border-muted text-transparent hover:border-accent`; aria-labels `Mark "{title}" done` / "Mark "{title}" not done"), title `flex-1 truncate text-sm` (completed → `text-text-muted line-through`), remove `variant="ghost" size="icon-xs"` `X size-3.5` (aria-label "Remove step {title}") swapping to inline confirm `text-xs text-text-muted` "Remove step?" + Cancel/Remove. Add form `flex items-center gap-2`: `Input h-8 flex-1` placeholder "Add a step…" + `Button type="submit" variant="outline" size="icon-sm"` `Plus size-4` (aria-label "Add step"), disabled when `disabled || !title.trim()`.

**TaskStatus** — `src/components/tasks/TaskStatus.jsx`
The single control that completes a task or reopens it — defines the not_started↔completed toggle in one place. Circular icon button `shrink-0 text-text-muted transition-colors hover:text-accent disabled:opacity-50`; completed → `CircleCheck size-5 text-success`, else `Circle size-5`. aria-labels "Mark {title} complete" / "Mark {title} not started".

**TaskFormDialog** — `src/components/tasks/TaskFormDialog.jsx`
Same dialog conventions as `GoalFormDialog`. Title "New task" / "Edit task". Props include optional `defaultProjectId` (used by ProjectDetails to pre-fill the project select on add). Fields: Title `Input` (placeholder "e.g. Draft the project brief"); Description (optional) `Textarea rows={3}`; then three `grid grid-cols-2 gap-4` rows — [Project (optional) `Select` | Goal (optional) `Select`], [Priority `Select` via `priorityLabel` | Status `Select` via `statusLabel`], [Planned minutes `Input type="number" min 1 max 1440 placeholder "30"` | Energy (optional) `Select` via `energyLabel` ("No preference")]. Sentinel `NO_VALUE = "none"` for unlinked project/goal/energy (**Radix Select rejects empty-string values**; mapped to `null` on submit). zod v3: title trimmed required; description trimmed `max 500`; plannedMinutes string with `^\d+$` regex + refine 1–1440 (converted to `Number` on submit); priority/status enums of `Object.values(...)`. Reset on `open` via primitive `mode` deps (never the raw `mode` object). Footer Cancel + "Create task" / "Save changes" with `Loader2 size-4 animate-spin` + "Saving…" while `isPending`. No schedule fields — `daily_schedules` owns scheduling.

**Task meta labels** — `src/components/tasks/taskMeta.js`
`priorityLabel()` Low/Medium/High; `energyLabel()` "High energy"/"Medium energy"/"Low energy". Reuse these instead of mapping priority/energy values inline.

**Tasks data layer** — `src/services/task.service.js` + `src/hooks/useTasks.js`
`task.service.js` owns tasks + task_steps SQL (see progress-tracker 09 notes); `useTasks.js` exposes `useTasks(status)`, `useTaskSteps(taskId)` and one `useMutation` per operation. Query keys: `["tasks", status ?? "all"]` and the deliberately distinct `["task", taskId, "steps"]`. Mutations invalidate `["tasks"]`, `["project"]`, `["projects"]`, `["today"]` (task) / `["task"]`, `["tasks"]`, `["today"]` (steps). Components never touch SQL directly.

**Route registration** — `src/routes/index.jsx`
`/tasks` → Tasks (child of the AppShell layout route).

### Focus section (feature 10)

**Focus page** — `src/pages/focus/Focus.jsx`
Header row: `h1 text-xl font-semibold text-text-primary` "Focus" + `text-sm text-text-muted` subtitle "Deep work, one task at a time." Body priority: post-session `SessionSummary` (state `summary`) → active session card → "Start a focus session" card. Start card (same section card): title "Start a focus session" + candidate list `ul.divide-y divide-border-light`, row `flex items-center gap-4 py-3`: time col `w-36 shrink-0 text-sm text-text-secondary` (`formatTime` range), title `min-w-0 flex-1 truncate text-sm font-medium text-text-primary`, meta `text-xs text-text-muted` "{plannedMinutes} min", Start `Button size="sm"` with `Play size-4`. Empty candidates: `EmptyState` (Timer) "Nothing to focus on yet" with `<Button asChild variant="outline" size="sm"><Link to="/">Plan your day</Link></Button>`. Then `FocusHistory`. Loading/error: page-level `LoadingState` / `ErrorState` (retry refetches active + history). Toasts: "Focus session started", "Session paused", "Back to it"; complete/cancel show the summary instead of a toast. `friendlyError(error)` strips to the thrown message.

**FocusTimer** — `src/components/focus/FocusTimer.jsx`
Section card. Props `{ session, children }`. 1s `setInterval` ticker only while `status === FOCUS_STATUS.STARTED` (effect deps `[running, session.startedAt]`, immediate `setNowMs(Date.now())` so resume re-reads wall clock instantly). Clock `text-4xl font-semibold tracking-tight text-text-primary tabular-nums` via `formatElapsed`; status badge top-right via `focusBadgeClass`; task title `text-base font-semibold text-text-primary` (`?? "Task removed"`). Progress track `mt-3 h-1 rounded-full bg-border-light`, fill `bg-accent` (over-plan → `bg-warning`) with inline width. Meta line `text-sm text-text-secondary`: "{n} min planned", "{n} steps remaining", "Over plan" (`text-warning-foreground`). `children` render in `mt-6 border-t border-border-light pt-4` (the controls + distraction row).

**FocusControls** — `src/components/focus/FocusControls.jsx`
Props `{ status, pending, onPause, onResume, onComplete, onCancel }`. Running → `Button variant="outline"` with `Pause size-4` "Pause"; paused → `variant="outline"` with `Play size-4` "Resume"; "Complete session" default variant with `Check size-4`; "Cancel" `variant="ghost"` with `X size-4` swaps to two-step confirm (`text-xs text-text-muted` "Discard this session?" + ghost "Keep going" + `variant="destructive" size="sm"` "Cancel session"). All disabled while `pending`; confirm state is local `useState` reset on confirm.

**SessionSummary** — `src/components/focus/SessionSummary.jsx`
Section card shown after complete/cancel. Props `{ session, distractions = [], onDismiss }`. Icon circle `rounded-full p-2.5`: completed → `bg-success-light` + `CircleCheck text-success-foreground`; cancelled → `bg-surface-secondary` + `CircleX text-text-muted`. Heading `text-base font-semibold text-text-primary` "Session complete" / "Session cancelled"; body `text-sm text-text-secondary`: "{taskTitle} — {formatMinutes(actual)} of {formatMinutes(planned)} planned."; "Done" `Button variant="outline" size="sm"` → clears the summary state. Feature 11: when distractions exist, a `pt-1` block adds `text-sm text-text-secondary` "{n} distraction{s} logged." followed by reason chips `rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-text-secondary` grouped by reason with `×N` counts (`groupByReason` local helper).

**DistractionDialog** — `src/components/focus/DistractionDialog.jsx`
Same conventions as `ScheduleBlockDialog`. Title "Log a distraction"; description "Note what pulled you away — for awareness, not judgment." Five preset chips `REASON_PRESETS` (Phone, People, Notifications, Noise, Mind wandering) styled `rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent`; clicking one fills the reason field via `setValue(..., { shouldValidate: true })`. Fields: Reason `Input` placeholder "e.g. Phone" (zod: trimmed required, ≤80) + Notes `Textarea rows={2}` placeholder "Anything worth remembering about it" (optional, ≤300). Reset on `open` via `useEffect`. Props `{ open, onOpenChange, onSubmit, isPending }`. Footer: Cancel `variant="outline"` + submit "Log distraction" with `Loader2 size-4 animate-spin` + "Saving…" while pending.

**FocusHistory** — `src/components/focus/FocusHistory.jsx`
"Recent sessions" section card. Props `{ items }`. Rows `ul.divide-y divide-border-light`, row `flex items-center gap-4 py-3`: `w-40 shrink-0 text-sm text-text-secondary` timestamp (`formatTimestamp`), title `min-w-0 flex-1 truncate text-sm font-medium text-text-primary`, meta `text-sm text-text-muted` "{actual} of {planned}" + feature 11 suffix "· N distraction(s)" when `session.distractionsCount > 0`, status badge via `focusBadgeClass`. Empty: `EmptyState` (History) "No focus sessions yet" — "Start a session and your focus time will be recorded here."

**Focus status badges** — `src/components/focus/focusStatus.js`
Mirrors `taskStatus.js` for `FOCUS_STATUS`. `focusStatusLabel` (started → "Running") / `focusBadgeClass` share base `rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap`; tones: started `bg-accent-light text-accent`, paused `bg-warning-light text-warning-foreground`, completed `bg-success-light text-success-foreground`, cancelled `bg-surface-secondary text-text-muted`. New focus status UI must reuse these helpers.

**Focus data layer** — `src/services/focus.service.js` + `src/hooks/useFocus.js`
`focus.service.js` owns focus_sessions SQL (see progress-tracker 10 notes); `useFocus.js` exposes `useActiveFocusSession()`, `useFocusHistory(limit)`, `useFocusCandidates()` and one `useMutation` per operation. Components never touch SQL directly. Timer ticks are local `useState` — not a query — so no polling.

**Distraction data layer** — `src/services/distraction.service.js` + `src/hooks/useDistractions.js`
`distraction.service.js` owns the distractions table SQL (see progress-tracker 11 notes); `useDistractions.js` exposes `useSessionDistractions(sessionId)` (key `["distractions", sessionId]`, enabled only with an id) and `useLogDistraction` (invalidates `["focus"]` + `["distractions"]`). `SESSION_SELECT` in `focus.service.js` carries a `distractionsCount` subselect so the timer's live count and history rows come from the same fetch. Components never touch SQL directly.

**Focus page distraction wiring (update)** — `src/pages/focus/Focus.jsx`
Feature 11: on the timer, a `mt-3 flex flex-wrap items-center gap-3` row adds an outline "Log distraction" `Button size="sm"` with `BellRing size-4` (disabled while controls pending) plus `text-xs text-text-muted` "{n} logged this session" when `distractionsCount > 0`. The summary receives `distractions={summaryDistractionsQuery.data ?? []}` from `useSessionDistractions(summary?.id)`. `DistractionDialog` mounts at the page bottom; success → toast "Distraction logged".

**NowCard focus state (update)** — `src/components/today/NowCard.jsx`
Feature 10 wired the Start button: props gained `focusActive` / `startPending`; while a session is open the button reads "Focus in progress" (disabled while starting) and Today's `handleStart` routes to `/focus` instead of double-starting.

### Low-Energy Mode section (feature 12)

**EnergySelector** — `src/components/today/EnergySelector.jsx`
Chips row `flex flex-wrap items-center gap-2`: label `text-xs text-text-muted` "Energy right now" + three toggle chips (High / Medium / Low via `ENERGY_LEVEL`). Chip base `rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors`; selected `border-transparent bg-accent-light text-accent`, unselected `border-border text-text-secondary hover:border-accent hover:text-accent`. Each chip carries `aria-pressed`; clicking the selected chip deselects (`null` = no mode). Props `{ value, onChange }` — presentational, owns no data.

**Energy store** — `src/stores/energy.store.js`
First Zustand store in the project: `create(persist(...))` with `{ energy: null, setEnergy }`, `localStorage` key `psm-energy-mode`, `partialize` to `{ energy }`. Client/UI state only (library-docs.md lists "Low-Energy Mode selection") — no business rules; the lightness ranking lives in `today.service.js`.

**NowCard low-energy state (update)** — `src/components/today/NowCard.jsx`
Feature 12: props gained `energy` / `onSelectEnergy` / `lighterOptions`; an `EnergySelector` row sits under the header (`mb-4`) for every state (even the empty schedule). When `energy === ENERGY_LEVEL.LOW` and options exist, a `mt-4 border-t border-border-light pt-4` block shows the "Low energy mode" badge (`rounded-full bg-warning-light px-2 py-0.5 text-xs font-medium whitespace-nowrap text-warning-foreground`) + `text-xs text-text-muted` copy "Lighter options from today's plan — your schedule stays as it is." and a `ul.divide-y divide-border-light` of ranked rows `flex items-center gap-3 py-2`: time col `w-36 shrink-0 text-sm text-text-secondary`, title `min-w-0 flex-1 truncate text-sm font-medium text-text-primary`, meta `shrink-0 text-xs text-text-muted` "{n} min · {energyLabel}" (label appended only when set), outline `Button size="sm"` with `Play size-4` "Start" → Today's existing `onStart`. Purely a suggestion surface — the plan is never modified.

**Lighter options data layer** — `src/services/today.service.js` + `src/hooks/useToday.js`
`findLighterOptions(schedule, timeNow, { excludeTaskId, limit })` ranks actionable blocks that still have time left by `ENERGY_RANK` (low → medium → unknown → high), then shorter `plannedMinutes`, then earlier `startTime`, capped at `DEFAULT_VALUES.LIGHTER_OPTIONS_MAX` (3). `getTodaySchedule` also selects `t.priority` / `t.energy_level` (`ScheduleItem` typedef extended). `useTodayData()` reads the energy store and computes `lighterOptions` only when `energy === ENERGY_LEVEL.LOW`, excluding the currently displayed task; returns `energy` + `lighterOptions` alongside the existing fields. Components never touch SQL directly.

### Overload Protection section (feature 13)

**OverloadBanner** — `src/components/today/OverloadBanner.jsx`
`section role="alert"` with `rounded-lg border border-warning-light bg-warning-lightest p-4`; inner `flex items-start gap-3`: `CircleAlert size-5` (`mt-0.5 shrink-0 text-warning-dark`), text column (`min-w-0 flex-1`), outline `Button size="sm"` with `Pencil size-4` "Available time". Copy: `text-sm font-semibold text-warning-foreground` "Your plan is overloaded." + `text-sm text-warning-foreground` "Planned work: {formatMinutes(remaining)} · Available time: {formatMinutes(available)}" + `text-xs text-warning-foreground` "Move, shorten, or remove tasks below to make the day fit — nothing changes unless you change it." Returns `null` when not overloaded. Props `{ overload, onAdjust }` — purely informational, never mutates the plan.

**AvailableTimeDialog** — `src/components/today/AvailableTimeDialog.jsx`
Same RHF+zod conventions as `ScheduleBlockDialog`. One string field "Hours available" (`Input type="number" min=0.25 max=24 step=0.25`); zod required message "Available time is required" + range refine "Enter between 0.25 and 24 hours"; double-layer validation (native min/max + zod). Resets to `String(currentMinutes / 60)` on open. Submits `{ minutes: Math.round(Number(hours) * 60) }`. Props `{ open, onOpenChange, currentMinutes, onSubmit, isPending }`; footer Cancel + Save (Loader2 spin + "Saving…" while pending).

**Settings data layer** — `src/services/settings.service.js` + `src/hooks/useSettings.js`
First consumer of the `settings` key/value table: `getAvailableMinutes()` (defensive read — missing/invalid/non-positive → `DEFAULT_VALUES.AVAILABLE_MINUTES` = 480) and `setAvailableMinutes(minutes)` (positive-integer guard, upsert via `ON CONFLICT (key) DO UPDATE`). Keys live in `SETTING_KEYS` (`constants.js`). Hook `useAvailableTime()` owns key `["settings","available-minutes"]`; `useSetAvailableTime()` invalidates `["settings"]`. `summarizeOverload(schedule, availableMinutes)` in `today.service.js` computes remaining (non-completed/cancelled) minutes and `overloaded = remaining > available` (strictly — a day that fits exactly shows nothing).

**Today page composition (update)** — `src/pages/today/Today.jsx`
`OverloadBanner` renders between the Top 3 / Progress grid and the Schedule card; `AvailableTimeDialog` mounts at the page bottom (open state `availableTimeOpen`). Save → toast "Available time updated". Verified end-to-end: 480/480 no banner → 300 min banner exact text → dialog 5h→10h clears banner → completing a 150-min block drops the remainder to 5h 30m → schedule JSON byte-identical throughout (plan never touched).

### Quick Capture section (feature 14)

**CaptureForm** — `src/components/captures/CaptureForm.jsx`
Section card. RHF+zod single field (`content`, trimmed non-empty, message "Type something to capture"). `Textarea rows={2}` `aria-label="Capture a thought"` placeholder "What's on your mind? Get it out of your head — organize it later." with `onKeyDown` Ctrl/Cmd+Enter → `preventDefault` + submit. Footer `flex items-center justify-between pt-1`: `text-xs text-text-muted` "Ctrl + Enter to capture" + submit Button size="sm" (`Inbox size-4` / `Loader2 animate-spin` "Capturing…" while pending). After a successful capture the form resets and refocuses the textarea (parent's submit returns truthy).

**CaptureList** — `src/components/captures/CaptureList.jsx`
"Inbox" list card. Props `{ captures, onConvertToTask, onConvertToIdea, onRemove, convertingId, convertingKind, removePending }` — presentational, owns only `confirmingId`. Rows `ul.divide-y divide-border-light`, `li.flex.items-start.gap-3.py-3` (first `pt-0` / last `pb-0`): content `whitespace-pre-wrap break-words text-sm` (`text-text-primary`, converted → `text-text-secondary`); meta row `text-xs text-text-muted` `formatTimestamp(capturedAt)` + converted badge `rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent` ("Converted to task" / "Converted to idea" via `CONVERTED_TYPE`). Actions: unconverted → `Button variant="outline" size="sm"` "Convert to task" (`ListPlus size-4`) + "Convert to idea" (`Lightbulb size-4`) — spinner (`Loader2`) replaces the icon only on the clicked button (`convertingId === capture.id && convertingKind === kind`), both disabled while converting or remove pending — + `Trash2` ghost `size="icon-xs"` (aria-label "Delete capture"); confirming → `text-xs text-text-muted` "Delete this capture?" + Cancel `size="xs"` + destructive `size="xs"` Delete. Converted rows keep only delete. Empty: `EmptyState` (Inbox) "Nothing captured yet".

**QuickCapture page** — `src/pages/captures/QuickCapture.jsx`
Header `h1 text-xl font-semibold text-text-primary` "Quick Capture" + `text-sm text-text-muted` subtitle "Get it out of your head now — organize it into tasks or ideas later." Composition: `space-y-6` — CaptureForm, then Inbox heading row (`h2 text-base font-semibold` "Inbox" + `text-xs text-text-muted` "{n} waiting to be organized", only when > 0), then CaptureList. Toasts: "Captured", "Converted to a task", "Converted to an idea", "Capture deleted"; failures via `friendlyError`. `convertingId` derived from both convert mutations' `variables?.id` while pending; `convertingKind` is `CONVERTED_TYPE.TASK` / `CONVERTED_TYPE.IDEA` / null.

**Quick capture data layer** — `src/services/quick-capture.service.js` + `src/hooks/useCaptures.js`
`quick-capture.service.js` owns the `quick_captures` SQL (see progress-tracker 14–15 notes); `useCaptures()` owns key `["captures"]`; `useCreateCapture` / `useConvertCaptureToTask` / `useConvertCaptureToIdea` / `useDeleteCapture` each invalidate `["captures"]` (converts also `["tasks"]` / `["ideas"]` respectively). `CONVERTED_TYPE` lives in `constants.js`. Shared `MAX_TITLE` (120) truncation for both conversions. Components never touch SQL directly.

**Route + sidebar (update)** — `src/routes/index.jsx`, `src/components/layout/Sidebar.jsx`
`/quick-capture` → QuickCapture (child of the AppShell layout route). Sidebar gained a 15th entry "Capture" (`Inbox` icon) after Focus.

### Ideas Vault section (feature 15)

**IdeaCard** — `src/components/ideas/IdeaCard.jsx`
`section.flex flex-col gap-3 rounded-lg border border-border bg-surface p-5`. Top row: title `h3 truncate text-base font-semibold text-text-primary` + status badge (`ideaStatusBadgeClass`) side by side, description below `line-clamp-2 text-sm text-text-secondary`, meta `text-xs text-text-muted` "Added {formatTimestamp(createdAt)}". Footer `mt-auto pt-1`: inline confirm (`confirming` state) "Remove this idea?" + Cancel `size="xs"` + destructive `size="xs"` Remove; otherwise edit + trash `Button variant="ghost" size="icon-xs"` (aria-labels "Edit {title}" / "Remove {title}", `Pencil` / `Trash2` at `size-3.5`).

**IdeaFormDialog** — `src/components/ideas/IdeaFormDialog.jsx`
RHF+zod (`ideaSchema`: title trimmed required "Idea title is required"; description ≤500; status `z.enum(Object.values(IDEA_STATUS))`). Serves add + edit (`mode` prop, `{ kind: "add" } | { kind: "edit", idea }` object from the page). Dialog titles "New idea" / "Edit idea"; descriptions "Capture a thought worth keeping — no commitment required." / "Update this idea's details." Fields: title Input, description Textarea rows 3, status Select (full width, options from `IDEA_STATUS` via `ideaStatusLabel`). Reset effect keyed on primitive deps (`[open, modeTitle, modeDescription, modeStatus, form]`) so typing is never wiped. Footer Cancel + "Create idea" / "Save changes" with `Loader2` "Saving…".

**Idea status helper** — `src/components/ideas/ideaStatus.js`
Same pattern as the other status helpers: BASE `rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap`; LABELS New/Exploring/Parked/Done; CLASSES `new` → `bg-accent-light text-accent`, `exploring` → `bg-warning-light text-warning-foreground`, `parked` → `bg-surface-secondary text-text-secondary`, `done` → `bg-success-light text-success-foreground`. Exports `ideaStatusLabel()` + `ideaStatusBadgeClass()` with fallback to the `new` style.

**Ideas page** — `src/pages/ideas/Ideas.jsx`
Header `h1 text-xl font-semibold text-text-primary` "Ideas" + `text-sm text-text-muted` subtitle "A vault for thoughts that are not tasks yet." + `Button size="sm"` "New idea" (`Plus`). States: `LoadingState` "Loading your ideas…" / `ErrorState` "Couldn't load your ideas" (retry = refetch) / `EmptyState` (`Lightbulb`) "No ideas yet" + "Keep ideas here so they don't compete with today's work." + New idea action. Grid `grid grid-cols-1 gap-6 xl:grid-cols-2` of IdeaCards. Toasts: "Idea created" / "Idea updated" / "Idea removed". Dialog state `{ kind: "add" } | { kind: "edit", idea }`.

**Ideas data layer** — `src/services/idea.service.js` + `src/hooks/useIdeas.js`
`idea.service.js` owns the `ideas` SQL (see progress-tracker 15 notes); `useIdeas()` owns key `["ideas"]`; `useCreateIdea` / `useUpdateIdea` / `useDeleteIdea` each invalidate `["ideas"]`. `IDEA_STATUS` lives in `constants.js`. Components never touch SQL directly.

**Route (update)** — `src/routes/index.jsx`
`/ideas` swapped from Placeholder to `Ideas` (the sidebar entry existed since the shell was built).

### What I Learned section (feature 16)

**LearningCard** — `src/components/learning/LearningCard.jsx`
`section.flex flex-col gap-3 rounded-lg border border-border bg-surface p-5`. Top row: title `h3 min-w-0 truncate text-base font-semibold text-text-primary` + date chip `span.shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary` showing `formatDate(entry.date)`. Content (only when non-empty) `p.break-words whitespace-pre-wrap text-sm text-text-secondary`. Footer `mt-auto pt-1`: inline confirm (`confirming` state) "Remove this note?" + Cancel `size="xs"` + destructive `size="xs"` Remove; otherwise edit + trash `Button variant="ghost" size="icon-xs"` (aria-labels "Edit {title}" / "Remove {title}", `Pencil` / `Trash2` at `size-3.5`).

**LearningFormDialog** — `src/components/learning/LearningFormDialog.jsx`
RHF+zod (`learningSchema`: title trimmed required "Learning note title is required"; date trimmed required "Pick a date for this learning note" + `DATE_REGEX` refine "Enter a valid date"; content ≤2000). Serves add + edit (`mode` prop `{ kind: "add" } | { kind: "edit", title, date, content }` flattened from the page). New entries default the date to today (`format(new Date(), DATE_FORMATS.ISO)`). Dialog titles "New learning note" / "Edit learning note"; descriptions "Write down what you figured out — no quizzes, no pressure." / "Update this note's details." Fields: title Input (placeholder "e.g. Why SQLite defers foreign keys"), date `Input type="date"` labeled "Learned on", content Textarea rows 5 labeled "Notes (optional)" (placeholder "What did you learn? What clicked?"). `DialogContent` `sm:max-w-[480px]`. Reset effect keyed on primitive deps (`[open, modeTitle, modeDate, modeContent, form]`). Footer Cancel + "Add note" / "Save changes" with `Loader2` "Saving…".

**Learning page** — `src/pages/learning/Learning.jsx`
Header `h1 text-xl font-semibold text-text-primary` "What I Learned" + `text-sm text-text-muted` subtitle "Notes on things you figured out — kept for yourself, not for tests." + `Button size="sm"` "New note" (`Plus`). States: `LoadingState` "Loading your learning notes…" / `ErrorState` "Couldn't load your learning notes" (retry = refetch) / `EmptyState` (`BookOpen`) "Nothing here yet" + "When something clicks, write it down so future you can find it." + New note action. Grid `grid grid-cols-1 gap-6 xl:grid-cols-2` of LearningCards. Toasts: "Learning note saved" / "Learning note updated" / "Learning note removed". Dialog state `{ kind: "add" } | { kind: "edit", entry }`.

**Learning data layer** — `src/services/learning.service.js` + `src/hooks/useLearning.js`
`learning.service.js` owns the `learning_entries` SQL (see progress-tracker 16 notes); `useLearningEntries()` owns key `["learning"]`; `useCreateLearningEntry` / `useUpdateLearningEntry` / `useDeleteLearningEntry` each invalidate `["learning"]`. Components never touch SQL directly.

**Route (update)** — `src/routes/index.jsx`
`/learning` swapped from Placeholder to `Learning` (the sidebar entry existed since the shell was built).

### Tech Concepts section (feature 17)

**ConceptCard** — `src/components/concepts/ConceptCard.jsx`
`section.flex flex-col gap-3 rounded-lg border border-border bg-surface p-5`. Top row: title `h3 truncate text-base font-semibold text-text-primary` + status badge (via `conceptStatus`) side by side, description below `mt-1 line-clamp-2 text-sm text-text-secondary` (only when non-empty). Meta row `flex flex-wrap items-center gap-2`: category chip `rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary` (only when category non-empty) + `text-xs text-text-muted` "Added {formatTimestamp(createdAt)}". Footer `mt-auto pt-1`: inline confirm (`confirming` state) "Remove this concept?" + Cancel `size="xs"` + destructive `size="xs"` Remove; otherwise edit + trash `Button variant="ghost" size="icon-xs"` (aria-labels "Edit {title}" / "Remove {title}", `Pencil` / `Trash2` at `size-3.5`).

**ConceptFormDialog** — `src/components/concepts/ConceptFormDialog.jsx`
RHF+zod (`conceptSchema`: title trimmed required "Concept title is required"; category ≤60; description ≤500; status `z.enum(Object.values(CONCEPT_STATUS))`). Serves add + edit (`mode` prop `{ kind: "add" } | { kind: "edit", title, category, description, status }` flattened from the page). Dialog titles "New concept" / "Edit concept"; descriptions "Name something you want to know — track it until it sticks." / "Update this concept's details." Fields: title Input (placeholder "e.g. SQLite transaction semantics"), category Input labeled "Category (optional)" (placeholder "e.g. Databases"), description Textarea rows 3, status Select (full width, options from `CONCEPT_STATUS` via `conceptStatusLabel`). `DialogContent` `sm:max-w-[440px]`. Reset effect keyed on primitive deps (`[open, modeTitle, modeCategory, modeDescription, modeStatus, form]`). Footer Cancel + "Add concept" / "Save changes" with `Loader2` "Saving…".

**Concept status helper** — `src/components/concepts/conceptStatus.js`
Same pattern as the other status helpers: BASE `rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap`; LABELS "Not started"/"Learning"/"Learned"/"Review"; CLASSES `not_started` → `bg-surface-secondary text-text-secondary`, `learning` → `bg-accent-light text-accent`, `learned` → `bg-success-light text-success-foreground`, `review` → `bg-warning-light text-warning-foreground`. Exports `conceptStatusLabel()` + `conceptStatusBadgeClass()` with fallback to the `not_started` style.

**Concepts page** — `src/pages/concepts/Concepts.jsx`
Header `h1 text-xl font-semibold text-text-primary` "Tech Concepts" + `text-sm text-text-muted` subtitle "Concepts you want to actually know — tracked until they stick." + `Button size="sm"` "New concept" (`Plus`). States: `LoadingState` "Loading your concepts…" / `ErrorState` "Couldn't load your concepts" (retry = refetch) / `EmptyState` (`Brain`) "No concepts yet" + "Add the things you're learning so progress is visible." + New concept action. Grid `grid grid-cols-1 gap-6 xl:grid-cols-2` of ConceptCards. Toasts: "Concept added" / "Concept updated" / "Concept removed". Dialog state `{ kind: "add" } | { kind: "edit", concept }`.

**Concepts data layer** — `src/services/concept.service.js` + `src/hooks/useConcepts.js`
`concept.service.js` owns the `tech_concepts` SQL (see progress-tracker 17 notes); `useConcepts()` owns key `["concepts"]`; `useCreateConcept` / `useUpdateConcept` / `useDeleteConcept` each invalidate `["concepts"]`. `CONCEPT_STATUS` lives in `constants.js`. Components never touch SQL directly.

**Route (update)** — `src/routes/index.jsx`
`/concepts` swapped from Placeholder to `Concepts` (the sidebar entry — "Concepts" with the `Brain` icon — existed since the shell was built).

### Watch Later section (feature 18)

**WatchLaterCard** — `src/components/watch-later/WatchLaterCard.jsx`
`section.flex flex-col gap-3 rounded-lg border border-border bg-surface p-5`. Top row: title `h3 min-w-0 truncate text-base font-semibold text-text-primary` + status badge (via `watchStatus`). URL line (only when non-empty): `a.block truncate text-sm text-accent hover:underline` with `target="_blank" rel="noreferrer"`. Meta row `flex flex-wrap items-center gap-2`: "Scheduled {formatDate(scheduledDate)}" chip `rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary` (only when dated) + `text-xs text-text-muted` "Added {formatTimestamp(createdAt)}". Footer `mt-auto pt-1`: inline confirm (`confirming` state) "Remove this item?" + Cancel `size="xs"` + destructive `size="xs"` Remove; otherwise the watched toggle — `Check` when pending / `Undo2` when watched (`Button variant="ghost" size="icon-xs"`, `size-3.5`, aria-labels "Mark {title} as watched" / "Mark {title} as unwatched") — plus edit + trash icon buttons (aria-labels "Edit {title}" / "Remove {title}").

**WatchLaterFormDialog** — `src/components/watch-later/WatchLaterFormDialog.jsx`
RHF+zod (`watchItemSchema`: title trimmed required "Item title is required"; url optional refined `value === "" || URL.canParse(value)` → "Enter a valid link (e.g. https://…)"; scheduledDate optional empty-or-`DATE_REGEX` → "Enter a valid date"; status `z.enum(Object.values(WATCH_STATUS))`). Serves add + edit (`mode` prop `{ kind: "add" } | { kind: "edit", title, url, scheduledDate, status }` flattened from the page; `scheduledDate` normalized `"" ↔ null` at the onSubmit/`|| null` boundary). Dialog titles "New link" / "Edit link"; descriptions "Save something worth watching — schedule it for later if you like." / "Update this link's details." Fields: title Input (placeholder "e.g. Rust ownership explained visually"), url Input labeled "Link (optional)" (placeholder "https://…"), scheduledDate `Input type="date"` labeled "Schedule for (optional)", status Select (full width, options from `WATCH_STATUS` via `watchStatusLabel`). `DialogContent` `sm:max-w-[440px]`. Reset effect keyed on primitive deps (`[open, modeTitle, modeUrl, modeScheduledDate, modeStatus, form]`). Footer Cancel + "Add link" / "Save changes" with `Loader2` "Saving…".

**Watch status helper** — `src/components/watch-later/watchStatus.js`
Same pattern as the other status helpers: BASE `rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap`; LABELS "Pending"/"Watched"; CLASSES `pending` → `bg-accent-light text-accent`, `watched` → `bg-success-light text-success-foreground`. Exports `watchStatusLabel()` + `watchStatusBadgeClass()` with fallback to the `pending` style.

**Watch Later page** — `src/pages/watch-later/WatchLater.jsx`
Header `h1 text-xl font-semibold text-text-primary` "Watch Later" + `text-sm text-text-muted` subtitle "Links worth your time — scheduled for a real moment, not an endless backlog." + `Button size="sm"` "New link" (`Plus`). States: `LoadingState` "Loading your watch list…" / `ErrorState` "Couldn't load your watch list" (retry = refetch) / `EmptyState` (`Eye`) "Nothing saved yet" + "Save videos and articles here with a date, so watching them actually happens." + New link action. Grid `grid grid-cols-1 gap-6 xl:grid-cols-2` of WatchLaterCards. `handleToggleStatus` flips pending ↔ watched via the dedicated `setWatchItemStatus` mutation. Toasts: "Added to Watch Later" / "Link updated" / "Link removed" / "Marked as watched" / "Marked as unwatched". Dialog state `{ kind: "add" } | { kind: "edit", item }`.

**Watch Later data layer** — `src/services/watch-later.service.js` + `src/hooks/useWatchLater.js`
`watch-later.service.js` owns the `watch_later` SQL (see progress-tracker 18 notes); `useWatchLater()` owns key `["watch-later"]`; `useCreateWatchItem` / `useUpdateWatchItem` / `useSetWatchItemStatus` / `useDeleteWatchItem` each invalidate `["watch-later"]`. `WATCH_STATUS` lives in `constants.js`. Components never touch SQL directly.

**Route (update)** — `src/routes/index.jsx`
`/watch-later` swapped from Placeholder to `WatchLater` (the sidebar entry — "Watch Later" with the `Eye` icon — existed since the shell was built).

### End-of-Day Review section (feature 19)

**EndOfDayReview** — `src/components/reviews/EndOfDayReview.jsx`
Self-contained section (owns its queries, mutation, and toasts). Section card `rounded-lg border border-border bg-surface p-6`. Header row: `h2 text-base font-semibold text-text-primary` "End of Day Review" + `text-sm text-text-muted` "{formatDate(date)} — compare the plan with what actually happened." + optional `text-xs text-text-muted` "Last saved {formatTimestamp(updatedAt)}" (only when a saved row exists). Stats: `grid grid-cols-2 gap-3 sm:grid-cols-4` of local `StatTile`s (`rounded-md bg-surface-secondary p-3`, value `text-lg font-semibold text-text-primary`, label `text-xs text-text-muted`): Planned / Completed / Partial / Missed. Focus line: `text-sm text-text-secondary` "Focus time today: {formatMinutes(focusMinutes)}". Form: RHF+zod single field — label "How did today go?", `Textarea rows={4}` placeholder "What moved forward? What got in the way? Anything to carry into tomorrow…", schema `max(2000)`, submit `size="sm"` "Save review" / "Saving…" with `Loader2`. Footer `mt-5 flex flex-wrap items-center gap-2 border-t border-border-light pt-4`: `text-xs text-text-muted` "Continue your evening:" + three `<Button asChild variant="outline" size="sm"><Link>` to `/diary` (Write in Diary), `/learning` (Log what I learned), `/` (Plan tomorrow). Loading → section card "Gathering today's numbers…"; error → section card with inline "Couldn't load today's review numbers." + outline "Try again" (refetches both queries).

**Reviews page** — `src/pages/reviews/Reviews.jsx`
`space-y-6`. Header: `h1 text-xl font-semibold text-text-primary` "Reviews" + `text-sm text-text-muted` subtitle "Close the loop — compare the plan with what actually happened, then steer tomorrow." Then `<EndOfDayReview />` followed by `<WeeklyReview />` (feature 21) — two self-contained stack sections.

**Reviews data layer** — `src/services/review.service.js` + `src/hooks/useReviews.js`
`review.service.js` owns the `daily_reviews` + `weekly_reviews` SQL (see progress-tracker 19/21 notes); `useReviews.js` owns keys `["reviews","daily",date]` + `["reviews","daily-stats",date]` + `["reviews","weekly",weekStart]` and `useSaveDailyReview` / `useSaveWeeklyReview` (both invalidate `["reviews"]`). Daily stats are always computed live from the day's schedule + focus sessions; saving upserts one row per date. Weekly reviews are keyed by their Monday (`weekStart`), all five text fields optional, one row per week. Components never touch SQL directly.

**Route (update)** — `src/routes/index.jsx`
`/reviews` swapped from Placeholder to `Reviews` (the sidebar entry — "Reviews" with the `ClipboardCheck` icon — existed since the shell was built).

### Weekly Review section (feature 21)

**WeeklyReview** — `src/components/reviews/WeeklyReview.jsx`
Self-contained section (owns its query, mutation, toasts) stacked below `EndOfDayReview` on `/reviews`. Section card `rounded-lg border border-border bg-surface p-6`. Week bounds computed with date-fns `startOfWeek`/`endOfWeek` (`weekStartsOn: 1`) formatted via `DATE_FORMATS.ISO` — the Monday `weekStart` is the storage key. Header row: `h2 text-base font-semibold text-text-primary` "Weekly Review" + `text-sm text-text-muted` "{formatDate(weekStart)} – {formatDate(weekEnd)} — zoom out on the week, then steer the next one." + optional `text-xs text-text-muted` "Last saved {formatTimestamp(updatedAt)}". Form: RHF+zod, five `Textarea rows={3}` fields (all optional, trimmed, `max(2000)` "Keep this field under 2000 characters") — Accomplishments ("What actually got done this week?"), What went well, What didn't go well, Changes for next week, Priorities for next week. Submit `size="sm"` "Save weekly review" / "Saving…" with `Loader2`. Reset effect keyed on the five stored-value primitives. Loading → section card "Loading your weekly review…"; error → section card with inline "Couldn't load your weekly review." + outline "Try again" (refetch).

### Digital Diary section (feature 20)

**DiaryCard** — `src/components/diary/DiaryCard.jsx`
`section.flex flex-col gap-3 rounded-lg border border-border bg-surface p-5`. Top row `flex items-start justify-between gap-3`: date chip `shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary` `{formatDate(entry.date)}` + `text-xs text-text-muted` "Added {formatTimestamp(createdAt)}". Body: `p.break-words whitespace-pre-wrap text-sm text-text-secondary` (free-form — long entries wrap, blank lines preserved). Footer `mt-auto pt-1`: inline confirm (`confirming` state) "Remove this entry?" + Cancel `size="xs"` + destructive `size="xs"` Remove; otherwise edit + trash icon buttons (`Button variant="ghost" size="icon-xs"`, `size-3.5`, aria-labels "Edit entry from {formatDate}" / "Remove entry from {formatDate}").

**DiaryFormDialog** — `src/components/diary/DiaryFormDialog.jsx`
RHF+zod (`diarySchema`: date trimmed required "Pick a date for this entry" + `DATE_REGEX` refine "Enter a valid date"; content trimmed required "Write something before saving" + `max(5000)` "Keep the entry under 5000 characters"). Serves add + edit (`mode` prop `{ kind: "add" } | { kind: "edit", date, content }` flattened from the page). Dialog titles "New diary entry" / "Edit entry"; descriptions "Free-form and completely private — no format, no prompts." / "Update this entry." Fields: date `Input type="date"` labeled "Entry date" (defaults to today in add mode), content `Textarea rows={6}` labeled "Entry" (placeholder "How was today? Write freely…"). `DialogContent` `sm:max-w-[480px]`. Reset effect keyed on primitive deps (`[open, modeDate, modeContent, form]`). Footer Cancel + "Save entry" / "Save changes" with `Loader2` "Saving…".

**Diary page** — `src/pages/diary/Diary.jsx`
Header `h1 text-xl font-semibold text-text-primary` "Digital Diary" + `text-sm text-text-muted` subtitle "Free-form writing, separate from reviews — just for you." + `Button size="sm"` "New entry" (`Plus`). States: `LoadingState` "Loading your diary…" / `ErrorState` "Couldn't load your diary" (retry = refetch) / `EmptyState` (`NotebookPen`) "Your diary is empty" + "Write freely about how the day went — entries are private and stay on this device." + New entry action. Grid `grid grid-cols-1 gap-6 xl:grid-cols-2` of DiaryCards. Toasts: "Diary entry saved" / "Diary entry updated" / "Diary entry removed". Dialog state `{ kind: "add" } | { kind: "edit", entry }`.

**Diary data layer** — `src/services/diary.service.js` + `src/hooks/useDiary.js`
`diary.service.js` owns the `diary_entries` SQL (see progress-tracker 20 notes); `useDiary()` owns key `["diary"]`; `useCreateDiaryEntry` / `useUpdateDiaryEntry` / `useDeleteDiaryEntry` each invalidate `["diary"]`. Entries order by `date DESC, created_at DESC`. Components never touch SQL directly.

**Route (update)** — `src/routes/index.jsx`
`/diary` swapped from Placeholder to `Diary` (the sidebar entry — "Diary" with the `FileText` icon — existed since the shell was built).

### Finance section (feature 22)

**TransactionCard** — `src/components/finance/TransactionCard.jsx`
`section.flex flex-col gap-3 rounded-lg border border-border bg-surface p-5`. Top row `flex items-start justify-between gap-3`: left `flex flex-wrap items-center gap-2` with date chip `{formatDate(transaction.date)}` + optional category chip (only when non-empty, same chip classes); right signed amount `cn("shrink-0 text-sm font-semibold", transactionAmountClass(transaction.type))` showing `{isIncome ? "+" : "-"}{formatAmount(transaction.amount)}`. Optional description `p.break-words text-sm text-text-secondary`. Footer `mt-auto flex items-center justify-between gap-3 pt-1`: left `text-xs text-text-muted` "Added {formatTimestamp(transaction.createdAt)}"; right inline confirm (`confirming` state) "Remove this transaction?" + Cancel `size="xs"` + destructive `size="xs"` Remove; otherwise edit/trash icons (`Button variant="ghost" size="icon-xs"`, `size-3.5`, aria-labels "Edit transaction from {formatDate}" / "Remove transaction from {formatDate}").

**TransactionFormDialog** — `src/components/finance/TransactionFormDialog.jsx`
RHF+zod (`transactionSchema`: type enum of `TRANSACTION_TYPE`; amount string trimmed required + refine "Enter an amount greater than zero"; date required + `DATE_REGEX` "Pick a date for this transaction"; category trimmed `max(60)`; description trimmed `max(300)`). Serves add + edit (`mode` prop `{ kind: "add" } | { kind: "edit", type, amount, date, category, description }` flattened from the page). Dialog titles "New transaction" / "Edit transaction"; descriptions "Log income or an expense — keep the month's picture honest." / "Update this transaction's details." Fields: `grid grid-cols-2 gap-4` with Type `Select` (options from `TYPE_OPTIONS` via `transactionTypeLabel`, `SelectTrigger className="w-full"`, default Expense on add) + Amount `Input type="number" step="0.01" min="0" placeholder="0.00"`; Date `Input type="date"` labeled "Date" (defaults to today); Category `Input` labeled "Category (optional)"; Note `Textarea rows={2}` labeled "Note (optional)". Amount is `Number(...)`-converted on submit. Reset effect keyed on primitive deps (`[open, modeType, modeAmount, modeDate, modeCategory, modeDescription, form]`). Footer Cancel + "Add transaction" / "Save changes" with `Loader2` "Saving…".

**Transaction type helper** — `src/components/finance/transactionType.js`
Mirrors `watchStatus.js`. `transactionTypeLabel(type)` maps `TRANSACTION_TYPE.INCOME/EXPENSE` → "Income"/"Expense". `transactionAmountClass(type)` returns `text-success-foreground` for income, `text-error-foreground` otherwise (expense default). New finance UI must reuse these helpers.

**Finance page** — `src/pages/finance/Finance.jsx`
Header `h1 text-xl font-semibold text-text-primary` "Finance" + `text-sm text-text-muted` subtitle "Track income and expenses so the month's picture stays honest." + `Button size="sm"` "New transaction" (`Plus`). States: `LoadingState` "Loading your transactions…" / `ErrorState` "Couldn't load your transactions" (retry = refetch) / `EmptyState` (`Wallet`) "No transactions yet" + "Log income and expenses to see the month's picture." + New transaction action. Body: month summary card (`rounded-lg border border-border bg-surface p-5`, `h2` "This month — {MMMM yyyy}") with `grid grid-cols-3 gap-3` of local `StatTile`s (Income/Spent/Net — computed by local pure `summarizeMonth(transactions, monthKey)` skipping entries outside `yyyy-MM`), then "All transactions" `h2` + `grid grid-cols-1 gap-6 xl:grid-cols-2` of TransactionCards. Toasts: "Transaction added" / "Transaction updated" / "Transaction removed". Dialog state `{ kind: "add" } | { kind: "edit", item }`. Money formatted via `formatAmount()` (added to `src/lib/utils.js` — display only, two decimals).

**Finance data layer** — `src/services/finance.service.js` + `src/hooks/useFinance.js`
`finance.service.js` owns the `finance_transactions` SQL (see progress-tracker 22 notes); `useFinance.js` owns key `["finance"]`; `useCreateTransaction` / `useUpdateTransaction` / `useDeleteTransaction` each invalidate `["finance"]`. Entries order by `date DESC, created_at DESC`. Amounts are positive REALs — the `type` column carries the sign at display time. Components never touch SQL directly.

**Route (update)** — `src/routes/index.jsx`
`/finance` swapped from Placeholder to `Finance` (the sidebar entry — "Finance" with the `BarChart3` icon — existed since the shell was built).

### shadcn/ui primitives (generated, JS mode)

Live in `src/components/ui/` (button, input, textarea, badge, card, label, select, dialog, table, tabs, dropdown-menu, form). Generated by `npx shadcn@latest add` — do not hand-edit. `cn()` imports rewritten to `@/lib/utils`. shadcn v4 emits `import { Slot } from "radix-ui"` (unified radix package) — keep the `radix-ui` and `cn` npm dependencies for future CLI adds.

### Tokens

See `ui-tokens.md`. Tailwind v4 `@theme` block lives in `src/index.css`; shadcn semantic variables (`--primary`, `--card`, etc.) are mapped to the project palette in `:root` + `@theme inline` in the same file. Never add colors outside that file.
