import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { DailyBarChart } from "@/components/analytics/DailyBarChart";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatMinutes } from "@/lib/datetime";

function StatTile({ label, value }) {
  return (
    <div className="rounded-md bg-surface-secondary p-3">
      <p className="text-lg font-semibold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

export function Analytics() {
  const [range, setRange] = useState("7");
  const days = Number(range);
  const { data, isLoading, isError, refetch } = useAnalytics(days);

  const hasActivity =
    data &&
    (data.totals.sessions > 0 ||
      data.totals.tasksCompleted > 0 ||
      data.totals.distractions > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-muted">
            Where your time and attention actually went, from your own records.
          </p>
        </div>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            <TabsTrigger value="7">7 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your analytics…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your analytics"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : !hasActivity ? (
        <EmptyState
          icon={BarChart3}
          title="Nothing to chart yet"
          description="Finish focus sessions, complete tasks, and log distractions — your patterns will show up here."
        />
      ) : (
        <>
          <section className="rounded-lg border border-border bg-surface p-5">
            <div className="grid grid-cols-4 gap-3">
              <StatTile
                label="Focus time"
                value={formatMinutes(data.totals.focusMinutes)}
              />
              <StatTile
                label="Tasks completed"
                value={data.totals.tasksCompleted}
              />
              <StatTile
                label="Focus sessions"
                value={data.totals.sessions}
              />
              <StatTile
                label="Distractions"
                value={data.totals.distractions}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DailyBarChart
              title="Focus time per day"
              summary={`Avg ${formatMinutes(data.averageFocusMinutes)}/day`}
              data={data.points}
              dataKey="focusMinutes"
              barClass="accent"
              valueFormatter={formatMinutes}
            />
            <DailyBarChart
              title="Tasks completed per day"
              data={data.points}
              dataKey="tasksCompleted"
              barClass="success"
              valueFormatter={(value) => String(value)}
            />
          </div>
        </>
      )}
    </div>
  );
}
