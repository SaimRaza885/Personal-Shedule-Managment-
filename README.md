# Personal Schedule Management

**Your personal productivity workspace.** Eliminate decision fatigue by organizing goals, projects, tasks, and focus sessions in one local, offline-first Windows desktop application.

---

## ✨ What It Does

**Answers: What should I do now?**

- **Plan** → Goals → Milestones → Projects → Tasks → Actionable steps
- **Schedule** → Fixed-time blocks you control (never auto-rescheduled)
- **Execute** → Focus sessions track actual vs planned time
- **Review** → Daily/weekly reviews compare planned vs actual
- **Improve** → Learn from analytics, adjust future planning

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop | Tauri 2 (Rust-based) |
| UI | React 19, Tailwind CSS v4 |
| Database | SQLite (local, offline) |
| State | Zustand, TanStack Query |
| Forms | react-hook-form + zod |
| Components | shadcn/ui (JS mode) |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
npm install -g @tauri-apps/cli

# Run development server
npm run tauri dev
```

---

## 📁 Project Structure

```
src/
├── main.jsx           # App entry
├── App.jsx            # Router + providers
├── routes/            # Route definitions
├── services/          # Database layer
├── hooks/             # Data hooks
├── components/        # UI components
└── pages/             # Page components
```

---

## 🎯 Core Principles

- **Windows-only desktop app** — No web/mobile
- **Local-first** — All data in SQLite, no cloud
- **No authentication** — Single user, no login
- **Offline-first** — Works without internet
- **User in control** — Never silently changes schedules

---

## 📚 Context Files

Read in order before implementation:

1. `context/project-overview.md`
2. `context/architecture.md`
3. `context/ui-tokens.md`
4. `context/ui-rules.md`
5. `context/ui-registry.md`
6. `context/code-standards.md`
7. `context/library-docs.md`
8. `context/build-plan.md`
9. `context/progress-tracker.md`

---

## 🎓 Required Skills

Install these Context7 skills for AI agent support:

```
tauri
react
typescript
sqlite
react-router
@tanstack/react-query
zustand
react-hook-form
zod
shadcn/ui
tailwindcss
lucide-react
date-fns
recharts
```

---

## 📄 License

*[To be specified]*

---

> Built with Tauri + React + SQLite