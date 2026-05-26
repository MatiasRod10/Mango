"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuickAdd } from "@/components/shared/quick-add-provider";

const ACTIONS = [
  {
    type: "ingreso" as const,
    label: "Ingreso",
    icon: ArrowDownToLine,
    bg: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)]",
    color: "text-[var(--success)]",
  },
  {
    type: "gasto" as const,
    label: "Gasto",
    icon: ArrowUpFromLine,
    bg: "bg-[color-mix(in_oklab,var(--destructive)_15%,transparent)]",
    color: "text-[var(--destructive)]",
  },
  {
    type: "ahorro" as const,
    label: "Ahorro",
    icon: PiggyBank,
    bg: "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)]",
    color: "text-[var(--primary-hover)]",
  },
  {
    type: "inversion" as const,
    label: "Invertir",
    icon: TrendingUp,
    bg: "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)]",
    color: "text-[var(--primary-hover)]",
  },
];

export function QuickActions() {
  const { openSheet } = useQuickAdd();
  return (
    <div className="grid grid-cols-4 gap-3">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.type}
            type="button"
            onClick={() => openSheet(action.type)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card py-3 transition-colors hover:bg-secondary/50"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                action.bg,
                action.color,
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-[11px] text-muted-foreground">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
