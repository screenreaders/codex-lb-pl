import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}
