/**
 * Formateo de números, monedas y fechas para locale es-AR.
 *
 * Importante: estos helpers aceptan string (lo que devuelve Postgres numeric)
 * o number. Si entra string, se parsea con Number() solo para FORMATEAR.
 * NUNCA usar esto para hacer aritmética — para eso, ver lib/utils/money.ts.
 */

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type MoneyInput = string | number | null | undefined;

function toNumber(value: MoneyInput): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Formatea pesos argentinos. Ej: 1234567.89 → "$ 1.234.567,89"
 * Configurable: ocultar decimales si el monto es redondo.
 */
export function formatARS(
  value: MoneyInput,
  options: { hideDecimals?: boolean; signed?: boolean } = {},
): string {
  const n = toNumber(value);
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: options.hideDecimals ? 0 : 2,
    maximumFractionDigits: options.hideDecimals ? 0 : 2,
    signDisplay: options.signed ? "exceptZero" : "auto",
  }).format(n);
  // Intl devuelve "$" pegado al número; agregamos espacio para que respire.
  return formatted.replace(/^(\$|-\$|\+\$)/, "$1 ");
}

/**
 * Formatea dólares. Ej: 1234.56 → "US$ 1,234.56"
 */
export function formatUSD(
  value: MoneyInput,
  options: { hideDecimals?: boolean; signed?: boolean } = {},
): string {
  const n = toNumber(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options.hideDecimals ? 0 : 2,
    maximumFractionDigits: options.hideDecimals ? 0 : 2,
    signDisplay: options.signed ? "exceptZero" : "auto",
  }).format(n);
  return formatted.replace(/^\$/, "US$ ").replace(/^-\$/, "-US$ ");
}

/**
 * Atajo para formatear según la moneda activa.
 */
export function formatMoney(
  value: MoneyInput,
  currency: "ARS" | "USD",
  options?: { hideDecimals?: boolean; signed?: boolean },
): string {
  return currency === "USD"
    ? formatUSD(value, options)
    : formatARS(value, options);
}

/**
 * Porcentaje con 1 decimal y signo opcional. Ej: 12.34 → "12,3%"
 */
export function formatPercent(
  value: MoneyInput,
  options: { signed?: boolean } = {},
): string {
  const n = toNumber(value);
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: options.signed ? "exceptZero" : "auto",
  }).format(n / 100);
}

/**
 * Fecha en formato DD/MM/YYYY. Acepta Date, string ISO o string YYYY-MM-DD.
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return format(d, "dd/MM/yyyy");
}

/**
 * Fecha + hora. Ej: "26/05/2026 14:32"
 */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return format(d, "dd/MM/yyyy HH:mm");
}

/**
 * Fecha relativa, p.ej. "hace 3 días". Para el dashboard.
 */
export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

/**
 * Convierte una fecha a 'YYYY-MM' para indexar movimientos.
 * Importante: usa la fecha local del input, no UTC, para no caer en bugs de TZ.
 */
export function toMonthKey(value: Date | string): string {
  const d = typeof value === "string" ? parseISO(value) : value;
  return format(d, "yyyy-MM");
}
