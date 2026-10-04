import { Circle, CircleCheck } from "lucide-react";
import { TASK_STATUS } from "@/lib/constants";

/**
 * The single control that completes a task or reopens it.
 * @param {{ task: object, onToggle: (task: object, nextStatus: string) => void,
 *   disabled?: boolean }} props
 */
export function TaskStatus({ task, onToggle, disabled = false }) {
  const isCompleted = task.status === TASK_STATUS.COMPLETED;
  const nextStatus = isCompleted
    ? TASK_STATUS.NOT_STARTED
    : TASK_STATUS.COMPLETED;

  return (
    <button
      type="button"
      aria-label={
        isCompleted
          ? `Mark ${task.title} not started`
          : `Mark ${task.title} complete`
      }
      onClick={() => onToggle(task, nextStatus)}
      disabled={disabled}
      className="shrink-0 text-text-muted transition-colors hover:text-accent disabled:opacity-50"
    >
      {isCompleted ? (
        <CircleCheck className="size-5 text-success" />
      ) : (
        <Circle className="size-5" />
      )}
    </button>
  );
}
