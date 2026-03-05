import { Monitor, Moon, Palette, Sun } from "lucide-react";

import { useThemeStore, type ThemePreference } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Jasny", icon: Sun },
  { value: "dark", label: "Ciemny", icon: Moon },
  { value: "auto", label: "Systemowy", icon: Monitor },
];

export function AppearanceSettings() {
  const preference = useThemeStore((s) => s.preference);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Wygląd</h3>
              <p className="text-xs text-muted-foreground">Wybierz wygląd interfejsu.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Motyw</p>
            <p className="text-xs text-muted-foreground">Wybierz preferowany schemat kolorów.</p>
          </div>
          <div role="group" aria-label="Wybór motywu" className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 p-0.5">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={preference === value}
                aria-label={`Ustaw motyw: ${label}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                  preference === value
                    ? "bg-background text-foreground shadow-[var(--shadow-xs)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
