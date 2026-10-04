# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next. Feature numbers match build-plan.md.

---

## Current Status

**Phase:** Phase 3 — Focus & Execution
**Last completed:** 12 Low-Energy Mode
**Next:** 13 Overload Protection

---

## Progress

### Phase 0 — Foundation & Setup

* [x] 01 Project Scaffold & Design Tokens
* [x] 02 SQLite Database Foundation
* [x] 03 Tauri Desktop Foundation

### Phase 1 — Today & Daily Execution

* [x] 04 Today Shell & What Should I Do Now?
* [x] 05 Daily Schedule
* [x] 06 Daily Top 3

### Phase 2 — Goals & Work

* [x] 07 Goals & Milestones
* [x] 08 Projects & Work
* [x] 09 Tasks & Task Steps

### Phase 3 — Focus & Execution

* [x] 10 Focus Sessions
* [x] 11 Distraction Log
* [x] 12 Low-Energy Mode
* [ ] 13 Overload Protection

### Phase 4 — Capture & Ideas

* [ ] 14 Quick Capture
* [ ] 15 Ideas Vault

### Phase 5 — Learning

* [ ] 16 What I Learned
* [ ] 17 Tech Concepts I Must Know
* [ ] 18 Watch Later

### Phase 6 — Reflection

* [ ] 19 End-of-Day Review
* [ ] 20 Digital Diary
* [ ] 21 Weekly Review

### Phase 7 — Personal Finance

* [ ] 22 Finance Tracker

### Phase 8 — Analytics

* [ ] 23 Personal Analytics

### Phase 9 — Notifications & Local Data

* [ ] 24 Windows Desktop Notifications
* [ ] 25 Backup / Restore / Export

### Phase 10 — Wiring, Hardening & Release

* [ ] 26 Wire Today & Planning Together
* [ ] 27 SQLite & App Hardening
* [ ] 28 Windows Desktop QA & Production Build

---

## Decisions Made During Build

* **App type:** Windows-only desktop application. V1 does not target mobile or web browsers as standalone products.
* **Local-first:** Core functionality works completely offline. No cloud database or online account is required.
* **SQLite:** All persistent application data is stored locally in SQLite.
* **No authentication:** V1 has no login, signup, or user-account system.
* **Main screen:** Today / "What Should I Do Now?" is the primary screen and should immediately tell the user what to work on next.
* **Goal hierarchy:** Goals connect to milestones, projects, and actionable tasks.
* **Fixed-time schedule:** The user manually creates fixed-time daily schedules. The application does not silently move or reschedule work.
* **Daily Top 3:** The user can select up to three important tasks for the day.
* **Actionable tasks:** Tasks can contain individual steps so larger work can be broken into clear actions.
* **Focus tracking:** Actual focus time comes from focus sessions rather than being manually guessed.
* **Distraction Log:** Distractions are recorded for personal awareness and analytics, not punishment.
* **Low-Energy Mode:** Low energy surfaces lighter already-planned tasks without deleting or automatically rescheduling work.
* **Overload Protection:** The application warns when planned work exceeds available time but does not automatically rewrite the user's plan.
* **Quick Capture:** Random thoughts can be captured quickly and organized later.
* **Ideas Vault:** Ideas remain separate from active tasks and current work.
* **Learning storage:** "What I Learned" stores free-form learning notes without forcing quizzes or review prompts.
* **Tech Concepts:** Concepts are manually created and tracked separately from learning notes.
* **Watch Later:** Saved videos/links can be scheduled and can become actionable tasks.
* **Digital Diary:** Diary entries are completely free-form and separate from structured reviews.
* **End-of-Day Review:** Daily review compares planned work with actual results and leads into diary, learning, and tomorrow's planning.
* **Weekly Review:** Weekly review focuses on accomplishments, problems, changes, and priorities for the following week.
* **Personal Finance:** Finance tracking is for personal income, expenses, spending, and savings only. It is not a business accounting system.
* **Analytics:** Analytics should remain simple and useful, focusing on actual personal activity rather than decorative charts.
* **Notifications:** Windows notifications are used for useful reminders such as upcoming tasks, task starts, and reviews. Notifications must not become excessive.
* **Backup/Restore:** Because data is local, backup and restore are required to protect user data.
* **No automatic AI planning:** V1 does not automatically create schedules, make long-term decisions, or reorganize the user's life.
* **Service boundary:** React components never access SQLite directly. Database operations go through services and hooks.
* **JavaScript:** The project uses JavaScript (`.js` / `.jsx`), not TypeScript.
* **Tauri:** Native Windows functionality is handled through Tauri rather than a separate backend/server.
* **UI consistency:** New components and pages must follow the existing design tokens, UI rules, and component patterns.

---

## Notes

*Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files.*

* **02 — Dev database engine:** `src/lib/database.js` routes to tauri-plugin-sql inside the desktop shell and to a sql.js (SQLite WASM) engine in a plain browser, so features can be developed and verified without the Rust toolchain. The dev engine persists to localStorage and exposes the same `execute`/`select` surface. All SQL uses `?` placeholders — the `$1` style breaks sql.js. Migrations (`src/lib/migrations.js`) run once per connection and are recorded in `_migrations`.
* **03 — Tauri scaffold:** `src-tauri/` configured for Windows (identifier `com.saimraza.personalschedule`, app data dir = `%APPDATA%/com.saimraza.personalschedule/`, `sqlite:schedule.db` preloaded). Rust plugins: sql (sqlite), notification, fs, dialog — backups/export will build on fs+dialog in feature 25. **No Rust toolchain on this machine yet**: `tauri dev`/`tauri build` cannot run; UI is verified in a browser via the sql.js engine. Before the first desktop build: install Rust, then `npm run tauri icon <png>` to generate `src-tauri/icons/`.
* **04 — Today data flow:** `services/today.service.js` owns the SQL (schedule join + step counts via subselects, top-3 join); `hooks/useToday.js` owns TanStack Query keys `["today","schedule",date]` / `["today","top-three",date]`. Times are stored as `HH:mm` strings, so `determineNowState` compares lexicographically: "now" = the actionable block containing the current time; when none matches, the hero falls back to the next upcoming block; when none remains it shows the empty state. The Start button logs only — focus-session start is feature 10.
* **05 — Schedule mutations:** `services/schedule.service.js` owns add/edit/remove of blocks; `hooks/useSchedule.js` owns the three mutations, each invalidating `["today"]` on success. Add creates task + `daily_schedules` row in one transaction (`planned_minutes` = block duration, synced to `tasks.planned_minutes`). Edit changes times only and re-syncs `planned_minutes`. Remove deletes only the `daily_schedules` row — the task survives as an orphan by design (the schedule is not the task's owner). `daily_schedules` is the schedule source of truth; `tasks.scheduled_date/start_time/end_time` stay NULL.
* **05 — devDatabase `getRowsModified` fix:** sql.js resets its change counter when a statement is freed, so `db.getRowsModified()` must be read **before** `stmt.free()`. Reading it after made every UPDATE/DELETE report `rowsAffected: 0`, which broke the not-found guards in services. The engine contract now matches tauri-plugin-sql. Also: `db.export()` (used for persistence) silently ends an open transaction, so the dev engine persists only when not inside BEGIN/COMMIT — real tauri-plugin-sql handles this at the pool level, so keep mutations wrapped in transactions regardless of engine.
* **06 — Top 3 mutations:** `services/top-three.service.js` owns add/remove/move SQL; `hooks/useTopThree.js` owns candidates query (key `["today","top-three-candidates",date]`) + three mutations invalidating `["today"]`. Add assigns `position = COALESCE(MAX(position),0)+1` inside a transaction with guards: task must be scheduled today and actionable, not already in the Top 3, and count `< DEFAULT_VALUES.DAILY_TOP_THREE_MAX`. Remove and move rewrite positions via **delete + re-insert inside the transaction**: `UNIQUE(date, position)` in SQLite is always immediate per-row (DEFERRABLE applies only to FKs), so swapping positions with UPDATE collides on the intermediate state — and with only 3 rows there is no free temp value inside the 1..3 CHECK. Same ids/created_at are preserved on re-insert. Candidates = today's scheduled, actionable, not-yet-picked tasks ordered by start_time.
* **07 — Goals data layer:** `services/goal.service.js` owns goals + milestones SQL; `hooks/useGoals.js` owns query keys `["goals"]`, `["goal", id]`, `["goal", id, "milestones"]` and one mutation per operation. Milestone mutations invalidate `["goal", goalId, "milestones"]` + `["goals"]` (list cards show rollup progress). `listGoals()` computes `milestonesTotal` / `milestonesCompleted` via subselects; order is `year IS NULL, year DESC, created_at DESC` (dated goals first, newest year first, no-year last). `getGoal` returns `null` (not `undefined`) — React Query v5 throws on `undefined`. **Goal delete relies on FK CASCADE** — services never delete milestone rows manually; projects/tasks keep their records via `ON DELETE SET NULL`.
* **07 — devDatabase FK pragma fix (important):** sql.js defaults `foreign_keys` OFF while tauri-plugin-sql (sqlx) defaults it ON — enabling it once at connection creation is **not enough**: `db.export()` (used by `persist()` after every write) internally closes and reopens the connection, silently resetting all connection-level pragmas. The dev engine now re-runs `PRAGMA foreign_keys = ON;` after every export. Without this, CASCADE / SET NULL worked only until the first write of a session, then deletes left orphaned rows silently. Verified with orphan-count probes (`milestones WHERE goal_id NOT IN (SELECT id FROM goals)`).
* **08 — Projects data layer:** `services/project.service.js` owns projects SQL; `hooks/useProjects.js` owns query keys `["projects"]`, `["project", id]`, `["project", projectId, "tasks"]` and one mutation per operation. `listProjects()` computes `tasksTotal` / `tasksCompleted` via subselects and orders by **status rank in JS** (`STATUS_ORDER` array from `PROJECT_STATUS`, then `rows.sort`) instead of a SQL CASE with literal status strings — code-standards forbids inline enum literals in SQL. Project delete relies on `tasks.project_id ON DELETE SET NULL`: tasks keep their records and just lose the link (the confirm copy says so). **Cross-domain invalidation:** `useUpdateGoal`/`useDeleteGoal` also invalidate `["projects"]` because project cards show the linked goal's title — verified by deleting a goal and watching project chips clear without a reload. `listProjectTasks` is read-only for now — task management is feature 09.
* **09 — Tasks data layer:** `services/task.service.js` owns tasks + task_steps SQL; `hooks/useTasks.js` owns query keys `["tasks", status ?? "all"]` and the deliberately distinct `["task", taskId, "steps"]`, plus one mutation per operation. Sorting is `STATUS_ORDER` rank (in_progress first) then `PRIORITY_ORDER` rank, done in JS after `ORDER BY created_at DESC` (no enum literals in SQL). `setTaskStatus` is **the single implementation of task status transitions** — documented in the service; `TaskStatus.jsx` is the single toggle component and defines the not_started↔completed toggle in one place. Step reordering is not in scope for v1; new steps get `sort_order = COALESCE(MAX(sort_order), -1) + 1` via a subselect inside the INSERT. `setTaskStepCompleted` takes an explicit target state (not a toggle) so retries can never double-toggle. **Cross-domain invalidation:** task mutations invalidate `["tasks"]`, `["project"]`, `["projects"]`, `["today"]`; step mutations invalidate `["task"]`, `["tasks"]`, `["today"]` — the Today hero reads `stepsTotal`/`stepsRemaining` per scheduled task, verified live (hero showed "2 of 2 steps remaining" and the card footer updated its `0 of 2 steps` count). Task delete relies on FK cascades (`task_steps` CASCADE, schedule/top-3 rows CASCADE) — verified by deleting a task with steps and probing `task_steps` for orphans. The task form deliberately has **no schedule fields** (daily_schedules owns scheduling) and no milestone select (nothing consumes that link yet). The Today hero's Start button still logs only — the status transition it will call exists (`setTaskStatus`); focus-session wiring is feature 10.
* **09 — Add-task entry point:** `/tasks` is the full management surface (filter, steps, edit, delete); `ProjectDetails` keeps its read-only task card but gained an "Add task" action that opens the shared `TaskFormDialog` with `defaultProjectId` pre-filled. Both surfaces call the same hook mutations, so the project view and the tasks list stay in sync via query invalidation.
* **10 — Focus data layer:** `services/focus.service.js` owns focus_sessions SQL; `hooks/useFocus.js` owns query keys `["focus","active"]`, `["focus","history",limit]`, `["focus","candidates",date]` and one mutation per operation (start/pause/resume/complete/cancel), each invalidating `["focus"]`, `["today"]`, `["tasks"]`, `["task"]`, `["project"]`, `["projects"]` (start flips the task to in_progress; finish rolls actual_minutes up to the task). Candidates reuse `today.service.getTodaySchedule(date)` filtered to actionable blocks — focus never invents its own schedule view.
* **10 — No resume column:** focus_sessions has no paused-at/resume column, so pause stores elapsed minutes in `actual_minutes` and resume shifts `started_at` back by that amount (`new Date(Date.now() - actualMinutes * 60000)`). In every open state the invariant "elapsed = now − started_at" holds, which is exactly what the timer renders and what finish re-reads. Verified conservation with a real 2-minute session: pause stored 2, resume shifted started_at by 2 min, clock continued at 02:04 instead of restarting, complete rolled +2 onto the task's `actual_minutes` and set `ended_at`.
* **10 — Single active session + task rollup:** `startFocusSession` guards against a second open session ("You already have a focus session in progress.") and auto-transitions the task not_started → in_progress via `setTaskStatus` (the single status-transition implementation from 09). `finishSession` handles complete AND cancel in one path: it refuses already-finished sessions, computes final actual minutes from wall-clock when running, and adds them to `tasks.actual_minutes` for both outcomes. Actively-focusing state is surfaced on Today's NowCard ("Focus in progress" replaces the Start button and routes to /focus).
* **10 — Focus UI:** `/focus` page = active-session timer (1s ticker only while running) / candidates list / history, plus a post-session summary card (SessionSummary) shown after complete/cancel — the summary IS the feedback, so no extra toast there. Timer renders from `startedAt` + now rather than counting in memory, so a reload restores the correct elapsed time (verified by deep-link reload: clock resumed at 00:29).
* **11 — Distraction data layer:** `services/distraction.service.js` owns the distractions table SQL (`logDistraction`, `listSessionDistractions`); `hooks/useDistractions.js` owns `useSessionDistractions(sessionId)` (key `["distractions", sessionId]`, disabled without an id) and `useLogDistraction` (invalidates `["focus"]` and `["distractions"]`). The `["focus"]` invalidation is what refreshes the live "N logged this session" count — `SESSION_SELECT` in `focus.service.js` gained a `distractionsCount` subselect so the timer and history read the count from the same row fetch, no extra query.
* **11 — Distraction capture UX:** `DistractionDialog` (same conventions as `ScheduleBlockDialog`) offers five one-tap preset chips (Phone, People, Notifications, Noise, Mind wandering) that fill the reason field, plus free-text reason (required, ≤80) and optional notes (≤300). Framing everywhere is "for awareness, not judgment" — the log button lives on the timer, the summary groups entries by reason with counts (`Phone ×2`), and history rows append "· N distraction(s)". Verification included the edge cases: empty-reason submit shows the zod error and keeps the dialog open; both preset and typed entries persisted correctly; the summary read "2 distractions logged." with reason chips after completion.
* **11 — No session rollup:** Distractions are deliberately NOT rolled into any task or daily metric — they exist for personal awareness now and analytics later (feature 23). `distractions.focus_session_id` has `ON DELETE CASCADE`, so removing a session cleans its entries; the count shown on finished history rows is therefore stable.
* **12 — Energy selection state:** `src/stores/energy.store.js` is the project's first Zustand store — the selection is UI state (library-docs.md lists "Low-Energy Mode selection" as a store use case), persisted to `localStorage` key `psm-energy-mode` via the persist middleware with `partialize` to `{ energy }` only. `EnergySelector` chips (High/Medium/Low) live in the NowCard header; clicking the selected chip deselects (`null` = no mode). Only **Low** triggers behavior — High/Medium are record-keeping states. `useTodayData()` reads the store and derives `lighterOptions` so the store itself stays free of business logic.
* **12 — Lighter options ranking (read-only):** `findLighterOptions(schedule, timeNow, { excludeTaskId, limit })` in `today.service.js` ranks actionable blocks that still have time left (`endTime > timeNow`) by energy level (low → medium → unknown → high, `ENERGY_RANK`), then shorter `plannedMinutes`, then earlier `startTime`; capped at `DEFAULT_VALUES.LIGHTER_OPTIONS_MAX` (3). `getTodaySchedule` now also selects `t.priority` / `t.energy_level`. The invariant holds — the mode only changes what is **surfaced**: verified the schedule rows are byte-identical before/after toggling modes, and each suggestion's Start reuses Today's existing `handleStart` (starts a real focus session for that task — verified it navigated to /focus with "Fix small issue" and its 25 min). Reload persistence verified; console clean.
* **12 — Verification seeding note:** the UI cannot yet create a scheduled task with an energy level (ScheduleBlockDialog creates tasks by title only; energy editing lives in TaskFormDialog) — linking these is feature 26. Feature-12 verification therefore seeded a mixed-energy day via service probes (`addScheduleBlock` + full `updateTask`), then confirmed the expected order (Fix small issue, Review PR, Read documentation) and that lower-ranked Groceries was dropped by the limit while the current block was excluded.
