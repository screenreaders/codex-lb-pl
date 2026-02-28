import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertMessage } from "@/components/alert-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import {
  confirmTotpSetup,
  disableTotp,
  startTotpSetup,
} from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/hooks/use-auth";
import type { DashboardSettings, SettingsUpdateRequest } from "@/features/settings/schemas";
import { getErrorMessage } from "@/utils/errors";

const totpCodeSchema = z.object({
  code: z.string().length(6, "Wpisz 6-cyfrowy kod"),
});

type TotpCodeValues = z.infer<typeof totpCodeSchema>;
type TotpDialog = "setup" | "disable" | null;

export type TotpSettingsProps = {
  settings: DashboardSettings;
  disabled?: boolean;
  onSave: (payload: SettingsUpdateRequest) => Promise<void>;
};

export function TotpSettings({ settings, disabled = false, onSave }: TotpSettingsProps) {
  const queryClient = useQueryClient();
  const refreshSession = useAuthStore((state) => state.refreshSession);

  const [activeDialog, setActiveDialog] = useState<TotpDialog>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [setupQrDataUri, setSetupQrDataUri] = useState<string | null>(null);
  const [prefetching, setPrefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmForm = useForm<TotpCodeValues>({
    resolver: zodResolver(totpCodeSchema),
    defaultValues: { code: "" },
  });

  const disableForm = useForm<TotpCodeValues>({
    resolver: zodResolver(totpCodeSchema),
    defaultValues: { code: "" },
  });

  const lock = disabled || prefetching || confirmForm.formState.isSubmitting || disableForm.formState.isSubmitting;

  const closeDialog = () => {
    setActiveDialog(null);
    setError(null);
    setSetupSecret(null);
    setSetupQrDataUri(null);
    confirmForm.reset();
    disableForm.reset();
  };

  const handleOpenSetup = async () => {
    setActiveDialog("setup");
    setPrefetching(true);
    setError(null);
    try {
      const response = await startTotpSetup();
      setSetupSecret(response.secret);
      setSetupQrDataUri(response.qrSvgDataUri);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPrefetching(false);
    }
  };

  const handleConfirmSetup = async (values: TotpCodeValues) => {
    if (!setupSecret) return;
    setError(null);
    try {
      await confirmTotpSetup({ secret: setupSecret, code: values.code });
      await refreshSession();
      void queryClient.invalidateQueries({ queryKey: ["settings", "detail"] });
      toast.success("TOTP skonfigurowane");
      closeDialog();
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  };

  const handleDisable = async (values: TotpCodeValues) => {
    setError(null);
    try {
      await disableTotp({ code: values.code });
      await refreshSession();
      void queryClient.invalidateQueries({ queryKey: ["settings", "detail"] });
      toast.success("TOTP wyłączone");
      closeDialog();
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  };

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="space-y-3">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">TOTP</h3>
              <p className="text-xs text-muted-foreground">
                {settings.totpConfigured ? "TOTP jest skonfigurowane." : "TOTP nie jest skonfigurowane."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {settings.totpConfigured ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs text-destructive hover:text-destructive"
                disabled={lock}
                onClick={() => setActiveDialog("disable")}
              >
                Wyłącz
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs"
                disabled={lock}
                onClick={handleOpenSetup}
              >
                Włącz TOTP
              </Button>
            )}
          </div>
        </div>

        {/* Require on login toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Wymagaj TOTP przy logowaniu</p>
            <p className="text-xs text-muted-foreground">Pytaj o kod TOTP po zalogowaniu hasłem.</p>
          </div>
          <Switch
            checked={settings.totpRequiredOnLogin}
            disabled={lock}
            onCheckedChange={(checked) =>
              void onSave({
                stickyThreadsEnabled: settings.stickyThreadsEnabled,
                preferEarlierResetAccounts: settings.preferEarlierResetAccounts,
                importWithoutOverwrite: settings.importWithoutOverwrite,
                totpRequiredOnLogin: checked,
                apiKeyAuthEnabled: settings.apiKeyAuthEnabled,
              })
            }
          />
        </div>
      </div>

      {/* Setup dialog */}
      <Dialog open={activeDialog === "setup"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Włącz TOTP</DialogTitle>
            <DialogDescription>
              Zeskanuj kod QR aplikacją uwierzytelniającą, a następnie wpisz kod weryfikacyjny.
            </DialogDescription>
          </DialogHeader>
          {error ? <AlertMessage variant="error">{error}</AlertMessage> : null}

          {setupQrDataUri ? (
            <div className="flex justify-center rounded-lg border bg-card p-4 dark:bg-white/95">
              <img src={setupQrDataUri} alt="Kod QR TOTP" className="h-40 w-40" />
            </div>
          ) : null}

          {setupSecret ? (
            <p className="rounded-lg border bg-muted/30 px-3 py-2 font-mono text-xs">
              Sekret: {setupSecret}
            </p>
          ) : null}

          {setupSecret ? (
            <Form {...confirmForm}>
              <form onSubmit={confirmForm.handleSubmit(handleConfirmSetup)} className="space-y-4">
                <FormField
                  control={confirmForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center gap-2">
                      <FormLabel className="sr-only">Kod weryfikacyjny</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog} disabled={prefetching}>
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={lock}>
                    Potwierdź konfigurację
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <Dialog open={activeDialog === "disable"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Wyłącz TOTP</DialogTitle>
            <DialogDescription>Wpisz aktualny kod TOTP, aby wyłączyć uwierzytelnianie dwuetapowe.</DialogDescription>
          </DialogHeader>
          {error ? <AlertMessage variant="error">{error}</AlertMessage> : null}
          <Form {...disableForm}>
            <form onSubmit={disableForm.handleSubmit(handleDisable)} className="space-y-4">
              <FormField
                control={disableForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-2">
                    <FormLabel className="sr-only">Kod TOTP</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog} disabled={lock}>
                  Anuluj
                </Button>
                <Button type="submit" variant="destructive" disabled={lock}>
                  Wyłącz TOTP
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
