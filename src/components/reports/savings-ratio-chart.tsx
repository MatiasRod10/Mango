"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMonthLabel } from "@/lib/utils/dates";
import { formatPercent } from "@/lib/utils/format";
import type { SavingsRatioPoint } from "@/lib/reports/series";

type Props = {
  data: SavingsRatioPoint[];
};

function shortMonthLabel(month: string) {
  const label = formatMonthLabel(month);
  const [m, y] = label.split(" ");
  return `${m.slice(0, 3)} ${y.slice(2)}`;
}

export function SavingsRatioChart({ data }: Props) {
  const series = data.map((p) => ({
    ...p,
    label: shortMonthLabel(p.month),
  }));
  const avg = series.length
    ? series.reduce((acc, p) => acc + p.ratio, 0) / series.length
    : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Ratio de ahorro</h3>
        <p className="text-xs tabular-nums text-muted-foreground">
          Promedio:{" "}
          <span className="font-medium text-foreground">
            {formatPercent(avg)}
          </span>
        </p>
      </div>
      <p className="mb-3 text-[11px] text-muted-foreground">
        % de ingresos destinados a ahorro + inversión por mes
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="ratio-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `${Math.round(Number(v))}%`}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                fontSize: 12,
              }}
              formatter={(value) => [formatPercent(Number(value)), "Ratio"]}
              labelFormatter={(_, payload) => {
                const month = payload?.[0]?.payload?.month;
                return month ? formatMonthLabel(month) : "";
              }}
            />
            <Area
              type="monotone"
              dataKey="ratio"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#ratio-fill)"
              dot={{ r: 3, fill: "var(--primary)" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
