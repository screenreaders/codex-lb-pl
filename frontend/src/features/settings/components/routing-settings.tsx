import { Route } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import type { DashboardSettings, SettingsUpdateRequest } from "@/features/settings/schemas";

export type RoutingSettingsProps = {
  settings: DashboardSettings;
  busy: boolean;
  onSave: (payload: SettingsUpdateRequest) => Promise<void>;
};

export function RoutingSettings({ settings, busy, onSave }: RoutingSettingsProps) {
  const save = (patch: Partial<SettingsUpdateRequest>) =>
    void onSave({
      stickyThreadsEnabled: settings.stickyThreadsEnabled,
      preferEarlierResetAccounts: settings.preferEarlierResetAccounts,
      totpRequiredOnLogin: settings.totpRequiredOnLogin,
      apiKeyAuthEnabled: settings.apiKeyAuthEnabled,
      ...patch,
    });

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Route className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Routing</h3>
              <p className="text-xs text-muted-foreground">Kontroluj sposób rozdzielania żądań między konta.</p>
            </div>
          </div>
        </div>

        <div className="divide-y rounded-lg border">
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">Stałe przypisanie</p>
              <p className="text-xs text-muted-foreground">Utrzymuj powiązane żądania na tym samym koncie.</p>
            </div>
            <Switch
              checked={settings.stickyThreadsEnabled}
              disabled={busy}
              onCheckedChange={(checked) => save({ stickyThreadsEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">Preferuj wcześniejszy reset</p>
              <p className="text-xs text-muted-foreground">Kieruj więcej ruchu na konta z wcześniejszym resetem limitu.</p>
            </div>
            <Switch
              checked={settings.preferEarlierResetAccounts}
              disabled={busy}
              onCheckedChange={(checked) => save({ preferEarlierResetAccounts: checked })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
