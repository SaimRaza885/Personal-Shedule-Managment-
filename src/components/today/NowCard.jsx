import { CalendarPlus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { energyLabel } from "@/components/tasks/taskMeta";
import { ENERGY_LEVEL } from "@/lib/constants";
import { formatTime } from "@/lib/datetime";
import { EnergySelector } from "./EnergySelector";
import { statusBadgeClass, statusLabel } from "./taskStatus";

function taskSubtitle(task, total, remaining) {
  if (!task) return "Up next";
  if (total > 0) return `${remaining} of ${total} steps remaining`;
  return task.status === "not_started" ? "Ready to start" : "In progress";
}

export function NowCard({
  current,
  upcoming,
  onStart,
  energy = null,
  onSelectEnergy,
  lighterOptions = [],
  focusActive = false,
  startPending = false,
}) {
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

      <div className="mb-4">
        <EnergySelector value={energy} onChange={onSelectEnergy} />
      </div>

      {!task ? (
        <EmptyState
          icon={CalendarPlus}
          title="Nothing scheduled right now"
          description="Add a task to today's schedule to always know what to work on next."
        />
      ) : (
        <>
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
              <Button onClick={() => onStart(task)} disabled={startPending}>
                <Play className="size-4" />
                {focusActive ? "Focus in progress" : "Start"}
              </Button>
            )}
          </div>

          {energy === ENERGY_LEVEL.LOW && lighterOptions.length > 0 && (
            <div className="mt-4 border-t border-border-light pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-warning-light px-2 py-0.5 text-xs font-medium whitespace-nowrap text-warning-foreground">
                  Low energy mode
                </span>
                <p className="text-xs text-text-muted">
                  Lighter options from today&rsquo;s plan — your schedule stays as
                  it is.
                </p>
              </div>
              <ul className="mt-3 divide-y divide-border-light">
                {lighterOptions.map((option) => (
                  <li key={option.id} className="flex items-center gap-3 py-2">
                    <span className="w-36 shrink-0 text-sm text-text-secondary">
                      {formatTime(option.startTime)} — {formatTime(option.endTime)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                      {option.title}
                    </span>
                    <span className="shrink-0 text-xs text-text-muted">
                      {option.plannedMinutes} min
                      {option.energyLevel ? ` · ${energyLabel(option.energyLevel)}` : ""}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStart(option)}
                      disabled={startPending}
                    >
                      <Play className="size-4" />
                      Start
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
