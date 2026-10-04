import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as scheduleService from "@/services/schedule.service";

export function useAddScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleService.addScheduleBlock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today"] }),
  });
}

export function useUpdateScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleService.updateScheduleBlock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today"] }),
  });
}

export function useRemoveScheduleBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleService.removeScheduleBlock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today"] }),
  });
}
