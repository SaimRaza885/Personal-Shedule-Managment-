import { ChevronDown, ChevronUp, Star, X } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { DEFAULT_VALUES, TASK_STATUS } from "@/lib/constants";

export function TopThreeCard({ items, onPick, onRemove, onMove }) {
  const max = DEFAULT_VALUES.DAILY_TOP_THREE_MAX;

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-text-primary">
          Daily Top 3
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {items.length} of {max}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onPick}
            disabled={items.length >= max}
          >
            <Star className="size-4" />
            Pick tasks
          </Button>
        </div>
      </div>
      {!items || items.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No top 3 set"
          description="Pick up to three important tasks to focus on today."
          action={
            <Button variant="outline" size="sm" onClick={onPick}>
              <Star className="size-4" />
              Pick tasks
            </Button>
          }
        />
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent">
                {item.position}
              </span>
              <p
                className={
                  item.status === TASK_STATUS.COMPLETED
                    ? "min-w-0 flex-1 truncate text-sm font-medium text-text-muted line-through"
                    : "min-w-0 flex-1 truncate text-sm font-medium text-text-primary"
                }
              >
                {item.title}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Move ${item.title} up`}
                  disabled={index === 0}
                  onClick={() => onMove(item, "up")}
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Move ${item.title} down`}
                  disabled={index === items.length - 1}
                  onClick={() => onMove(item, "down")}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${item.title} from Top 3`}
                  onClick={() => onRemove(item)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
