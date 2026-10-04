import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/services/analytics.service";

export function useAnalytics(days) {
  return useQuery({
    queryKey: ["analytics", days],
    queryFn: () => getAnalytics(days),
  });
}
