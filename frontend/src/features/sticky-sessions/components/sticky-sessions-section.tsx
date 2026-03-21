import { useMemo } from "react";
import { Pin } from "lucide-react";

import { AlertMessage } from "@/components/alert-message";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpinnerBlock } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStickySessions } from "@/features/sticky-sessions/hooks/use-sticky-sessions";
import type { StickySessionIdentifier, StickySessionKind } from "@/features/sticky-sessions/schemas";
import { useDialogState } from "@/hooks/use-dialog-state";
import { getErrorMessageOrNull } from "@/utils/errors";
import { formatTimeLong } from "@/utils/formatters";

function kindLabel(kind: StickySessionKind): string {
  switch (kind) {
    case "codex_session":
      return "Sesja Codex";
    case "sticky_thread":
      return "Stały wątek";
    case "prompt_cache":
      return "Cache promptów";
  }
}

export function StickySessionsSection() {
  const { stickySessionsQuery, deleteMutation, purgeMutation } = useStickySessions();
  const deleteDialog = useDialogState<StickySessionIdentifier>();
  const purgeDialog = useDialogState();

  const mutationError = useMemo(
    () =>
      getErrorMessageOrNull(stickySessionsQuery.error) ||
      getErrorMessageOrNull(deleteMutation.error) ||
      getErrorMessageOrNull(purgeMutation.error),
    [stickySessionsQuery.error, deleteMutation.error, purgeMutation.error],
  );

  const entries = stickySessionsQuery.data?.entries ?? [];
  const staleCount = stickySessionsQuery.data?.stalePromptCacheCount ?? 0;
  const busy = deleteMutation.isPending || purgeMutation.isPending;

  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Pin className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Sesje sticky</h3>
          <p className="text-xs text-muted-foreground">
            Przeglądaj trwałe mapowania i usuwaj przestarzałe wpisy cache promptów.
          </p>
        </div>
      </div>

      {mutationError ? <AlertMessage variant="error">{mutationError}</AlertMessage> : null}

      <div className="flex flex-col gap-3 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Widoczne wiersze</span>
            <span className="text-sm font-medium tabular-nums">{entries.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Przestarzały cache promptów</span>
            <span className="text-sm font-medium tabular-nums">{staleCount}</span>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          disabled={busy || staleCount === 0}
          onClick={() => purgeDialog.show()}
        >
          Usuń przestarzałe
        </Button>
      </div>

      {stickySessionsQuery.isLoading && !stickySessionsQuery.data ? (
        <div className="py-8">
          <SpinnerBlock />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Pin}
          title="Brak sesji sticky"
          description="Mapowania sticky pojawią się tutaj po utworzeniu przez routowane żądania."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klucz</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Konto</TableHead>
                <TableHead>Zaktualizowano</TableHead>
                <TableHead>Ważność</TableHead>
                <TableHead className="w-[96px] text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const updated = formatTimeLong(entry.updatedAt);
                const expires = entry.expiresAt ? formatTimeLong(entry.expiresAt) : null;
                return (
                  <TableRow key={`${entry.kind}:${entry.key}`}>
                    <TableCell className="max-w-[18rem] truncate font-mono text-xs" title={entry.key}>
                      {entry.key}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{kindLabel(entry.kind)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{entry.accountId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {updated.date} {updated.time}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.isStale ? (
                        <Badge variant="secondary">Przestarzałe</Badge>
                      ) : expires ? (
                        `${expires.date} ${expires.time}`
                      ) : (
                        "Trwałe"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={busy}
                        onClick={() => deleteDialog.show({ key: entry.key, kind: entry.kind })}
                      >
                        Usuń
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        title="Usuń sesję sticky"
        description={
          deleteDialog.data
            ? `Mapowanie ${kindLabel(deleteDialog.data.kind)} ${deleteDialog.data.key} przestanie przypinać przyszłe żądania.`
            : ""
        }
        confirmLabel="Usuń"
        onOpenChange={deleteDialog.onOpenChange}
        onConfirm={() => {
          if (!deleteDialog.data) {
            return;
          }
          void deleteMutation.mutateAsync(deleteDialog.data).finally(() => {
            deleteDialog.hide();
          });
        }}
      />

      <ConfirmDialog
        open={purgeDialog.open}
        title="Usuń przestarzałe mapowania cache promptów"
        description="Usunięte zostaną tylko wygasłe wpisy cache promptów. Mapowania sesji trwałych i sticky-thread pozostaną bez zmian."
        confirmLabel="Usuń"
        onOpenChange={purgeDialog.onOpenChange}
        onConfirm={() => {
          void purgeMutation.mutateAsync(true).finally(() => {
            purgeDialog.hide();
          });
        }}
      />
    </section>
  );
}
