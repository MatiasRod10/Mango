import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { entities, memberships } from "@/lib/db/schema";
import type { Entity, Membership } from "@/lib/db/schema";

/**
 * Queries de entidad y miembros.
 */

export async function getEntity(id: string): Promise<Entity | undefined> {
  const rows = await db
    .select()
    .from(entities)
    .where(and(eq(entities.id, id), isNull(entities.deletedAt)))
    .limit(1);
  return rows[0];
}

export async function getMembershipsByEntity(
  entityId: string,
): Promise<Membership[]> {
  return db
    .select()
    .from(memberships)
    .where(and(eq(memberships.entityId, entityId), eq(memberships.active, true)));
}

export async function getMembershipByUserAndEntity(
  userId: string,
  entityId: string,
): Promise<Membership | undefined> {
  const rows = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.entityId, entityId),
        eq(memberships.active, true),
      ),
    )
    .limit(1);
  return rows[0];
}
