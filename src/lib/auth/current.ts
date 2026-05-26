import { getEntity, getMembershipByUserAndEntity } from "@/lib/db/queries/entity";

/**
 * Identidad del usuario y entidad activos.
 *
 * Por ahora HARDCODEADO mientras no tengamos Stack Auth. Cuando se inicialice,
 * estos helpers van a leer de la session real:
 *   - currentUserId() → (await auth()).userId
 *   - currentEntityId() → leer la primera entity del user, o un selector si
 *     tiene varias.
 */

export const CURRENT_USER_ID = "user_matias";
export const CURRENT_ENTITY_ID = "ent_garcia";

export async function currentUserId(): Promise<string> {
  // TODO Sprint Stack Auth: const { userId } = await auth(); return userId;
  return CURRENT_USER_ID;
}

export async function currentEntityId(): Promise<string> {
  // TODO Sprint Stack Auth: derivar del user (puede tener varias entidades)
  return CURRENT_ENTITY_ID;
}

export async function currentEntity() {
  return getEntity(await currentEntityId());
}

export async function currentMembership() {
  const [userId, entityId] = await Promise.all([
    currentUserId(),
    currentEntityId(),
  ]);
  return getMembershipByUserAndEntity(userId, entityId);
}
