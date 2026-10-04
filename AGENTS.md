<!-- BEGIN:desktop-agent-rules -->

# This is NOT a web app

This project is a Windows-only desktop application built with Tauri, React, TypeScript, and SQLite. Read the relevant documentation in the project before writing any code. Heed project-specific conventions and existing architecture.

<!-- END:desktop-agent-rules -->

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Workflow Rules

* **One feature at a time** — Complete one feature fully, commit, push to GitHub, then start next
* **Small commits** — Build something small, commit with clear message, push to GitHub
* **Feature completion** — A feature is done when: UI works with mock data → logic wired to database → tests pass → progress-tracker.md updated
* **Push after each feature** — Do not batch multiple features in one push
* **Update progress** — After each feature: update `progress-tracker.md` and `ui-registry.md`

## Rules That Never Change

* Never use hardcoded hex values or raw Tailwind color classes
* Update `progress-tracker.md` and `ui-registry.md` after every feature
* Before any third party library — load its installed skill first,
  then read `context/library-docs.md` for project-specific rules
* If the same problem persists after one corrective prompt —
  stop immediately and run /recover

## Available Skills

* `/architect` — before any complex feature. Think before building.
* `/imprint` — after any new UI component. Capture patterns.
* `/review` — before demo or when something feels off.
* `/recover` — when something breaks after one failed correction.
* `/remember save` — when a feature spans multiple sessions.
* `/remember restore` — when returning after a multi-session feature.