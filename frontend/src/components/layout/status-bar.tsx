import { useEffect, useState } from "react";
import { Activity, ArrowRightLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard/api";
import { getSettings } from "@/features/settings/api";
import { useRefreshIntervalStore } from "@/hooks/use-refresh-interval";
import { formatTimeLong } from "@/utils/formatters";

function getRoutingLabel(
  routingStrategy: string | undefined,
  sticky: boolean,
  preferEarlier: boolean,
): string {
  if (routingStrategy === "round_robin") {
    if (sticky && preferEarlier) return "Cykliczne + stałe przypisanie + preferowany wcześniejszy reset";
    if (sticky) return "Cykliczne + stałe przypisanie";
    if (preferEarlier) return "Cykliczne + preferowany wcześniejszy reset";
    return "Cykliczne";
  }
  if (sticky && preferEarlier) return "Stałe przypisanie + preferowany wcześniejszy reset";
  if (sticky) return "Stałe przypisanie";
  if (preferEarlier) return "Preferuj wcześniejszy reset";
  return "Ważone użyciem";
}

export function StatusBar() {
  const refreshInterval = useRefreshIntervalStore((s) => s.interval);

  const { data: lastSyncAt = null } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: refreshInterval,
    select: (data) => data.lastSyncAt,
  });

  const { data: settings } = useQuery({
    queryKey: ["settings", "detail"],
    queryFn: getSettings,
  });
  const lastSync = formatTimeLong(lastSyncAt);
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    function check() {
      setIsLive(lastSyncAt ? Date.now() - new Date(lastSyncAt).getTime() < 60_000 : false);
    }
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, [lastSyncAt]);

  const routingLabel = settings
    ? getRoutingLabel(
        settings.routingStrategy,
        settings.stickyThreadsEnabled,
        settings.preferEarlierResetAccounts,
      )
    : "—";
  const liveLabel = isLive ? "Na żywo" : "Brak świeżej synchronizacji";

  return (
    <footer
      role="contentinfo"
      aria-label="Pasek statusu aplikacji"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-background/50 px-4 py-2 shadow-[0_-1px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl backdrop-saturate-[1.8] supports-[backdrop-filter]:bg-background/40 dark:shadow-[0_-1px_12px_rgba(0,0,0,0.25)]"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5" role="status" aria-live="polite" aria-atomic="true">
          {isLive ? (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          ) : (
            <Activity className="h-3 w-3" aria-hidden="true" />
          )}
          <span className="sr-only">{liveLabel}.</span>
          <span className="font-medium">Ostatnia synchronizacja:</span> {lastSync.time}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ArrowRightLeft className="h-3 w-3" aria-hidden="true" />
          <span className="font-medium">Trasowanie:</span> {routingLabel}
        </span>
      </div>
    </footer>
  );
}
