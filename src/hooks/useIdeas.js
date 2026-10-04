import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIdea,
  deleteIdea,
  listIdeas,
  updateIdea,
} from "@/services/idea.service";

export function useIdeas() {
  return useQuery({
    queryKey: ["ideas"],
    queryFn: listIdeas,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIdea,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ideas"] }),
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIdea,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ideas"] }),
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ideas"] }),
  });
}
