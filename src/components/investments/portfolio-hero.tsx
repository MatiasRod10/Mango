import { ArrowDown, ArrowUp } from "lucide-react";
import { formatMoney, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { CurrencyToggle } from "@/components/shared/currency-toggle";
import type { PortfolioStats } from "@/lib/investments/stats";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

type Props = {
  stats: PortfolioStats;
  currency: DisplayCurrency;
};

export function PortfolioHero({ stats, currency }: Props) {
  const positive = stats.profitArs >= 0;

  const value = currency === "ARS" ? stats.currentArs : stats.currentUsd;
  const profitValue = currency === "ARS" ? stats.profitArs : stats.profitUsd;
  const profitPct =
    currency === "ARS" ? stats.profitArsPct : stats.profitUsdPct;
  const otherValue = currency === "ARS" ? stats.currentUsd : stats.currentArs;
  const otherCurrency: DisplayCurrency = currency === "ARS" ? "USD" : "ARS";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6"
      style={{
        background:
          "radial-gradient(120% 80% at 80% 0%, rgba(34, 197, 94, 0.35) 0%, rgba(34, 197, 94, 0) 60%), var(--card)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Patrimonio invertido</p>
        <CurrencyToggle value={currency} />
      </div>
      <p className="text-5xl font-semibold tracking-tight tabular-nums">
        {formatMoney(value.toString(), currency)}
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
            positive
              ? "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)]"
              : "bg-[color-mix(in_oklab,var(--destructive)_15%,transparent)] text-[var(--destructive)]",
          )}
        >
          {positive ? (
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          <span className="font-medium tabular-nums">
            {positive ? "+" : ""}
            {formatMoney(profitValue.toString(), currency)} (
            {formatPercent(profitPct, { signed: true })})
          </span>
        </span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Equivale a{" "}
        <span className="text-foreground tabular-nums">
          {formatMoney(otherValue.toString(), otherCurrency)}
        </span>
      </p>
    </div>
  );
}
