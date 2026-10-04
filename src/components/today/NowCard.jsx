import { CalendarPlus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatTime } from "@/lib/datetime";
import { statusBadgeClass, statusLabel } from "./taskStatus";

function taskSubtitle(task, total, remaining) {
  if (!task) return "Up next";
  if (total > 0) return `${remaining} of ${total} steps remaining`;
  return task.status === "not_started" ? "Ready to start" : "In progress";
}

export function NowCard({ current, upcoming, onStart }) {
  const task = current ?? upcoming;
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-text-primary">
          What Should I Do Now?
        </h2>
        {task && (
          <span className={statusBadgeClass(task.status)}>
            {statusLabel(task.status)}
          </span>
        )}
      </div>

      {!task ? (
        <EmptyState
          icon={CalendarPlus}
          title="Nothing scheduled right now"
          description="Add a task to today's schedule to always know what to work on next."
        />
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm text-text-muted">
              {current ? "Current task" : "Up next"}
            </p>
            <h3 className="text-xl font-semibold text-text-primary">
              {task.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span>
                {formatTime(task.startTime)} — {formatTime(task.endTime)}
              </span>
              <span>{taskSubtitle(task, task.stepsTotal, task.stepsRemaining)}</span>
              <span>{task.plannedMinutes} min planned</span>
            </div>
          </div>
          {current && (
            <Button onClick={() => onStart(task)}>
              <Play className="size-4" />
              Start
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
