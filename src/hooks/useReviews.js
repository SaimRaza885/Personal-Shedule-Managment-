import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDailyReview,
  getDailyReviewStats,
  saveDailyReview,
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
