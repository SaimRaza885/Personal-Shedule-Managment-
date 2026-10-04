import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWatchItem,
  deleteWatchItem,
  listWatchLater,
  setWatchItemStatus,
  updateWatchItem,
} from "@/services/watch-later.service";

export function useWatchLater() {
  return useQuery({
    queryKey: ["watch-later"],
    queryFn: listWatchLater,
  });
}

export function useCreateWatchItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWatchItem,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["watch-later"] }),
  });
}

export function useUpdateWatchItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWatchItem,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["watch-later"] }),
  });
}

export function useSetWatchItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setWatchItemStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["watch-later"] }),
  });
}

export function useDeleteWatchItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWatchItem,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["watch-later"] }),
  });
}
