import { ArrowDown, ArrowUp } from "lucide-react";
import { formatMoney, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { CurrencyToggle } from "@/components/shared/currency-toggle";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

type Props = {
  balanceArs: string;
  balanceUsd: string;
  changePct: number;
  currency: DisplayCurrency;
};

export function HeroBalance({
  balanceArs,
  balanceUsd,
  changePct,
  currency,
}: Props) {
  const positive = changePct >= 0;
  const primary = currency === "ARS" ? balanceArs : balanceUsd;
  const secondary = currency === "ARS" ? balanceUsd : balanceArs;
  const secondaryCurrency: DisplayCurrency =
    currency === "ARS" ? "USD" : "ARS";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 0%, rgba(123, 63, 242, 0.45) 0%, rgba(123, 63, 242, 0) 60%), var(--card)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Balance del mes</p>
        <CurrencyToggle value={currency} />
      </div>
      <p className="text-5xl font-semibold tracking-tight tabular-nums">
        {formatMoney(primary, currency)}
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
            {formatPercent(changePct, { signed: true })}
          </span>
        </span>
        <span className="text-muted-foreground">vs mes anterior</span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Equivale a{" "}
        <span className="text-foreground tabular-nums">
          {formatMoney(secondary, secondaryCurrency)}
        </span>
      </p>
    </div>
  );
}
