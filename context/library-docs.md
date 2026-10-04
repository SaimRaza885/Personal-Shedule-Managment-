# Library Docs

Project-specific usage patterns for every third-party library in this project. This file covers **how we use each library in this specific Personal Productivity Desktop App** — the rules, patterns, and constraints that apply here, not general tutorials.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

1. **Check AGENTS.md** at the project root — it lists the skills installed for this project and how to use them. Skills carry up-to-date API docs and patterns specific to this codebase.
2. **Check for an MCP server** for that tool if one is configured. Use it for real-time docs/debugging before falling back to general knowledge.
3. **Read this file** for project-specific patterns that override general library knowledge.

Order of authority:

```text
MCP server (real-time) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on training knowledge alone for library APIs — they change, and Tauri, Tailwind v4, React Router, and SQLite libraries can shift meaningfully across versions.

---

## Tauri

**Check first:** AGENTS.md for a Tauri skill.

Tauri is the desktop layer of the application. The React frontend runs inside the Tauri Windows desktop application and communicates with native functionality through Tauri APIs.

### Rules

* The application is **Windows-only** in V1.
* Tauri owns native desktop functionality such as filesystem access, notifications, application paths, and SQLite/native integrations.
* Do not introduce a separate Node.js/Express backend.
* Do not create API routes or remote server endpoints.
* Keep native functionality behind clear service/lib boundaries.
* React components must not directly contain complex native logic.
* Use Tauri APIs only when the feature actually requires desktop functionality.

---

## SQLite

**Check first:** AGENTS.md for a SQLite/Tauri database skill.

SQLite is the application's **local database**. The app is completely offline and all core user data is stored locally on the Windows device.

### Database access

```js
// Example service shape
export async function listTasks(filters = {}) {
  // SQLite query through the application's database layer
}
```

**Rules:**

* SQLite is the only application database in V1.
* There is no Supabase, Firebase, MongoDB, PostgreSQL, or cloud database.
* Components never access SQLite directly.
* Database access goes through service modules.
* Use parameterized queries for all user-provided values.
* Never construct SQL by concatenating user input.
* Always handle database errors.
* Keep database/business rules inside services.
* Use transactions when multiple related writes must succeed or fail together.
* Database migrations must be used for schema changes.
* Store dates/times consistently and format them only at the UI boundary.
* Local database data must remain available without an internet connection.

### Data examples

Core data includes:

* Goals
* Milestones
* Projects
* Tasks
* Task steps
* Daily schedules
* Daily Top 3
* Focus sessions
* Distractions
* Learning entries
* Tech concepts
* Watch Later items
* Ideas
* Quick captures
* Diary entries
* Daily reviews
* Weekly reviews
* Finance transactions
* Settings

---

## React Router

**Check first:** AGENTS.md for a React Router skill.

The application uses React Router for navigation between the desktop app's main sections.

### Route tree

```jsx
// src/routes/index.jsx
createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { path: "/", element: <Today /> },
      { path: "/goals", element: <Goals /> },
      { path: "/projects", element: <Projects /> },
      { path: "/tasks", element: <Tasks /> },
      { path: "/focus", element: <Focus /> },
      { path: "/learning", element: <Learning /> },
      { path: "/ideas", element: <Ideas /> },
      { path: "/diary", element: <Diary /> },
      { path: "/finance", element: <Finance /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/reviews", element: <Reviews /> },
      { path: "/settings", element: <Settings /> },
    ],
  },
]);
```

**Rules:**

* Navigate with `<Link>` / `useNavigate`.
* Read route params with `useParams`.
* Never use `window.location` for normal in-app navigation.
* Keep database fetching inside hooks/services.
* Route components compose screens; they do not contain database logic.
* The Today screen is the primary execution screen.

---

## TanStack Query (React Query)

**Check first:** AGENTS.md for a TanStack Query skill.

TanStack Query manages application data read from the local SQLite service layer. It provides caching, deduplication, loading/error state, and controlled invalidation.

```js
// Provider in App.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});
```

**Rules:**

* Every database read used by a component should be exposed through a hook.
* Every database write should use a mutation.
* Mutations invalidate affected query keys on success.
* Query keys are arrays namespaced by domain and filters:
  `["tasks", filters]`, `["goal", goalId]`, `["focus-session", sessionId]`.
* Read `{ data, isLoading, isError, error }` in components.
* Render loading/empty/error states.
* Do not duplicate database data into local state unnecessarily.
* Use `enabled` when a query depends on another value.
* Do not treat TanStack Query as the database; SQLite remains the source of truth.

---

## Zustand

**Check first:** AGENTS.md for a Zustand skill.

Zustand is used for lightweight **client/UI state**, not as a replacement for SQLite.

### Good uses

* Sidebar state
* UI preferences
* Current temporary focus state
* Low-Energy Mode selection
* Temporary filters
* Modal/dialog state
* Other short-lived application UI state

### Rules

* Persistent user data belongs in SQLite.
* Do not store the entire task/project database in Zustand.
* Do not duplicate SQLite records in a global store unless there is a clear UI-state reason.
* Keep stores small and domain-focused.
* Avoid putting business rules into Zustand stores.

---

## react-hook-form + zod

**Check first:** AGENTS.md for a related skill.

All non-trivial forms use react-hook-form with a zod schema through `@hookform/resolvers/zod`, rendered with shadcn/ui `Form` primitives.

```js
const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  planned_minutes: z.number().int().positive(),
  priority: z.enum(["low", "medium", "high"]),
});
```

**Rules:**

* The zod schema is the single validation source.
* Reuse schemas for defaults and error messages.
* Validate before writing to SQLite.
* Task, goal, milestone, project, schedule, learning, diary, tech concept, finance, and review forms should use this pattern where applicable.
* On submit, call a mutation hook.
* Show button loading state and a success/error toast.
* Never submit silently.

---

## shadcn/ui (JS mode)

**Check first:** AGENTS.md for a shadcn skill.

shadcn/ui runs in **JavaScript mode** — components are generated as `.jsx`, not `.tsx`.

```jsonc
// components.json
{
  "tsx": false,
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils"
  }
}
```

```bash
# add primitives as needed
npx shadcn@latest add button input select dialog table dropdown-menu form badge tabs
```

**Rules:**

* Generated primitives live in `src/components/ui/` as `.jsx`.
* Don't hand-write what the CLI already provides.
* Don't heavily edit generated files.
* Compose primitives into feature components.
* Use `cn()` for conditional classes.
* Radix handles keyboard and accessibility behavior for supported primitives.
* Keep the application's visual language consistent with `ui-tokens.md`.

---

## Tailwind CSS v4

**Check first:** AGENTS.md for a Tailwind skill.

Tailwind v4 is used for application styling.

* Enabled through the Vite plugin: `@tailwindcss/vite`.
* `@import "tailwindcss";` is at the top of `src/index.css`.
* Design tokens are defined with `@theme` in `src/index.css`.
* There is no unnecessary Tailwind v3 configuration.
* Use project tokens instead of raw colors.
* Never use arbitrary hex colors when an existing design token should be used.
* Avoid inline styles.
* Keep spacing, typography, borders, radii, and colors consistent with `ui-tokens.md`.

---

## lucide-react

* Import icons individually:

```js
import { Plus, Check, X, Play, Clock } from "lucide-react";
```

* Size through Tailwind:

```jsx
<Clock className="size-4" />
```

* Icons should reinforce actions and information.
* Do not use icons as the only indication of important meaning.
* Use familiar icons for actions such as start, complete, edit, delete, add, pause, and settings.
* Avoid unnecessary decorative icons.

---

## date-fns

**Check first:** AGENTS.md for a date-fns skill.

Use `date-fns` for date and time formatting and calculations.

```js
import { format, isToday, addDays } from "date-fns";
```

**Rules:**

* Use it for schedule calculations, task dates, reviews, diary dates, focus sessions, finance dates, and relative time displays.
* Prefer it over hand-written date arithmetic.
* Keep stored dates/times consistent in SQLite.
* Format dates at the UI boundary.
* Be careful with local Windows timezone behavior.
* Do not silently change a user's scheduled time because of timezone assumptions.

---

## Recharts

**Check first:** AGENTS.md for a Recharts skill.

Recharts is used only for useful personal analytics.

### Allowed analytics

* Focus time
* Task completion
* Planned vs actual time
* Productive hours
* Learning activity
* Goal progress
* Spending/savings

**Rules:**

* Charts must answer a useful question.
* Do not add charts simply for decoration.
* Keep charts readable on desktop window sizes.
* Prefer simple charts over complex dashboards.
* Analytics must be based on actual stored data.
* Never invent or estimate personal statistics without clearly indicating that they are estimates.

---

## Tauri Notifications

**Check first:** AGENTS.md for the Tauri notification skill.

Windows desktop notification
