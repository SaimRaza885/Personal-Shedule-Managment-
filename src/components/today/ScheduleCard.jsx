import { Clock } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatTime } from "@/lib/datetime";
import { statusBadgeClass, statusLabel } from "./taskStatus";

export function ScheduleCard({ items }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-base font-semibold text-text-primary">
        Today's Schedule
      </h3>
      {!items || items.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No tasks scheduled"
          description="Plan your day by adding tasks to fixed time blocks."
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
                  item.status === "completed"
                    ? "min-w-0 flex-1 truncate text-sm font-medium text-text-muted line-through"
                    : "min-w-0 flex-1 truncate text-sm font-medium text-text-primary"
                }
              >
                {item.title}
              </p>
              <span className={statusBadgeClass(item.status)}>
                {statusLabel(item.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
