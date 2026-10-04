import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DATE_FORMATS, DEFAULT_VALUES, ENERGY_LEVEL } from "@/lib/constants";
import { useEnergyStore } from "@/stores/energy.store";
import { useAvailableTime } from "@/hooks/useSettings";
import {
  determineNowState,
  findLighterOptions,
  getTodaySchedule,
  getTopThree,
  summarizeOverload,
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

  const availableTimeQuery = useAvailableTime();

  const schedule = scheduleQuery.data ?? [];
  const topThree = topThreeQuery.data ?? [];
  const timeNow = format(new Date(), "HH:mm");
  const { current, upcoming } = determineNowState(schedule, timeNow);
  const progress = summarizeProgress(schedule);
  const overload = summarizeOverload(
    schedule,
    availableTimeQuery.data ?? DEFAULT_VALUES.AVAILABLE_MINUTES,
  );
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
    overload,
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
