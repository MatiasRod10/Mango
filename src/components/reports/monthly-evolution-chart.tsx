"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMonthLabel } from "@/lib/utils/dates";
import { formatMoney } from "@/lib/utils/format";
import type { MonthlyPoint } from "@/lib/reports/series";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

type Props = {
  data: MonthlyPoint[];
  currency: DisplayCurrency;
};

const SERIES = [
  {
    key: "ingresos",
    label: "Ingresos",
    color: "var(--success)",
  },
  {
    key: "gastos",
    label: "Gastos",
    color: "var(--destructive)",
  },
  {
    key: "ahorro",
    label: "Ahorro",
    color: "var(--primary-hover)",
  },
  {
    key: "balance",
    label: "Balance",
    color: "#06b6d4",
  },
] as const;

function shortMonthLabel(month: string) {
  // "2026-05" → "May 26"
  const label = formatMonthLabel(month);
  const [m, y] = label.split(" ");
  return `${m.slice(0, 3)} ${y.slice(2)}`;
}

export function MonthlyEvolutionChart({ data, currency }: Props) {
  // Construyo el shape final con la moneda activa
  const series = data.map((p) => ({
    month: p.month,
    label: shortMonthLabel(p.month),
    ingresos: currency === "ARS" ? p.ingresosArs : p.ingresosUsd,
    gastos: currency === "ARS" ? p.gastosArs : p.gastosUsd,
    ahorro: currency === "ARS" ? p.ahorroArs : p.ahorroUsd,
    balance: currency === "ARS" ? p.balanceArs : p.balanceUsd,
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Evolución mensual</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series}
            margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const n = Number(v);
                if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
                return String(n);
              }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                fontSize: 12,
              }}
              formatter={(value, name) => [
                formatMoney(Number(value).toString(), currency),
                name,
              ]}
              labelFormatter={(label, payload) => {
                const month = payload?.[0]?.payload?.month;
                return month ? formatMonthLabel(month) : label;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3, fill: s.color }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
