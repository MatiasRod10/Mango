"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categoryEmoji } from "@/lib/utils/category";
import { formatMoney, formatPercent } from "@/lib/utils/format";
import type { CategoryPoint } from "@/lib/reports/series";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

type Props = {
  data: CategoryPoint[];
  currency: DisplayCurrency;
  title?: string;
};

// Paleta para hasta 9 segmentos. Se rotará si hay más (pero categoryCompositionForGastos limita a 8 + Otros).
const COLORS = [
  "var(--primary)",
  "#06b6d4",
  "var(--success)",
  "var(--warning)",
  "var(--destructive)",
  "var(--primary-hover)",
  "#a855f7",
  "#f97316",
  "var(--muted-foreground)",
];

export function CategoryDonutChart({
  data,
  currency,
  title = "Composición de gastos",
}: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">{title}</h3>
        <p className="py-6 text-center text-sm text-muted-foreground">
          Sin gastos cargados en el período.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category,
    value: currency === "ARS" ? d.amountArs : d.amountUsd,
    percent: d.percent,
  }));

  const total = chartData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: 12,
                }}
                formatter={(value) => [
                  formatMoney(Number(value).toString(), currency),
                  "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatMoney(total.toString(), currency)}
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 text-xs w-full">
          {chartData.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="truncate">
                  {categoryEmoji(d.name)} {d.name}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatPercent(d.percent)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
