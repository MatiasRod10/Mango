import type { Movement } from "@/lib/db/schema";
import { calculateMonthlyStats } from "@/lib/movements/stats";

/**
 * Series temporales para los gráficos de /reportes. Operan sobre Movement[]
 * (consumidos por funciones puras — fácil de mover a SQL si crece la data).
 */

export type MonthlyPoint = {
  month: string; // YYYY-MM
  ingresosArs: number;
  ingresosUsd: number;
  gastosArs: number;
  gastosUsd: number;
  ahorroArs: number;
  ahorroUsd: number;
  inversionArs: number;
  inversionUsd: number;
  balanceArs: number;
  balanceUsd: number;
};

export function monthlyEvolution(
  movements: Movement[],
  months: string[],
): MonthlyPoint[] {
  // Inicializo todos los meses pedidos (incluso si no hay movs, queremos el punto en 0)
  const byMonth = new Map<string, Movement[]>(months.map((m) => [m, []]));
  for (const m of movements) {
    if (byMonth.has(m.month)) byMonth.get(m.month)!.push(m);
  }
  return months
    .slice()
    .sort()
    .map((month) => {
      const stats = calculateMonthlyStats(byMonth.get(month) ?? []);
      return {
        month,
        ingresosArs: parseFloat(stats.ingresosArs),
        ingresosUsd: parseFloat(stats.ingresosUsd),
        gastosArs: parseFloat(stats.gastosArs),
        gastosUsd: parseFloat(stats.gastosUsd),
        ahorroArs: parseFloat(stats.ahorroArs),
        ahorroUsd: parseFloat(stats.ahorroUsd),
        inversionArs: parseFloat(stats.inversionArs),
        inversionUsd: parseFloat(stats.inversionUsd),
        balanceArs: parseFloat(stats.balanceArs),
        balanceUsd: parseFloat(stats.balanceUsd),
      };
    });
}

export type SavingsRatioPoint = {
  month: string;
  /** % de los ingresos que se destinó a ahorro + inversión. 0-100. */
  ratio: number;
  ingresosArs: number;
  ahorroArs: number;
  inversionArs: number;
};

export function savingsRatioByMonth(
  movements: Movement[],
  months: string[],
): SavingsRatioPoint[] {
  const evolution = monthlyEvolution(movements, months);
  return evolution.map((point) => {
    const totalSaving = point.ahorroArs + point.inversionArs;
    const ratio =
      point.ingresosArs > 0 ? (totalSaving / point.ingresosArs) * 100 : 0;
    return {
      month: point.month,
      ratio,
      ingresosArs: point.ingresosArs,
      ahorroArs: point.ahorroArs,
      inversionArs: point.inversionArs,
    };
  });
}

export type PriorityPoint = {
  month: string;
  necesidad: number;
  deseo: number;
  inversionFamiliar: number;
  reserva: number;
  operativo: number;
  estrategico: number;
  /** Gastos sin priority asignada — los agrupamos como "otros". */
  otros: number;
};

export function gastosByPriorityByMonth(
  movements: Movement[],
  months: string[],
): PriorityPoint[] {
  const byMonth = new Map<string, Movement[]>(months.map((m) => [m, []]));
  for (const m of movements) {
    if (m.type !== "gasto") continue;
    if (byMonth.has(m.month)) byMonth.get(m.month)!.push(m);
  }
  return months
    .slice()
    .sort()
    .map((month) => {
      const point: PriorityPoint = {
        month,
        necesidad: 0,
        deseo: 0,
        inversionFamiliar: 0,
        reserva: 0,
        operativo: 0,
        estrategico: 0,
        otros: 0,
      };
      for (const m of byMonth.get(month) ?? []) {
        const ars = parseFloat(m.amountArs);
        switch (m.priority) {
          case "necesidad":
            point.necesidad += ars;
            break;
          case "deseo":
            point.deseo += ars;
            break;
          case "inversion_familiar":
            point.inversionFamiliar += ars;
            break;
          case "reserva":
            point.reserva += ars;
            break;
          case "operativo":
            point.operativo += ars;
            break;
          case "estrategico":
            point.estrategico += ars;
            break;
          default:
            point.otros += ars;
        }
      }
      return point;
    });
}

export type CategoryPoint = {
  category: string;
  amountArs: number;
  amountUsd: number;
  percent: number;
};

/**
 * Composición de gastos por categoría para un set de movs (típicamente un mes).
 * Devuelve top N + "Otros" agregado si hay más.
 */
export function categoryCompositionForGastos(
  movements: Movement[],
  topN = 8,
): CategoryPoint[] {
  const map = new Map<string, { ars: number; usd: number }>();
  let totalArs = 0;
  for (const m of movements) {
    if (m.type !== "gasto") continue;
    const ars = parseFloat(m.amountArs);
    const usd = parseFloat(m.amountUsd);
    const cur = map.get(m.category) ?? { ars: 0, usd: 0 };
    cur.ars += ars;
    cur.usd += usd;
    map.set(m.category, cur);
    totalArs += ars;
  }

  const items = Array.from(map.entries())
    .map(([category, sums]) => ({
      category,
      amountArs: sums.ars,
      amountUsd: sums.usd,
      percent: totalArs > 0 ? (sums.ars / totalArs) * 100 : 0,
    }))
    .sort((a, b) => b.amountArs - a.amountArs);

  if (items.length <= topN) return items;
  const top = items.slice(0, topN);
  const restArs = items.slice(topN).reduce((acc, x) => acc + x.amountArs, 0);
  const restUsd = items.slice(topN).reduce((acc, x) => acc + x.amountUsd, 0);
  top.push({
    category: "Otros",
    amountArs: restArs,
    amountUsd: restUsd,
    percent: totalArs > 0 ? (restArs / totalArs) * 100 : 0,
  });
  return top;
}
