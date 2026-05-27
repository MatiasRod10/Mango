"use client";

import { useState, useTransition } from "react";
import { DollarSign, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  refreshUsdRateNowAction,
  updateUsdRateConfigAction,
} from "@/lib/actions/entity";
import { formatARS } from "@/lib/utils/format";
import type { Entity } from "@/lib/db/schema";
import { ConfigSection } from "./config-section";

const TYPES = [
  { value: "blue", label: "Blue" },
  { value: "oficial", label: "Oficial" },
  { value: "mep", label: "MEP" },
  { value: "ccl", label: "CCL" },
  { value: "manual", label: "Manual" },
] as const;

type RateType = (typeof TYPES)[number]["value"];

export function UsdRateSection({
  entity,
  canEdit,
}: {
  entity: Entity;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();

  const [type, setType] = useState<RateType>(entity.usdRateType as RateType);
  const [manualRate, setManualRate] = useState<string>(entity.usdRate);

  const dirty =
    type !== entity.usdRateType ||
    (type === "manual" && manualRate !== entity.usdRate);

  const handleSave = () => {
    startTransition(async () => {
      const r = await updateUsdRateConfigAction({
        usdRateType: type,
        manualRate:
          type === "manual" ? parseFloat(manualRate) : undefined,
      });
      if (r.ok) toast.success("Cotización actualizada");
      else toast.error(r.error);
    });
  };

  const handleRefreshNow = () => {
    startRefresh(async () => {
      const r = await refreshUsdRateNowAction();
      if (r.ok) toast.success("Cotización refrescada desde dolarapi");
      else toast.error(r.error);
    });
  };

  const since = formatDistanceToNow(entity.usdRateUpdatedAt, {
    addSuffix: true,
    locale: es,
  });

  return (
    <ConfigSection
      icon={DollarSign}
      title="Cotización del dólar"
      description={`Actual: ${formatARS(entity.usdRate, { hideDecimals: true })} · actualizada ${since}`}
      action={
        canEdit && entity.usdRateType !== "manual" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshNow}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refrescar
          </Button>
        ) : null
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="usd-type">Tipo</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as RateType)}
            disabled={!canEdit || isPending}
          >
            <SelectTrigger id="usd-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            {type === "manual"
              ? "Vos seteás el valor a mano — Mango no lo va a auto-refrescar."
              : "Mango fetchea dolarapi.com automáticamente cuando el valor está stale (+1 h)."}
          </p>
        </div>

        {type === "manual" && (
          <div className="space-y-1.5">
            <Label htmlFor="usd-manual">Valor manual (ARS por 1 USD)</Label>
            <Input
              id="usd-manual"
              type="number"
              step="0.01"
              inputMode="decimal"
              className="tabular-nums"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              disabled={!canEdit || isPending}
            />
          </div>
        )}

        {canEdit ? (
          <Button
            onClick={handleSave}
            disabled={isPending || !dirty}
            size="sm"
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Solo admin u owner pueden cambiar la cotización.
          </p>
        )}
      </div>
    </ConfigSection>
  );
}
