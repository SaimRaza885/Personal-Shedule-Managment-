import { Star } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";

export function TopThreeCard({ items }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-base font-semibold text-text-primary">
        Daily Top 3
      </h3>
      {!items || items.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No top 3 set"
          description="Pick up to three important tasks to focus on today."
        />
      ) : (
        <ol className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent">
                {item.position}
              </span>
              <p
                className={
                  item.status === "completed"
                    ? "min-w-0 truncate text-sm font-medium text-text-muted line-through"
                    : "min-w-0 truncate text-sm font-medium text-text-primary"
                }
              >
                {item.title}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
