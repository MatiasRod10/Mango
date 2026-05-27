import { z } from "zod";
import { entityTypeSchema } from "./entity";

export const onboardingSchema = z.object({
  entityName: z
    .string()
    .trim()
    .min(1, "Necesito un nombre")
    .max(120, "Máximo 120 caracteres"),
  entityType: entityTypeSchema,
  memberName: z
    .string()
    .trim()
    .min(1, "Necesito tu nombre")
    .max(80, "Máximo 80 caracteres"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
