function toPercent(done, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

export function DailyProgressCard({ completed, total, minutesDone, minutesPlanned }) {
  const tasksPercent = toPercent(completed, total);
  const minutesPercent = toPercent(minutesDone, minutesPlanned);

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-base font-semibold text-text-primary">
        Daily Progress
      </h3>
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-text-secondary">Tasks completed</span>
            <span className="font-medium text-text-primary">
              {completed} of {total}
            </span>
          </div>
          <div className="h-1 rounded-full bg-border-light">
            <div
              className="h-1 rounded-full bg-accent"
              style={{ width: `${tasksPercent}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-text-secondary">Planned time done</span>
            <span className="font-medium text-text-primary">
              {minutesDone} of {minutesPlanned} min
            </span>
          </div>
          <div className="h-1 rounded-full bg-border-light">
            <div
              className="h-1 rounded-full bg-accent"
              style={{ width: `${minutesPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
