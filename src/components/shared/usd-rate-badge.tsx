"use client";

import { useTransition } from "react";
import { RefreshCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { formatARS } from "@/lib/utils/format";
import { refreshUsdRate } from "@/lib/usd-rate/actions";
import { cn } from "@/lib/utils";
import type { UsdRateType } from "@/lib/usd-rate/fetch";

type Props = {
  value: string;
  type: UsdRateType;
  updatedAt: Date;
  stale: boolean;
};

const TYPE_LABEL: Record<UsdRateType, string> = {
  blue: "Blue",
  oficial: "Oficial",
  mep: "MEP",
  ccl: "CCL",
};

export function UsdRateBadge({ value, type, updatedAt, stale }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    if (isPending) return;
    startTransition(() => {
      refreshUsdRate();
    });
  };

  const since = formatDistanceToNow(updatedAt, {
    addSuffix: true,
    locale: es,
  });
  const title = stale
    ? `Dólar ${TYPE_LABEL[type]} · No pude conectar con dolarapi (mostrando valor de respaldo). Click para reintentar.`
    : `Dólar ${TYPE_LABEL[type]} · ${since}. Click para refrescar.`;

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs transition-colors hover:bg-secondary/70",
        isPending && "opacity-70",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          stale ? "bg-[var(--warning)]" : "bg-[var(--success)]",
        )}
      />
      <span className="text-muted-foreground">USD</span>
      <span className="font-medium tabular-nums">
        {formatARS(value, { hideDecimals: true })}
      </span>
      <RefreshCcw
        className={cn(
          "h-3 w-3 text-muted-foreground/60",
          isPending && "animate-spin",
        )}
      />
    </button>
  );
}
