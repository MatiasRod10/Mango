import { formatMoney } from "@/lib/utils/format";
import type { MonthlyStats } from "@/lib/movements/stats";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

const ITEMS = [
  {
    label: "Ingresos",
    arsKey: "ingresosArs",
    usdKey: "ingresosUsd",
    color: "var(--success)",
  },
  {
    label: "Gastos",
    arsKey: "gastosArs",
    usdKey: "gastosUsd",
    color: "var(--destructive)",
  },
  {
    label: "Ahorro",
    arsKey: "ahorroArs",
    usdKey: "ahorroUsd",
    color: "var(--primary)",
  },
  {
    label: "Inversión",
    arsKey: "inversionArs",
    usdKey: "inversionUsd",
    color: "var(--warning)",
  },
] as const;

type Props = {
  stats: MonthlyStats;
  currency: DisplayCurrency;
};

export function StatsGrid({ stats, currency }: Props) {
  const otherCurrency: DisplayCurrency = currency === "ARS" ? "USD" : "ARS";
  return (
    <div className="grid grid-cols-2 gap-3">
      {ITEMS.map((item) => {
        const primary = currency === "ARS" ? stats[item.arsKey] : stats[item.usdKey];
        const secondary = currency === "ARS" ? stats[item.usdKey] : stats[item.arsKey];
        return (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: item.color }}
              />
              {item.label}
            </div>
            <p className="text-xl font-semibold tabular-nums">
              {formatMoney(primary, currency)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
              {formatMoney(secondary, otherCurrency)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
