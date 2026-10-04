import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/datetime";

/**
 * @param {{ entry: object, onEdit: (entry: object) => void,
 *   onRemove: (entry: object) => void }} props
 */
export function LearningCard({ entry, onEdit, onRemove }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-base font-semibold text-text-primary">
          {entry.title}
        </h3>
        <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary">
          {formatDate(entry.date)}
        </span>
      </div>

      {entry.content && (
        <p className="break-words whitespace-pre-wrap text-sm text-text-secondary">
          {entry.content}
        </p>
      )}

      <div className="mt-auto pt-1">
        {confirming ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-text-muted">Remove this note?</span>
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
                onRemove(entry);
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Edit ${entry.title}`}
              onClick={() => onEdit(entry)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Remove ${entry.title}`}
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
