/**
 * Roles de miembro y comparación jerárquica.
 * Mantener en sync con el enum `member_role` de schema.sql.
 */

export const MEMBER_ROLES = ["viewer", "member", "admin", "owner"] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

const ROLE_RANK: Record<MemberRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

/**
 * ¿El role `actual` cumple con el `min` requerido?
 * Ej: hasRole("admin", "member") → true; hasRole("member", "admin") → false.
 */
export function hasRole(actual: MemberRole, min: MemberRole): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[min];
}
