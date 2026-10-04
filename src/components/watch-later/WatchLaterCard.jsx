import { useState } from "react";
import { Check, Pencil, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatTimestamp } from "@/lib/datetime";
import { WATCH_STATUS } from "@/lib/constants";
import { watchStatusBadgeClass, watchStatusLabel } from "./watchStatus";

/**
 * @param {{ item: object, onToggleStatus: (item: object) => void,
 *   onEdit: (item: object) => void,
 *   onRemove: (item: object) => void }} props
 */
export function WatchLaterCard({ item, onToggleStatus, onEdit, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const isWatched = item.status === WATCH_STATUS.WATCHED;

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-base font-semibold text-text-primary">
          {item.title}
        </h3>
        <span className={watchStatusBadgeClass(item.status)}>
          {watchStatusLabel(item.status)}
        </span>
      </div>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm text-accent hover:underline"
        >
          {item.url}
        </a>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {item.scheduledDate && (
          <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary">
            Scheduled {formatDate(item.scheduledDate)}
          </span>
        )}
        <span className="text-xs text-text-muted">
          Added {formatTimestamp(item.createdAt)}
        </span>
      </div>

      <div className="mt-auto pt-1">
        {confirming ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-text-muted">Remove this item?</span>
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
                onRemove(item);
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
              aria-label={
                isWatched
                  ? `Mark ${item.title} as unwatched`
                  : `Mark ${item.title} as watched`
              }
              onClick={() => onToggleStatus(item)}
            >
              {isWatched ? (
                <Undo2 className="size-3.5" />
              ) : (
                <Check className="size-3.5" />
              )}
            </Button>
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
