/**
 * Emoji por categoría para los íconos de movimientos.
 * Pegado con los defaults de src/lib/constants/categories.ts.
 */

const EMOJI_MAP: Record<string, string> = {
  // Ingresos
  Sueldo: "💼",
  Freelance: "💻",
  Renta: "🏘",
  Dividendos: "📊",
  Reintegros: "↩️",
  Regalo: "🎁",

  // Gastos
  Vivienda: "🏠",
  Servicios: "💡",
  Supermercado: "🛒",
  Transporte: "🚗",
  Salud: "🏥",
  Educación: "📚",
  Ocio: "🎬",
  Vestimenta: "👕",
  Restaurantes: "🍽",
  Tecnología: "💻",
  Mascotas: "🐶",

  // Ahorros
  "Fondo emergencia": "🛟",
  Vacaciones: "✈️",
  Inversión: "📈",
  Auto: "🚙",

  // Fallback
  Otros: "💵",
  Otro: "💵",
};

export function categoryEmoji(category: string): string {
  return EMOJI_MAP[category] ?? "💵";
}
