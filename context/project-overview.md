# Project Overview

## About the Project

This is a Windows-only **Personal Productivity & Life Management desktop application** for a single user. It is designed around one core purpose: helping the user reduce decision fatigue, organize responsibilities, and know what to work on next.

The application has one main experience:

1. **A personal productivity workspace** — goals, milestones, projects, tasks, fixed-time schedules, daily priorities, focus sessions, learning, ideas, diary, finance, reviews, analytics, and personal planning are managed in one local application.
2. **A "What Should I Do Now?" workflow** — the main screen shows the user's current schedule, available time, remaining work, and next actionable task so they do not have to repeatedly decide what to do next.

The defining feature is the **daily planning and execution pipeline**: the user creates goals, breaks them into milestones, projects, tasks, and actionable steps, schedules work into fixed time blocks, executes tasks through focus sessions, records actual work and distractions, and reviews the day to improve future planning.

The application is **local-first and offline**. Persistent data is stored locally in SQLite, with no account, cloud database, remote backend, or required internet connection.

---

## The Problem It Solves

People often have tasks, goals, learning plans, ideas, notes, and personal responsibilities scattered across different apps, notebooks, browser tabs, and messaging applications. The result is decision fatigue: even when there is work to do, the user spends time deciding what to do next.

This application replaces that scattered workflow with one source of truth:

* Goals are broken into milestones, projects, tasks, and actionable steps.
* Daily schedules use fixed time blocks so the user knows when work should happen.
* The main screen answers **"What should I do now?"** using the current schedule and remaining work.
* Focus sessions record actual time spent instead of relying only on estimates.
* Overload protection warns when planned work exceeds available time without silently changing the user's plan.
* Low-Energy Mode surfaces lighter already-planned tasks when the user has low energy.
* Reviews compare planned work with actual results and help improve future planning.
* Learning notes, technical concepts, ideas, diary entries, saved videos, and finances remain organized without requiring multiple applications.

---

## Roles

There is exactly **one role**. The application is designed for one personal user and has no account system.

| Role     | Logs in? | What they do                                                                                                                                                           |
| -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User** | No       | Creates goals, schedules work, manages tasks, tracks focus, records learning and ideas, reviews progress, manages personal finance, and controls application settings. |

> **Core rule:** This is a personal local application. There are no admin, teacher, student, parent, or shared-user roles. Data belongs to the local user and is stored on their Windows device.

---

## Pages

### Main application

```text
/                       → Today / What Should I Do Now?
/goals                  → Goals & milestones
/projects               → Projects & work
/tasks                  → Tasks & task steps
/focus                  → Focus sessions & focus history
/learning               → What I Learned
/concepts               → Tech Concepts I Must Know
/watch-later            → Watch Later
/ideas                  → Ideas Vault
/quick-capture          → Quick Capture
/diary                  → Digital Diary
/finance                → Finance Tracker
/reviews                → Daily & weekly reviews
/analytics              → Personal Analytics
/settings               → Application settings, notifications, working hours, backup & restore
```

---

## Navigation

* **Main application:** a collapsible **left sidebar** grouped around Today, Planning, Work, Focus, Learning, Reflection, Finance, Analytics, and Settings.
* **Topbar:** current date, useful quick actions, notifications, and application controls.
* **Today page:** the primary screen and first destination. It immediately shows the current schedule, next actionable task, Daily Top 3, and relevant daily information.
* **Desktop layout:** designed specifically for Windows desktop use rather than mobile-first navigation.

---

## Core Workflow (end to end)

This is the spine of the product. Everything else supports it.

1. **Set goals**
