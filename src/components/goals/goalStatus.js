import { GOAL_STATUS, MILESTONE_PERIOD, MILESTONE_STATUS } from "@/lib/constants";

const BASE =
  "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const GOAL_LABELS = {
  [GOAL_STATUS.PLANNED]: "Planned",
  [GOAL_STATUS.IN_PROGRESS]: "In Progress",
  [GOAL_STATUS.COMPLETED]: "Completed",
  [GOAL_STATUS.ARCHIVED]: "Archived",
};

const GOAL_CLASSES = {
  [GOAL_STATUS.PLANNED]: `${BASE} bg-surface-secondary text-text-secondary`,
  [GOAL_STATUS.IN_PROGRESS]: `${BASE} bg-accent-light text-accent`,
  [GOAL_STATUS.COMPLETED]: `${BASE} bg-success-light text-success-foreground`,
  [GOAL_STATUS.ARCHIVED]: `${BASE} bg-surface-secondary text-text-muted`,
};

export function goalStatusLabel(status) {
  return GOAL_LABELS[status] ?? status;
}

export function goalStatusBadgeClass(status) {
  return GOAL_CLASSES[status] ?? GOAL_CLASSES[GOAL_STATUS.PLANNED];
}

const MILESTONE_LABELS = {
  [MILESTONE_STATUS.PLANNED]: "Planned",
  [MILESTONE_STATUS.IN_PROGRESS]: "In Progress",
  [MILESTONE_STATUS.COMPLETED]: "Completed",
};

const MILESTONE_CLASSES = {
  [MILESTONE_STATUS.PLANNED]: `${BASE} bg-surface-secondary text-text-secondary`,
  [MILESTONE_STATUS.IN_PROGRESS]: `${BASE} bg-accent-light text-accent`,
  [MILESTONE_STATUS.COMPLETED]: `${BASE} bg-success-light text-success-foreground`,
};

export function milestoneStatusLabel(status) {
  return MILESTONE_LABELS[status] ?? status;
}

export function milestoneStatusBadgeClass(status) {
  return (
    MILESTONE_CLASSES[status] ?? MILESTONE_CLASSES[MILESTONE_STATUS.PLANNED]
  );
}

const PERIOD_LABELS = {
  [MILESTONE_PERIOD.YEAR]: "Year",
  [MILESTONE_PERIOD.MONTH]: "Month",
  [MILESTONE_PERIOD.WEEK]: "Week",
};

export function periodLabel(period) {
  return PERIOD_LABELS[period] ?? period;
}
