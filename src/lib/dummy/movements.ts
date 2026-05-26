import type { Movement } from "@/lib/db/schema";
import {
  DUMMY_ENTITY_ID,
  DUMMY_MEMBERSHIPS,
} from "@/lib/dummy/entity";
import { getRateForDate } from "@/lib/dummy/usd-rate";

/**
 * Movimientos dummy. ~32 entries entre abril y mayo 2026.
 * Para no escribir cada Movement entero, definimos un Quick y lo inflamos
 * a Movement completo con la cotización del mes.
 */

type Quick = {
  id: string;
  member: "matias" | "sofia";
  type: Movement["type"];
  description: string;
  /** Monto en ARS (positivo siempre — el `type` define si entra o sale). */
  amountArs: number;
  date: string; // YYYY-MM-DD
  category: string;
  subcategory?: string | null;
  paymentMethod?: Movement["paymentMethod"];
  priority?: Movement["priority"];
  recurrence?: Movement["recurrence"];
  notes?: string;
};

const memberMap = {
  matias: { id: DUMMY_MEMBERSHIPS[0].id, name: DUMMY_MEMBERSHIPS[0].name },
  sofia: { id: DUMMY_MEMBERSHIPS[1].id, name: DUMMY_MEMBERSHIPS[1].name },
};

const QUICK: Quick[] = [
  // ============================= ABRIL 2026 =================================
  { id: "mov_apr01", member: "matias", type: "ingreso", description: "Sueldo abril", amountArs: 2350000, date: "2026-04-25", category: "Sueldo", paymentMethod: "transferencia", recurrence: "mensual" },
  { id: "mov_apr02", member: "sofia",  type: "ingreso", description: "Freelance diseño", amountArs: 850000, date: "2026-04-28", category: "Freelance", paymentMethod: "transferencia" },

  { id: "mov_apr03", member: "matias", type: "gasto",   description: "Expensas",        amountArs: 95000,  date: "2026-04-01", category: "Vivienda",     priority: "necesidad",        paymentMethod: "debito",           recurrence: "mensual" },
  { id: "mov_apr04", member: "matias", type: "gasto",   description: "Telecentro",      amountArs: 28000,  date: "2026-04-02", category: "Servicios",    priority: "necesidad",        paymentMethod: "debito",           recurrence: "mensual" },
  { id: "mov_apr05", member: "sofia",  type: "gasto",   description: "OSDE prepaga",    amountArs: 180000, date: "2026-04-03", category: "Salud",        priority: "necesidad",        paymentMethod: "debito",           recurrence: "mensual" },
  { id: "mov_apr06", member: "sofia",  type: "gasto",   description: "Colegio Mateo",   amountArs: 145000, date: "2026-04-05", category: "Educación",    priority: "necesidad",        paymentMethod: "transferencia",    recurrence: "mensual" },
  { id: "mov_apr07", member: "sofia",  type: "gasto",   description: "Coto Belgrano",   amountArs: 65000,  date: "2026-04-06", category: "Supermercado", priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_apr08", member: "matias", type: "gasto",   description: "YPF",             amountArs: 35000,  date: "2026-04-08", category: "Transporte",   priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_apr09", member: "matias", type: "gasto",   description: "Don Julio",       amountArs: 45000,  date: "2026-04-12", category: "Restaurantes", priority: "deseo",            paymentMethod: "credito" },
  { id: "mov_apr10", member: "sofia",  type: "gasto",   description: "Disco",           amountArs: 58000,  date: "2026-04-15", category: "Supermercado", priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_apr11", member: "matias", type: "gasto",   description: "Uber x2",         amountArs: 12000,  date: "2026-04-18", category: "Transporte",   priority: "necesidad",        paymentMethod: "billetera_virtual" },
  { id: "mov_apr12", member: "matias", type: "ahorro",  description: "Fondo emergencia", amountArs: 200000, date: "2026-04-20", category: "Fondo emergencia", paymentMethod: "transferencia" },
  { id: "mov_apr13", member: "sofia",  type: "gasto",   description: "Carrefour",       amountArs: 42000,  date: "2026-04-22", category: "Supermercado", priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_apr14", member: "matias", type: "gasto",   description: "La Cabrera",      amountArs: 38000,  date: "2026-04-25", category: "Restaurantes", priority: "deseo",            paymentMethod: "credito" },
  { id: "mov_apr15", member: "matias", type: "inversion", description: "Compra dólares MEP", amountArs: 1180000, date: "2026-04-28", category: "Inversión", priority: "inversion_familiar", paymentMethod: "transferencia", notes: "1000 USD a $1180" },
  { id: "mov_apr16", member: "sofia",  type: "gasto",   description: "Cine Hoyts",      amountArs: 8500,   date: "2026-04-30", category: "Ocio",         priority: "deseo",            paymentMethod: "credito" },

  // ============================= MAYO 2026 ==================================
  { id: "mov_may01", member: "matias", type: "gasto",   description: "Expensas mayo",   amountArs: 95000,  date: "2026-05-02", category: "Vivienda",     priority: "necesidad",        paymentMethod: "debito",           recurrence: "mensual" },
  { id: "mov_may02", member: "matias", type: "gasto",   description: "Telecentro",      amountArs: 28000,  date: "2026-05-03", category: "Servicios",    priority: "necesidad",        paymentMethod: "debito",           recurrence: "mensual" },
  { id: "mov_may03", member: "sofia",  type: "gasto",   description: "OSDE prepaga",    amountArs: 195000, date: "2026-05-04", category: "Salud",        priority: "necesidad",        paymentMethod: "debito",           recurrence: "mensual" },
  { id: "mov_may04", member: "sofia",  type: "gasto",   description: "Coto",            amountArs: 72000,  date: "2026-05-05", category: "Supermercado", priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_may05", member: "matias", type: "gasto",   description: "YPF",             amountArs: 38000,  date: "2026-05-08", category: "Transporte",   priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_may06", member: "sofia",  type: "gasto",   description: "Colegio Mateo",   amountArs: 145000, date: "2026-05-10", category: "Educación",    priority: "necesidad",        paymentMethod: "transferencia",    recurrence: "mensual" },
  { id: "mov_may07", member: "matias", type: "gasto",   description: "Tegui",           amountArs: 52000,  date: "2026-05-12", category: "Restaurantes", priority: "deseo",            paymentMethod: "credito" },
  { id: "mov_may08", member: "sofia",  type: "gasto",   description: "Disco",           amountArs: 48000,  date: "2026-05-15", category: "Supermercado", priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_may09", member: "matias", type: "gasto",   description: "Netflix",         amountArs: 12000,  date: "2026-05-18", category: "Ocio",         priority: "deseo",            paymentMethod: "credito",          recurrence: "mensual" },
  { id: "mov_may10", member: "sofia",  type: "gasto",   description: "Farmacia",        amountArs: 18500,  date: "2026-05-20", category: "Salud",        priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_may11", member: "sofia",  type: "gasto",   description: "Cuota extra Mateo", amountArs: 145000, date: "2026-05-22", category: "Educación",  priority: "necesidad",        paymentMethod: "transferencia" },
  { id: "mov_may12", member: "matias", type: "gasto",   description: "Uber x3",         amountArs: 18000,  date: "2026-05-23", category: "Transporte",   priority: "necesidad",        paymentMethod: "billetera_virtual" },
  { id: "mov_may13", member: "sofia",  type: "gasto",   description: "Coto",            amountArs: 65000,  date: "2026-05-24", category: "Supermercado", priority: "necesidad",        paymentMethod: "credito" },
  { id: "mov_may14", member: "matias", type: "ingreso", description: "Sueldo mayo",     amountArs: 2450000, date: "2026-05-25", category: "Sueldo",     paymentMethod: "transferencia",    recurrence: "mensual" },
  { id: "mov_may15", member: "matias", type: "gasto",   description: "Bar Sur",         amountArs: 12500,  date: "2026-05-26", category: "Restaurantes", priority: "deseo",            paymentMethod: "credito" },
  { id: "mov_may16", member: "sofia",  type: "gasto",   description: "Coto Belgrano",   amountArs: 18200,  date: "2026-05-26", category: "Supermercado", priority: "necesidad",        paymentMethod: "credito" },
];

function quickToMovement(q: Quick): Movement {
  const member = memberMap[q.member];
  const rate = getRateForDate(q.date);
  const month = q.date.slice(0, 7);
  const amountUsd = (q.amountArs / parseFloat(rate)).toFixed(2);
  return {
    id: q.id,
    entityId: DUMMY_ENTITY_ID,
    membershipId: member.id,
    memberName: member.name,
    type: q.type,
    description: q.description,
    amountArs: q.amountArs.toFixed(2),
    amountUsd,
    usdRateUsed: rate,
    date: q.date,
    month,
    category: q.category,
    subcategory: q.subcategory ?? null,
    paymentMethod: q.paymentMethod ?? "debito",
    priority: q.priority ?? null,
    recurrence: q.recurrence ?? "unico",
    tags: [],
    notes: q.notes ?? null,
    createdAt: new Date(`${q.date}T12:00:00Z`),
    updatedAt: new Date(`${q.date}T12:00:00Z`),
    deletedAt: null,
  };
}

export const DUMMY_MOVEMENTS: Movement[] = QUICK.map(quickToMovement).sort(
  (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
);

/**
 * Filtra movimientos de un mes específico (YYYY-MM).
 */
export function movementsForMonth(month: string): Movement[] {
  return DUMMY_MOVEMENTS.filter((m) => m.month === month);
}
