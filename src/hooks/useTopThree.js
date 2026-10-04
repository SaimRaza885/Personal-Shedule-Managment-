import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as topThreeService from "@/services/top-three.service";

export function useTopThreeCandidates(date) {
  return useQuery({
    queryKey: ["today", "top-three-candidates", date],
    queryFn: () => topThreeService.listTopThreeCandidates(date),
  });
}

export function useAddTopThree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topThreeService.addTopThreeTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today"] }),
  });
}

export function useRemoveTopThree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topThreeService.removeTopThreeTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today"] }),
  });
}

export function useMoveTopThree() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topThreeService.moveTopThreeTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["today"] }),
  });
}
