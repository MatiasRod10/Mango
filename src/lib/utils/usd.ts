/**
 * Conversiones ARS ↔ USD usando una cotización dada.
 *
 * IMPORTANTE: trabaja con strings (lo que devuelve Postgres numeric).
 * Usa lib/utils/money.ts internamente para preservar precisión.
 */

import { divide, multiply, toMoneyString } from "./money";

type Numeric = string | number;

/**
 * ARS → USD. ars / rate.
 * Ej: arsToUsd("1000000", "1234.56") → "810.00" (string con 2 decimales)
 */
export function arsToUsd(ars: Numeric, rate: Numeric): string {
  return toMoneyString(divide(ars, rate));
}

/**
 * USD → ARS. usd * rate.
 * Ej: usdToArs("100", "1234.56") → "123456.00"
 */
export function usdToArs(usd: Numeric, rate: Numeric): string {
  return toMoneyString(multiply(usd, rate));
}

/**
 * Dada una moneda + monto, devuelve el otro lado usando la cotización.
 * Útil al cargar un movimiento donde el usuario eligió ARS o USD.
 */
export function convertAmount(
  amount: Numeric,
  fromCurrency: "ARS" | "USD",
  rate: Numeric,
): { amountArs: string; amountUsd: string } {
  if (fromCurrency === "ARS") {
    return { amountArs: toMoneyString(amount), amountUsd: arsToUsd(amount, rate) };
  }
  return { amountArs: usdToArs(amount, rate), amountUsd: toMoneyString(amount) };
}
