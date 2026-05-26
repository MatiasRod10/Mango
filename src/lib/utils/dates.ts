import {
  differenceInCalendarDays,
  format,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Movement } from "@/lib/db/schema";

/**
 * Helpers de fecha específicos para Mango.
 * Para formato puro, ver lib/utils/format.ts (formatDate, etc.).
 */

/**
 * Devuelve "Hoy" / "Ayer" / "Hace X días" / "22 may" / "22 may 2025" según
 * la antigüedad de la fecha. Para los headers de movimientos.
 */
export function formatDayLabel(date: string | Date, now: Date = new Date()): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  const diff = differenceInCalendarDays(now, d);
  if (diff > 1 && diff <= 6) return format(d, "EEEE", { locale: es });
  if (d.getFullYear() === now.getFullYear()) return format(d, "d MMM", { locale: es });
  return format(d, "d MMM yyyy", { locale: es });
}

/**
 * Etiqueta del mes "Mayo 2026" (capitalizada).
 */
export function formatMonthLabel(month: string): string {
  const d = parseISO(`${month}-01`);
  const label = format(d, "MMMM yyyy", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Agrupa movimientos por fecha (YYYY-MM-DD), descendente.
 */
export function groupMovementsByDay(
  movements: Movement[],
): { date: string; label: string; movements: Movement[] }[] {
  const groups = new Map<string, Movement[]>();
  for (const m of movements) {
    const key = m.date; // YYYY-MM-DD
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, movs]) => ({
      date,
      label: formatDayLabel(date),
      movements: movs,
    }));
}

/**
 * El mes actual en formato YYYY-MM (en TZ local del servidor).
 */
export function currentMonth(now: Date = new Date()): string {
  return format(now, "yyyy-MM");
}

/**
 * El mes anterior al dado. Ej: "2026-05" → "2026-04", "2026-01" → "2025-12".
 */
export function previousMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1); // m-1 es el mes dado, -2 es el anterior
  return format(d, "yyyy-MM");
}

/**
 * Últimos N meses (incluido el de referencia), descendente.
 * Ej: lastNMonths(3, "2026-05") → ["2026-05", "2026-04", "2026-03"].
 */
export function lastNMonths(n: number, ref: string = currentMonth()): string[] {
  const result: string[] = [];
  let cursor = ref;
  for (let i = 0; i < n; i++) {
    result.push(cursor);
    cursor = previousMonth(cursor);
  }
  return result;
}
