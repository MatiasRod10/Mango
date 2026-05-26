import type { Investment } from "@/lib/db/schema";
import {
  ASSET_CLASS_EMOJI,
  ASSET_CLASS_LABEL,
  RISK_BADGE_CLASS,
  RISK_LABEL,
} from "@/lib/utils/asset-class";
import { formatARS, formatDate, formatPercent, formatUSD } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Props = { investment: Investment };

export function InvestmentCard({ investment: inv }: Props) {
  const invUsd = parseFloat(inv.investedUsd);
  const curUsd = parseFloat(inv.currentValueUsd);
  const invArs = parseFloat(inv.investedArs);
  const curArs = parseFloat(inv.currentValueArs);

  // Determinar moneda de display: si invertido en USD (acciones, cripto, dólares),
  // mostramos USD. Si invertido en ARS (plazo fijo, bonos), mostramos ARS.
  const displayInUsd = ["acciones", "cedear", "cripto", "dolar", "inmueble"].includes(
    inv.assetClass,
  );
  const profitUsd = curUsd - invUsd;
  const profitArs = curArs - invArs;
  const profitPct = displayInUsd
    ? invUsd > 0 ? (profitUsd / invUsd) * 100 : 0
    : invArs > 0 ? (profitArs / invArs) * 100 : 0;

  const isOnlyCurrencyProfit = inv.assetClass === "dolar" && Math.abs(profitUsd) < 0.01;
  const profitColor = isOnlyCurrencyProfit
    ? "text-[var(--warning)]"
    : profitPct >= 0
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg",
              RISK_BADGE_CLASS[inv.risk].split(" ").filter((c) => c.startsWith("bg-")).join(" "),
            )}
            aria-hidden
          >
            {ASSET_CLASS_EMOJI[inv.assetClass]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{inv.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {inv.ticker ? `${inv.ticker} · ` : ""}
              {ASSET_CLASS_LABEL[inv.assetClass]}
              {inv.brokerOrAccount ? ` · ${inv.brokerOrAccount}` : ""}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
            RISK_BADGE_CLASS[inv.risk],
          )}
        >
          {RISK_LABEL[inv.risk]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Invertí</p>
          <p className="tabular-nums font-medium">
            {displayInUsd ? formatUSD(inv.investedUsd) : formatARS(inv.investedArs)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Vale</p>
          <p className="tabular-nums font-medium">
            {displayInUsd
              ? formatUSD(inv.currentValueUsd)
              : formatARS(inv.currentValueArs)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Profit</p>
          <p className={cn("tabular-nums font-semibold", profitColor)}>
            {formatPercent(profitPct, { signed: true })}
          </p>
        </div>
      </div>

      {inv.notes && (
        <p className="mt-2 text-[11px] text-muted-foreground">{inv.notes}</p>
      )}

      <p className="mt-2 text-[11px] text-muted-foreground tabular-nums">
        Compra {formatDate(inv.date)}
      </p>
    </div>
  );
}
