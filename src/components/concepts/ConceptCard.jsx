import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/datetime";
import { conceptStatusBadgeClass, conceptStatusLabel } from "./conceptStatus";

/**
 * @param {{ concept: object, onEdit: (concept: object) => void,
 *   onRemove: (concept: object) => void }} props
 */
export function ConceptCard({ concept, onEdit, onRemove }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-text-primary">
            {concept.title}
          </h3>
          {concept.description && (
            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
              {concept.description}
            </p>
          )}
        </div>
        <span className={conceptStatusBadgeClass(concept.status)}>
          {conceptStatusLabel(concept.status)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {concept.category && (
          <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary">
            {concept.category}
          </span>
        )}
        <p className="text-xs text-text-muted">
          Added {formatTimestamp(concept.createdAt)}
        </p>
      </div>

      <div className="mt-auto pt-1">
        {confirming ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-text-muted">
              Remove this concept?
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
                onRemove(concept);
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
              aria-label={`Edit ${concept.title}`}
              onClick={() => onEdit(concept)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Remove ${concept.title}`}
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
