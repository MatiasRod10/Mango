import { MovementsList } from "@/components/movements/movements-list";
import { DUMMY_MEMBERSHIPS } from "@/lib/dummy/entity";
import { movementsForMonth } from "@/lib/dummy/movements";
import { getActiveMonth } from "@/lib/preferences/active-month";
import { getDisplayCurrency } from "@/lib/preferences/display-currency";
import { formatMonthLabel } from "@/lib/utils/dates";

export default async function MovimientosPage() {
  const [currency, month] = await Promise.all([
    getDisplayCurrency(),
    getActiveMonth(),
  ]);
  const movements = movementsForMonth(month);
  const members = DUMMY_MEMBERSHIPS.map((m) => ({ id: m.id, name: m.name }));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Movimientos</h1>
        <p className="text-sm text-muted-foreground">
          {movements.length}{" "}
          {movements.length === 1 ? "movimiento" : "movimientos"} en{" "}
          {formatMonthLabel(month).toLowerCase()}
        </p>
      </div>
      <MovementsList
        movements={movements}
        currency={currency}
        members={members}
      />
    </div>
  );
}
