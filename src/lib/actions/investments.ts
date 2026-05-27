"use server";

import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { investments } from "@/lib/db/schema";
import { currentEntity, requireUser } from "@/lib/auth/current";
import { currentMembership } from "@/lib/auth/current";
import {
  newInvestmentSchema,
  updateInvestmentValueSchema,
  type NewInvestmentInput,
  type UpdateInvestmentValueInput,
} from "@/lib/schemas/investment";
import { convertAmount } from "@/lib/utils/usd";
import { fetchUsdRate } from "@/lib/usd-rate/fetch";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function insertInvestmentAction(
  input: NewInvestmentInput,
): Promise<ActionResult<{ id: string }>> {
  await requireUser();

  const parsed = newInvestmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const [entity, membership] = await Promise.all([
    currentEntity(),
    currentMembership(),
  ]);
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  // Cotización al momento de la compra (snapshot histórico). Usamos rate live
  // del momento que se carga la inversión, asumiendo que es ~ hoy. Si querés
  // cargar una inversión vieja con rate antiguo, hay que extender el form.
  const buyRate = entity.usdRate;
  const { amountArs: investedArs, amountUsd: investedUsd } = convertAmount(
    parsed.data.invested,
    parsed.data.investedCurrency,
    buyRate,
  );

  // Cotización actual (live).
  const liveRate = await fetchUsdRate("blue");
  const currentRate = liveRate.stale ? entity.usdRate : liveRate.value;
  const { amountArs: currentValueArs, amountUsd: currentValueUsd } =
    convertAmount(
      parsed.data.currentValue,
      parsed.data.currentValueCurrency,
      currentRate,
    );

  const id = createId();

  await db.insert(investments).values({
    id,
    entityId: entity.id,
    membershipId: membership?.id ?? null,
    name: parsed.data.name,
    ticker: parsed.data.ticker ?? null,
    assetClass: parsed.data.assetClass,
    brokerOrAccount: parsed.data.brokerOrAccount ?? null,
    date: parsed.data.date,
    investedArs,
    investedUsd,
    buyUsdSellRate: buyRate,
    currentValueArs,
    currentValueUsd,
    currentUsdSellRate: currentRate,
    quantity: parsed.data.quantity?.toString() ?? null,
    averagePriceArs: null,
    currentPriceArs: null,
    status: "active",
    risk: parsed.data.risk,
    notes: parsed.data.notes ?? null,
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { id } };
}

export async function updateInvestmentAction(
  id: string,
  input: NewInvestmentInput,
): Promise<ActionResult> {
  await requireUser();
  const parsed = newInvestmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  const [existing] = await db
    .select()
    .from(investments)
    .where(and(eq(investments.id, id), eq(investments.entityId, entity.id)))
    .limit(1);
  if (!existing) return { ok: false, error: "Inversión no encontrada" };

  // Para edit: re-calculamos con los rates "del momento" para que el snapshot
  // siga siendo coherente con lo que se cargó.
  const liveRate = await fetchUsdRate("blue");
  const currentRate = liveRate.stale ? existing.currentUsdSellRate : liveRate.value;

  const { amountArs: investedArs, amountUsd: investedUsd } = convertAmount(
    parsed.data.invested,
    parsed.data.investedCurrency,
    existing.buyUsdSellRate, // conservamos el rate histórico de compra
  );
  const { amountArs: currentValueArs, amountUsd: currentValueUsd } =
    convertAmount(
      parsed.data.currentValue,
      parsed.data.currentValueCurrency,
      currentRate,
    );

  await db
    .update(investments)
    .set({
      name: parsed.data.name,
      ticker: parsed.data.ticker ?? null,
      assetClass: parsed.data.assetClass,
      brokerOrAccount: parsed.data.brokerOrAccount ?? null,
      date: parsed.data.date,
      investedArs,
      investedUsd,
      currentValueArs,
      currentValueUsd,
      currentUsdSellRate: currentRate,
      quantity: parsed.data.quantity?.toString() ?? null,
      risk: parsed.data.risk,
      notes: parsed.data.notes ?? null,
    })
    .where(eq(investments.id, id));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

export async function updateInvestmentValueAction(
  id: string,
  input: UpdateInvestmentValueInput,
): Promise<ActionResult> {
  await requireUser();
  const parsed = updateInvestmentValueSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  const [existing] = await db
    .select()
    .from(investments)
    .where(and(eq(investments.id, id), eq(investments.entityId, entity.id)))
    .limit(1);
  if (!existing) return { ok: false, error: "Inversión no encontrada" };

  const liveRate = await fetchUsdRate("blue");
  const currentRate = liveRate.stale ? existing.currentUsdSellRate : liveRate.value;

  const { amountArs: currentValueArs, amountUsd: currentValueUsd } =
    convertAmount(
      parsed.data.currentValue,
      parsed.data.currentValueCurrency,
      currentRate,
    );

  await db
    .update(investments)
    .set({
      currentValueArs,
      currentValueUsd,
      currentUsdSellRate: currentRate,
    })
    .where(eq(investments.id, id));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

export async function markInvestmentSoldAction(
  id: string,
): Promise<ActionResult> {
  await requireUser();
  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  await db
    .update(investments)
    .set({ status: "sold" })
    .where(and(eq(investments.id, id), eq(investments.entityId, entity.id)));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

export async function deleteInvestmentAction(
  id: string,
): Promise<ActionResult> {
  await requireUser();
  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  await db
    .update(investments)
    .set({ deletedAt: new Date() })
    .where(and(eq(investments.id, id), eq(investments.entityId, entity.id)));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
