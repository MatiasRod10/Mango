import type { Movement } from "@/lib/db/schema";
import { MovementListItem } from "@/components/movements/movement-list-item";
import { groupMovementsByDay } from "@/lib/utils/dates";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

type Props = {
  movements: Movement[];
  currency: DisplayCurrency;
};

export function RecentMovements({ movements, currency }: Props) {
  const groups = groupMovementsByDay(movements);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Últimos movimientos</h3>
        <button type="button" className="text-xs text-muted-foreground">
          Ver todo
        </button>
      </div>
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Aún no cargaste movimientos este mes.
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
