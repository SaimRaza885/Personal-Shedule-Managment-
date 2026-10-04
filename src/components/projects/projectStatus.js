import { PROJECT_STATUS } from "@/lib/constants";

const BASE =
  "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const LABELS = {
  [PROJECT_STATUS.ACTIVE]: "Active",
  [PROJECT_STATUS.COMPLETED]: "Completed",
  [PROJECT_STATUS.PAUSED]: "Paused",
  [PROJECT_STATUS.ARCHIVED]: "Archived",
};

const CLASSES = {
  [PROJECT_STATUS.ACTIVE]: `${BASE} bg-accent-light text-accent`,
  [PROJECT_STATUS.COMPLETED]: `${BASE} bg-success-light text-success-foreground`,
  [PROJECT_STATUS.PAUSED]: `${BASE} bg-warning-light text-warning-foreground`,
  [PROJECT_STATUS.ARCHIVED]: `${BASE} bg-surface-secondary text-text-muted`,
};

export function projectStatusLabel(status) {
  return LABELS[status] ?? status;
}

export function projectStatusBadgeClass(status) {
  return CLASSES[status] ?? CLASSES[PROJECT_STATUS.ACTIVE];
}
