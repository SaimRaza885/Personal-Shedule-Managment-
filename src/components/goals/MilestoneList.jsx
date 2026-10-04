import { useState } from "react";
import { Flag, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/datetime";
import { MILESTONE_STATUS } from "@/lib/constants";
import {
  milestoneStatusBadgeClass,
  milestoneStatusLabel,
  periodLabel,
} from "./goalStatus";

/**
 * @param {{ items: Array<object>, onAdd: () => void,
 *   onEdit: (item: object) => void, onRemove: (item: object) => void }} props
 */
export function MilestoneList({ items, onAdd, onEdit, onRemove }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const completedCount = items.filter(
    (item) => item.status === MILESTONE_STATUS.COMPLETED,
  ).length;

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-text-primary">
          Milestones
        </h3>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <span className="text-xs text-text-muted">
              {completedCount} of {items.length} complete
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="size-4" />
            Add milestone
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No milestones yet"
          description="Break this goal into checkpoints you can track."
          action={
            <Button variant="outline" size="sm" onClick={onAdd}>
              <Plus className="size-4" />
              Add milestone
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border-light">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p
                  className={
                    item.status === MILESTONE_STATUS.COMPLETED
                      ? "truncate text-sm font-medium text-text-muted line-through"
                      : "truncate text-sm font-medium text-text-primary"
                  }
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {item.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary">
                {periodLabel(item.periodType)}
              </span>
              {item.targetDate && (
                <span className="shrink-0 text-xs text-text-secondary">
                  {formatDate(item.targetDate)}
                </span>
              )}
              <span className={milestoneStatusBadgeClass(item.status)}>
                {milestoneStatusLabel(item.status)}
              </span>
              {confirmingId === item.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-text-muted">
                    Remove this milestone?
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
                <div className="flex shrink-0 items-center gap-1">
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
