import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAvailableMinutes,
  getNotificationSettings,
  setAvailableMinutes,
  setNotificationSettings,
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

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: getNotificationSettings,
  });
}

export function useSetNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setNotificationSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
}
