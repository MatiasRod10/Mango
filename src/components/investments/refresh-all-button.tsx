"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { refreshAllInvestmentPricesAction } from "@/lib/actions/market-data";

export function RefreshAllButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const r = await refreshAllInvestmentPricesAction();
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const { updated, failed, skipped } = r.data;
      if (updated > 0) {
        const detail = failed > 0 ? ` (${failed} sin pricing automático)` : "";
        toast.success(`Actualicé ${updated} ${updated === 1 ? "activo" : "activos"}${detail}`);
      } else {
        toast.info("Ninguna inversión tiene pricing automático activo", {
          description: skipped[0] ?? undefined,
        });
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      size="sm"
      variant="outline"
      disabled={isPending}
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Actualizando..." : "Actualizar"}
    </Button>
  );
}
