import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLearningEntry,
  deleteLearningEntry,
  listLearningEntries,
  updateLearningEntry,
} from "@/services/learning.service";

export function useLearningEntries() {
  return useQuery({
    queryKey: ["learning"],
    queryFn: listLearningEntries,
  });
}

export function useCreateLearningEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLearningEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning"] }),
  });
}

export function useUpdateLearningEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLearningEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning"] }),
  });
}

export function useDeleteLearningEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLearningEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning"] }),
  });
}
