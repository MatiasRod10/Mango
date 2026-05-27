"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickAdd } from "@/components/shared/quick-add-provider";

export function DashboardEmptyState() {
  const { openSheet } = useQuickAdd();
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background:
            "color-mix(in oklab, var(--primary) 15%, transparent)",
          color: "var(--primary-hover)",
        }}
      >
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold">Empecemos por el primer movimiento</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cargá lo que gastaste hoy — un café, el supermercado, el alquiler. Una
        vez que tengas algunos, todo el resto de Mango cobra sentido.
      </p>
      <Button
        size="lg"
        className="mt-5"
        onClick={() => openSheet("gasto")}
      >
        Cargar primer movimiento
      </Button>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Atajo:{" "}
        <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-medium">
          N
        </kbd>
      </p>
    </div>
  );
}
