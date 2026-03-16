import { useMemo } from "react";

import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccountWindowUsage } from "@/features/dashboard/components/account-card";
import type { AccountSummary } from "@/features/dashboard/schemas";
import { formatUsageDisplay } from "@/features/dashboard/utils";
import { buildDuplicateAccountIdSet, formatCompactAccountId } from "@/utils/account-identifiers";
import { normalizeStatus } from "@/utils/account-status";
import { formatQuotaResetLabel, formatSlug, formatWindowLabel } from "@/utils/formatters";

export type AccountsSummaryTableProps = {
  accounts: AccountSummary[];
  primaryUsageByAccount?: Record<string, AccountWindowUsage>;
  secondaryUsageByAccount?: Record<string, AccountWindowUsage>;
  primaryWindowMinutes?: number | null;
  secondaryWindowMinutes?: number | null;
};

export function AccountsSummaryTable({
  accounts,
  primaryUsageByAccount,
  secondaryUsageByAccount,
  primaryWindowMinutes,
  secondaryWindowMinutes,
}: AccountsSummaryTableProps) {
  const duplicateAccountIds = useMemo(() => buildDuplicateAccountIdSet(accounts), [accounts]);
  const primaryWindowLabel = formatWindowLabel("primary", primaryWindowMinutes ?? null);
  const secondaryWindowLabel = formatWindowLabel("secondary", secondaryWindowMinutes ?? null);

  return (
    <Table aria-label="Podsumowanie kont">
      <TableCaption className="text-xs text-muted-foreground">
        Okno główne: {primaryWindowLabel} · Okno wtórne: {secondaryWindowLabel}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Konto</TableHead>
          <TableHead scope="col">Plan</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Główne ({primaryWindowLabel})</TableHead>
          <TableHead scope="col">Wtórne ({secondaryWindowLabel})</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => {
          const status = normalizeStatus(account.status);
          const showAccountId = duplicateAccountIds.has(account.accountId);
          const title = account.displayName || account.email || account.accountId;
          const subtitle =
            account.displayName && account.displayName !== account.email
              ? account.email
              : null;
          const compactId = formatCompactAccountId(account.accountId);
          const planLabel = formatSlug(account.planType);
          const weeklyOnly = account.windowMinutesPrimary == null && account.windowMinutesSecondary != null;

          const primaryUsage = primaryUsageByAccount?.[account.accountId];
          const secondaryUsage = secondaryUsageByAccount?.[account.accountId];
          const primaryUsageDisplay = weeklyOnly
            ? { display: "—", srValue: "nie dotyczy" }
            : formatUsageDisplay({
                remainingCredits: primaryUsage?.remainingCredits,
                capacityCredits: primaryUsage?.capacityCredits,
                remainingPercent:
                  primaryUsage?.remainingPercentAvg ?? account.usage?.primaryRemainingPercent ?? null,
              });
          const secondaryUsageDisplay = formatUsageDisplay({
            remainingCredits: secondaryUsage?.remainingCredits,
            capacityCredits: secondaryUsage?.capacityCredits,
            remainingPercent:
              secondaryUsage?.remainingPercentAvg ?? account.usage?.secondaryRemainingPercent ?? null,
          });
          const primaryReset = weeklyOnly ? "—" : formatQuotaResetLabel(account.resetAtPrimary ?? null);
          const secondaryReset = formatQuotaResetLabel(account.resetAtSecondary ?? null);

          return (
            <TableRow key={account.accountId}>
              <TableCell className="align-top">
                <div className="min-w-0 space-y-0.5">
                  <div className="truncate text-sm font-medium">{title}</div>
                  {subtitle ? (
                    <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
                  ) : null}
                  {showAccountId ? (
                    <div className="truncate text-[11px] text-muted-foreground">ID {compactId}</div>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="align-top text-sm">{planLabel}</TableCell>
              <TableCell className="align-top">
                <StatusBadge status={status} />
              </TableCell>
              <TableCell className="align-top">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Pozostało</div>
                  <div className="font-medium tabular-nums">{primaryUsageDisplay.display}</div>
                  <div className="text-xs text-muted-foreground">Reset {primaryReset}</div>
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Pozostało</div>
                  <div className="font-medium tabular-nums">{secondaryUsageDisplay.display}</div>
                  <div className="text-xs text-muted-foreground">Reset {secondaryReset}</div>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
