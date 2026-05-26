import type { Investment } from "@/lib/db/schema";

/**
 * Helpers de cálculo sobre Investment[]. Misma lógica que después se va
 * a precalcular en SQL cuando conectemos DB.
 */

export type PortfolioStats = {
  investedArs: number;
  investedUsd: number;
  currentArs: number;
  currentUsd: number;
  profitArs: number;
  profitUsd: number;
  profitArsPct: number;
  profitUsdPct: number;
};

export function calculatePortfolioStats(
  investments: Investment[],
): PortfolioStats {
  let investedArs = 0;
  let investedUsd = 0;
  let currentArs = 0;
  let currentUsd = 0;

  for (const inv of investments) {
    if (inv.status !== "active") continue;
    investedArs += parseFloat(inv.investedArs);
    investedUsd += parseFloat(inv.investedUsd);
    currentArs += parseFloat(inv.currentValueArs);
    currentUsd += parseFloat(inv.currentValueUsd);
  }

  const profitArs = currentArs - investedArs;
  const profitUsd = currentUsd - investedUsd;

  return {
    investedArs,
    investedUsd,
    currentArs,
    currentUsd,
    profitArs,
    profitUsd,
    profitArsPct: investedArs > 0 ? (profitArs / investedArs) * 100 : 0,
    profitUsdPct: investedUsd > 0 ? (profitUsd / investedUsd) * 100 : 0,
  };
}

export type ProfitBreakdown = {
  /** Ganancia real del activo, en USD (sum de profit USD por instrumento). */
  realGainUsd: number;
  /** Ganancia real convertida a ARS al tipo de cambio actual. */
  realGainArs: number;
  /** Porcentaje de ganancia real sobre invertido en USD. */
  realGainPct: number;
  /** Parte del profit ARS que viene SOLO del movimiento del dólar. */
  currencyEffectArs: number;
  /** Variación del dólar entre el promedio ponderado de compra y el actual (%). */
  currencyEffectPct: number;
  /** Tipo de cambio usado para la descomposición. */
  currentRate: number;
  /** Promedio ponderado del tipo de cambio al momento de compra. */
  weightedBuyRate: number;
};

export function calculateProfitBreakdown(
  investments: Investment[],
  currentRate: number,
): ProfitBreakdown {
  let realGainUsd = 0;
  let investedUsd = 0;
  let profitArs = 0;
  let buyRateWeightedSum = 0;

  for (const inv of investments) {
    if (inv.status !== "active") continue;
    const invUsd = parseFloat(inv.investedUsd);
    const curUsd = parseFloat(inv.currentValueUsd);
    const invArs = parseFloat(inv.investedArs);
    const curArs = parseFloat(inv.currentValueArs);
    const buyRate = parseFloat(inv.buyUsdSellRate);

    realGainUsd += curUsd - invUsd;
    investedUsd += invUsd;
    profitArs += curArs - invArs;
    buyRateWeightedSum += invUsd * buyRate;
  }

  const realGainArs = realGainUsd * currentRate;
  const realGainPct = investedUsd > 0 ? (realGainUsd / investedUsd) * 100 : 0;
  const currencyEffectArs = profitArs - realGainArs;
  const weightedBuyRate =
    investedUsd > 0 ? buyRateWeightedSum / investedUsd : currentRate;
  const currencyEffectPct =
    weightedBuyRate > 0
      ? ((currentRate - weightedBuyRate) / weightedBuyRate) * 100
      : 0;

  return {
    realGainUsd,
    realGainArs,
    realGainPct,
    currencyEffectArs,
    currencyEffectPct,
    currentRate,
    weightedBuyRate,
  };
}

export type CompositionItem = {
  assetClass: Investment["assetClass"];
  percent: number;
  valueArs: number;
};

export function compositionByAssetClass(
  investments: Investment[],
): CompositionItem[] {
  const total = investments
    .filter((i) => i.status === "active")
    .reduce((acc, i) => acc + parseFloat(i.currentValueArs), 0);

  const map = new Map<Investment["assetClass"], number>();
  for (const inv of investments) {
    if (inv.status !== "active") continue;
    const prev = map.get(inv.assetClass) ?? 0;
    map.set(inv.assetClass, prev + parseFloat(inv.currentValueArs));
  }
  return Array.from(map.entries())
    .map(([assetClass, valueArs]) => ({
      assetClass,
      valueArs,
      percent: total > 0 ? (valueArs / total) * 100 : 0,
    }))
    .sort((a, b) => b.percent - a.percent);
}
