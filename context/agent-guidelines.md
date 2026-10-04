# AI Agent Guidelines

**This file tells you how to work on this project.** Read this before any implementation.

---

## 🎯 Project Identity

- **Product:** Personal Schedule Management
- **Type:** Windows-only desktop application
- **Tech:** Tauri 2 + React 19 + SQLite (local database)
- **Purpose:** Eliminate decision fatigue with a "What should I do now?" workflow
- **User:** Single personal user, no authentication, offline-first

---

## ⚡ Quick Rules

1. **This is NOT a web app** - Desktop-only, no web/mobile version in V1
2. **JavaScript only** - No TypeScript (`.js`/`.jsx` files)
3. **Local SQLite** - No cloud database, no backend, no authentication
4. **Offline-first** - Must work without internet
5. **No raw colors** - Use tokens from `ui-tokens.md`, never hardcoded hex or `bg-blue-500`

---

## 📚 Before You Code

**Read these 9 files IN ORDER:**

1. `context/project-overview.md` → What the app does and why
2. `context/architecture.md` → Tech stack, folder structure, data flow
3. `context/ui-tokens.md` → Design tokens (colors, typography, spacing)
4. `context/ui-rules.md` → UI patterns and conventions
5. `context/ui-registry.md` → Component registry
6. `context/code-standards.md` → Coding rules
7. `context/library-docs.md` → Library usage patterns
8. `context/build-plan.md` → Phased development plan
9. `context/progress-tracker.md` → Current status

---

## 🏗 Architecture

**Data Flow:** Page → Hooks → Services → SQLite/Tauri → Local Database

- **Pages** - Route-level composition, NEVER direct database access
- **Components** - Presentational UI, NEVER direct database access  
- **Hooks** - Wrap services, provide data to components
- **Services** - ALL SQLite reads/writes, business rules
- **Lib** - Database client, constants, utilities

---

## 🛠 Required Skills

Load Context7 skills for these libraries before using them:

```
tauri, react, typescript, sqlite, react-router
@tanstack/react-query, zustand
react-hook-form, zod
shadcn/ui, tailwindcss, lucide-react
date-fns, recharts
```

---

## 📁 File Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Router + providers
├── index.css            # Tailwind @theme tokens
├── lib/
│   └── constants.js      # Enums, status values
├── services/            # Database layer
├── hooks/               # Data hooks
├── components/         # UI components
│   └── layout/          # AppShell, Sidebar, Topbar
└── pages/              # Page components
```

---

## ⚠️ NEVER DO

- ❌ Create API routes, server endpoints, or backend services
- ❌ Add authentication, login, signup, or user accounts
- ❌ Use TypeScript or `.ts`/`.tsx` files
- ❌ Use hardcoded hex colors or raw Tailwind classes
- ❌ Access SQLite directly from components
- ❌ Import React in services
- ❌ Silently change user schedules
- ❌ Add mobile/web support in V1
- ❌ Store data in cloud databases

---

## ✅ ALWAYS DO

- ✅ Load library skill first (Context7 find-docs)
- ✅ Read context files in order
- ✅ Use `@/` import aliases
- ✅ Update `progress-tracker.md` after each feature
- ✅ Update `ui-registry.md` after new components
- ✅ Keep business logic in services
- ✅ Use TanStack Query for data fetching
- ✅ Use shadcn/ui primitives
- ✅ Follow `ui-tokens.md` for styling

---

## 🎯 Core Workflow

The app answers **"What should I do now?"** by:

1. User plans tomorrow → schedule + tasks stored
2. Today opens → system shows next actionable task
3. User starts → focus session tracks time
4. User completes → next task becomes available
5. End of day → daily review + tomorrow's plan

---

## 📌 Remember

- **Today screen is primary** - Focus on this experience first
- **User is in control** - Warn but never auto-change schedules
- **Offline-first** - All data local, no internet required
- **Simple over clever** - Junior developer should understand your code
- **One feature at a time** - Finish fully before starting next

---

> **You are a senior engineer. Think before implementing.**