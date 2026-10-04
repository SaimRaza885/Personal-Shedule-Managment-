# UI Rules

Concise rules for building the Personal Productivity & Life Management UI. Design assets are available — use them as the source of truth for visual decisions. These rules cover the most important patterns and constraints to keep the UI consistent without over-specifying every detail.

---

## Font

Always use Inter as the primary application font.

The project uses `@fontsource-variable/inter` rather than framework-specific font loading.

```javascript
import "@fontsource-variable/inter";
```

The font is configured through the project's design tokens. Never use system fonts as the primary font.

---

## Layout

* Main application content uses a centered desktop layout
* Main content area padding: 24px on all sides
* Gap between page sections: 24px
* Header height: 64px
* Left sidebar is used for primary application navigation
* Sidebar and main content should remain visually balanced on desktop screens
* Avoid unnecessary full-width content when a narrower content area improves readability

---

## Sidebar

Primary navigation is grouped by application purpose:

* Today

* Planning

* Work

* Focus

* Learning

* Reflection

* Finance

* Analytics

* Settings

* Active item uses the project accent color and a clear background/state

* Inactive items use the secondary text color

* Navigation labels should remain short and clear

* Icons use `lucide-react`

* Sidebar should remain consistent across application pages

* Do not create a different navigation pattern for individual pages unless required

---

## Cards

Every major content section lives in a card.

```text
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 12px
padding: 20px
box-shadow: 0px 1px 2px rgba(0,0,0,0.05)
```

Never use colored card backgrounds for normal content. Color goes inside cards through badges, indicators, progress elements, and text rather than covering the entire card surface.

---

## Typography Hierarchy

Three levels are used consistently throughout:

**Section headings** — card titles, page section titles

```text
font-size: 16px
font-weight: 600
color: #111827
line-height: 24px
```

**Body / primary content text**

```text
font-size: 14px
font-weight: 500
color: #111827
line-height: 20px
```

**Secondary / muted text** — labels, timestamps, subtitles

```text
font-size: 12px
font-weight: 400
color: #6B7280
line-height: 16px
```

Important dashboard numbers may use larger typography, but should remain visually restrained and consistent.

---

## Badges

All status badges use `border-radius: 9999px` unless specified otherwise.

```text
padding: 2px 8px
font-size: 12px
font-weight: 500
```

Use badges for states such as:

* Not Started
* In Progress
* Completed
* Paused
* Low Energy
* Scheduled
* Pending

Badges should communicate status without becoming visually dominant.

---

## Buttons

**Primary button:**

```text
background: project accent color
color: #FFFFFF
border-radius: 8px
padding: 8px 16px
font-size: 14px
font-weight: 500
```

**Secondary button:**

```text
background: #FFFFFF
border: 1px solid #E5E7EB
color: #111827
border-radius: 8px
padding: 8px 16px
```

Use primary buttons for the main action of a section and secondary buttons for supporting actions.

---

## Form Inputs

```text
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 8px
padding: 8px 12px
font-size: 14px
color: #111827
placeholder color: #6B7280
focus: ring-1 ring-accent border-accent
```

Forms should remain simple and focused. Do not show unnecessary fields or information that is not required for the current action.

---

## Task & Schedule Lists

* No alternating row colors — use a clean white surface
* Items are separated by subtle borders or spacing
* Task title: 14px, font-weight 500, primary text color
* Supporting information: 12px, muted text color
* Scheduled times should be visually easy to scan
* Completed tasks should have a clear but subtle completed state
* Hover states should provide feedback without changing the overall layout

---

## Focus & Progress Indicators

Progress indicators are used for meaningful information such as:

* Goal progress
* Task completion
* Focus time
* Planned vs actual time
* Learning progress

Progress tracks should remain subtle and compact.

```text
height: 4px
border-radius: 9999px
background track: project border/muted token
```

Do not use decorative progress bars that do not communicate useful information.

---

## Empty States

Every section that can be empty must have an empty state. Keep it minimal:

* Short descriptive text using the muted text color
* Optional icon above text
* CTA button if there is a logical next action

Examples include:

* No goals yet
* No tasks scheduled
* No ideas captured
* No diary entries
* No finance records
* No saved videos
* No focus sessions

Empty states should help the user understand what to do next rather than simply saying that the section is empty.

---

## Today / What Should I Do Now?

The Today page is the most important screen in the application.

The **What Should I Do Now?** section should be visually prominent without overwhelming the rest of the page.

It should clearly show:

* Current task
* Scheduled time
* Remaining task steps when available
* Planned duration
* Start action
* Relevant task status

The user should understand what they should work on next within a few seconds of opening the application.

---

## Tailwind v4 Note

This project uses Tailwind v4. Tokens are defined with `@theme` in `globals.css` — no `tailwind.config.ts` is used. Never define project colors in a Tailwind config file. Always use the project's existing design tokens.

---

## Do Nots

* Never use Tailwind's built-in color classes (`bg-purple-500`, `text-gray-600`) — use project tokens only
* Never define colors in a Tailwind config file — use `@theme` in `globals.css`
* Never add gradients to normal card backgrounds
* Never use more than one font weight in a single UI element
* Never show raw error messages to users — always show human-readable text
* Never stack more than 2 levels of border radius inside each other
* Never use `position: fixed` for UI elements — use normal flow layout
* Never create a new visual pattern when an existing component already solves the same problem
* Never add decorative charts or statistics that do not provide useful personal information
* Never silently change or reschedule the user's planned tasks through the UI
* Never make the interface feel like a generic AI dashboard; prioritize a clean, focused productivity workspace
