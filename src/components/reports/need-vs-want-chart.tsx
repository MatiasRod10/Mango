"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMonthLabel } from "@/lib/utils/dates";
import { formatARS } from "@/lib/utils/format";
import type { PriorityPoint } from "@/lib/reports/series";

type Props = {
  data: PriorityPoint[];
};

const SERIES = [
  { key: "necesidad", label: "Necesidad", color: "var(--muted-foreground)" },
  { key: "deseo", label: "Deseo", color: "var(--warning)" },
  { key: "inversionFamiliar", label: "Inv. familiar", color: "var(--primary)" },
  { key: "reserva", label: "Reserva", color: "var(--success)" },
  { key: "operativo", label: "Operativo", color: "#06b6d4" },
  { key: "estrategico", label: "Estratégico", color: "var(--destructive)" },
  { key: "otros", label: "Sin prioridad", color: "var(--secondary)" },
] as const;

function shortMonthLabel(month: string) {
  const label = formatMonthLabel(month);
  const [m, y] = label.split(" ");
  return `${m.slice(0, 3)} ${y.slice(2)}`;
}

export function NeedVsWantChart({ data }: Props) {
  const series = data.map((p) => ({ ...p, label: shortMonthLabel(p.month) }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-1 text-sm font-semibold">Gastos por prioridad</h3>
      <p className="mb-3 text-[11px] text-muted-foreground">
        Necesidad · Deseo · Inversión familiar — mes a mes
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
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
                formatARS(Number(value).toString()),
                name,
              ]}
              labelFormatter={(_, payload) => {
                const month = payload?.[0]?.payload?.month;
                return month ? formatMonthLabel(month) : "";
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
            />
            {SERIES.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="priority"
                name={s.label}
                fill={s.color}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
