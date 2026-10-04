import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as taskService from "@/services/task.service";

export function useTasks(status = null) {
  return useQuery({
    queryKey: ["tasks", status ?? "all"],
    queryFn: () => taskService.listTasks(status ? { status } : {}),
  });
}

export function useTaskSteps(taskId) {
  return useQuery({
    queryKey: ["task", taskId, "steps"],
    queryFn: () => taskService.listTaskSteps(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });
}

export function useSetTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.setTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });
}

export function useCreateTaskStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTaskStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });
}

export function useSetTaskStepCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.setTaskStepCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });
}

export function useDeleteTaskStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTaskStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["today"] });
    },
  });
}
