import { useState } from "react";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/datetime";
import { TASK_STATUS } from "@/lib/constants";
import { statusBadgeClass, statusLabel } from "./taskStatus";

/**
 * @param {{ items: Array<object>, onAdd: () => void,
 *   onEdit: (item: object) => void, onRemove: (item: object) => void }} props
 */
export function ScheduleCard({ items, onAdd, onEdit, onRemove }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const plannedMinutes = items.reduce(
    (sum, item) => sum + (item.plannedMinutes ?? 0),
    0,
  );

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-text-primary">
          Today's Schedule
        </h3>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <span className="text-xs text-text-muted">
              {plannedMinutes} min planned
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="size-4" />
            Add task
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No tasks scheduled"
          description="Plan your day by adding tasks to fixed time blocks."
          action={
            <Button variant="outline" size="sm" onClick={onAdd}>
              <Plus className="size-4" />
              Add task
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border-light">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <div className="w-28 shrink-0 text-sm text-text-secondary">
                {formatTime(item.startTime)} — {formatTime(item.endTime)}
              </div>
              <p
                className={
                  item.status === TASK_STATUS.COMPLETED
                    ? "min-w-0 flex-1 truncate text-sm font-medium text-text-muted line-through"
                    : "min-w-0 flex-1 truncate text-sm font-medium text-text-primary"
                }
              >
                {item.title}
              </p>
              <span className={statusBadgeClass(item.status)}>
                {statusLabel(item.status)}
              </span>
              {confirmingId === item.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">
                    Remove this block?
                  </span>
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
                      onRemove(item);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => setConfirmingId(item.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
