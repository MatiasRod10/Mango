"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS: {
  value: "light" | "dark" | "system";
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

// Patrón React-recommended para detectar hidratación sin setState-en-effect.
// Server snapshot = false, client snapshot = true. La diferencia gatilla un
// re-render natural cuando hidratamos.
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();

  return (
    <div className="inline-flex rounded-full border border-border bg-secondary p-0.5">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = hydrated && theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
              active
                ? "bg-foreground font-medium text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
