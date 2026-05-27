import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { movements } from "@/lib/db/schema";
import type { Movement } from "@/lib/db/schema";

/**
 * Queries sobre movements. Todas filtran por entity_id + deleted_at IS NULL
 * (regla del CLAUDE.md). Aprovechan los índices del schema.
 */

export async function getMovementsForMonth(
  entityId: string,
  month: string,
): Promise<Movement[]> {
  return db
    .select()
    .from(movements)
    .where(
      and(
        eq(movements.entityId, entityId),
        eq(movements.month, month),
        isNull(movements.deletedAt),
      ),
    )
    .orderBy(desc(movements.date), desc(movements.createdAt));
}

export async function getLatestMovements(
  entityId: string,
  limit = 8,
): Promise<Movement[]> {
  return db
    .select()
    .from(movements)
    .where(and(eq(movements.entityId, entityId), isNull(movements.deletedAt)))
    .orderBy(desc(movements.date), desc(movements.createdAt))
    .limit(limit);
}

/**
 * Movs de varios meses en una sola query (para reportes con histórico).
 */
export async function getMovementsForMonths(
  entityId: string,
  months: string[],
): Promise<Movement[]> {
  if (months.length === 0) return [];
  return db
    .select()
    .from(movements)
    .where(
      and(
        eq(movements.entityId, entityId),
        inArray(movements.month, months),
        isNull(movements.deletedAt),
      ),
    )
    .orderBy(desc(movements.date), desc(movements.createdAt));
}

/**
 * Todos los movs de una entity (para exportar CSV).
 */
export async function getAllMovementsForEntity(
  entityId: string,
): Promise<Movement[]> {
  return db
    .select()
    .from(movements)
    .where(and(eq(movements.entityId, entityId), isNull(movements.deletedAt)))
    .orderBy(desc(movements.date), desc(movements.createdAt));
}
