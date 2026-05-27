"use server";

import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { memberships, movements } from "@/lib/db/schema";
import { currentEntity, requireUser } from "@/lib/auth/current";
import {
  newMovementSchema,
  type NewMovementInput,
} from "@/lib/schemas/movement";
import { convertAmount } from "@/lib/utils/usd";
import { ensureFreshEntityRate } from "@/lib/usd-rate/sync";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function resolveMember(membershipId: string, entityId: string) {
  const [member] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.id, membershipId),
        eq(memberships.entityId, entityId),
        eq(memberships.active, true),
      ),
    )
    .limit(1);
  return member;
}

export async function insertMovementAction(
  input: NewMovementInput,
): Promise<ActionResult<{ id: string }>> {
  await requireUser();

  const parsed = newMovementSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  const member = await resolveMember(parsed.data.membershipId, entity.id);
  if (!member) return { ok: false, error: "Miembro inválido" };

  const freshRate = await ensureFreshEntityRate(entity);
  const { amountArs, amountUsd } = convertAmount(
    parsed.data.amount,
    parsed.data.currency,
    freshRate,
  );

  const id = createId();
  const month = parsed.data.date.slice(0, 7);

  await db.insert(movements).values({
    id,
    entityId: entity.id,
    membershipId: member.id,
    memberName: member.name,
    type: parsed.data.type,
    description: parsed.data.description,
    amountArs,
    amountUsd,
    usdRateUsed: freshRate,
    date: parsed.data.date,
    month,
    category: parsed.data.category,
    subcategory: parsed.data.subcategory ?? null,
    paymentMethod: parsed.data.paymentMethod,
    priority: parsed.data.priority ?? null,
    recurrence: parsed.data.recurrence,
    tags: [],
    notes: parsed.data.notes ?? null,
  });

  revalidatePath("/", "layout");
  return { ok: true, data: { id } };
}

export async function updateMovementAction(
  id: string,
  input: NewMovementInput,
): Promise<ActionResult> {
  await requireUser();

  const parsed = newMovementSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  const [existing] = await db
    .select()
    .from(movements)
    .where(and(eq(movements.id, id), eq(movements.entityId, entity.id)))
    .limit(1);
  if (!existing) return { ok: false, error: "Movimiento no encontrado" };

  const member = await resolveMember(parsed.data.membershipId, entity.id);
  if (!member) return { ok: false, error: "Miembro inválido" };

  // Recalculamos ARS/USD con la cotización actual de la entity.
  // (Si querés conservar la cotización original, usar existing.usdRateUsed en lugar de entity.usdRate.)
  const freshRate = await ensureFreshEntityRate(entity);
  const { amountArs, amountUsd } = convertAmount(
    parsed.data.amount,
    parsed.data.currency,
    freshRate,
  );

  const month = parsed.data.date.slice(0, 7);

  await db
    .update(movements)
    .set({
      membershipId: member.id,
      memberName: member.name,
      type: parsed.data.type,
      description: parsed.data.description,
      amountArs,
      amountUsd,
      usdRateUsed: freshRate,
      date: parsed.data.date,
      month,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory ?? null,
      paymentMethod: parsed.data.paymentMethod,
      priority: parsed.data.priority ?? null,
      recurrence: parsed.data.recurrence,
      notes: parsed.data.notes ?? null,
    })
    .where(eq(movements.id, id));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}

export async function deleteMovementAction(
  id: string,
): Promise<ActionResult> {
  await requireUser();
  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "No tenés entidad activa" };

  await db
    .update(movements)
    .set({ deletedAt: new Date() })
    .where(and(eq(movements.id, id), eq(movements.entityId, entity.id)));

  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
