/**
 * Helpers de auth.
 *
 * TODO: se completa cuando inicialicemos Stack Auth (npx @stackframe/init-stack).
 * Acá van a ir:
 *   - requireUser(): toma el user de Stack o redirige a /login
 *   - requireEntityMembership(entityId, minRole): valida pertenencia + rol
 *   - hasRole(membership, minRole): comparación de roles
 */

import type { MemberRole } from "@/lib/auth/roles";
export type { MemberRole };
