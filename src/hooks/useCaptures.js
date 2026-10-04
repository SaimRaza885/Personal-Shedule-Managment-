import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  convertCaptureToIdea,
  convertCaptureToTask,
  createCapture,
  deleteCapture,
  listCaptures,
} from "@/services/quick-capture.service";

export function useCaptures() {
  return useQuery({
    queryKey: ["captures"],
    queryFn: listCaptures,
  });
}

export function useCreateCapture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCapture,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["captures"] }),
  });
}

export function useConvertCaptureToTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: convertCaptureToTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captures"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useConvertCaptureToIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: convertCaptureToIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captures"] });
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
  });
}

export function useDeleteCapture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCapture,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["captures"] }),
  });
}
