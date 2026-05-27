"use server";

import { currentEntity, requireUser } from "@/lib/auth/current";
import { ensureFreshEntityRate } from "@/lib/usd-rate/sync";
import { refreshPriceForInvestment } from "@/lib/market-data";
import { getCedearRatio } from "@/lib/market-data/cedear-ratios";
import type { Investment } from "@/lib/db/schema";

type AssetClass = Investment["assetClass"];

export type PreviewInput = {
  assetClass: AssetClass;
  ticker: string;
  quantity: number;
};

export type PreviewResult =
  | {
      ok: true;
      valueUsd: number;
      valueArs: number;
      source: string;
      ratio?: number;
      usdRate: string;
    }
  | { ok: false; reason: string };

/**
 * Calcula el valor actual de una inversión *sin guardarla* — para mostrar
 * un preview en el sheet de "Nueva inversión".
 *
 * Reusa el mismo dispatcher que refreshAll, así nunca diverge la lógica
 * entre preview y refresh real.
 */
export async function previewMarketValueAction(
  input: PreviewInput,
): Promise<PreviewResult> {
  await requireUser();
  const entity = await currentEntity();
  if (!entity) return { ok: false, reason: "Sin entidad activa" };

  if (!input.ticker || !input.quantity || input.quantity <= 0) {
    return { ok: false, reason: "Faltan ticker o cantidad" };
  }

  // Investment ficticio solo para pasar al dispatcher
  const fake: Investment = {
    id: "preview",
    entityId: entity.id,
    membershipId: null,
    name: "Preview",
    ticker: input.ticker,
    assetClass: input.assetClass,
    brokerOrAccount: null,
    date: new Date().toISOString().slice(0, 10),
    investedArs: "0",
    investedUsd: "0",
    buyUsdSellRate: entity.usdRate,
    currentValueArs: "0",
    currentValueUsd: "0",
    currentUsdSellRate: entity.usdRate,
    quantity: input.quantity.toString(),
    averagePriceArs: null,
    currentPriceArs: null,
    status: "active",
    risk: "medium",
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const rate = await ensureFreshEntityRate(entity);
  const result = await refreshPriceForInvestment(fake, rate);

  if (!result.ok) return { ok: false, reason: result.reason };

  return {
    ok: true,
    valueUsd: parseFloat(result.newValueUsd),
    valueArs: parseFloat(result.newValueArs),
    source: result.source,
    ratio:
      input.assetClass === "cedear"
        ? (getCedearRatio(input.ticker) ?? undefined)
        : undefined,
    usdRate: rate,
  };
}
