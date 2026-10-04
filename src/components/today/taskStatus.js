import { TASK_STATUS } from "@/lib/constants";

const LABELS = {
  [TASK_STATUS.NOT_STARTED]: "Not Started",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.COMPLETED]: "Completed",
  [TASK_STATUS.PAUSED]: "Paused",
  [TASK_STATUS.CANCELLED]: "Cancelled",
};

const BASE =
  "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const CLASSES = {
  [TASK_STATUS.NOT_STARTED]: `${BASE} bg-surface-secondary text-text-secondary`,
  [TASK_STATUS.IN_PROGRESS]: `${BASE} bg-accent-light text-accent`,
  [TASK_STATUS.COMPLETED]: `${BASE} bg-success-light text-success-foreground`,
  [TASK_STATUS.PAUSED]: `${BASE} bg-warning-light text-warning-foreground`,
  [TASK_STATUS.CANCELLED]: `${BASE} bg-surface-secondary text-text-muted`,
};

export function statusLabel(status) {
  return LABELS[status] ?? status;
}

export function statusBadgeClass(status) {
  return CLASSES[status] ?? CLASSES[TASK_STATUS.NOT_STARTED];
}
