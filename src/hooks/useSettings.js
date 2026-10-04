import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAvailableMinutes,
  setAvailableMinutes,
} from "@/services/settings.service";

export function useAvailableTime() {
  return useQuery({
    queryKey: ["settings", "available-minutes"],
    queryFn: getAvailableMinutes,
  });
}

export function useSetAvailableTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setAvailableMinutes,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
}
