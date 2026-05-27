"use server";

import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { memberships } from "@/lib/db/schema";
import {
  currentEntityId,
  currentUser,
  requireRole,
} from "@/lib/auth/current";
import {
  createInvitationSchema,
  type CreateInvitationInput,
} from "@/lib/schemas/membership";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const INVITE_TTL_DAYS = 7;

export async function createInvitationAction(
  input: CreateInvitationInput,
): Promise<ActionResult<{ token: string; id: string }>> {
  try {
    await requireRole("admin");
  } catch {
    return { ok: false, error: "Solo admin u owner pueden invitar" };
  }

  const parsed = createInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const entityId = await currentEntityId();

  // Verificar si ya existe un membership/invitación con ese email
  const [existing] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.entityId, entityId),
        eq(memberships.invitedEmail, parsed.data.email),
        eq(memberships.active, true),
      ),
    )
    .limit(1);

  if (existing) {
    return {
      ok: false,
      error: "Ya existe un miembro/invitación con ese email",
    };
  }

  const id = createId();
  const token = createId();
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(memberships).values({
    id,
    entityId,
    userId: "", // se completa cuando aceptan
    name: parsed.data.name,
    role: parsed.data.role,
    active: true,
    invitedEmail: parsed.data.email,
    inviteToken: token,
    inviteExpiresAt: expiresAt,
    joinedAt: null,
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { token, id } };
}

export async function acceptInvitationAction(
  token: string,
): Promise<ActionResult<{ entityId: string }>> {
  const user = await currentUser();
  if (!user) {
    return {
      ok: false,
      error: "Necesitás estar logueado para aceptar la invitación",
    };
  }

  const [invitation] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.inviteToken, token))
    .limit(1);

  if (!invitation) {
    return { ok: false, error: "Invitación no encontrada" };
  }

  if (invitation.inviteExpiresAt && invitation.inviteExpiresAt < new Date()) {
    return { ok: false, error: "Invitación expirada. Pedile una nueva al admin." };
  }

  if (invitation.userId) {
    return { ok: false, error: "Esta invitación ya fue usada" };
  }

  await db
    .update(memberships)
    .set({
      userId: user.id,
      inviteToken: null,
      inviteExpiresAt: null,
      joinedAt: new Date(),
      name:
        invitation.name ||
        user.displayName ||
        user.primaryEmail ||
        "Sin nombre",
    })
    .where(eq(memberships.id, invitation.id));

  revalidatePath("/", "layout");
  return { ok: true, data: { entityId: invitation.entityId } };
}

export async function removeMembershipAction(
  membershipId: string,
): Promise<ActionResult> {
  try {
    await requireRole("admin");
  } catch {
    return {
      ok: false,
      error: "Solo admin u owner pueden remover miembros",
    };
  }

  const entityId = await currentEntityId();

  const [target] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.id, membershipId),
        eq(memberships.entityId, entityId),
      ),
    )
    .limit(1);

  if (!target) return { ok: false, error: "Miembro no encontrado" };

  if (target.role === "owner") {
    const owners = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.entityId, entityId),
          eq(memberships.role, "owner"),
          eq(memberships.active, true),
        ),
      );
    if (owners.length <= 1) {
      return {
        ok: false,
        error: "No podés remover el único owner de la entidad",
      };
    }
  }

  await db
    .update(memberships)
    .set({ active: false })
    .where(eq(memberships.id, membershipId));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
