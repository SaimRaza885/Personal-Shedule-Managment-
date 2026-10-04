import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as goalService from "@/services/goal.service";

export function useGoals() {
  return useQuery({ queryKey: ["goals"], queryFn: goalService.listGoals });
}

export function useGoal(id) {
  return useQuery({
    queryKey: ["goal", id],
    queryFn: () => goalService.getGoal(id),
    enabled: !!id,
  });
}

export function useGoalMilestones(goalId) {
  return useQuery({
    queryKey: ["goal", goalId, "milestones"],
    queryFn: () => goalService.listMilestones(goalId),
    enabled: !!goalId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.createGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.updateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.createMilestone,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["goal", variables.goalId, "milestones"],
      });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.updateMilestone,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["goal", variables.goalId, "milestones"],
      });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.deleteMilestone,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["goal", variables.goalId, "milestones"],
      });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
