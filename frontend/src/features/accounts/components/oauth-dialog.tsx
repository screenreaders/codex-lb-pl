import { Check, CircleAlert, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { OAuthState } from "@/features/accounts/schemas";
import { formatCountdown } from "@/utils/formatters";

type Stage = "intro" | "browser" | "device" | "success" | "error";

function getStage(state: OAuthState): Stage {
  if (state.status === "success") return "success";
  if (state.status === "error") return "error";
  if (state.method === "browser" && (state.status === "pending" || state.status === "starting")) return "browser";
  if (state.method === "device" && (state.status === "pending" || state.status === "starting")) return "device";
  return "intro";
}

function getStepLabel(stage: Stage): string {
  if (stage === "intro") return "Krok 1 z 3";
  if (stage === "browser" || stage === "device") return "Krok 2 z 3";
  if (stage === "success") return "Krok 3 z 3";
  return "Krok 2 z 3";
}

function getStageLiveMessage(stage: Stage, state: OAuthState): string {
  if (stage === "intro") return "Wybierz metodę logowania, a następnie rozpocznij autoryzację.";
  if (stage === "browser") return "Oczekiwanie na zakończenie autoryzacji w przeglądarce.";
  if (stage === "device") {
    if (state.userCode) {
      return `Wpisz kod użytkownika ${state.userCode} na stronie weryfikacyjnej i dokończ logowanie.`;
    }
    return "Otwórz link weryfikacyjny i dokończ autoryzację kodem urządzenia.";
  }
  if (stage === "success") return "Konto zostało pomyślnie dodane.";
  return state.errorMessage || "Autoryzacja nieudana.";
}

function getStageDescription(stage: Stage): string {
  if (stage === "intro") return "Wybierz metodę logowania i dokończ autoryzację.";
  if (stage === "browser") return "Otwórz stronę logowania i wróć tutaj po autoryzacji.";
  if (stage === "device") return "Wykonaj kroki weryfikacji kodem urządzenia, a następnie wróć do tego okna.";
  if (stage === "success") return "Konto jest gotowe do użycia. Możesz zamknąć okno.";
  return "Wystąpił błąd autoryzacji. Możesz spróbować ponownie albo zamknąć okno.";
}

type CopyButtonProps = {
  text: string;
  ariaLabel: string;
  onCopyFeedback: (message: string) => void;
};

function CopyButton({ text, ariaLabel, onCopyFeedback }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopyFeedback("Skopiowano do schowka.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopyFeedback("Nie udało się skopiować do schowka.");
    }
  }, [onCopyFeedback, text]);

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-7 gap-1 px-2 text-xs"
      aria-label={copied ? `${ariaLabel}. Skopiowano.` : ariaLabel}
      onClick={() => void handleCopy()}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" aria-hidden="true" />
          Skopiowano!
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" aria-hidden="true" />
          Kopiuj
        </>
      )}
    </Button>
  );
}

export type OauthDialogProps = {
  open: boolean;
  state: OAuthState;
  onOpenChange: (open: boolean) => void;
  onStart: (method?: "browser" | "device") => Promise<void>;
  onComplete: () => Promise<void>;
  onReset: () => void;
};

export function OauthDialog({
  open,
  state,
  onOpenChange,
  onStart,
  onComplete,
  onReset,
}: OauthDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<"browser" | "device">("browser");
  const stage = getStage(state);
  const methodHelpId = useId();
  const [copyFeedback, setCopyFeedback] = useState<{ id: number; message: string }>({
    id: 0,
    message: "",
  });
  const completedRef = useRef(false);
  const stageLiveMessage = open ? getStageLiveMessage(stage, state) : "";

  useEffect(() => {
    if (stage === "success" && !completedRef.current) {
      completedRef.current = true;
      void onComplete();
    }
    if (stage === "intro") {
      completedRef.current = false;
    }
  }, [stage, onComplete]);

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      onReset();
      setSelectedMethod("browser");
      setCopyFeedback({ id: 0, message: "" });
    }
  };

  const handleStart = () => {
    void onStart(selectedMethod);
  };

  const handleChangeMethod = () => {
    onReset();
  };

  const handleCopyFeedback = useCallback((scope: string, message: string) => {
    setCopyFeedback((prev) => ({
      id: prev.id + 1,
      message: `${scope}: ${message}`,
    }));
  }, [setCopyFeedback]);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <p key={stage} className="sr-only" aria-live={stage === "error" ? "assertive" : "polite"} aria-atomic="true">
          {stageLiveMessage}
        </p>
        <p key={copyFeedback.id} className="sr-only" aria-live="polite" aria-atomic="true">
          {copyFeedback.message}
        </p>
        <DialogHeader>
          <p className="text-xs font-medium text-muted-foreground">{getStepLabel(stage)}</p>
          <DialogTitle>
            {stage === "success" ? "Konto dodane" : stage === "error" ? "Autoryzacja nieudana" : "Dodaj konto przez OAuth"}
          </DialogTitle>
          <DialogDescription>{getStageDescription(stage)}</DialogDescription>
        </DialogHeader>

        {/* Intro stage */}
        {stage === "intro" ? (
          <fieldset className="space-y-2" aria-describedby={methodHelpId}>
            <legend className="text-sm font-medium">Metoda logowania</legend>
            <p id={methodHelpId} className="text-xs text-muted-foreground">
              Wybierz jedną z opcji. NVDA odczyta aktualnie zaznaczoną metodę.
            </p>

            <label
              className={cn(
                "block w-full cursor-pointer rounded-lg border p-3 text-left transition-colors focus-within:ring-2 focus-within:ring-ring/60",
                selectedMethod === "browser"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50",
              )}
            >
              <input
                type="radio"
                name="oauth-method"
                value="browser"
                className="sr-only"
                checked={selectedMethod === "browser"}
                onChange={() => setSelectedMethod("browser")}
              />
              <p className="text-sm font-medium">Przeglądarka (PKCE)</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Otwiera okno przeglądarki do logowania. Polecane dla większości użytkowników.
              </p>
            </label>

            <label
              className={cn(
                "block w-full cursor-pointer rounded-lg border p-3 text-left transition-colors focus-within:ring-2 focus-within:ring-ring/60",
                selectedMethod === "device"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50",
              )}
            >
              <input
                type="radio"
                name="oauth-method"
                value="device"
                className="sr-only"
                checked={selectedMethod === "device"}
                onChange={() => setSelectedMethod("device")}
              />
              <p className="text-sm font-medium">Kod urządzenia</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Użyj kodu na innym urządzeniu. Przydatne w środowiskach bez interfejsu.
              </p>
            </label>
          </fieldset>
        ) : null}

        {/* Browser stage */}
        {stage === "browser" ? (
          <div className="min-w-0 space-y-3 text-sm">
            {state.authorizationUrl ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">URL autoryzacji</p>
                <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="min-w-0 flex-1 truncate font-mono text-xs">{state.authorizationUrl}</p>
                  <CopyButton
                    text={state.authorizationUrl}
                    ariaLabel="Skopiuj URL autoryzacji"
                    onCopyFeedback={(message) => handleCopyFeedback("URL autoryzacji", message)}
                  />
                </div>
              </div>
            ) : null}
            <div role="status" aria-live="polite" aria-atomic="true" className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              <span>Oczekiwanie na zakończenie autoryzacji...</span>
            </div>
          </div>
        ) : null}

        {/* Device stage */}
        {stage === "device" ? (
          <div className="space-y-3 text-sm">
            <ol className="list-inside list-decimal space-y-1 text-xs text-muted-foreground">
              <li>Otwórz poniższy link weryfikacyjny</li>
              <li>Wprowadź kod użytkownika, gdy pojawi się monit</li>
              <li>Dokończ logowanie na tej stronie</li>
            </ol>

            {state.userCode ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Kod użytkownika</p>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="min-w-0 flex-1 font-mono text-lg font-bold tracking-widest">{state.userCode}</p>
                  <CopyButton
                    text={state.userCode}
                    ariaLabel="Skopiuj kod użytkownika"
                    onCopyFeedback={(message) => handleCopyFeedback("Kod użytkownika", message)}
                  />
                </div>
              </div>
            ) : null}

            {state.verificationUrl ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">URL weryfikacji</p>
                <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border bg-muted/20 px-3 py-2">
                  <p className="min-w-0 flex-1 truncate break-all font-mono text-xs">{state.verificationUrl}</p>
                  <CopyButton
                    text={state.verificationUrl}
                    ariaLabel="Skopiuj URL weryfikacji"
                    onCopyFeedback={(message) => handleCopyFeedback("URL weryfikacji", message)}
                  />
                </div>
              </div>
            ) : null}

            <div role="status" aria-live="polite" aria-atomic="true" className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              <span>
                Oczekiwanie na autoryzację
                {state.expiresInSeconds != null && state.expiresInSeconds > 0
                  ? ` · wygasa za ${formatCountdown(state.expiresInSeconds)}`
                  : "..."}
              </span>
            </div>
          </div>
        ) : null}

        {/* Success stage */}
        {stage === "success" ? (
          <div role="status" aria-live="polite" className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Konto zostało pomyślnie dodane.</p>
          </div>
        ) : null}

        {/* Error stage */}
        {stage === "error" ? (
          <div role="alert" aria-live="assertive" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{state.errorMessage || "Wystąpił nieznany błąd."}</p>
          </div>
        ) : null}

        <DialogFooter>
          {stage === "intro" ? (
            <>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Anuluj
              </Button>
              <Button type="button" onClick={handleStart}>
                Rozpocznij logowanie
              </Button>
            </>
          ) : null}

          {stage === "browser" ? (
            <>
              <Button type="button" variant="outline" onClick={handleChangeMethod}>
                Zmień metodę
              </Button>
              {state.authorizationUrl ? (
                <Button type="button" asChild>
                  <a href={state.authorizationUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Otwórz stronę logowania
                  </a>
                </Button>
              ) : null}
            </>
          ) : null}

          {stage === "device" ? (
            <>
              <Button type="button" variant="outline" onClick={handleChangeMethod}>
                Zmień metodę
              </Button>
              {state.verificationUrl ? (
                <Button type="button" asChild>
                  <a href={state.verificationUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Otwórz link
                  </a>
                </Button>
              ) : null}
            </>
          ) : null}

          {stage === "success" ? (
            <Button type="button" onClick={() => close(false)}>
              Gotowe
            </Button>
          ) : null}

          {stage === "error" ? (
            <>
              <Button type="button" variant="outline" onClick={handleChangeMethod}>
                Spróbuj ponownie
              </Button>
              <Button type="button" onClick={() => close(false)}>
                Zamknij
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
