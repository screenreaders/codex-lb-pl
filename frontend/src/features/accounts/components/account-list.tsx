import { Plus, Search, Upload } from "lucide-react";
import { useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountListItem } from "@/features/accounts/components/account-list-item";
import type { AccountSummary } from "@/features/accounts/schemas";
import { buildDuplicateAccountIdSet } from "@/utils/account-identifiers";

const STATUS_FILTER_OPTIONS = ["all", "active", "paused", "rate_limited", "quota_exceeded", "deactivated"];
const STATUS_FILTER_LABELS: Record<string, string> = {
  all: "Wszystkie statusy",
  active: "Aktywne",
  paused: "Wstrzymane",
  rate_limited: "Ograniczone",
  quota_exceeded: "Przekroczony limit",
  deactivated: "Dezaktywowane",
};

export type AccountListProps = {
  accounts: AccountSummary[];
  selectedAccountId: string | null;
  onSelect: (accountId: string) => void;
  onOpenImport: () => void;
  onOpenOauth: () => void;
};

export function AccountList({
  accounts,
  selectedAccountId,
  onSelect,
  onOpenImport,
  onOpenOauth,
}: AccountListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const searchInputId = useId();
  const statusFilterId = useId();
  const resultCountId = useId();

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return accounts.filter((account) => {
      if (statusFilter !== "all" && account.status !== statusFilter) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        account.email.toLowerCase().includes(needle) ||
        account.accountId.toLowerCase().includes(needle) ||
        account.planType.toLowerCase().includes(needle)
      );
    });
  }, [accounts, search, statusFilter]);

  const duplicateAccountIds = useMemo(() => buildDuplicateAccountIdSet(accounts), [accounts]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchInputId} className="sr-only">
            Szukaj kont
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
          <Input
            id={searchInputId}
            placeholder="Szukaj kont..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <label htmlFor={statusFilterId} className="sr-only">
            Filtr statusu kont
          </label>
          <SelectTrigger
            id={statusFilterId}
            size="sm"
            className="w-32 shrink-0"
            aria-label="Filtr statusu kont"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {STATUS_FILTER_LABELS[option] ?? option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onOpenImport} className="h-8 flex-1 gap-1.5 text-xs">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Importuj
        </Button>
        <Button type="button" size="sm" onClick={onOpenOauth} className="h-8 flex-1 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Dodaj konto
        </Button>
      </div>

      <p id={resultCountId} className="sr-only" aria-live="polite" aria-atomic="true">
        {`Liczba pasujących kont: ${filtered.length}.`}
      </p>
      <div
        role="listbox"
        aria-label="Lista kont"
        aria-describedby={resultCountId}
        className="max-h-[calc(100vh-16rem)] space-y-1 overflow-y-auto p-1"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Brak pasujących kont</p>
            <p className="text-xs text-muted-foreground/70">Spróbuj zmienić filtry.</p>
          </div>
        ) : (
          filtered.map((account) => (
            <AccountListItem
              key={account.accountId}
              account={account}
              selected={account.accountId === selectedAccountId}
              showAccountId={duplicateAccountIds.has(account.accountId)}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
