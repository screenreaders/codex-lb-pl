import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createApiKey,
  deleteApiKey,
  listApiKeys,
  regenerateApiKey,
  updateApiKey,
} from "@/features/api-keys/api";
import type {
  ApiKeyCreateRequest,
  ApiKeyUpdateRequest,
} from "@/features/api-keys/schemas";

export function useApiKeys() {
  const queryClient = useQueryClient();

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys", "list"],
    queryFn: listApiKeys,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["api-keys", "list"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: ApiKeyCreateRequest) => createApiKey(payload),
    onSuccess: () => {
      toast.success("Klucz API utworzony");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nie udało się utworzyć klucza API");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ keyId, payload }: { keyId: string; payload: ApiKeyUpdateRequest }) =>
      updateApiKey(keyId, payload),
    onSuccess: () => {
      toast.success("Klucz API zaktualizowany");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nie udało się zaktualizować klucza API");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (keyId: string) => deleteApiKey(keyId),
    onSuccess: () => {
      toast.success("Klucz API usunięty");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nie udało się usunąć klucza API");
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (keyId: string) => regenerateApiKey(keyId),
    onSuccess: () => {
      toast.success("Klucz API wygenerowany ponownie");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nie udało się wygenerować klucza API ponownie");
    },
  });

  return {
    apiKeysQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    regenerateMutation,
  };
}
