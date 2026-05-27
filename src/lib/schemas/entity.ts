import { z } from "zod";

export const entityTypeSchema = z.enum([
  "family",
  "company",
  "project",
  "personal",
]);

export const usdRateTypeSchema = z.enum([
  "blue",
  "oficial",
  "mep",
  "ccl",
  "manual",
]);

export const updateEntitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Necesito un nombre")
    .max(120, "Máximo 120 caracteres"),
  type: entityTypeSchema,
  displayCurrency: z.enum(["ARS", "USD"]),
});

export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;

export const updateUsdRateConfigSchema = z
  .object({
    usdRateType: usdRateTypeSchema,
    /** Solo se usa cuando usdRateType === "manual". */
    manualRate: z
      .number()
      .refine((n) => Number.isFinite(n) && n > 0, "El rate debe ser > 0")
      .optional(),
  })
  .refine(
    (data) => data.usdRateType !== "manual" || data.manualRate !== undefined,
    {
      path: ["manualRate"],
      message: "Si el tipo es manual, hay que setear un valor",
    },
  );

export type UpdateUsdRateConfigInput = z.infer<
  typeof updateUsdRateConfigSchema
>;
