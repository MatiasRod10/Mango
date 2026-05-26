-- =============================================================================
-- Mango — Schema Postgres (Neon)
-- =============================================================================
-- Convenciones:
--   * IDs: text (cuid2 generado en la app) o uuid. Usamos text para que combine
--     con los IDs de Neon Auth (Stack) sin tener que castear.
--   * Montos: numeric(18, 2) — siempre. Nunca usar float.
--   * Fechas de transacción: date. Timestamps de sistema: timestamptz.
--   * Soft delete: columna deleted_at nullable. Las queries deben filtrar.
--   * Multi-tenant: TODA tabla con datos del usuario tiene entity_id y se
--     debe filtrar SIEMPRE por entity_id en queries.
-- =============================================================================

-- Si necesitás resetear (CUIDADO en prod):
-- DROP TABLE IF EXISTS budgets, investments, saving_goals, movements,
--                       memberships, entities CASCADE;
-- DROP TYPE IF EXISTS entity_type, member_role, movement_type, payment_method,
--                     priority, recurrence, goal_status, goal_category,
--                     asset_class, investment_status, risk_level,
--                     budget_status, usd_rate_type, theme CASCADE;

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE entity_type      AS ENUM ('family', 'company', 'project', 'personal');
CREATE TYPE member_role      AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE movement_type    AS ENUM ('ingreso', 'gasto', 'ahorro', 'inversion');
CREATE TYPE payment_method   AS ENUM (
  'efectivo', 'debito', 'credito', 'transferencia',
  'billetera_virtual', 'cuenta_sueldo', 'otro'
);
CREATE TYPE priority         AS ENUM (
  'necesidad', 'deseo', 'inversion_familiar',
  'reserva', 'operativo', 'estrategico'
);
CREATE TYPE recurrence       AS ENUM ('unico', 'semanal', 'mensual', 'anual');
CREATE TYPE goal_status      AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE goal_category    AS ENUM (
  'emergencia', 'vacaciones', 'educacion', 'vivienda',
  'auto', 'inversion', 'otro'
);
CREATE TYPE asset_class      AS ENUM (
  'dolar', 'plazo_fijo', 'fondo_comun', 'acciones',
  'cedear', 'cripto', 'bonos', 'inmueble', 'otro'
);
CREATE TYPE investment_status AS ENUM ('active', 'sold', 'paused');
CREATE TYPE risk_level       AS ENUM ('low', 'medium', 'high');
CREATE TYPE budget_status    AS ENUM ('ok', 'warning', 'exceeded');
CREATE TYPE usd_rate_type    AS ENUM ('blue', 'oficial', 'mep', 'ccl', 'manual');
CREATE TYPE theme            AS ENUM ('light', 'dark');

-- =============================================================================
-- ENTITIES (una familia / persona / empresa)
-- =============================================================================
CREATE TABLE entities (
  id              text PRIMARY KEY,
  name            text NOT NULL,
  type            entity_type NOT NULL DEFAULT 'family',
  country         text NOT NULL DEFAULT 'AR',
  base_currency   text NOT NULL DEFAULT 'ARS',
  display_currency text NOT NULL DEFAULT 'ARS',

  -- Settings de cotización
  usd_rate            numeric(12, 2) NOT NULL DEFAULT 1000,
  usd_rate_type       usd_rate_type NOT NULL DEFAULT 'blue',
  usd_rate_source     text NOT NULL DEFAULT 'dolarapi',
  usd_rate_updated_at timestamptz NOT NULL DEFAULT now(),

  -- Settings de UI
  theme           theme NOT NULL DEFAULT 'dark',

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

-- =============================================================================
-- MEMBERSHIPS (vincula users de Neon Auth con entities)
-- =============================================================================
-- user_id corresponde al id que provee Neon Auth (Stack).
-- Como no hay foreign key directa contra tablas de Auth (están en otro schema
-- gestionado), guardamos user_id como text y validamos en la app.
CREATE TABLE memberships (
  id          text PRIMARY KEY,
  entity_id   text NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  user_id     text NOT NULL,
  name        text NOT NULL,         -- display name dentro de la entidad
  role        member_role NOT NULL DEFAULT 'member',
  active      boolean NOT NULL DEFAULT true,
  invited_email text,                -- si todavía no aceptó la invitación
  invite_token  text UNIQUE,
  invite_expires_at timestamptz,
  joined_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, user_id)
);

CREATE INDEX idx_memberships_user      ON memberships(user_id) WHERE active = true;
CREATE INDEX idx_memberships_entity    ON memberships(entity_id) WHERE active = true;

-- =============================================================================
-- MOVEMENTS (ingresos / gastos / ahorros / inversiones-cash)
-- =============================================================================
CREATE TABLE movements (
  id              text PRIMARY KEY,
  entity_id       text NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  membership_id   text REFERENCES memberships(id) ON DELETE SET NULL,
  member_name     text NOT NULL,     -- denormalizado para histórico

  type            movement_type NOT NULL,
  description     text NOT NULL,

  -- Doble moneda: SIEMPRE guardamos ambas + el tipo de cambio del momento
  amount_ars      numeric(18, 2) NOT NULL,
  amount_usd      numeric(18, 2) NOT NULL,
  usd_rate_used   numeric(12, 2) NOT NULL,

  date            date NOT NULL,
  month           text NOT NULL,     -- 'YYYY-MM' — se calcula en la app

  category        text NOT NULL,
  subcategory     text,
  payment_method  payment_method NOT NULL DEFAULT 'efectivo',
  priority        priority,
  recurrence      recurrence NOT NULL DEFAULT 'unico',
  tags            text[] NOT NULL DEFAULT '{}',
  notes           text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX idx_movements_entity_date   ON movements(entity_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_movements_entity_month  ON movements(entity_id, month) WHERE deleted_at IS NULL;
CREATE INDEX idx_movements_entity_type   ON movements(entity_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_movements_category      ON movements(entity_id, category) WHERE deleted_at IS NULL;
CREATE INDEX idx_movements_member        ON movements(membership_id) WHERE deleted_at IS NULL;

-- =============================================================================
-- SAVING GOALS (objetivos de ahorro)
-- =============================================================================
CREATE TABLE saving_goals (
  id                  text PRIMARY KEY,
  entity_id           text NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  owner_membership_id text REFERENCES memberships(id) ON DELETE SET NULL,
  owner_name          text NOT NULL,

  name                text NOT NULL,
  target_ars          numeric(18, 2) NOT NULL,
  target_usd          numeric(18, 2) NOT NULL,
  saved_ars           numeric(18, 2) NOT NULL DEFAULT 0,
  saved_usd           numeric(18, 2) NOT NULL DEFAULT 0,
  usd_rate_used       numeric(12, 2) NOT NULL,

  deadline            date,
  status              goal_status NOT NULL DEFAULT 'active',
  category            goal_category NOT NULL DEFAULT 'otro',
  notes               text,

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);

CREATE INDEX idx_goals_entity ON saving_goals(entity_id, status) WHERE deleted_at IS NULL;

-- =============================================================================
-- INVESTMENTS (instrumentos: dólares, plazo fijo, acciones, cripto, etc.)
-- =============================================================================
CREATE TABLE investments (
  id                    text PRIMARY KEY,
  entity_id             text NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  membership_id         text REFERENCES memberships(id) ON DELETE SET NULL,

  name                  text NOT NULL,
  ticker                text,
  asset_class           asset_class NOT NULL,
  broker_or_account     text,
  date                  date NOT NULL,

  -- Snapshot al momento de la compra
  invested_ars          numeric(18, 2) NOT NULL,
  invested_usd          numeric(18, 2) NOT NULL,
  buy_usd_sell_rate     numeric(12, 2) NOT NULL,

  -- Valor actual (se actualiza manualmente o por integración futura)
  current_value_ars     numeric(18, 2) NOT NULL,
  current_value_usd     numeric(18, 2) NOT NULL,
  current_usd_sell_rate numeric(12, 2) NOT NULL,

  -- Para activos con cantidad (acciones, cripto, etc.)
  quantity              numeric(18, 8),
  average_price_ars     numeric(18, 4),
  current_price_ars     numeric(18, 4),

  status                investment_status NOT NULL DEFAULT 'active',
  risk                  risk_level NOT NULL DEFAULT 'medium',
  notes                 text,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);

CREATE INDEX idx_investments_entity ON investments(entity_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_investments_class  ON investments(entity_id, asset_class) WHERE deleted_at IS NULL;

-- Nota: profit y profit_percent se calculan en la app (no se guardan):
--   profit_ars         = current_value_ars - invested_ars
--   profit_ars_percent = profit_ars / invested_ars * 100
--   (idem USD)

-- =============================================================================
-- BUDGETS (presupuestos mensuales — V1.1)
-- =============================================================================
CREATE TABLE budgets (
  id          text PRIMARY KEY,
  entity_id   text NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  month       text NOT NULL,                  -- 'YYYY-MM'
  category    text NOT NULL,
  subcategory text,
  limit_ars   numeric(18, 2) NOT NULL,
  limit_usd   numeric(18, 2) NOT NULL,
  status      budget_status NOT NULL DEFAULT 'ok',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, month, category, subcategory)
);

CREATE INDEX idx_budgets_entity_month ON budgets(entity_id, month);

-- =============================================================================
-- TRIGGERS para updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entities_updated      BEFORE UPDATE ON entities      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_memberships_updated   BEFORE UPDATE ON memberships   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_movements_updated     BEFORE UPDATE ON movements     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_saving_goals_updated  BEFORE UPDATE ON saving_goals  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_investments_updated   BEFORE UPDATE ON investments   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_budgets_updated       BEFORE UPDATE ON budgets       FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- Seed mínimo (categorías sugeridas — la app puede ofrecerlas como default)
-- =============================================================================
-- No se persisten en una tabla por ahora. Sugeridas:
--   Gastos:    Vivienda, Servicios, Supermercado, Transporte, Salud, Educación,
--              Ocio, Vestimenta, Restaurantes, Tecnología, Mascotas, Otros
--   Ingresos:  Sueldo, Freelance, Renta, Dividendos, Reintegros, Regalo, Otros
--   Ahorros:   Fondo emergencia, Vacaciones, Inversión, Vivienda, Auto, Otro
