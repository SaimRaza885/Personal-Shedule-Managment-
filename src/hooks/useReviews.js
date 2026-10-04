import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDailyReview,
  getDailyReviewStats,
  getWeeklyReview,
  saveDailyReview,
  saveWeeklyReview,
} from "@/services/review.service";

export function useDailyReview(date) {
  return useQuery({
    queryKey: ["reviews", "daily", date],
    queryFn: () => getDailyReview(date),
  });
}

export function useDailyReviewStats(date) {
  return useQuery({
    queryKey: ["reviews", "daily-stats", date],
    queryFn: () => getDailyReviewStats(date),
  });
}

export function useSaveDailyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveDailyReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useWeeklyReview(weekStart) {
  return useQuery({
    queryKey: ["reviews", "weekly", weekStart],
    queryFn: () => getWeeklyReview(weekStart),
  });
}

export function useSaveWeeklyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveWeeklyReview,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
