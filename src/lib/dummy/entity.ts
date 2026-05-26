import type { Entity, Membership } from "@/lib/db/schema";

/**
 * Familia García — entidad dummy para Sprint 1.
 * Cuando conectemos Neon, esto se reemplaza por una query real.
 */

export const DUMMY_ENTITY_ID = "ent_garcia";
export const DUMMY_USER_ID = "user_matias";

export const DUMMY_ENTITY: Entity = {
  id: DUMMY_ENTITY_ID,
  name: "Familia García",
  type: "family",
  country: "AR",
  baseCurrency: "ARS",
  displayCurrency: "ARS",
  usdRate: "1247.00",
  usdRateType: "blue",
  usdRateSource: "dolarapi",
  usdRateUpdatedAt: new Date("2026-05-26T09:30:00Z"),
  theme: "dark",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-05-26T09:30:00Z"),
  deletedAt: null,
};

export const DUMMY_MEMBERSHIPS: Membership[] = [
  {
    id: "mem_matias",
    entityId: DUMMY_ENTITY_ID,
    userId: DUMMY_USER_ID,
    name: "Matías",
    role: "owner",
    active: true,
    invitedEmail: null,
    inviteToken: null,
    inviteExpiresAt: null,
    joinedAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "mem_sofia",
    entityId: DUMMY_ENTITY_ID,
    userId: "user_sofia",
    name: "Sofía",
    role: "admin",
    active: true,
    invitedEmail: null,
    inviteToken: null,
    inviteExpiresAt: null,
    joinedAt: new Date("2026-01-05T00:00:00Z"),
    createdAt: new Date("2026-01-05T00:00:00Z"),
    updatedAt: new Date("2026-01-05T00:00:00Z"),
  },
];

export const DUMMY_CURRENT_USER = DUMMY_MEMBERSHIPS[0]; // Matías
