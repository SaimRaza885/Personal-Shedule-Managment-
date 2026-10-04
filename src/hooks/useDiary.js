import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDiaryEntry,
  deleteDiaryEntry,
  listDiaryEntries,
  updateDiaryEntry,
} from "@/services/diary.service";

export function useDiaryEntries() {
  return useQuery({
    queryKey: ["diary"],
    queryFn: listDiaryEntries,
  });
}

export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiaryEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary"] }),
  });
}

export function useUpdateDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDiaryEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary"] }),
  });
}

export function useDeleteDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDiaryEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary"] }),
  });
}
