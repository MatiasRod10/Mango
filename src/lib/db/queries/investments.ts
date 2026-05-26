import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { investments } from "@/lib/db/schema";
import type { Investment } from "@/lib/db/schema";

/**
 * Queries sobre investments. Filtran por entity + soft delete.
 */

export async function getInvestmentsByEntity(
  entityId: string,
): Promise<Investment[]> {
  return db
    .select()
    .from(investments)
    .where(and(eq(investments.entityId, entityId), isNull(investments.deletedAt)));
}

export async function getActiveInvestmentsByEntity(
  entityId: string,
): Promise<Investment[]> {
  return db
    .select()
    .from(investments)
    .where(
      and(
        eq(investments.entityId, entityId),
        eq(investments.status, "active"),
        isNull(investments.deletedAt),
      ),
    );
}
