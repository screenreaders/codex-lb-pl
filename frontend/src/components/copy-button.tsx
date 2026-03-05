import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export type CopyButtonProps = {
  value: string;
  label?: string;
  ariaLabel?: string;
};

export function CopyButton({ value, label = "Kopiuj", ariaLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Skopiowano do schowka");
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Nie udało się skopiować");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={copied ? `${ariaLabel ?? label}. Skopiowano.` : ariaLabel ?? label}
    >
      {copied ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : <Copy className="mr-2 h-4 w-4" aria-hidden="true" />}
      {copied ? "Skopiowano" : label}
    </Button>
  );
}
