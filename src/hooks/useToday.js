import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DATE_FORMATS } from "@/lib/constants";
import {
  determineNowState,
  getTodaySchedule,
  getTopThree,
  summarizeProgress,
} from "@/services/todayService";

export function useTodayData() {
  const date = format(new Date(), DATE_FORMATS.ISO);

  const scheduleQuery = useQuery({
    queryKey: ["today", "schedule", date],
    queryFn: () => getTodaySchedule(date),
  });

  const topThreeQuery = useQuery({
    queryKey: ["today", "top-three", date],
    queryFn: () => getTopThree(date),
  });

  const schedule = scheduleQuery.data ?? [];
  const topThree = topThreeQuery.data ?? [];
  const timeNow = format(new Date(), "HH:mm");
  const { current, upcoming } = determineNowState(schedule, timeNow);
  const progress = summarizeProgress(schedule);

  return {
    date,
    schedule,
    topThree,
    current,
    upcoming,
    progress,
    isLoading: scheduleQuery.isLoading || topThreeQuery.isLoading,
    isError: scheduleQuery.isError || topThreeQuery.isError,
    refetch() {
      scheduleQuery.refetch();
      topThreeQuery.refetch();
    },
  };
}
