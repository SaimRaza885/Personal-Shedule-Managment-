import { FOCUS_STATUS } from "@/lib/constants";

const LABELS = {
  [FOCUS_STATUS.STARTED]: "Running",
  [FOCUS_STATUS.PAUSED]: "Paused",
  [FOCUS_STATUS.COMPLETED]: "Completed",
  [FOCUS_STATUS.CANCELLED]: "Cancelled",
};

const BASE =
  "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const CLASSES = {
  [FOCUS_STATUS.STARTED]: `${BASE} bg-accent-light text-accent`,
  [FOCUS_STATUS.PAUSED]: `${BASE} bg-warning-light text-warning-foreground`,
  [FOCUS_STATUS.COMPLETED]: `${BASE} bg-success-light text-success-foreground`,
  [FOCUS_STATUS.CANCELLED]: `${BASE} bg-surface-secondary text-text-muted`,
};

export function focusStatusLabel(status) {
  return LABELS[status] ?? status;
}

export function focusBadgeClass(status) {
  return CLASSES[status] ?? CLASSES[FOCUS_STATUS.STARTED];
}
