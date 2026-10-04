import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/datetime";
import { ideaStatusBadgeClass, ideaStatusLabel } from "./ideaStatus";

/**
 * @param {{ idea: object, onEdit: (idea: object) => void,
 *   onRemove: (idea: object) => void }} props
 */
export function IdeaCard({ idea, onEdit, onRemove }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-text-primary">
            {idea.title}
          </h3>
          {idea.description && (
            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
              {idea.description}
            </p>
          )}
        </div>
        <span className={ideaStatusBadgeClass(idea.status)}>
          {ideaStatusLabel(idea.status)}
        </span>
      </div>

      <p className="text-xs text-text-muted">
        Added {formatTimestamp(idea.createdAt)}
      </p>

      <div className="mt-auto pt-1">
        {confirming ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-text-muted">Remove this idea?</span>
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
                onRemove(idea);
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
              aria-label={`Edit ${idea.title}`}
              onClick={() => onEdit(idea)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Remove ${idea.title}`}
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
