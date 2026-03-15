import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { AccountTrendChart } from "@/features/accounts/components/account-trend-chart";
import type { AccountSummary, AccountTrendsResponse } from "@/features/accounts/schemas";
import { quotaBarColor, quotaBarTrack } from "@/utils/account-status";
import { formatPercentNullable, formatQuotaResetLabel } from "@/utils/formatters";

export type AccountUsagePanelProps = {
  account: AccountSummary;
  trends?: AccountTrendsResponse | null;
};

function QuotaRow({
  label,
  percent,
  resetAt,
}: {
  label: string;
  percent: number | null;
  resetAt: string | null | undefined;
}) {
  const clamped = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const hasPercent = percent !== null;
  const percentLabel = formatPercentNullable(percent);
  const srPercent = percentLabel === "--" ? "brak danych" : percentLabel;
  const resetLabel = formatQuotaResetLabel(resetAt ?? null);
  const srLabel = `Pozostało (${label}). ${srPercent}. Reset ${resetLabel}.`;
  return (
    <div className="space-y-1.5">
      <span className="sr-only">{srLabel}</span>
      <div aria-hidden="true">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Pozostało ({label})</span>
          <span
            className={cn(
              "tabular-nums font-medium",
              !hasPercent
                ? "text-muted-foreground"
                : clamped >= 70
                  ? "text-emerald-600 dark:text-emerald-400"
                  : clamped >= 30
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400",
            )}
          >
            {percentLabel}
          </span>
        </div>
        <div className={cn("h-1.5 w-full overflow-hidden rounded-full", quotaBarTrack(clamped))}>
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", quotaBarColor(clamped))}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>Reset {resetLabel}</span>
        </div>
      </div>
    </div>
  );
}

export function AccountUsagePanel({ account, trends }: AccountUsagePanelProps) {
  const primary = account.usage?.primaryRemainingPercent ?? null;
  const secondary = account.usage?.secondaryRemainingPercent ?? null;
  const weeklyOnly = account.windowMinutesPrimary == null && account.windowMinutesSecondary != null;
  const hasTrends = trends && (trends.primary.length > 0 || trends.secondary.length > 0);

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Użycie</h3>
      <div className={cn("grid gap-4", weeklyOnly ? "grid-cols-1" : "grid-cols-2")}>
        {!weeklyOnly && <QuotaRow label="Główne" percent={primary} resetAt={account.resetAtPrimary} />}
        <QuotaRow label="Wtórne" percent={secondary} resetAt={account.resetAtSecondary} />
      </div>
      {hasTrends && (
        <div className="pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trend 7-dniowy</h4>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-chart-1" />
                Główne
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-chart-2" />
                Wtórne
              </span>
            </div>
          </div>
          <AccountTrendChart primary={trends.primary} secondary={trends.secondary} />
        </div>
      )}
    </div>
  );
}
