import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { DATE_FORMATS } from "@/lib/constants";
import * as focusService from "@/services/focus.service";

function invalidateFocusRelated(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["focus"] });
  queryClient.invalidateQueries({ queryKey: ["today"] });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["task"] });
  queryClient.invalidateQueries({ queryKey: ["project"] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
}

export function useActiveFocusSession() {
  return useQuery({
    queryKey: ["focus", "active"],
    queryFn: focusService.getActiveFocusSession,
  });
}

export function useFocusHistory(limit = 10) {
  return useQuery({
    queryKey: ["focus", "history", limit],
    queryFn: () => focusService.listFocusSessions(limit),
  });
}

export function useFocusCandidates() {
  const date = format(new Date(), DATE_FORMATS.ISO);

  return useQuery({
    queryKey: ["focus", "candidates", date],
    queryFn: () => focusService.listFocusCandidates(date),
  });
}

export function useStartFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: focusService.startFocusSession,
    onSuccess: () => invalidateFocusRelated(queryClient),
  });
}

export function usePauseFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: focusService.pauseFocusSession,
    onSuccess: () => invalidateFocusRelated(queryClient),
  });
}

export function useResumeFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: focusService.resumeFocusSession,
    onSuccess: () => invalidateFocusRelated(queryClient),
  });
}

export function useCompleteFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: focusService.completeFocusSession,
    onSuccess: () => invalidateFocusRelated(queryClient),
  });
}

export function useCancelFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: focusService.cancelFocusSession,
    onSuccess: () => invalidateFocusRelated(queryClient),
  });
}
