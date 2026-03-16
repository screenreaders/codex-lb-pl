import { Clock, ExternalLink, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { AccountSummary } from "@/features/dashboard/schemas";
import { formatCompactAccountId } from "@/utils/account-identifiers";
import {
  normalizeStatus,
  quotaBarColor,
  quotaBarTrack,
} from "@/utils/account-status";
import { STATUS_LABELS } from "@/utils/constants";
import { formatCompactNumber, formatPercentNullable, formatQuotaResetLabel } from "@/utils/formatters";

type AccountAction = "details" | "resume" | "reauth";

export type AccountCardProps = {
  account: AccountSummary;
  showAccountId?: boolean;
  primaryUsage?: AccountWindowUsage;
  secondaryUsage?: AccountWindowUsage;
  onAction?: (account: AccountSummary, action: AccountAction) => void;
};

export type AccountWindowUsage = {
  remainingCredits: number;
  capacityCredits: number;
  remainingPercentAvg: number | null;
};

function QuotaBar({
  label,
  percent,
  resetLabel,
  remainingCredits,
  capacityCredits,
}: {
  label: string;
  percent: number | null;
  resetLabel: string;
  remainingCredits?: number;
  capacityCredits?: number;
}) {
  const clamped = percent === null ? 0 : Math.max(0, Math.min(100, percent));
  const hasPercent = percent !== null;
  const percentLabel = formatPercentNullable(percent);
  const srPercent = percentLabel === "--" ? "brak danych" : percentLabel;
  const hasCapacity = typeof capacityCredits === "number" && capacityCredits > 0;
  const hasRemaining = typeof remainingCredits === "number" && remainingCredits > 0;
  const creditsLabel = hasCapacity
    ? `${formatCompactNumber(remainingCredits ?? 0)} / ${formatCompactNumber(capacityCredits)}`
    : hasRemaining
      ? `${formatCompactNumber(remainingCredits)}`
      : null;
  const displayLabel =
    creditsLabel && percentLabel !== "--" ? `${creditsLabel} (${percentLabel})` : creditsLabel ?? percentLabel;
  const srCredits =
    creditsLabel && percentLabel !== "--"
      ? `${creditsLabel} (${percentLabel})`
      : creditsLabel ?? srPercent;
  const srLabel = `${label}. Pozostało ${srCredits}. Reset ${resetLabel}.`;
  return (
    <div className="space-y-1">
      <span className="sr-only">{srLabel}</span>
      <div aria-hidden="true">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
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
            {displayLabel}
          </span>
        </div>
        <div className={cn("h-1.5 w-full overflow-hidden rounded-full", quotaBarTrack(clamped))}>
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", quotaBarColor(clamped))}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{resetLabel}</span>
        </div>
      </div>
    </div>
  );
}

export function AccountCard({
  account,
  showAccountId = false,
  primaryUsage,
  secondaryUsage,
  onAction,
}: AccountCardProps) {
  const status = normalizeStatus(account.status);
  const statusLabel = STATUS_LABELS[status] ?? status;
  const primaryRemaining = account.usage?.primaryRemainingPercent ?? null;
  const secondaryRemaining = account.usage?.secondaryRemainingPercent ?? null;
  const primaryRemainingCredits = primaryUsage?.remainingCredits;
  const primaryCapacityCredits = primaryUsage?.capacityCredits;
  const secondaryRemainingCredits = secondaryUsage?.remainingCredits;
  const secondaryCapacityCredits = secondaryUsage?.capacityCredits;
  const weeklyOnly = account.windowMinutesPrimary == null && account.windowMinutesSecondary != null;

  const primaryReset = formatQuotaResetLabel(account.resetAtPrimary ?? null);
  const secondaryReset = formatQuotaResetLabel(account.resetAtSecondary ?? null);

  const title = account.displayName || account.email;
  const compactId = formatCompactAccountId(account.accountId);
  const emailSubtitle =
    account.displayName && account.displayName !== account.email
      ? account.email
      : null;
  const heading = showAccountId && !emailSubtitle ? `${title} (${compactId})` : title;
  const subtitle = showAccountId && emailSubtitle ? `${emailSubtitle} | ID ${compactId}` : emailSubtitle;

  const quotaSummary = (label: string, percent: number | null, resetLabel: string) => {
    const percentLabel = formatPercentNullable(percent);
    const srPercent = percentLabel === "--" ? "brak danych" : percentLabel;
    return `${label}: pozostało ${srPercent}, reset ${resetLabel}.`;
  };

  const summaryParts = [heading];
  if (subtitle) summaryParts.push(subtitle);
  summaryParts.push(`Status: ${statusLabel}.`);
  if (!weeklyOnly) summaryParts.push(quotaSummary("Główne", primaryRemaining, primaryReset));
  summaryParts.push(quotaSummary("Wtórne", secondaryRemaining, secondaryReset));
  const srSummary = summaryParts.join(" ");

  return (
    <div className="card-hover rounded-xl border bg-card p-4">
      <p className="sr-only">{srSummary}</p>

      <div aria-hidden="true">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{heading}</p>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground" title={showAccountId ? `ID konta ${account.accountId}` : undefined}>
                {subtitle}
              </p>
            ) : null}
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Quota bars */}
        <div className={cn("mt-3.5 grid gap-3", weeklyOnly ? "grid-cols-1" : "grid-cols-2")}>
          {!weeklyOnly && (
            <QuotaBar
              label="Główne"
              percent={primaryRemaining}
              resetLabel={primaryReset}
              remainingCredits={primaryRemainingCredits}
              capacityCredits={primaryCapacityCredits}
            />
          )}
          <QuotaBar
            label="Wtórne"
            percent={secondaryRemaining}
            resetLabel={secondaryReset}
            remainingCredits={secondaryRemainingCredits}
            capacityCredits={secondaryCapacityCredits}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1.5 border-t pt-3">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onAction?.(account, "details")}
        >
          <ExternalLink className="h-3 w-3" />
          Szczegóły
        </Button>
        {status === "paused" && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 rounded-lg text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            onClick={() => onAction?.(account, "resume")}
          >
            <Play className="h-3 w-3" />
            Wznów
          </Button>
        )}
        {status === "deactivated" && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 rounded-lg text-xs text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            onClick={() => onAction?.(account, "reauth")}
          >
            <RotateCcw className="h-3 w-3" />
            Uwierzytelnij
          </Button>
        )}
      </div>
    </div>
  );
}
