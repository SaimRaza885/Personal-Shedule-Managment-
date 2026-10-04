import { CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOCUS_STATUS } from "@/lib/constants";
import { formatMinutes } from "@/lib/datetime";

export function SessionSummary({ session, onDismiss }) {
  const completed = session.status === FOCUS_STATUS.COMPLETED;
  const Icon = completed ? CircleCheck : CircleX;

  const timeText =
    session.plannedMinutes != null
      ? `${formatMinutes(session.actualMinutes)} of ${formatMinutes(session.plannedMinutes)} planned.`
      : `${formatMinutes(session.actualMinutes)} focused.`;

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
        </div>
        <Button variant="outline" size="sm" onClick={onDismiss}>
          Done
        </Button>
      </div>
    </section>
  );
}
