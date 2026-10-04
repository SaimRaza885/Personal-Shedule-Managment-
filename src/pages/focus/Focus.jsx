import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BellRing, Play, Timer } from "lucide-react";
import { DistractionDialog } from "@/components/focus/DistractionDialog";
import { FocusControls } from "@/components/focus/FocusControls";
import { FocusHistory } from "@/components/focus/FocusHistory";
import { FocusTimer } from "@/components/focus/FocusTimer";
import { SessionSummary } from "@/components/focus/SessionSummary";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/button";
import { useLogDistraction, useSessionDistractions } from "@/hooks/useDistractions";
import {
  useActiveFocusSession,
  useCancelFocusSession,
  useCompleteFocusSession,
  useFocusCandidates,
  useFocusHistory,
  usePauseFocusSession,
  useResumeFocusSession,
  useStartFocusSession,
} from "@/hooks/useFocus";
import { formatTime } from "@/lib/datetime";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Focus() {
  const activeQuery = useActiveFocusSession();
  const historyQuery = useFocusHistory();
  const candidatesQuery = useFocusCandidates();
  const startFocus = useStartFocusSession();
  const pauseFocus = usePauseFocusSession();
  const resumeFocus = useResumeFocusSession();
  const completeFocus = useCompleteFocusSession();
  const cancelFocus = useCancelFocusSession();
  const logDistraction = useLogDistraction();

  const [summary, setSummary] = useState(null);
  const [distractionOpen, setDistractionOpen] = useState(false);

  const active = activeQuery.data ?? null;
  const candidates = candidatesQuery.data ?? [];

  const summaryDistractionsQuery = useSessionDistractions(
    summary ? summary.id : null,
  );

  const handleStart = async (candidate) => {
    try {
      await startFocus.mutateAsync({ taskId: candidate.taskId });
      setSummary(null);
      toast.success("Focus session started");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handlePause = async () => {
    try {
      await pauseFocus.mutateAsync({ id: active.id });
      toast.success("Session paused");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleResume = async () => {
    try {
      await resumeFocus.mutateAsync({ id: active.id });
      toast.success("Back to it");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleComplete = async () => {
    try {
      const result = await completeFocus.mutateAsync({ id: active.id });
      setSummary({
        ...active,
        actualMinutes: result.actualMinutes,
        status: result.status,
      });
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleCancel = async () => {
    try {
      const result = await cancelFocus.mutateAsync({ id: active.id });
      setSummary({
        ...active,
        actualMinutes: result.actualMinutes,
        status: result.status,
      });
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleLogDistraction = async (values) => {
    try {
      await logDistraction.mutateAsync({
        focusSessionId: active.id,
        reason: values.reason,
        notes: values.notes,
      });
      setDistractionOpen(false);
      toast.success("Distraction logged");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  if (activeQuery.isLoading || historyQuery.isLoading) {
    return <LoadingState message="Loading your focus session&hellip;" />;
  }

  if (activeQuery.isError || historyQuery.isError) {
    return (
      <ErrorState
        title="Couldn't load your focus data"
        description="Check that the app's database is available, then try again."
        onRetry={() => {
          activeQuery.refetch();
          historyQuery.refetch();
        }}
      />
    );
  }

  const controlsPending =
    pauseFocus.isPending ||
    resumeFocus.isPending ||
    completeFocus.isPending ||
    cancelFocus.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Focus</h1>
        <p className="text-sm text-text-muted">
          Deep work, one task at a time.
        </p>
      </div>

      {summary ? (
        <SessionSummary
          session={summary}
          distractions={summaryDistractionsQuery.data ?? []}
          onDismiss={() => setSummary(null)}
        />
      ) : active ? (
        <FocusTimer session={active}>
          <FocusControls
            status={active.status}
            pending={controlsPending}
            onPause={handlePause}
            onResume={handleResume}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDistractionOpen(true)}
              disabled={controlsPending}
            >
              <BellRing className="size-4" />
              Log distraction
            </Button>
            {active.distractionsCount > 0 && (
              <span className="text-xs text-text-muted">
                {active.distractionsCount} logged this session
              </span>
            )}
          </div>
        </FocusTimer>
      ) : (
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            Start a focus session
          </h2>

          {candidatesQuery.isLoading ? (
            <LoadingState message="Loading today's schedule&hellip;" />
          ) : candidatesQuery.isError ? (
            <ErrorState
              title="Couldn't load today's schedule"
              onRetry={() => candidatesQuery.refetch()}
            />
          ) : candidates.length === 0 ? (
            <EmptyState
              icon={Timer}
              title="Nothing to focus on yet"
              description="Schedule a task for today, then start a session here."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link to="/">Plan your day</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border-light">
              {candidates.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3">
                  <span className="w-36 shrink-0 text-sm text-text-secondary">
                    {formatTime(item.startTime)} &mdash; {formatTime(item.endTime)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-sm text-text-secondary">
                    {item.plannedMinutes} min
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleStart(item)}
                    disabled={startFocus.isPending}
                  >
                    <Play className="size-4" />
                    Start
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <FocusHistory items={historyQuery.data ?? []} />

      <DistractionDialog
        open={distractionOpen}
        onOpenChange={setDistractionOpen}
        onSubmit={handleLogDistraction}
        isPending={logDistraction.isPending}
      />
    </div>
  );
}
