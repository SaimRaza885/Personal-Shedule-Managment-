# Build Plan

## Core Principle

Full page UI built with mock/static data first — verified visually before any logic is written. Then functionality is built and wired to the local SQLite database step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

Each feature below has a **UI** part (build the screen with mock or static data, verify against ui-rules.md / ui-tokens.md) and a **Logic** part (wire it to SQLite via services + hooks where applicable).

Build order begins with the foundation and the **Today / What Should I Do Now?** experience, followed by planning, work, focus, learning, reflection, finance, analytics, and local backup.

---

## Phase 0 — Foundation & Setup

### 01 Project Scaffold & Design Tokens

**Logic / setup:**

* Vite + React 19 app (JavaScript, `.jsx`). `@/` alias in `vite.config.js` + `jsconfig.json`.
* Tauri 2 Windows desktop application.
* Tailwind CSS v4 via `@tailwindcss/vite`; `src/index.css` with `@import "tailwindcss"` + the full `@theme` token block (see ui-tokens.md) and the shadcn variable mapping.
* Initialize shadcn/ui in **JS mode** (`components.json` → `"tsx": false`); add required base primitives.
* Install Inter (`@fontsource-variable/inter`) imported in `main.jsx`.
* Create `lib/database.js`, `lib/constants.js`, `lib/notifications.js`, `lib/utils.js`.
* Set up the initial application structure and routing.
* Configure the local SQLite database through Tauri.

### 02 SQLite Database Foundation

**Logic:**

* Create the local SQLite database and all core tables.
* Add keys, relationships, indexes, defaults, and status constraints.
* Create the database initialization and migration structure.
* Ensure the application can create and read its local database without an internet connection.
* No cloud database or authentication.

### 03 Tauri Desktop Foundation

**UI:** Initial desktop shell with application layout and basic loading/error states.

**Logic:**

* Configure Tauri 2 for Windows.
* Set up native commands required for SQLite, filesystem access, notifications, and backups.
* Configure application data location.
* Configure Windows desktop notifications.
* Ensure the application works as a standalone Windows desktop application.

---

## Phase 1 — Today & Daily Execution

### 04 Today Shell & "What Should I Do Now?"

**UI:** Main Today screen with large current-task section, date, available time, Start button, Top 3, today's schedule, and daily progress using mock data.

**Logic:**

* Determine the current scheduled task.
* Show the next actionable task based on the current time and task status.
* Show remaining steps and planned duration.
* Display appropriate state when there
