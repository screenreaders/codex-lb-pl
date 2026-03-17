import { LayoutGrid } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DASHBOARD_ACCOUNTS_VIEW_OPTIONS,
  isDashboardAccountsView,
  useDashboardDisplayStore,
} from "@/hooks/use-dashboard-display";

export function DashboardDisplaySettings() {
  const accountsView = useDashboardDisplayStore((s) => s.accountsView);
  const setAccountsView = useDashboardDisplayStore((s) => s.setAccountsView);
  const currentOption =
    DASHBOARD_ACCOUNTS_VIEW_OPTIONS.find((option) => option.value === accountsView) ??
    DASHBOARD_ACCOUNTS_VIEW_OPTIONS[0];
  const descriptionId = "dashboard-accounts-view-description";

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <LayoutGrid className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Panel</h3>
              <p className="text-xs text-muted-foreground">Ustal co ma byc wyswietlane w panelu.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Widok kont</p>
            <p id={descriptionId} className="text-xs text-muted-foreground">
              {currentOption.description}
            </p>
          </div>
          <Select
            value={accountsView}
            onValueChange={(value) => {
              if (isDashboardAccountsView(value)) {
                setAccountsView(value);
              }
            }}
          >
            <SelectTrigger size="sm" className="w-56" aria-describedby={descriptionId}>
              <SelectValue placeholder="Widok kont" />
            </SelectTrigger>
            <SelectContent align="end">
              {DASHBOARD_ACCOUNTS_VIEW_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
