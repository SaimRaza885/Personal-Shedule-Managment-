// Core application constants
// Status values, enums, and defaults used throughout the application

// Task status
export const TASK_STATUS = Object.freeze({
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  PAUSED: "paused",
  CANCELLED: "cancelled",
});

// Task priority
export const TASK_PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

// Energy levels for Low-Energy Mode
export const ENERGY_LEVEL = Object.freeze({
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
});

// Goal status
export const GOAL_STATUS = Object.freeze({
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ARCHIVED: "archived",
});

// Project status
export const PROJECT_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
  ARCHIVED: "archived",
});

// Milestone period types
export const MILESTONE_PERIOD = Object.freeze({
  YEAR: "year",
  MONTH: "month",
  WEEK: "week",
});

// Milestone status
export const MILESTONE_STATUS = Object.freeze({
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
});

// Focus session status
export const FOCUS_STATUS = Object.freeze({
  STARTED: "started",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

// Finance transaction types
export const TRANSACTION_TYPE = Object.freeze({
  INCOME: "income",
  EXPENSE: "expense",
});

// Tech concept status
export const CONCEPT_STATUS = Object.freeze({
  NOT_STARTED: "not_started",
  LEARNING: "learning",
  LEARNED: "learned",
  REVIEW: "review",
});

// Watch Later item status
export const WATCH_STATUS = Object.freeze({
  PENDING: "pending",
  WATCHED: "watched",
});

// Idea status
export const IDEA_STATUS = Object.freeze({
  NEW: "new",
  EXPLORING: "exploring",
  PARKED: "parked",
  DONE: "done",
});

// Types a quick capture can be organized into
export const CONVERTED_TYPE = Object.freeze({
  TASK: "task",
  IDEA: "idea",
});

// Keys for the local settings store
export const SETTING_KEYS = Object.freeze({
  AVAILABLE_MINUTES: "available_minutes",
  NOTIFICATIONS_ENABLED: "notifications_enabled",
  NOTIFICATION_LEAD_MINUTES: "notification_lead_minutes",
  EVENING_REVIEW_TIME: "evening_review_time",
});

// Default values
export const DEFAULT_VALUES = Object.freeze({
  PLANNED_MINUTES: 30,
  DAILY_TOP_THREE_MAX: 3,
  LIGHTER_OPTIONS_MAX: 3,
  AVAILABLE_MINUTES: 480,
  NOTIFICATION_LEAD_MINUTES: 10,
  EVENING_REVIEW_TIME: "21:00",
});

// Date formats
export const DATE_FORMATS = Object.freeze({
  DISPLAY: "MMMM d, yyyy",
  DAY: "MMM d, yyyy",
  SHORT: "MMM d",
  ISO: "yyyy-MM-dd",
  TIME: "h:mm a",
});
