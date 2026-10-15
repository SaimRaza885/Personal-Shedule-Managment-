import { useMemo, useState } from "react";
import { ListTodo, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { statusBadgeClass, statusLabel } from "@/components/today/taskStatus";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/datetime";

function scheduleLabel(task) {
  if (task.scheduledDate && task.startTime && task.endTime) {
    return `${formatDate(task.scheduledDate)} · ${formatTime(task.startTime)} — ${formatTime(task.endTime)}`;
  }
  return "Not scheduled";
}

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const SORT_OPTIONS = [
  { value: "created_asc", label: "Oldest first" },
  { value: "created_desc", label: "Newest first" },
  { value: "status", label: "Status" },
];

const STATUS_ORDER = [
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.NOT_STARTED,
  TASK_STATUS.PAUSED,
  TASK_STATUS.COMPLETED,
  TASK_STATUS.CANCELLED,
];

/**
 * @param {{ items: object[], onAdd: () => void, onEdit: (task: object) => void,
 *   onDelete: (task: object) => void, onToggleComplete: (task: object) => void,
 *   isPending?: boolean }} props
 */
export function ProjectTasks({
  items,
  onAdd,
  onEdit,
  onDelete,
  onToggleComplete,
  isPending = false,
}) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("created_asc");
  const [confirmingId, setConfirmingId] = useState(null);

  const total = items.length;
  const completed = items.filter(
    (task) => task.status === TASK_STATUS.COMPLETED,
  ).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const displayTasks = useMemo(() => {
    let list = [...items];

    if (filter === "active") {
      list = list.filter(
        (task) =>
          task.status !== TASK_STATUS.COMPLETED &&
          task.status !== TASK_STATUS.CANCELLED,
      );
    } else if (filter === "completed") {
      list = list.filter((task) => task.status === TASK_STATUS.COMPLETED);
    }

    list.sort((a, b) => {
      if (sort === "created_asc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sort === "created_desc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sort === "status") {
        const rankA = STATUS_ORDER.indexOf(a.status);
        const rankB = STATUS_ORDER.indexOf(b.status);
        if (rankA !== rankB) return rankA - rankB;
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

    return list;
  }, [items, filter, sort]);

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">Tasks</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-border bg-surface p-0.5">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === option.value
                    ? "bg-surface-tertiary text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-7 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="size-4" />
            Add task
          </Button>
        </div>
      </div>

      {total > 0 && (
        <div className="mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {completed} of {total} complete
            </span>
            <span className="text-text-secondary">{percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-border-light">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {total === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks in this project yet"
          description="Tasks you link to this project will show up here."
          action={
            <Button variant="outline" size="sm" onClick={onAdd}>
              <Plus className="size-4" />
              Add task
            </Button>
          }
        />
      ) : displayTasks.length === 0 ? (
        <div className="py-8 text-center text-sm text-text-muted">
          No tasks match this filter.
        </div>
      ) : (
        <ul className="divide-y divide-border-light">
          {displayTasks.map((task) => {
            const isCompleted = task.status === TASK_STATUS.COMPLETED;
            const isConfirming = confirmingId === task.id;

            return (
              <li key={task.id} className="flex items-center gap-3 py-3">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => onToggleComplete(task)}
                  disabled={isPending}
                  aria-label={
                    isCompleted ? "Mark as not completed" : "Mark as completed"
                  }
                  className="size-4 shrink-0 cursor-pointer rounded border-border bg-surface accent-accent disabled:cursor-not-allowed"
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      isCompleted
                        ? "text-text-muted line-through"
                        : "text-text-primary",
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {scheduleLabel(task)} · {task.plannedMinutes} min planned
                  </p>
                </div>

                <span className={statusBadgeClass(task.status)}>
                  {statusLabel(task.status)}
                </span>

                {isConfirming ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => {
                        setConfirmingId(null);
                        onDelete(task);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
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
                      aria-label={`Delete ${task.title}`}
                      onClick={() => setConfirmingId(task.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
