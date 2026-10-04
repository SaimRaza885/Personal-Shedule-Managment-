import { NowCard } from "@/components/today/NowCard";
import { TopThreeCard } from "@/components/today/TopThreeCard";
import { DailyProgressCard } from "@/components/today/DailyProgressCard";
import { ScheduleCard } from "@/components/today/ScheduleCard";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useTodayData } from "@/hooks/useToday";

export function Today() {
  const {
    schedule,
    topThree,
    current,
    upcoming,
    progress,
    isLoading,
    isError,
    refetch,
  } = useTodayData();

  const handleStart = (task) => {
    console.log("[Today] start task", task?.id);
  };

  if (isLoading) {
    return <LoadingState message="Loading your day…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load today"
        description="Your schedule could not be loaded. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <NowCard current={current} upcoming={upcoming} onStart={handleStart} />

      <div className="grid grid-cols-2 gap-6">
        <TopThreeCard items={topThree} />
        <DailyProgressCard
          completed={progress.completed}
          total={progress.total}
          minutesDone={progress.minutesDone}
          minutesPlanned={progress.minutesPlanned}
        />
      </div>

      <ScheduleCard items={schedule} />
    </div>
  );
}
