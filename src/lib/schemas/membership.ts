import { z } from "zod";

export const memberRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);

export const createInvitationSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  name: z
    .string()
    .trim()
    .min(1, "Necesito un nombre")
    .max(80, "Máximo 80 caracteres"),
  role: memberRoleSchema,
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
