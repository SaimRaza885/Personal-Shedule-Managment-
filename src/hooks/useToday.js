import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DATE_FORMATS, ENERGY_LEVEL } from "@/lib/constants";
import { useEnergyStore } from "@/stores/energy.store";
import {
  determineNowState,
  findLighterOptions,
  getTodaySchedule,
  getTopThree,
  summarizeProgress,
} from "@/services/today.service";

export function useTodayData() {
  const date = format(new Date(), DATE_FORMATS.ISO);
  const energy = useEnergyStore((state) => state.energy);

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
  const lighterOptions =
    energy === ENERGY_LEVEL.LOW
      ? findLighterOptions(schedule, timeNow, {
          excludeTaskId: (current ?? upcoming)?.taskId ?? null,
        })
      : [];

  return {
    date,
    schedule,
    topThree,
    current,
    upcoming,
    progress,
    energy,
    lighterOptions,
    isLoading: scheduleQuery.isLoading || topThreeQuery.isLoading,
    isError: scheduleQuery.isError || topThreeQuery.isError,
    refetch() {
      scheduleQuery.refetch();
      topThreeQuery.refetch();
    },
  };
}
