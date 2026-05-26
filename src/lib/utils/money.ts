/**
 * Aritmética segura sobre montos.
 *
 * Postgres devuelve `numeric` como string. Convertir a `number` rompe precisión
 * para montos grandes (ej: ARS de 9+ cifras + 2 decimales). Acá trabajamos en
 * "centavos" como BigInt y devolvemos string al final.
 *
 * Precisión: 2 decimales fijos (centavos). Para porcentajes y per-unit prices
 * con más decimales, usá number — esta capa es solo para montos contables.
 */

type Numeric = string | number;

const SCALE = 100n; // 2 decimales

function toCents(value: Numeric): bigint {
  if (value === null || value === undefined || value === "") return 0n;
  const s = typeof value === "number" ? String(value) : value.trim();
  const negative = s.startsWith("-");
  const abs = negative ? s.slice(1) : s;

  const [whole = "0", fracRaw = ""] = abs.split(".");
  // Tomamos solo los primeros 2 decimales, ignoramos el resto (truncamos, no redondeamos).
  const frac = (fracRaw + "00").slice(0, 2);
  const cents = BigInt(whole) * SCALE + BigInt(frac);
  return negative ? -cents : cents;
}

function fromCents(cents: bigint): string {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const whole = abs / SCALE;
  const frac = abs % SCALE;
  const fracStr = frac.toString().padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${fracStr}`;
}

/**
 * Garantiza un string con exactamente 2 decimales (forma canónica de la DB).
 */
export function toMoneyString(value: Numeric): string {
  return fromCents(toCents(value));
}

export function add(...values: Numeric[]): string {
  return fromCents(values.reduce((acc, v) => acc + toCents(v), 0n));
}

export function subtract(a: Numeric, b: Numeric): string {
  return fromCents(toCents(a) - toCents(b));
}

/**
 * Multiplicación monto × escalar (ej: 100 ARS × 12.5 = 1250 ARS).
 * El escalar puede tener hasta 8 decimales (para cotizaciones precisas).
 */
export function multiply(amount: Numeric, factor: Numeric): string {
  const FACTOR_SCALE = 100_000_000n; // 8 decimales para el factor
  const a = toCents(amount); // 2 dec
  // Parseamos el factor con hasta 8 decimales
  const fStr = typeof factor === "number" ? String(factor) : String(factor).trim();
  const negF = fStr.startsWith("-");
  const absF = negF ? fStr.slice(1) : fStr;
  const [w = "0", frRaw = ""] = absF.split(".");
  const fr = (frRaw + "00000000").slice(0, 8);
  const f = BigInt(w) * FACTOR_SCALE + BigInt(fr);
  const fSigned = negF ? -f : f;

  const product = (a * fSigned) / FACTOR_SCALE; // resultado en centavos
  return fromCents(product);
}

/**
 * División monto / escalar (ej: 1000 USD / 0.85 cotización = 1176.47 USD).
 * Truncamos al 2do decimal (no redondeamos) — convención contable conservadora.
 */
export function divide(amount: Numeric, divisor: Numeric): string {
  const FACTOR_SCALE = 100_000_000n;
  const a = toCents(amount);
  const dStr = typeof divisor === "number" ? String(divisor) : String(divisor).trim();
  const negD = dStr.startsWith("-");
  const absD = negD ? dStr.slice(1) : dStr;
  const [w = "0", frRaw = ""] = absD.split(".");
  const fr = (frRaw + "00000000").slice(0, 8);
  const d = BigInt(w) * FACTOR_SCALE + BigInt(fr);
  if (d === 0n) throw new Error("División por cero");
  const dSigned = negD ? -d : d;

  // (a en centavos) * FACTOR_SCALE / d → resultado en centavos
  const result = (a * FACTOR_SCALE) / dSigned;
  return fromCents(result);
}

export function compare(a: Numeric, b: Numeric): -1 | 0 | 1 {
  const ca = toCents(a);
  const cb = toCents(b);
  if (ca < cb) return -1;
  if (ca > cb) return 1;
  return 0;
}

export const isZero = (v: Numeric) => toCents(v) === 0n;
export const isPositive = (v: Numeric) => toCents(v) > 0n;
export const isNegative = (v: Numeric) => toCents(v) < 0n;
