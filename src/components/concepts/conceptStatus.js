import { CONCEPT_STATUS } from "@/lib/constants";

const BASE = "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const LABELS = {
  [CONCEPT_STATUS.NOT_STARTED]: "Not started",
  [CONCEPT_STATUS.LEARNING]: "Learning",
  [CONCEPT_STATUS.LEARNED]: "Learned",
  [CONCEPT_STATUS.REVIEW]: "Review",
};

const CLASSES = {
  [CONCEPT_STATUS.NOT_STARTED]: `${BASE} bg-surface-secondary text-text-secondary`,
  [CONCEPT_STATUS.LEARNING]: `${BASE} bg-accent-light text-accent`,
  [CONCEPT_STATUS.LEARNED]: `${BASE} bg-success-light text-success-foreground`,
  [CONCEPT_STATUS.REVIEW]: `${BASE} bg-warning-light text-warning-foreground`,
};

export function conceptStatusLabel(status) {
  return LABELS[status] ?? status;
}

export function conceptStatusBadgeClass(status) {
  return CLASSES[status] ?? CLASSES[CONCEPT_STATUS.NOT_STARTED];
}
