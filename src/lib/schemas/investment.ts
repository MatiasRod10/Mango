import { z } from "zod";

export const assetClassSchema = z.enum([
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

export const riskLevelSchema = z.enum(["low", "medium", "high"]);

export const investmentStatusSchema = z.enum(["active", "sold", "paused"]);

export const newInvestmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Necesito un nombre")
    .max(120, "Máximo 120 caracteres"),
  ticker: z.string().trim().max(40).optional(),
  assetClass: assetClassSchema,
  brokerOrAccount: z.string().trim().max(80).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),

  invested: z
    .number({ message: "Poné un monto válido" })
    .refine(
      (n) => Number.isFinite(n) && n > 0,
      "Tiene que ser mayor a 0",
    ),
  investedCurrency: z.enum(["ARS", "USD"]),

  currentValue: z
    .number({ message: "Poné un valor actual" })
    .refine((n) => Number.isFinite(n) && n >= 0, "No puede ser negativo"),
  currentValueCurrency: z.enum(["ARS", "USD"]),

  quantity: z.number().optional(),
  /** Ratio CEDEAR override (cuántos CEDEARs argentinos = 1 acción US). Solo
   * para assetClass="cedear". Si está vacío, usamos la tabla oficial. */
  cedearRatio: z
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, "Tiene que ser mayor a 0")
    .optional(),
  risk: riskLevelSchema,
  notes: z.string().trim().max(500).optional(),
});

export type NewInvestmentInput = z.infer<typeof newInvestmentSchema>;

/**
 * Schema reducido para "actualizar valor actual" sin tocar el resto del activo.
 */
export const updateInvestmentValueSchema = z.object({
  currentValue: z
    .number({ message: "Poné un valor" })
    .refine((n) => Number.isFinite(n) && n >= 0, "No puede ser negativo"),
  currentValueCurrency: z.enum(["ARS", "USD"]),
});

export type UpdateInvestmentValueInput = z.infer<
  typeof updateInvestmentValueSchema
>;
