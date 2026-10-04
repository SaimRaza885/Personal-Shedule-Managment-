import { useState } from "react";
import { Play } from "lucide-react";

export function Today() {
  const [currentTask, setCurrentTask] = useState(null);

  // Mock data for now - will be replaced with real data from services
  const mockTask = {
    id: "1",
    title: "Build Today Screen",
    startTime: "9:00 AM",
    endTime: "10:30 AM",
    stepsRemaining: 4,
    plannedMinutes: 90,
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          What Should I Do Now?
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Your Next Task</p>
          <h3 className="text-xl font-semibold text-text-primary">
            {mockTask.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>{mockTask.startTime} — {mockTask.endTime}</span>
            <span>{mockTask.stepsRemaining} steps remaining</span>
            <span>{mockTask.plannedMinutes} minutes</span>
          </div>
          <button className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-dark transition-colors">
            <Play className="size-4" />
            Start
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Daily Top 3
        </h3>
        <p className="text-sm text-text-muted">Select your top 3 priorities for today</p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Today's Schedule
        </h3>
        <p className="text-sm text-text-muted">Your scheduled tasks will appear here</p>
      </div>
    </div>
  );
}
