import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ApiKeyCreatedDialogProps = {
  open: boolean;
  apiKey: string | null;
  onOpenChange: (open: boolean) => void;
};

export function ApiKeyCreatedDialog({ open, apiKey, onOpenChange }: ApiKeyCreatedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Klucz API utworzony</DialogTitle>
          <DialogDescription>
            Skopiuj ten klucz teraz. Po zamknięciu tego okna nie będzie już wyświetlany.
          </DialogDescription>
        </DialogHeader>

        {apiKey ? (
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Klucz API</p>
            <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border bg-muted/20 px-3 py-2">
              <p className="min-w-0 flex-1 truncate font-mono text-xs">{apiKey}</p>
              <CopyButton value={apiKey} label="Kopiuj" ariaLabel="Skopiuj klucz API" />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
