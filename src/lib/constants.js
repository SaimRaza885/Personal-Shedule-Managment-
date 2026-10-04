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

// Default values
export const DEFAULT_VALUES = Object.freeze({
  PLANNED_MINUTES: 30,
  DAILY_TOP_THREE_MAX: 3,
});

// Date formats
export const DATE_FORMATS = Object.freeze({
  DISPLAY: "MMMM d, yyyy",
  DAY: "MMM d, yyyy",
  SHORT: "MMM d",
  ISO: "yyyy-MM-dd",
  TIME: "h:mm a",
});
