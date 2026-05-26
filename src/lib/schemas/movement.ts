import { z } from "zod";

/**
 * Schema de validación para "Nuevo movimiento".
 * Se usa en el form (client) y en la API route (server) cuando conectemos DB.
 */

export const movementTypeSchema = z.enum([
  "ingreso",
  "gasto",
  "ahorro",
  "inversion",
]);

export const paymentMethodSchema = z.enum([
  "efectivo",
  "debito",
  "credito",
  "transferencia",
  "billetera_virtual",
  "cuenta_sueldo",
  "otro",
]);

export const prioritySchema = z.enum([
  "necesidad",
  "deseo",
  "inversion_familiar",
  "reserva",
  "operativo",
  "estrategico",
]);

export const recurrenceSchema = z.enum(["unico", "semanal", "mensual", "anual"]);

export const newMovementSchema = z.object({
  type: movementTypeSchema,
  description: z
    .string()
    .trim()
    .min(1, "Necesito una descripción")
    .max(120, "Máximo 120 caracteres"),
  amount: z
    .number({ message: "Poné un monto válido" })
    .refine(
      (n) => Number.isFinite(n) && n > 0,
      "El monto tiene que ser mayor a 0",
    ),
  currency: z.enum(["ARS", "USD"]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  category: z.string().trim().min(1, "Elegí una categoría"),
  subcategory: z.string().trim().optional(),
  paymentMethod: paymentMethodSchema,
  priority: prioritySchema.optional(),
  recurrence: recurrenceSchema,
  notes: z.string().trim().max(500).optional(),
  membershipId: z.string().min(1, "Elegí un miembro"),
});

export type NewMovementInput = z.infer<typeof newMovementSchema>;
