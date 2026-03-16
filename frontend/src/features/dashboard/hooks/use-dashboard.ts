import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard/api";
import { useRefreshIntervalStore } from "@/hooks/use-refresh-interval";

export function useDashboard() {
  const refreshInterval = useRefreshIntervalStore((s) => s.interval);

  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: refreshInterval,
  });
}
