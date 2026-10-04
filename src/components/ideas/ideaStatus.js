import { IDEA_STATUS } from "@/lib/constants";

const BASE =
  "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const LABELS = {
  [IDEA_STATUS.NEW]: "New",
  [IDEA_STATUS.EXPLORING]: "Exploring",
  [IDEA_STATUS.PARKED]: "Parked",
  [IDEA_STATUS.DONE]: "Done",
};

const CLASSES = {
  [IDEA_STATUS.NEW]: `${BASE} bg-accent-light text-accent`,
  [IDEA_STATUS.EXPLORING]: `${BASE} bg-warning-light text-warning-foreground`,
  [IDEA_STATUS.PARKED]: `${BASE} bg-surface-secondary text-text-secondary`,
  [IDEA_STATUS.DONE]: `${BASE} bg-success-light text-success-foreground`,
};

export function ideaStatusLabel(status) {
  return LABELS[status] ?? status;
}

export function ideaStatusBadgeClass(status) {
  return CLASSES[status] ?? CLASSES[IDEA_STATUS.NEW];
}
