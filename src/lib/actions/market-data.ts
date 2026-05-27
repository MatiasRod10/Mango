"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { investments } from "@/lib/db/schema";
import { currentEntity, requireUser } from "@/lib/auth/current";
import { getActiveInvestmentsByEntity } from "@/lib/db/queries/investments";
import { ensureFreshEntityRate } from "@/lib/usd-rate/sync";
import { refreshPriceForInvestment } from "@/lib/market-data";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function refreshInvestmentPriceAction(
  id: string,
): Promise<ActionResult<{ refreshed: boolean; reason?: string; source?: string }>> {
  await requireUser();
  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  const [inv] = await db
    .select()
    .from(investments)
    .where(and(eq(investments.id, id), eq(investments.entityId, entity.id)))
    .limit(1);
  if (!inv) return { ok: false, error: "Inversión no encontrada" };

  const rate = await ensureFreshEntityRate(entity);
  const result = await refreshPriceForInvestment(inv, rate);

  if (!result.ok) {
    return { ok: true, data: { refreshed: false, reason: result.reason } };
  }

  await db
    .update(investments)
    .set({
      currentValueArs: result.newValueArs,
      currentValueUsd: result.newValueUsd,
      currentUsdSellRate: rate,
    })
    .where(eq(investments.id, id));

  revalidatePath("/", "layout");
  return {
    ok: true,
    data: { refreshed: true, source: result.source },
  };
}

export async function refreshAllInvestmentPricesAction(): Promise<
  ActionResult<{ updated: number; failed: number; skipped: string[] }>
> {
  await requireUser();
  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  const rate = await ensureFreshEntityRate(entity);
  const all = await getActiveInvestmentsByEntity(entity.id);

  let updated = 0;
  let failed = 0;
  const skipped: string[] = [];

  for (const inv of all) {
    const result = await refreshPriceForInvestment(inv, rate);
    if (result.ok) {
      await db
        .update(investments)
        .set({
          currentValueArs: result.newValueArs,
          currentValueUsd: result.newValueUsd,
          currentUsdSellRate: rate,
        })
        .where(eq(investments.id, inv.id));
      updated++;
    } else {
      failed++;
      skipped.push(`${inv.name}: ${result.reason}`);
    }
  }

  revalidatePath("/", "layout");
  return { ok: true, data: { updated, failed, skipped } };
}
