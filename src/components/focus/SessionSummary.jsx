import { CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOCUS_STATUS } from "@/lib/constants";
import { formatMinutes } from "@/lib/datetime";

function groupByReason(distractions) {
  const groups = [];
  for (const distraction of distractions) {
    const existing = groups.find((g) => g.reason === distraction.reason);
    if (existing) {
      existing.count += 1;
    } else {
      groups.push({ reason: distraction.reason, count: 1 });
    }
  }
  return groups;
}

export function SessionSummary({ session, distractions = [], onDismiss }) {
  const completed = session.status === FOCUS_STATUS.COMPLETED;
  const Icon = completed ? CircleCheck : CircleX;

  const timeText =
    session.plannedMinutes != null
      ? `${formatMinutes(session.actualMinutes)} of ${formatMinutes(session.plannedMinutes)} planned.`
      : `${formatMinutes(session.actualMinutes)} focused.`;

  const reasonGroups = groupByReason(distractions);

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-start gap-4">
        <span
          className={`rounded-full p-2.5 ${
            completed
              ? "bg-success-light text-success-foreground"
              : "bg-surface-secondary text-text-muted"
          }`}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-base font-semibold text-text-primary">
            {completed ? "Session complete" : "Session cancelled"}
          </h2>
          <p className="text-sm text-text-secondary">
            {session.taskTitle ?? "Task removed"} &mdash; {timeText}
          </p>
          {reasonGroups.length > 0 && (
            <div className="pt-1">
              <p className="text-sm text-text-secondary">
                {distractions.length}{" "}
                {distractions.length === 1 ? "distraction" : "distractions"}{" "}
                logged.
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {reasonGroups.map((group) => (
                  <span
                    key={group.reason}
                    className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-text-secondary"
                  >
                    {group.reason}
                    {group.count > 1 ? ` \u00d7${group.count}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onDismiss}>
          Done
        </Button>
      </div>
    </section>
  );
}
