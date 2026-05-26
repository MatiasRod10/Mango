"use client";

import { useState } from "react";
import { MovementListItem } from "./movement-list-item";
import { groupMovementsByDay } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";
import type { Movement, Membership } from "@/lib/db/schema";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

const TYPE_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "ingreso", label: "Ingresos" },
  { value: "gasto", label: "Gastos" },
  { value: "ahorro", label: "Ahorros" },
  { value: "inversion", label: "Inversión" },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number]["value"];

type Props = {
  movements: Movement[];
  currency: DisplayCurrency;
  members: Pick<Membership, "id" | "name">[];
};

export function MovementsList({ movements, currency, members }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all"); // "all" o membership id

  const filtered = movements
    .filter((m) => typeFilter === "all" || m.type === typeFilter)
    .filter(
      (m) => memberFilter === "all" || m.membershipId === memberFilter,
    );
  const groups = groupMovementsByDay(filtered);

  const memberPills = [
    { value: "all", label: "Todos" },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setTypeFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full border border-border px-3 py-1.5 text-xs transition-colors",
              typeFilter === f.value
                ? "bg-foreground font-medium text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
        <span className="shrink-0 pr-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          Quién
        </span>
        {memberPills.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMemberFilter(m.value)}
            className={cn(
              "shrink-0 rounded-full border border-border px-3 py-1 text-xs transition-colors",
              memberFilter === m.value
                ? "bg-[var(--primary)] font-medium text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Sin movimientos para esta combinación de filtros.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.date}>
              <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                {g.label}
              </p>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                {g.movements.map((m) => (
                  <MovementListItem
                    key={m.id}
                    movement={m}
                    currency={currency}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
