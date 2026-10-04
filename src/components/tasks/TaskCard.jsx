import { useState } from "react";
import { Link } from "react-router-dom";
import { ListChecks, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { statusBadgeClass, statusLabel } from "@/components/today/taskStatus";
import { TASK_STATUS } from "@/lib/constants";
import { TaskStatus } from "./TaskStatus";
import { TaskSteps } from "./TaskSteps";
import { energyLabel, priorityLabel } from "./taskMeta";

/**
 * @param {{ task: object, expanded: boolean, onToggleExpand: () => void,
 *   onEdit: (task: object) => void, onRemove: (task: object) => void,
 *   onToggleComplete: (task: object, nextStatus: string) => void,
 *   statusPending?: boolean, steps?: object[], stepsLoading?: boolean,
 *   stepsPending?: boolean, onAddStep: (title: string) => Promise<boolean>,
 *   onToggleStep: (step: object) => void,
 *   onRemoveStep: (step: object) => void }} props
 */
export function TaskCard({
  task,
  expanded,
  onToggleExpand,
  onEdit,
  onRemove,
  onToggleComplete,
  statusPending = false,
  steps,
  stepsLoading = false,
  stepsPending = false,
  onAddStep,
  onToggleStep,
  onRemoveStep,
}) {
  const [confirming, setConfirming] = useState(false);
  const isCompleted = task.status === TASK_STATUS.COMPLETED;
  const meta = [
    `${priorityLabel(task.priority)} priority`,
    `${task.plannedMinutes} min planned`,
  ];
  if (task.energyLevel) meta.push(energyLabel(task.energyLevel));

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <TaskStatus
            task={task}
            onToggle={onToggleComplete}
            disabled={statusPending}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={
              isCompleted
                ? "text-sm font-medium text-text-muted line-through"
                : "text-sm font-medium text-text-primary"
            }
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {task.projectName && (
              <Link
                to={`/projects/${task.projectId}`}
                className="max-w-40 truncate rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {task.projectName}
              </Link>
            )}
            {task.goalTitle && (
              <Link
                to={`/goals/${task.goalId}`}
                className="max-w-40 truncate rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {task.goalTitle}
              </Link>
            )}
            <span className="text-xs text-text-muted">{meta.join(" · ")}</span>
          </div>
        </div>
        <span className={statusBadgeClass(task.status)}>
          {statusLabel(task.status)}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-border-light pt-3">
          <TaskSteps
            steps={steps}
            isLoading={stepsLoading}
            disabled={stepsPending}
            onAdd={onAddStep}
            onToggle={onToggleStep}
            onRemove={onRemoveStep}
          />
        </div>
      )}

      <div className="mt-auto pt-1">
        {confirming ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-text-muted">
              Remove task? Its steps and schedule will be removed.
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="xs"
              onClick={() => {
                setConfirming(false);
                onRemove(task);
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Edit ${task.title}`}
                onClick={() => onEdit(task)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${task.title}`}
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              aria-expanded={expanded}
              onClick={onToggleExpand}
            >
              <ListChecks className="size-4" />
              {task.stepsTotal > 0
                ? `${task.stepsCompleted} of ${task.stepsTotal} steps`
                : "Add steps"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
