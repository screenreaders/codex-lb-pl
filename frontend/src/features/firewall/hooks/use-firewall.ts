import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createFirewallIp, deleteFirewallIp, listFirewallIps } from "@/features/firewall/api";

export function useFirewall() {
  const queryClient = useQueryClient();

  const firewallQuery = useQuery({
    queryKey: ["firewall", "ips"],
    queryFn: listFirewallIps,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["firewall", "ips"] });
  };

  const createMutation = useMutation({
    mutationFn: (ipAddress: string) => createFirewallIp({ ipAddress }),
    onSuccess: () => {
      toast.success("IP dodane do zapory");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nie udało się dodać IP do zapory");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ipAddress: string) => deleteFirewallIp(ipAddress),
    onSuccess: () => {
      toast.success("IP usunięte z zapory");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Nie udało się usunąć IP z zapory");
    },
  });

  return {
    firewallQuery,
    createMutation,
    deleteMutation,
  };
}
