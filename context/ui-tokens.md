# UI Tokens

Design tokens for the Personal Productivity & Life Management application. All colors, typography, spacing, and component values should be defined here and reused throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `src/index.css`. No `tailwind.config.ts` is needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:

* `--color-accent` → `bg-accent`, `text-accent`, `border-accent`
* `--color-surface` → `bg-surface`, `text-surface`, `border-surface`

```jsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Also correct — references CSS variable directly
style={{ color: "var(--color-text-primary)" }}

// Never — hardcoded hex values
className="bg-[#F7F9FC] text-[#111827]"

// Never — raw Tailwind color classes
className="bg-blue-500 text-gray-600"
```

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* Page and surface backgrounds */
  --color-background: #f7f9fc;
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f3f4f6;
  --color-surface-muted: #f5f7fa;

  /* Borders */
  --color-border: #e5e7eb;
  --color-border-light: #eef0f2;
  --color-border-muted: #d1d5db;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-dark: #374151;
  --color-text-darker: #1f2937;
  --color-text-darkest: #111827;

  /* Primary accent — blue */
  --color-accent: #1c74bd;
  --color-accent-dark: #155c98;
  --color-accent-light: #dbeafe;
  --color-accent-muted: #eff6ff;
  --color-accent-foreground: #ffffff;

  /* Success — green */
  --color-success: #10b981;
  --color-success-dark: #047857;
  --color-success-light: #d1fae5;
  --color-success-lightest: #ecfdf5;
  --color-success-foreground: #047857;

  /* Info — blue */
  --color-info: #3b82f6;
  --color-info-dark: #1d4ed8;
  --color-info-light: #dbeafe;
  --color-info-lightest: #eff6ff;
  --color-info-foreground: #1d4ed8;

  /* Warning — amber */
  --color-warning: #f59e0b;
  --color-warning-dark: #b45309;
  --color-warning-light: #fef3c7;
  --color-warning-lightest: #fffbeb;
  --color-warning-foreground: #92400e;

  /* Error — red */
  --color-error: #ef4444;
  --color-error-dark: #b91c1c;
  --color-error-light: #fee2e2;
  --color-error-lightest: #fef2f2;
  --color-error-foreground: #b91c1c;

  /* Focus / productivity */
  --color-focus: #1c74bd;
  --color-focus-light: #dbeafe;
  --color-focus-foreground: #155c98;

  /* Dark overlays */
  --color-overlay: #111827;
  --color-overlay-dark: #030712;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

Tailwind v4 generates utility classes automatically from every `--color-*` token above:

* `bg-accent`, `text-accent`, `border-accent`
* `bg-surface`, `text-surface-secondary`
* `bg-success-light`, `text-text-muted`
* `bg-warning-light`, `text-warning-dark`
* etc.

---

## Color Usage Guide

### Page Layout

| Element           | Token                  |
| ----------------- | ---------------------- |
| Page background   | `bg-background`        |
| Card / surface    | `bg-surface`           |
| Secondary surface | `bg-surface-secondary` |
| Default border    | `border-border`        |
| Light border      | `border-border-light`  |

### Typography

| Element                 | Token                 |
| ----------------------- | --------------------- |
| Headings, primary text  | `text-text-primary`   |
| Secondary text, labels  | `text-text-secondary` |
| Placeholder, muted text | `text-text-muted`     |
| Dark labels             | `text-text-dark`      |

### Accent

Used for:

* Primary buttons
* Active navigation items
* Focus actions
* Selected states
* Important task indicators
* Goal progress
* Primary links

| Element                | Token                    |
| ---------------------- | ------------------------ |
| Button background      | `bg-accent`              |
| Button text            | `text-accent-foreground` |
| Light badge background | `bg-accent-light`        |
| Subtle background      | `bg-accent-muted`        |

### Success Colors

Used for:

* Completed tasks
* Completed goals
* Positive review metrics
* Successful finance entries where appropriate
* Completed focus sessions

| Element           | Token                     |
| ----------------- | ------------------------- |
| Main success      | `text-success`            |
| Light background  | `bg-success-light`        |
| Subtle background | `bg-success-lightest`     |
| Dark success text | `text-success-foreground` |

### Info Colors

Used for:

* Scheduled items
* Informational states
* Learning-related indicators
* Neutral progress information

| Element | Token |
| ------- | ----- |
|         |       |
