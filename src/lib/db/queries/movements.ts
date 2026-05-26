import { and, desc, eq, isNull } from "drizzle-orm";
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
