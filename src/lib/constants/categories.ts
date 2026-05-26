/**
 * Categorías sugeridas para movimientos. La entidad puede definir las suyas
 * propias en config; estas son los defaults que ofrece la app.
 *
 * Mantener nombres tal cual se muestran (con tildes y mayúsculas).
 */

export const EXPENSE_CATEGORIES = [
  "Vivienda",
  "Servicios",
  "Supermercado",
  "Transporte",
  "Salud",
  "Educación",
  "Ocio",
  "Vestimenta",
  "Restaurantes",
  "Tecnología",
  "Mascotas",
  "Otros",
] as const;

export const INCOME_CATEGORIES = [
  "Sueldo",
  "Freelance",
  "Renta",
  "Dividendos",
  "Reintegros",
  "Regalo",
  "Otros",
] as const;

export const SAVING_CATEGORIES = [
  "Fondo emergencia",
  "Vacaciones",
  "Inversión",
  "Vivienda",
  "Auto",
  "Otro",
] as const;

/**
 * Mapping movement_type → lista de categorías sugeridas.
 */
export const CATEGORIES_BY_TYPE = {
  ingreso: INCOME_CATEGORIES,
  gasto: EXPENSE_CATEGORIES,
  ahorro: SAVING_CATEGORIES,
  inversion: SAVING_CATEGORIES, // los movimientos tipo inversion-cash usan las mismas
} as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type SavingCategory = (typeof SAVING_CATEGORIES)[number];
