import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatTimestamp } from "@/lib/datetime";

/**
 * @param {{ entry: object, onEdit: (entry: object) => void,
 *   onRemove: (entry: object) => void }} props
 */
export function DiaryCard({ entry, onEdit, onRemove }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary">
          {formatDate(entry.date)}
        </span>
        <span className="text-xs text-text-muted">
          {formatTimestamp(entry.createdAt)}
        </span>
      </div>

      <p className="break-words whitespace-pre-wrap text-sm text-text-secondary">
        {entry.content}
      </p>

      <div className="mt-auto pt-1">
        {confirming ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-text-muted">Remove this entry?</span>
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
              aria-label={`Edit entry from ${formatDate(entry.date)}`}
              onClick={() => onEdit(entry)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Remove entry from ${formatDate(entry.date)}`}
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
