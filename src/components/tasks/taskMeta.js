import { ENERGY_LEVEL, TASK_PRIORITY } from "@/lib/constants";

const PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: "Low",
  [TASK_PRIORITY.MEDIUM]: "Medium",
  [TASK_PRIORITY.HIGH]: "High",
};

const ENERGY_LABELS = {
  [ENERGY_LEVEL.HIGH]: "High energy",
  [ENERGY_LEVEL.MEDIUM]: "Medium energy",
  [ENERGY_LEVEL.LOW]: "Low energy",
};

export function priorityLabel(priority) {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function energyLabel(energyLevel) {
  return ENERGY_LABELS[energyLevel] ?? energyLevel;
}
