# Architecture

## Stack

| Layer                   | Tool                                          | Purpose                                                 |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------- |
| Desktop framework       | Tauri 2                                       | Windows desktop application + native system integration |
| Build tool / dev server | Vite                                          | Fast dev server + production bundling                   |
| UI framework            | React 19                                      | Component model                                         |
| Routing                 | React Router                                  | Client-side routing                                     |
| Language                | JavaScript (`.js` / `.jsx`)                   | Throughout — **no TypeScript**                          |
| Styling                 | Tailwind CSS v4 (`@tailwindcss/vite`)         | Utility CSS + design tokens via `@theme`                |
| Components              | shadcn/ui (**JS mode**, `tsx: false`) + Radix | Accessible UI primitives as `.jsx`                      |
| Icons                   | lucide-react                                  | Icon set                                                |
| Backend                 | Rust + Tauri                                  | Native desktop operations + SQLite access               |
| Database                | SQLite                                        | Local, offline-first application data                   |
| State                   | Zustand                                       | Local application state                                 |
| Forms                   | react-hook-form + zod                         | Form state + validation                                 |
| Dates                   | date-fns                                      | Date and schedule handling                              |
| Charts                  | Recharts                                      | Personal analytics                                      |
| Notifications           | Tauri notification plugin                     | Windows desktop notifications                           |
| Printing                | Browser-native print + `@media print`         | Print supported content                                 |
| Storage                 | Local filesystem + SQLite                     | Local database, backups and exports                     |

There is **no custom server**, cloud database, authentication system, or serverless API layer. The React app communicates with the native Tauri layer when it needs filesystem, SQLite, notification, or other desktop functionality. All user data is stored locally on the Windows machine.

---

## Folder Structure

```text
/
├── AGENTS.md
├── context/                         → these guidance files
├── docs/                            → product specs (source of truth)
├── index.html                       → Vite entry HTML (mounts #root)
├── vite.config.js                   → Vite + @tailwindcss/vite + @ alias
├── jsconfig.json                    → editor path intellisense for @/
├── components.json                  → shadcn/ui config (tsx: false → .jsx)
└── src/
    ├── main.jsx                     → mount App, import index.css
    ├── App.jsx                      → RouterProvider + application providers
    ├── routes/
    │   └── index.jsx                → route tree
    ├── lib/
    │   ├── database.js              → SQLite access layer
    │   ├── constants.js             → enums, status values, defaults
    │   ├── notifications.js         → Windows notification helpers
    │   └── utils.js                 → cn(), formatters, small helpers
    ├── services/                    → ALL database access lives here (one module per domain)
    │   ├── goal.service.js
    │   ├── project.service.js
    │   ├── task.service.js
    │   ├── schedule.service.js
    │   ├── focus.service.js
    │   ├── review.service.js
    │   ├── diary.service.js
    │   ├── learning.service.js
    │   ├── concept.service.js
    │   ├── watch-later.service.js
    │   ├── idea.service.js
    │   ├── capture.service.js
    │   ├── distraction.service.js
    │   ├── finance.service.js
    │   ├── analytics.service.js
    │   └── backup.service.js
    ├── hooks/                       → application state and data hooks
    │   ├── useGoals.js
    │   ├── useProjects.js
    │   ├── useTasks.js
    │   ├── useSchedule.js
    │   ├── useFocus.js
    │   ├── useDiary.js
    │   ├── useLearning.js
    │   ├── useConcepts.js
    │   ├── useWatchLater.js
    │   ├── useFinance.js
    │   └── ...
    ├── components/
    │   ├── ui/                      → shadcn/ui primitives ONLY (.jsx)
    │   ├── layout/                  → AppShell, Sidebar, Topbar
    │   ├── shared/                  → PageHeader, EmptyState, ConfirmDialog, StatusBadge
    │   ├── today/                   → NextTask, TopThree, DailySchedule, DailyProgress
    │   ├── goals/                   → GoalCard, GoalForm, MilestoneList
    │   ├── projects/                → ProjectCard, ProjectForm, ProjectTasks
    │   ├── tasks/                   → TaskForm, TaskSteps, TaskStatus
    │   ├── focus/                   → FocusTimer, FocusControls, SessionSummary
    │   ├── learning/                → LearningEntry, ConceptList, WatchLater
    │   ├── diary/                   → DiaryEditor, DiaryEntryList
    │   ├── finance/                 → TransactionForm, FinanceSummary
    │   └── reviews/                 → DailyReview, WeeklyReview
    ├── pages/
    │   ├── today/                   → Today
    │   ├── goals/                   → Goals, GoalDetails
    │   ├── work/                    → Projects, ProjectDetails, Tasks
    │   ├── learning/                → Learned, Concepts, WatchLater
    │   ├── diary/                   → Diary
    │   ├── finance/                 → Finance
    │   ├── ideas/                   → Ideas, QuickCapture
    │   ├── analytics/               → Analytics
    │   ├── reviews/                 → WeeklyReview, EndOfDayReview
    │   └── settings/                → Settings, Backup
    └── assets/                      → static assets
```

---

## System Boundaries

| Folder        | Owns                                                                            | Never contains                               |
| ------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| `pages/`      | Route-level composition and layout.                                             | Direct SQLite calls, business logic.         |
| `components/` | Presentational UI + local interaction.                                          | Direct database access, data fetching logic. |
| `hooks/`      | Application data/state hooks; wraps services.                                   | Raw SQL string building; UI/JSX.             |
| `services/`   | **All** SQLite reads/writes; business rules and domain operations.              | React hooks, JSX, DOM APIs.                  |
| `lib/`        | Database client, constants, notifications, pure utilities.                      | Feature-specific business logic.             |
| `routes/`     | Route tree and navigation.                                                      | Database access or feature logic.            |
| `src-tauri/`  | Native desktop functionality, SQLite integration, filesystem and notifications. | React UI or presentation logic.              |

**Rule:** data flows `pages → hooks → services → SQLite/Tauri`. A component never accesses SQLite directly; a service never imports React.

---

## Data Flow

### Reads

```text
Page renders
   ↓
useX() hook (hooks/)
   ↓
xService.getX() (services/)
   ↓
SQLite / Tauri
   ↓
Local database
```

### Writes (mutations)

```text
Form submit / action
   ↓
useX mutation hook → xService.createX()/updateX()
   ↓
SQLite / Tauri
   ↓
Local database updated
   ↓
UI refreshes
```

### Daily Execution Pipeline

```text
User plans tomorrow
   → schedule + tasks stored locally
Today opens
   → system determines the next scheduled actionable task
User starts task
   → focus session starts
User pauses/completes
   → actual time is recorded
Task completed
   → next task becomes available
End of day
   → daily review + diary + tomorrow's plan
Weekly
   → weekly review + analytics
```

### Goals → Projects → Tasks

```text
Year Goal
   → Monthly milestone
      → Weekly milestone
         → Project
            → Task
               → Task steps
                  → Focus Session
```

Goals provide direction, while tasks provide the actual work the user performs.

---

## SQLite Database Schema

Single local SQLite database. **All personal application data is stored locally.** IDs are generated locally. Timestamps and dates are stored consistently according to the project's database conventions.

### Goals & Planning

**`goals`** — `id`, `title`, `description`, `year`, `status`, `created_at`, `updated_at`.

**`milestones`** — `id`, `goal_id`, `title`, `description`, `period_type` (`year`/`month`/`week`), `target_date`, `status`, `created_at`, `updated_at`.

### Work & Projects

**`projects`** — `id`, `goal_id`, `name`, `description`, `status` (`active`/`completed`/`paused`/`archived`), `created_at`, `updated_at`.

**`tasks`** — `id`, `project_id`, `goal_id`, `milestone_id`, `title`, `description`, `scheduled_date`, `start_time`, `end_time`, `planned_minutes`, `actual_minutes`, `priority`, `status`, `energy_level`, `created_at`, `updated_at`.

**`task_steps`** — `id`, `task_id`, `title`, `is_completed`, `sort_order`, `created_at`, `updated_at`.

### Daily Planning

**`daily_schedules`** — `id`, `task_id`, `date`, `start_time`, `end_time`, `planned_minutes`, `created_at`, `updated_at`.

**`daily_top_three`** — `id`, `date`, `task_id`, `position`, `created_at`.

### Focus

**`focus_sessions`** — `id`, `task_id`, `started_at`, `ended_at`, `planned_minutes`, `actual_minutes`, `status`, `created_at`.

**`distractions`** — `id`, `focus_session_id`, `reason`, `notes`, `occurred_at`, `created_at`.

### Learning

**`learning_entries`** — `id`, `title`, `content`, `date`, `created_at`, `updated_at`.

**`tech_concepts`** — `id`, `title`, `category`, `description`, `status` (`not_started`/`learning`/`learned`/`review`), `created_at`, `updated_at`.

**`watch_later`** — `id`, `title`, `url`, `scheduled_date`, `status`, `created_at`, `updated_at`.

### Ideas & Capture

**`ideas`** — `id`, `title`, `description`, `status`, `created_at`, `updated_at`.

**`quick_captures`** — `id`, `content`, `captured_at`, `converted_type`, `converted_id`, `created_at`.

### Reflection

**`diary_entries`** — `id`, `date`, `content`, `created_at`, `updated_at`.

**`daily_reviews`** — `id`, `date`, `planned_tasks`, `completed_tasks`, `partial_tasks`, `missed_tasks`, `focus_minutes`, `review_notes`, `created_at`, `updated_at`.

**`weekly_reviews`** — `id`, `week_start`, `week_end`, `what_went_well`, `what_did_not_go_well`, `accomplishments`, `changes_for_next_week`, `priorities`, `created_at`, `updated_at`.

### Finance

**`finance_transactions`** — `id`, `type` (`income`/`expense`), `amount`, `category`, `description`, `date`, `created_at`, `updated_at`.

### Application

**`settings`** — local application preferences, notification settings, working hours, available time and other user configuration.

**`backups`** — local backup metadata such as `id`, `file_path`, `created_at`, `size`.

---

## Local Storage

The SQLite database is stored locally on the user's Windows machine.

The application must not require an internet connection for normal operation.

Important local data includes:

* Tasks
* Goals
* Projects
* Schedule
* Focus sessions
* Diary
* Learning
* Tech concepts
* Watch Later
* Ideas
* Distractions
* Reviews
* Finance
* Analytics data

The application must provide a reliable way to:

* Create a backup
* Restore a backup
* Export personal data

---

## Authentication

There is **no authentication system** in V1.

The application is intended for one user on their Windows machine.

Do not add:

* Login
* Signup
* Password authentication
* User accounts
* OAuth
* Cloud identity
* Multi-user permissions

---

## Notifications

Windows desktop notifications are used for useful reminders such as:

* Upcoming scheduled task
* Task start time
* Next task
* Evening review
* Other explicitly configured reminders

Notifications should not become excessive or distracting.

---

## Scheduling Rules

The Today screen should determine the user's current task from the daily schedule.

The system should consider:

* Current time
* Scheduled start/end time
* Task status
* Available time
* Completed tasks
* Remaining tasks
* Planned duration

If planned work exceeds available time, the application should warn the user.

Example:

```text
Planned work: 8h 20m
Available time: 5h

Your plan is overloaded.
```

The user remains in control and can move, remove, or reduce tasks.

---

## Low-Energy Mode

The user can select:

* High energy
* Medium energy
* Low energy

Low-Energy Mode should prioritize lighter tasks that are already planned.

For example:

```text
Instead of:
Build a complete feature

Prefer:
Review requirements
Plan implementation
Read documentation
Fix a small issue
Complete task steps
```

The system should help maintain momentum without treating low-energy days as failures.

---

## What Should I Do Now?

This is the central application behavior.

When the user opens the application, the primary screen should clearly answer:

> **What should I do now?**

The screen should prominently show:

* Current task
* Scheduled time
* Remaining steps
* Planned duration
* Start button

Example:

```text
YOUR NEXT TASK

Finish Client Team Page

9:00 AM — 10:30 AM

4 steps remaining

[ START ]
```

After completing the task, the next appropriate scheduled task should become the current task.

---

## Invariants

Rules the AI agent must never violate:

* Components never access SQLite directly — all database access goes through `services/`, surfaced via hooks.
* Services never import React or touch the DOM; hooks never contain JSX.
* The application is Windows-only in V1.
* The application is offline-first and must work without internet access.
* User data is stored locally in SQLite.
* No cloud database, authentication, or synchronization should be introduced.
* The Today / "What Should I Do Now?" experience remains the central workflow.
* Tasks should be actionable rather than vague.
* Fixed-time scheduling must be respected.
* The user remains in control of planning and schedule changes.
* Overload Protection warns about unrealistic schedules but never silently deletes or changes user tasks.
* Focus sessions record planned and actual time.
* Diary entries remain completely free-form.
* What I Learned is storage only; do not add automatic quizzes or forced review prompts.
* Tech Concepts are manually created by the user and remain separate from What I Learned.
* Finance is personal finance only, not business/freelance accounting.
* No mobile application is part of V1.
* No unnecessary AI planning or automatic life decisions are part of V1.
* No hardcoded hex values or raw Tailwind color classes in components — use tokens from `ui-tokens.md`.
* Errors surfaced to users are human-readable.
* No secrets or external service credentials are required for the core application.
