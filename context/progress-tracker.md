# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next. Feature numbers match build-plan.md.

---

## Current Status

**Phase:** Phase 0 — Foundation & Setup
**Last completed:** 02 SQLite Database Foundation
**Next:** 03 Tauri Desktop Foundation

---

## Progress

### Phase 0 — Foundation & Setup

* [x] 01 Project Scaffold & Design Tokens
* [x] 02 SQLite Database Foundation
* [ ] 03 Tauri Desktop Foundation

### Phase 1 — Today & Daily Execution

* [ ] 04 Today Shell & What Should I Do Now?
* [ ] 05 Daily Schedule
* [ ] 06 Daily Top 3

### Phase 2 — Goals & Work

* [ ] 07 Goals & Milestones
* [ ] 08 Projects & Work
* [ ] 09 Tasks & Task Steps

### Phase 3 — Focus & Execution

* [ ] 10 Focus Sessions
* [ ] 11 Distraction Log
* [ ] 12 Low-Energy Mode
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
