import type { Movement } from "@/lib/db/schema";
import { add, subtract } from "@/lib/utils/money";

/**
 * Helpers de cálculo sobre Movement[]. Cuando conectemos DB, lo más probable
 * es mover estos cálculos a SQL (sum, group by). Por ahora corren en JS sobre
 * los dummies.
 */

export type MonthlyStats = {
  ingresosArs: string;
  ingresosUsd: string;
  gastosArs: string;
  gastosUsd: string;
  ahorroArs: string;
  ahorroUsd: string;
  inversionArs: string;
  inversionUsd: string;
  /** Balance = ingresos - gastos. Ahorro e inversión NO se restan (son alocaciones, no consumo). */
  balanceArs: string;
  balanceUsd: string;
};

export function calculateMonthlyStats(movements: Movement[]): MonthlyStats {
  let ingresosArs = "0";
  let ingresosUsd = "0";
  let gastosArs = "0";
  let gastosUsd = "0";
  let ahorroArs = "0";
  let ahorroUsd = "0";
  let inversionArs = "0";
  let inversionUsd = "0";

  for (const m of movements) {
    if (m.type === "ingreso") {
      ingresosArs = add(ingresosArs, m.amountArs);
      ingresosUsd = add(ingresosUsd, m.amountUsd);
    } else if (m.type === "gasto") {
      gastosArs = add(gastosArs, m.amountArs);
      gastosUsd = add(gastosUsd, m.amountUsd);
    } else if (m.type === "ahorro") {
      ahorroArs = add(ahorroArs, m.amountArs);
      ahorroUsd = add(ahorroUsd, m.amountUsd);
    } else if (m.type === "inversion") {
      inversionArs = add(inversionArs, m.amountArs);
      inversionUsd = add(inversionUsd, m.amountUsd);
    }
  }

  return {
    ingresosArs,
    ingresosUsd,
    gastosArs,
    gastosUsd,
    ahorroArs,
    ahorroUsd,
    inversionArs,
    inversionUsd,
    balanceArs: subtract(ingresosArs, gastosArs),
    balanceUsd: subtract(ingresosUsd, gastosUsd),
  };
}

export type CategoryStat = {
  category: string;
  amountArs: string;
  amountUsd: string;
  /** Porcentaje del total de gastos del período. 0-100. */
  percent: number;
};

export function topGastoCategories(
  movements: Movement[],
  limit = 5,
): CategoryStat[] {
  const map = new Map<string, { ars: string; usd: string }>();
  let totalArs = "0";

  for (const m of movements) {
    if (m.type !== "gasto") continue;
    const cur = map.get(m.category) ?? { ars: "0", usd: "0" };
    cur.ars = add(cur.ars, m.amountArs);
    cur.usd = add(cur.usd, m.amountUsd);
    map.set(m.category, cur);
    totalArs = add(totalArs, m.amountArs);
  }

  const total = parseFloat(totalArs);
  return Array.from(map.entries())
    .map(([category, sums]) => ({
      category,
      amountArs: sums.ars,
      amountUsd: sums.usd,
      percent: total > 0 ? (parseFloat(sums.ars) / total) * 100 : 0,
    }))
    .sort((a, b) => parseFloat(b.amountArs) - parseFloat(a.amountArs))
    .slice(0, limit);
}
