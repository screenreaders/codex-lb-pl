import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { AccountListItem } from "@/features/accounts/components/account-list-item";
import { AccountCard, type AccountCardProps, type AccountWindowUsage } from "@/features/dashboard/components/account-card";
import type { AccountSummary } from "@/features/dashboard/schemas";
import { buildDuplicateAccountIdSet } from "@/utils/account-identifiers";

export type AccountCardPanelProps = {
  accounts: AccountSummary[];
  primaryUsageByAccount?: Record<string, AccountWindowUsage>;
  secondaryUsageByAccount?: Record<string, AccountWindowUsage>;
  onAction?: AccountCardProps["onAction"];
};

export function AccountCardPanel({
  accounts,
  primaryUsageByAccount,
  secondaryUsageByAccount,
  onAction,
}: AccountCardPanelProps) {
  const duplicateAccountIds = useMemo(() => buildDuplicateAccountIdSet(accounts), [accounts]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    accounts[0]?.accountId ?? null,
  );

  useEffect(() => {
    if (accounts.length === 0) {
      if (selectedAccountId !== null) {
        setSelectedAccountId(null);
      }
      return;
    }
    const stillExists = selectedAccountId
      ? accounts.some((account) => account.accountId === selectedAccountId)
      : false;
    if (!stillExists) {
      setSelectedAccountId(accounts[0]?.accountId ?? null);
    }
  }, [accounts, selectedAccountId]);

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nie połączono jeszcze żadnych kont"
        description="Zaimportuj konto lub uwierzytelnij konto, aby rozpocząć."
      />
    );
  }

  const selectedAccount =
    accounts.find((account) => account.accountId === selectedAccountId) ?? accounts[0];
  const showAccountId = duplicateAccountIds.has(selectedAccount.accountId);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div
        role="listbox"
        aria-label="Menu kont"
        className="max-h-[420px] space-y-1 overflow-y-auto rounded-xl border bg-card p-2"
      >
        {accounts.map((account) => (
          <AccountListItem
            key={account.accountId}
            account={account}
            selected={account.accountId === selectedAccount.accountId}
            showAccountId={duplicateAccountIds.has(account.accountId)}
            onSelect={setSelectedAccountId}
          />
        ))}
      </div>
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wybrane konto</div>
        <AccountCard
          account={selectedAccount}
          showAccountId={showAccountId}
          primaryUsage={primaryUsageByAccount?.[selectedAccount.accountId]}
          secondaryUsage={secondaryUsageByAccount?.[selectedAccount.accountId]}
          onAction={onAction}
        />
      </div>
    </div>
  );
}
