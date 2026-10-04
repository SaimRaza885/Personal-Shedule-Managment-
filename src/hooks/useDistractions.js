import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as distractionService from "@/services/distraction.service";

export function useSessionDistractions(sessionId) {
  return useQuery({
    queryKey: ["distractions", sessionId],
    queryFn: () => distractionService.listSessionDistractions(sessionId),
    enabled: !!sessionId,
  });
}

export function useLogDistraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: distractionService.logDistraction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus"] });
      queryClient.invalidateQueries({ queryKey: ["distractions"] });
    },
  });
}
