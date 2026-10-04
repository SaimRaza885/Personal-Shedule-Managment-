# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

* **Think before implementing** — understand what is being built and why before writing a line.
* **Read context files first** — never assume; verify against architecture.md and project-overview.md.
* **Scope is sacred** — build only what the current feature requires. Never go beyond scope even if it seems helpful.
* **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete.
* **Clean over clever** — simple, readable code a junior can follow beats clever abstractions.
* **One thing at a time** — finish one feature fully before touching the next.
* **Security is not the UI's job** — local data access and application boundaries must be respected; the UI should not directly manage database operations.

---

## Language: JavaScript (not TypeScript)

This project is **JavaScript** — `.js` and `.jsx`. Do not introduce TypeScript, `.ts`/`.tsx` files, or a `tsconfig.json`.

* Use modern ES modules (`import`/`export`), `const` by default, `let` only when reassigning, never `var`.
* Prefer small pure functions; avoid implicit surprises. Validate external/user data at the boundary (forms with zod, service inputs) rather than trusting shapes.
* Document non-trivial data shapes (a goal, task, focus session, learning entry, diary entry, transaction) with **JSDoc `@typedef`** in `lib/` or the relevant service, and reference them with `@param`/`@returns`. This gives editor intellisense without TypeScript.
* No floating promises — always `await` or `.catch()`. Async functions handle their own errors (see Error Handling).
* Enums/allowed values (statuses, priorities, energy levels, transaction types) live as frozen constants in `lib/constants.js` — never as scattered string literals.

```js
/** @typedef {{ id: string, title: string, status: "planned"|"in_progress"|"completed"|"cancelled", priority: "low"|"medium"|"high" }} Task */

/** @param {string} taskId @returns {Promise<Task>} */
export async function getTask(taskId) { /* ... */ }
```

---

## React + Vite Conventions

* **Function components only**, with hooks. No class components.
* This is a **Vite SPA** running inside a Tauri Windows desktop application — there is no Next.js. Never write `"use client"`, `"use server"`, `next/*` imports, Server Components, Server Actions, API route handlers, `app/`, or Next.js `pages/` files.
* The app entry is `src/main.jsx` → `src/App.jsx`. Global CSS and the Inter font import live in `main.jsx`.
* **One component per file**; **named exports** (no default exports for components).
* Props are destructured in the signature. Keep components presentational — data comes in via props or hooks, never direct SQLite/Tauri database calls.
* Respect the Rules of Hooks (top level only, stable order). Extract reusable logic into `hooks/`.
* No inline styles — style with Tailwind classes using tokens from ui-tokens.md.

### Component structure (order)

```jsx
// 1. External imports
import { useState } from "react";
import { Plus } from "lucide-react";

// 2. Internal imports (@/ alias)
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";

// 3. Component (named export)
export function TaskList({ projectId }) {
  // hooks / query hooks
  // derived values
  // handlers
  // return JSX
}
```

---

## Routing (React Router)

* The route tree lives in `src/routes/index.jsx`.
* Navigate with `<Link>`/`useNavigate>` — never mutate `window.location` for in-app navigation.
* Route params (`:id`, `:projectId`) are read with `useParams`.
* Keep route-level composition inside pages/routes; database and business logic must remain outside route components.

---

## Data Layer: Services + Hooks

**Every** database interaction goes through a service module; every component consumes application data through a hook that wraps the relevant service. Components never access SQLite directly.

### Service modules (`services/*.service.js`)

```js
// services/task.service.js

/** @returns {Promise<Task[]>} */
export async function listTasks(filters) {
  // SQLite/Tauri data access
}
```

* Services are the only place where SQLite/Tauri database operations are performed.
* Always handle database errors — never assume success. Throw a normalized error so the hook can surface a friendly message.
* Use a single-row query when exactly one record is expected.
* Business rules (task status transitions, schedule validation, overload calculation, focus-time calculation) live in the relevant service, defined once.
* Services must not contain React UI logic.

### Hooks (`hooks/*.js`)

```js
// hooks/useTasks.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as taskService from "@/services/task.service";

export function useTasks(filters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => taskService.listTasks(filters),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
```

* Query keys are arrays namespaced by domain: `["tasks", filters]`, `["goal", goalId]`, `["focus-session", sessionId]`.
* Mutations invalidate affected keys on success.
* Components read `{ data, isLoading, isError }` and render loading/empty/error states (see ui-rules.md) — never leave a bare unhandled state.

---

## Forms (react-hook-form + zod)

* All non-trivial forms (goals, milestones, projects, tasks, schedules, learning entries, tech concepts, diary entries, finance transactions) use **react-hook-form** with a **zod** schema via `@hookform/resolvers/zod`.
* The zod schema is the single source of validation truth; reuse it for defaults and error messages.
* Use shadcn/ui's `Form` primitives (built on react-hook-form) for consistent labels, descriptions, and error text.
* Submit handlers call a mutation hook; show loading state on the submit button and a success/error toast. Never submit silently.

---

## SQLite Usage

* SQLite is the **only application database** in V1.
* All user data is stored locally on the Windows device.
* There is **no Supabase, Firebase, MongoDB, PostgreSQL, or remote database**.
* There is no account or authentication system in V1.
* SQLite access must remain inside the data/service/native boundaries defined in `architecture.md`.
* Never expose raw database operations directly to React components.
* Use parameterized queries for all values. Never build SQL by directly concatenating user input.
* Database schema changes must be handled through the project's migration strategy.
* Keep business rules in services rather than duplicating them across components.

---

## File and Folder Naming

* Folders: kebab-case — `focus-sessions`, `daily-review`, `tech-concepts`.
* Component files: PascalCase — `TaskCard.jsx`, `FocusTimer.jsx`.
* Page files: PascalCase — `Today.jsx`, `WeeklyReview.jsx`.
* Service files: `domain.service.js` — `task.service.js`, `goal.service.js`.
* Hook files: `useThing.js` — `useTasks.js`, `useGoals.js`.
* Utility/lib files: camelCase — `database.js`, `queryClient.js`, `constants.js`, `utils.js`.
* One component per file. Barrel `index.js` files only inside `components/ui/` (shadcn) — never elsewhere.

---

## shadcn/ui (JS mode)

* `components.json` has `"tsx": false` → components are generated as `.jsx` into `src/components/ui/`.
* Add primitives with the CLI (`npx shadcn@latest add button dialog table ...`) — don't hand-write Radix wrappers that shadcn already provides.
* shadcn components read semantic CSS variables; those variables are mapped to our tokens in `src/index.css` (see ui-tokens.md). Never let shadcn ship its default palette.
* Extend/compose shadcn primitives in feature folders; don't fork or heavily edit files in `components/ui/` (keeps them upgradeable).
* Use the `cn()` helper (`lib/utils.js`) for conditional classes — never string-concatenate class names.

---

## Error Handling

* No empty catch blocks — always handle or log.
* Log with a context prefix: `console.error("[task.service:createTask]", error)`.
* User-facing errors are **human-readable** — never surface raw SQLite/Tauri errors. Map known cases to clear sentences; fall back to a generic "Something went wrong. Please try again."
* TanStack Query surfaces errors via `isError`/`error`; render an error state with a retry action.
* Validate inputs before writing (zod on forms, guards in services) — fail early with a clear message.

---

## Environment Variables

This application is local-first and does not require remote service credentials.

* Do not hardcode secrets or credentials.
* Do not introduce unnecessary environment variables.
* Vite environment variables, if ever required for development/build configuration, must be accessed through `import.meta.env`.
* Never use `process.env` in the React application.
* Never introduce cloud database or authentication credentials without explicitly changing the project architecture first.

---

## Task & Planning Invariants (in code)

* Task status transitions are implemented once in the relevant task service and reused — never re-derived differently in individual components.
* Goal → milestone → project → task relationships remain consistent.
* A task's planned duration must match its schedule where applicable.
* Actual focus time comes from recorded focus sessions — never manually re-derived differently across screens.
* Daily Top 3 contains a maximum of three tasks.
* Overload protection compares planned work against available time and warns the user when the plan is overloaded.
* Low-Energy Mode changes which already-planned tasks are surfaced; it does not silently delete, reschedule, or modify tasks.
* "What Should I Do Now?" uses the current schedule, task status, remaining work, available time, and priority to determine the next actionable task.
* Fixed-time schedules must not be silently changed by the application.
* Status/priority/energy/transaction enum strings come from `lib/constants.js` — never inline literals scattered across files.

---

## Import Aliases

Use the `@/` alias (configured in `vite.config.js` + `jsconfig.json`) — never relative paths that climb more than one level.

```js
// Correct
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import { TASK_STATUS } from "@/lib/constants";

// Never
import { Button } from "../../../components/ui/button";
```

---

## Comments

* No comments restating what code does — code must be self-explanatory.
* Comments only for **why** — a non-obvious decision, a business rule, a local-storage/SQLite assumption.
* JSDoc typedefs/annotations are encouraged for core data shapes and service signatures.
* Never leave `TODO`/`FIXME` in delivered code — either do it or note it in progress-tracker.m
