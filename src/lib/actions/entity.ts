"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { entities } from "@/lib/db/schema";
import { currentEntityId, requireRole } from "@/lib/auth/current";
import {
  updateEntitySchema,
  updateUsdRateConfigSchema,
  type UpdateEntityInput,
  type UpdateUsdRateConfigInput,
} from "@/lib/schemas/entity";
import { fetchUsdRate, type UsdRateType } from "@/lib/usd-rate/fetch";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function updateEntityAction(
  input: UpdateEntityInput,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
  } catch {
    return { ok: false, error: "Solo admin u owner pueden editar la entidad" };
  }

  const parsed = updateEntitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const entityId = await currentEntityId();
  await db
    .update(entities)
    .set({
      name: parsed.data.name,
      type: parsed.data.type,
      displayCurrency: parsed.data.displayCurrency,
    })
    .where(eq(entities.id, entityId));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

export async function updateUsdRateConfigAction(
  input: UpdateUsdRateConfigInput,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
  } catch {
    return { ok: false, error: "Solo admin u owner pueden cambiar la cotización" };
  }

  const parsed = updateUsdRateConfigSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const entityId = await currentEntityId();

  if (parsed.data.usdRateType === "manual") {
    // Setea el rate manual ingresado por el user
    await db
      .update(entities)
      .set({
        usdRateType: "manual",
        usdRate: parsed.data.manualRate!.toFixed(2),
        usdRateSource: "manual",
        usdRateUpdatedAt: new Date(),
      })
      .where(eq(entities.id, entityId));
  } else {
    // Cambia el tipo y fetchea desde dolarapi
    const fresh = await fetchUsdRate(parsed.data.usdRateType as UsdRateType);
    await db
      .update(entities)
      .set({
        usdRateType: parsed.data.usdRateType,
        usdRate: fresh.value,
        usdRateSource: fresh.stale ? "fallback" : "dolarapi",
        usdRateUpdatedAt: new Date(),
      })
      .where(eq(entities.id, entityId));
  }

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

/**
 * Fuerza refresh inmediato del rate (ignora el cache de 1h).
 */
export async function refreshUsdRateNowAction(): Promise<ActionResult> {
  try {
    await requireRole("member");
  } catch {
    return { ok: false, error: "Sin permisos" };
  }

  const entityId = await currentEntityId();
  const [entity] = await db
    .select()
    .from(entities)
    .where(eq(entities.id, entityId))
    .limit(1);
  if (!entity) return { ok: false, error: "Entidad no encontrada" };

  if (entity.usdRateType === "manual") {
    return {
      ok: false,
      error: "Tu cotización está en 'manual'. Cambiá el tipo a blue/oficial/MEP/CCL para usar refresh automático.",
    };
  }

  const fresh = await fetchUsdRate(entity.usdRateType as UsdRateType);
  if (fresh.stale) {
    return { ok: false, error: "No pude contactar con dolarapi. Probá en unos segundos." };
  }

  await db
    .update(entities)
    .set({
      usdRate: fresh.value,
      usdRateSource: "dolarapi",
      usdRateUpdatedAt: new Date(),
    })
    .where(eq(entities.id, entityId));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
