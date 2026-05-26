import { Info } from "lucide-react";
import { formatARS, formatPercent, formatUSD } from "@/lib/utils/format";
import type { ProfitBreakdown as Breakdown } from "@/lib/investments/stats";

export function ProfitBreakdown({ data }: { data: Breakdown }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in oklab, #06b6d4 15%, transparent)",
            color: "#06b6d4",
          }}
        >
          <Info className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold">¿De dónde viene el profit?</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-3"
          style={{ background: "color-mix(in oklab, var(--secondary) 50%, var(--card))" }}
        >
          <p className="text-[11px] text-muted-foreground">
            Ganancia real (activos)
          </p>
          <p className="text-lg font-semibold tabular-nums text-[var(--success)]">
            {data.realGainUsd >= 0 ? "+ " : ""}
            {formatUSD(data.realGainUsd.toString())}
          </p>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            {formatPercent(data.realGainPct, { signed: true })} en USD
          </p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ background: "color-mix(in oklab, var(--secondary) 50%, var(--card))" }}
        >
          <p className="text-[11px] text-muted-foreground">Por cotización</p>
          <p className="text-lg font-semibold tabular-nums text-[var(--warning)]">
            {data.currencyEffectArs >= 0 ? "+ " : ""}
            {formatARS(data.currencyEffectArs.toString())}
          </p>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            dólar {formatPercent(data.currencyEffectPct, { signed: true })}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        El dólar pasó de un promedio ponderado de{" "}
        <span className="text-foreground tabular-nums">
          {formatARS(data.weightedBuyRate, { hideDecimals: true })}
        </span>{" "}
        a{" "}
        <span className="text-foreground tabular-nums">
          {formatARS(data.currentRate, { hideDecimals: true })}
        </span>
        . La parte por cotización no es ganancia real — es que tus activos USD
        valen más pesos.
      </p>
    </div>
  );
}
