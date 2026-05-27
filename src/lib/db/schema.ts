/**
 * Schema Drizzle — traducción 1:1 de schema.sql.
 *
 * Convenciones:
 *   - TypeScript en camelCase, columnas DB en snake_case (mapeo explícito).
 *   - Montos: numeric(18, 2) → string en runtime (mode default de drizzle). NUNCA convertir a number en lógica de negocio (ver lib/utils/money.ts).
 *   - Soft delete: deleted_at nullable + filtros con isNull() en queries.
 *   - Los triggers BEFORE UPDATE para updated_at se aplican vía schema.sql en Neon (Drizzle no los gestiona).
 */

import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// =============================================================================
// ENUMS
// =============================================================================

export const entityTypeEnum = pgEnum("entity_type", [
  "family",
  "company",
  "project",
  "personal",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

export const movementTypeEnum = pgEnum("movement_type", [
  "ingreso",
  "gasto",
  "ahorro",
  "inversion",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "efectivo",
  "debito",
  "credito",
  "transferencia",
  "billetera_virtual",
  "cuenta_sueldo",
  "otro",
]);

export const priorityEnum = pgEnum("priority", [
  "necesidad",
  "deseo",
  "inversion_familiar",
  "reserva",
  "operativo",
  "estrategico",
]);

export const recurrenceEnum = pgEnum("recurrence", [
  "unico",
  "semanal",
  "mensual",
  "anual",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "paused",
  "cancelled",
]);

export const goalCategoryEnum = pgEnum("goal_category", [
  "emergencia",
  "vacaciones",
  "educacion",
  "vivienda",
  "auto",
  "inversion",
  "otro",
]);

export const assetClassEnum = pgEnum("asset_class", [
  "dolar",
  "plazo_fijo",
  "fondo_comun",
  "acciones",
  "cedear",
  "cripto",
  "bonos",
  "inmueble",
  "otro",
]);

export const investmentStatusEnum = pgEnum("investment_status", [
  "active",
  "sold",
  "paused",
]);

export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high"]);

export const budgetStatusEnum = pgEnum("budget_status", [
  "ok",
  "warning",
  "exceeded",
]);

export const usdRateTypeEnum = pgEnum("usd_rate_type", [
  "blue",
  "oficial",
  "mep",
  "ccl",
  "manual",
]);

export const themeEnum = pgEnum("theme", ["light", "dark"]);

// =============================================================================
// ENTITIES
// =============================================================================

export const entities = pgTable("entities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: entityTypeEnum("type").notNull().default("family"),
  country: text("country").notNull().default("AR"),
  baseCurrency: text("base_currency").notNull().default("ARS"),
  displayCurrency: text("display_currency").notNull().default("ARS"),

  usdRate: numeric("usd_rate", { precision: 12, scale: 2 })
    .notNull()
    .default("1000"),
  usdRateType: usdRateTypeEnum("usd_rate_type").notNull().default("blue"),
  usdRateSource: text("usd_rate_source").notNull().default("dolarapi"),
  usdRateUpdatedAt: timestamp("usd_rate_updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  theme: themeEnum("theme").notNull().default("dark"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// =============================================================================
// MEMBERSHIPS
// =============================================================================

export const memberships = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    role: memberRoleEnum("role").notNull().default("member"),
    active: boolean("active").notNull().default(true),
    invitedEmail: text("invited_email"),
    inviteToken: text("invite_token").unique(),
    inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("memberships_entity_user_unique").on(t.entityId, t.userId),
    index("idx_memberships_user")
      .on(t.userId)
      .where(sql`${t.active} = true`),
    index("idx_memberships_entity")
      .on(t.entityId)
      .where(sql`${t.active} = true`),
  ],
);

// =============================================================================
// MOVEMENTS
// =============================================================================

export const movements = pgTable(
  "movements",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    membershipId: text("membership_id").references(() => memberships.id, {
      onDelete: "set null",
    }),
    memberName: text("member_name").notNull(),

    type: movementTypeEnum("type").notNull(),
    description: text("description").notNull(),

    amountArs: numeric("amount_ars", { precision: 18, scale: 2 }).notNull(),
    amountUsd: numeric("amount_usd", { precision: 18, scale: 2 }).notNull(),
    usdRateUsed: numeric("usd_rate_used", { precision: 12, scale: 2 }).notNull(),

    date: date("date").notNull(),
    month: text("month").notNull(),

    category: text("category").notNull(),
    subcategory: text("subcategory"),
    paymentMethod: paymentMethodEnum("payment_method")
      .notNull()
      .default("efectivo"),
    priority: priorityEnum("priority"),
    recurrence: recurrenceEnum("recurrence").notNull().default("unico"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_movements_entity_date")
      .on(t.entityId, t.date.desc())
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_movements_entity_month")
      .on(t.entityId, t.month)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_movements_entity_type")
      .on(t.entityId, t.type)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_movements_category")
      .on(t.entityId, t.category)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_movements_member")
      .on(t.membershipId)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);

// =============================================================================
// SAVING GOALS
// =============================================================================

export const savingGoals = pgTable(
  "saving_goals",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    ownerMembershipId: text("owner_membership_id").references(
      () => memberships.id,
      { onDelete: "set null" },
    ),
    ownerName: text("owner_name").notNull(),

    name: text("name").notNull(),
    targetArs: numeric("target_ars", { precision: 18, scale: 2 }).notNull(),
    targetUsd: numeric("target_usd", { precision: 18, scale: 2 }).notNull(),
    savedArs: numeric("saved_ars", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),
    savedUsd: numeric("saved_usd", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),
    usdRateUsed: numeric("usd_rate_used", { precision: 12, scale: 2 }).notNull(),

    deadline: date("deadline"),
    status: goalStatusEnum("status").notNull().default("active"),
    category: goalCategoryEnum("category").notNull().default("otro"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_goals_entity")
      .on(t.entityId, t.status)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);

// =============================================================================
// INVESTMENTS
// =============================================================================

export const investments = pgTable(
  "investments",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    membershipId: text("membership_id").references(() => memberships.id, {
      onDelete: "set null",
    }),

    name: text("name").notNull(),
    ticker: text("ticker"),
    assetClass: assetClassEnum("asset_class").notNull(),
    brokerOrAccount: text("broker_or_account"),
    date: date("date").notNull(),

    investedArs: numeric("invested_ars", { precision: 18, scale: 2 }).notNull(),
    investedUsd: numeric("invested_usd", { precision: 18, scale: 2 }).notNull(),
    buyUsdSellRate: numeric("buy_usd_sell_rate", {
      precision: 12,
      scale: 2,
    }).notNull(),

    currentValueArs: numeric("current_value_ars", {
      precision: 18,
      scale: 2,
    }).notNull(),
    currentValueUsd: numeric("current_value_usd", {
      precision: 18,
      scale: 2,
    }).notNull(),
    currentUsdSellRate: numeric("current_usd_sell_rate", {
      precision: 12,
      scale: 2,
    }).notNull(),

    quantity: numeric("quantity", { precision: 18, scale: 8 }),
    averagePriceArs: numeric("average_price_ars", { precision: 18, scale: 4 }),
    currentPriceArs: numeric("current_price_ars", { precision: 18, scale: 4 }),

    /** Ratio CEDEAR override (cuántos CEDEARs = 1 acción US). Null → usar la
     * tabla local en cedear-ratios.ts. Útil cuando el ratio oficial cambia
     * y nuestra tabla está desactualizada, o cuando el broker informa otro. */
    cedearRatio: numeric("cedear_ratio", { precision: 10, scale: 4 }),

    status: investmentStatusEnum("status").notNull().default("active"),
    risk: riskLevelEnum("risk").notNull().default("medium"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_investments_entity")
      .on(t.entityId, t.status)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_investments_class")
      .on(t.entityId, t.assetClass)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);

// =============================================================================
// BUDGETS (V1.1)
// =============================================================================

export const budgets = pgTable(
  "budgets",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    month: text("month").notNull(),
    category: text("category").notNull(),
    subcategory: text("subcategory"),
    limitArs: numeric("limit_ars", { precision: 18, scale: 2 }).notNull(),
    limitUsd: numeric("limit_usd", { precision: 18, scale: 2 }).notNull(),
    status: budgetStatusEnum("status").notNull().default("ok"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("budgets_entity_month_category_unique").on(
      t.entityId,
      t.month,
      t.category,
      t.subcategory,
    ),
    index("idx_budgets_entity_month").on(t.entityId, t.month),
  ],
);

// =============================================================================
// Type helpers (usar en queries y forms)
// =============================================================================

export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
export type Movement = typeof movements.$inferSelect;
export type NewMovement = typeof movements.$inferInsert;
export type SavingGoal = typeof savingGoals.$inferSelect;
export type NewSavingGoal = typeof savingGoals.$inferInsert;
export type Investment = typeof investments.$inferSelect;
export type NewInvestment = typeof investments.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
