import { ListTodo } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { statusBadgeClass, statusLabel } from "@/components/today/taskStatus";
import { TASK_STATUS } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/datetime";

function scheduleLabel(task) {
  if (task.scheduledDate && task.startTime && task.endTime) {
    return `${formatDate(task.scheduledDate)} · ${formatTime(task.startTime)} — ${formatTime(task.endTime)}`;
  }
  return "Not scheduled";
}

/**
 * Read-only list of the tasks linked to a project. Task management arrives
 * with the Tasks feature; this card only presents what the project owns.
 * @param {{ items: object[] }} props
 */
export function ProjectTasks({ items }) {
  const total = items.length;
  const completed = items.filter(
    (task) => task.status === TASK_STATUS.COMPLETED,
  ).length;

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-text-primary">Tasks</h2>
        {total > 0 && (
          <span className="text-xs text-text-muted">
            {completed} of {total} complete
          </span>
        )}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks in this project yet"
          description="Tasks you link to this project will show up here."
        />
      ) : (
        <ul className="divide-y divide-border-light">
          {items.map((task) => (
            <li key={task.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {task.title}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {scheduleLabel(task)} · {task.plannedMinutes} min planned
                </p>
              </div>
              <span className={statusBadgeClass(task.status)}>
                {statusLabel(task.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
