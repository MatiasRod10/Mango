import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { entities } from "@/lib/db/schema";
import { fetchUsdRate, type UsdRateType } from "./fetch";
import type { Entity } from "@/lib/db/schema";

/**
 * Si entity.usdRate está stale (>1 h), refresca de dolarapi y persiste.
 * Devuelve el rate a usar (fresco o existente).
 *
 * Respeta el tipo de cotización configurado en la entity (blue/oficial/mep/ccl).
 * Si está en "manual", no refresca — el user lo setea a mano.
 *
 * Si dolarapi falla, conserva el rate guardado (no rompe).
 */
const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hora

export async function ensureFreshEntityRate(entity: Entity): Promise<string> {
  if (entity.usdRateType === "manual") return entity.usdRate;

  const updatedAtMs = entity.usdRateUpdatedAt.getTime();
  const isStale = Date.now() - updatedAtMs > STALE_AFTER_MS;
  if (!isStale) return entity.usdRate;

  const fresh = await fetchUsdRate(entity.usdRateType as UsdRateType);
  if (fresh.stale) return entity.usdRate;

  await db
    .update(entities)
    .set({
      usdRate: fresh.value,
      usdRateUpdatedAt: new Date(),
    })
    .where(eq(entities.id, entity.id));

  return fresh.value;
}
