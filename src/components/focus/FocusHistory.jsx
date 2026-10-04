import { History } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatMinutes, formatTimestamp } from "@/lib/datetime";
import { focusBadgeClass, focusStatusLabel } from "./focusStatus";

export function FocusHistory({ items }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="mb-4 text-base font-semibold text-text-primary">
        Recent sessions
      </h2>

      {items.length === 0 ? (
        <EmptyState
          icon={History}
          title="No focus sessions yet"
          description="Start a session and your focus time will be recorded here."
        />
      ) : (
        <ul className="divide-y divide-border-light">
          {items.map((session) => (
            <li key={session.id} className="flex items-center gap-4 py-3">
              <span className="w-40 shrink-0 text-sm text-text-secondary">
                {formatTimestamp(session.startedAt)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                {session.taskTitle ?? "Task removed"}
              </span>
              <span className="shrink-0 text-sm text-text-secondary">
                {session.plannedMinutes != null
                  ? `${formatMinutes(session.actualMinutes)} of ${formatMinutes(session.plannedMinutes)}`
                  : formatMinutes(session.actualMinutes)}
              </span>
              <span className={focusBadgeClass(session.status)}>
                {focusStatusLabel(session.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
