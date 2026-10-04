import { WATCH_STATUS } from "@/lib/constants";

const BASE =
  "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

const LABELS = {
  [WATCH_STATUS.PENDING]: "Pending",
  [WATCH_STATUS.WATCHED]: "Watched",
};

const CLASSES = {
  [WATCH_STATUS.PENDING]: `${BASE} bg-accent-light text-accent`,
  [WATCH_STATUS.WATCHED]: `${BASE} bg-success-light text-success-foreground`,
};

export function watchStatusLabel(status) {
  return LABELS[status] ?? status;
}

export function watchStatusBadgeClass(status) {
  return CLASSES[status] ?? CLASSES[WATCH_STATUS.PENDING];
}
