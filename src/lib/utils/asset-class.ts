import type { Investment } from "@/lib/db/schema";

type AssetClass = Investment["assetClass"];
type RiskLevel = Investment["risk"];

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  dolar: "Dólares",
  plazo_fijo: "Plazo fijo",
  fondo_comun: "Fondo común",
  acciones: "Acciones",
  cedear: "CEDEARs",
  cripto: "Cripto",
  bonos: "Bonos",
  inmueble: "Inmueble",
  otro: "Otro",
};

export const ASSET_CLASS_EMOJI: Record<AssetClass, string> = {
  dolar: "💵",
  plazo_fijo: "🏦",
  fondo_comun: "🧺",
  acciones: "📈",
  cedear: "📈",
  cripto: "₿",
  bonos: "🏛",
  inmueble: "🏠",
  otro: "💼",
};

/** Color HEX o CSS variable para el donut + chips. */
export const ASSET_CLASS_COLOR: Record<AssetClass, string> = {
  dolar: "var(--primary)",
  plazo_fijo: "var(--warning)",
  fondo_comun: "var(--info, #06b6d4)",
  acciones: "#06b6d4",
  cedear: "#06b6d4",
  cripto: "var(--success)",
  bonos: "var(--destructive)",
  inmueble: "var(--muted-foreground)",
  otro: "var(--muted-foreground)",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

export const RISK_BADGE_CLASS: Record<RiskLevel, string> = {
  low: "bg-[color-mix(in_oklab,var(--success)_15%,transparent)] text-[var(--success)]",
  medium:
    "bg-[color-mix(in_oklab,var(--warning)_15%,transparent)] text-[var(--warning)]",
  high: "bg-[color-mix(in_oklab,var(--destructive)_15%,transparent)] text-[var(--destructive)]",
};
