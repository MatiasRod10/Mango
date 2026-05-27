"use server";

import { currentEntity, requireUser } from "@/lib/auth/current";
import { getAllMovementsForEntity } from "@/lib/db/queries/movements";

export type ExportResult =
  | { ok: true; csv: string; filename: string }
  | { ok: false; error: string };

function csvEscape(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportMovementsCSV(): Promise<ExportResult> {
  await requireUser();
  const entity = await currentEntity();
  if (!entity) return { ok: false, error: "Sin entidad activa" };

  const movs = await getAllMovementsForEntity(entity.id);

  const headers = [
    "Fecha",
    "Mes",
    "Tipo",
    "Descripción",
    "Categoría",
    "Subcategoría",
    "Monto ARS",
    "Monto USD",
    "Cotización usada",
    "Método de pago",
    "Prioridad",
    "Recurrencia",
    "Quién",
    "Notas",
  ];

  const rows = movs.map((m) => [
    m.date,
    m.month,
    m.type,
    m.description,
    m.category,
    m.subcategory ?? "",
    m.amountArs,
    m.amountUsd,
    m.usdRateUsed,
    m.paymentMethod,
    m.priority ?? "",
    m.recurrence,
    m.memberName,
    m.notes ?? "",
  ]);

  // BOM para que Excel detecte UTF-8 (caracteres con tilde / ñ)
  const BOM = "﻿";
  const csv =
    BOM +
    [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map((v) => csvEscape(String(v))).join(",")),
    ].join("\n");

  const today = new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    csv,
    filename: `mango-movimientos-${today}.csv`,
  };
}
