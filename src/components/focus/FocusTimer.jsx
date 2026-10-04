import { useEffect, useState } from "react";
import { FOCUS_STATUS } from "@/lib/constants";
import { formatElapsed, formatMinutes } from "@/lib/datetime";
import { focusBadgeClass, focusStatusLabel } from "./focusStatus";

export function FocusTimer({ session, children }) {
  const running = session.status === FOCUS_STATUS.STARTED;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return undefined;
    setNowMs(Date.now());
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [running, session.startedAt]);

  const elapsedMs = running
    ? Math.max(0, nowMs - new Date(session.startedAt).getTime())
    : session.actualMinutes * 60000;

  const plannedMs = (session.plannedMinutes ?? 0) * 60000;
  const percent =
    plannedMs > 0 ? Math.min(100, Math.round((elapsedMs / plannedMs) * 100)) : 0;
  const overPlan = plannedMs > 0 && elapsedMs > plannedMs;

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm text-text-muted">
          {running ? "Focusing on" : "Paused"}
        </h2>
        <span className={focusBadgeClass(session.status)}>
          {focusStatusLabel(session.status)}
        </span>
      </div>

      <div className="space-y-4">
        <h3 className="truncate text-xl font-semibold text-text-primary">
          {session.taskTitle ?? "Task removed"}
        </h3>
        <p
          className="text-4xl font-semibold tracking-tight text-text-primary tabular-nums"
          aria-label="Elapsed time"
        >
          {formatElapsed(elapsedMs)}
        </p>
        <div>
          <div className="h-1 rounded-full bg-border-light">
            <div
              className={`h-1 rounded-full ${overPlan ? "bg-warning" : "bg-accent"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
            {session.plannedMinutes != null && (
              <span>{formatMinutes(session.plannedMinutes)} planned</span>
            )}
            {session.stepsTotal > 0 && (
              <span>
                {session.stepsRemaining} of {session.stepsTotal} steps remaining
              </span>
            )}
            {overPlan && <span className="text-warning-foreground">Over plan</span>}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border-light pt-4">{children}</div>
    </section>
  );
}
