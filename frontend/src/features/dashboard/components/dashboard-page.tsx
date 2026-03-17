import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { AlertMessage } from "@/components/alert-message";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccountMutations } from "@/features/accounts/hooks/use-accounts";
import { AccountCardPanel } from "@/features/dashboard/components/account-card-panel";
import { AccountsSummaryTable } from "@/features/dashboard/components/accounts-summary-table";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { RequestFilters } from "@/features/dashboard/components/filters/request-filters";
import { RecentRequestsTable } from "@/features/dashboard/components/recent-requests-table";
import { StatsGrid } from "@/features/dashboard/components/stats-grid";
import { UsageDonuts } from "@/features/dashboard/components/usage-donuts";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useRequestLogs } from "@/features/dashboard/hooks/use-request-logs";
import { buildDashboardView } from "@/features/dashboard/utils";
import type { AccountSummary } from "@/features/dashboard/schemas";
import { isRefreshIntervalValue, REFRESH_INTERVAL_OPTIONS, useRefreshIntervalStore } from "@/hooks/use-refresh-interval";
import { useThemeStore } from "@/hooks/use-theme";
import { REQUEST_STATUS_LABELS } from "@/utils/constants";
import { formatModelLabel, formatSlug } from "@/utils/formatters";

const MODEL_OPTION_DELIMITER = ":::";

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDark = useThemeStore((s) => s.theme === "dark");
  const refreshInterval = useRefreshIntervalStore((s) => s.interval);
  const setRefreshInterval = useRefreshIntervalStore((s) => s.setInterval);
  const dashboardQuery = useDashboard();
  const { filters, logsQuery, optionsQuery, updateFilters } = useRequestLogs();
  const { resumeMutation } = useAccountMutations();

  const isRefreshing = dashboardQuery.isFetching || logsQuery.isFetching;

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }, [queryClient]);

  const handleRefreshIntervalChange = useCallback(
    (value: string) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return;
      }
      if (isRefreshIntervalValue(parsed)) {
        setRefreshInterval(parsed);
      }
    },
    [setRefreshInterval],
  );

  const handleAccountAction = useCallback(
    (account: AccountSummary, action: string) => {
      switch (action) {
        case "details":
          navigate(`/accounts?selected=${account.accountId}`);
          break;
        case "resume":
          void resumeMutation.mutateAsync(account.accountId);
          break;
        case "reauth":
          navigate(`/accounts?selected=${account.accountId}`);
          break;
      }
    },
    [navigate, resumeMutation],
  );

  const overview = dashboardQuery.data;
  const logPage = logsQuery.data;

  const view = useMemo(() => {
    if (!overview || !logPage) {
      return null;
    }
    return buildDashboardView(overview, logPage.requests, isDark);
  }, [overview, logPage, isDark]);

  const accountOptions = useMemo(() => {
    const labels = new Map<string, string>();
    for (const account of overview?.accounts ?? []) {
      labels.set(account.accountId, account.displayName || account.email || account.accountId);
    }
    return (optionsQuery.data?.accountIds ?? []).map((accountId) => ({
      value: accountId,
      label: labels.get(accountId) ?? accountId,
    }));
  }, [optionsQuery.data?.accountIds, overview?.accounts]);

  const modelOptions = useMemo(
    () =>
      (optionsQuery.data?.modelOptions ?? []).map((option) => ({
        value: `${option.model}${MODEL_OPTION_DELIMITER}${option.reasoningEffort ?? ""}`,
        label: formatModelLabel(option.model, option.reasoningEffort),
      })),
    [optionsQuery.data?.modelOptions],
  );

  const statusOptions = useMemo(
    () =>
      (optionsQuery.data?.statuses ?? []).map((status) => ({
        value: status,
        label: REQUEST_STATUS_LABELS[status] ?? formatSlug(status),
      })),
    [optionsQuery.data?.statuses],
  );

  const errorMessage =
    (dashboardQuery.error instanceof Error && dashboardQuery.error.message) ||
    (logsQuery.error instanceof Error && logsQuery.error.message) ||
    (optionsQuery.error instanceof Error && optionsQuery.error.message) ||
    null;

  const primaryUsageByAccount = useMemo(() => {
    const entries = overview?.windows.primary.accounts ?? [];
    return Object.fromEntries(entries.map((entry) => [entry.accountId, entry]));
  }, [overview?.windows.primary.accounts]);
  const secondaryUsageByAccount = useMemo(() => {
    const entries = overview?.windows.secondary?.accounts ?? [];
    return Object.fromEntries(entries.map((entry) => [entry.accountId, entry]));
  }, [overview?.windows.secondary?.accounts]);

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Przegląd, stan kont i ostatnie logi żądań.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">Auto odświeżanie</span>
          <Select value={String(refreshInterval)} onValueChange={handleRefreshIntervalChange}>
            <SelectTrigger size="sm" className="w-[140px]" aria-label="Częstotliwość odświeżania danych">
              <SelectValue placeholder="Odświeżanie" />
            </SelectTrigger>
            <SelectContent align="end">
              {REFRESH_INTERVAL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Odśwież panel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            title="Odśwież panel"
          >
            <RefreshCw className={`h-4 w-4${isRefreshing ? " animate-spin" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {errorMessage ? <AlertMessage variant="error">{errorMessage}</AlertMessage> : null}

      {!view ? (
        <DashboardSkeleton />
      ) : (
        <>
          <section className="space-y-4" aria-labelledby="summary-section-title">
            <div className="flex items-center gap-3">
              <h2 id="summary-section-title" className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                Podsumowanie
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <StatsGrid stats={view.stats} />
          </section>

          <section className="space-y-4" aria-labelledby="usage-section-title">
            <div className="flex items-center gap-3">
              <h2 id="usage-section-title" className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                Zużycie i limity
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <UsageDonuts
              primaryItems={view.primaryUsageItems}
              secondaryItems={view.secondaryUsageItems}
              primaryTotal={overview?.summary.primaryWindow.capacityCredits ?? 0}
              secondaryTotal={overview?.summary.secondaryWindow?.capacityCredits ?? 0}
              primaryWindowMinutes={overview?.windows.primary.windowMinutes ?? null}
              secondaryWindowMinutes={overview?.windows.secondary?.windowMinutes ?? null}
            />
          </section>

          <section className="space-y-4" aria-labelledby="accounts-section-title">
            <div className="flex items-center gap-3">
              <h2 id="accounts-section-title" className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                Konta
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Podsumowanie kont</h3>
                <AccountsSummaryTable
                  accounts={overview?.accounts ?? []}
                  primaryUsageByAccount={primaryUsageByAccount}
                  secondaryUsageByAccount={secondaryUsageByAccount}
                  primaryWindowMinutes={overview?.windows.primary.windowMinutes ?? null}
                  secondaryWindowMinutes={overview?.windows.secondary?.windowMinutes ?? null}
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Karta konta</h3>
                <AccountCardPanel
                  accounts={overview?.accounts ?? []}
                  primaryUsageByAccount={primaryUsageByAccount}
                  secondaryUsageByAccount={secondaryUsageByAccount}
                  onAction={handleAccountAction}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="request-logs-section-title">
            <div className="flex items-center gap-3">
              <h2 id="request-logs-section-title" className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                Logi żądań
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <RequestFilters
              filters={filters}
              accountOptions={accountOptions}
              modelOptions={modelOptions}
              statusOptions={statusOptions}
              onSearchChange={(search) => updateFilters({ search, offset: 0 })}
              onTimeframeChange={(timeframe) => updateFilters({ timeframe, offset: 0 })}
              onAccountChange={(accountIds) => updateFilters({ accountIds, offset: 0 })}
              onModelChange={(modelOptionsSelected) =>
                updateFilters({ modelOptions: modelOptionsSelected, offset: 0 })
              }
              onStatusChange={(statuses) => updateFilters({ statuses, offset: 0 })}
              onReset={() =>
                updateFilters({
                  search: "",
                  timeframe: "all",
                  accountIds: [],
                  modelOptions: [],
                  statuses: [],
                  offset: 0,
                })
              }
            />
            <div className="transition-opacity duration-200">
              <RecentRequestsTable
                requests={view.requestLogs}
                accounts={overview?.accounts ?? []}
                total={logPage?.total ?? 0}
                limit={filters.limit}
                offset={filters.offset}
                hasMore={logPage?.hasMore ?? false}
                onLimitChange={(limit) => updateFilters({ limit, offset: 0 })}
                onOffsetChange={(offset) => updateFilters({ offset })}
              />
            </div>
          </section>
        </>
      )}

    </div>
  );
}
