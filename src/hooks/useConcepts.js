import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConcept,
  deleteConcept,
  listConcepts,
  updateConcept,
} from "@/services/concept.service";

export function useConcepts() {
  return useQuery({
    queryKey: ["concepts"],
    queryFn: listConcepts,
  });
}

export function useCreateConcept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConcept,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["concepts"] }),
  });
}

export function useUpdateConcept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConcept,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["concepts"] }),
  });
}

export function useDeleteConcept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConcept,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["concepts"] }),
  });
}
