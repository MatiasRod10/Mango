import { MovementsList } from "@/components/movements/movements-list";
import { currentEntityId } from "@/lib/auth/current";
import { getMembershipsByEntity } from "@/lib/db/queries/entity";
import { getMovementsForMonth } from "@/lib/db/queries/movements";
import { getActiveMonth } from "@/lib/preferences/active-month";
import { getDisplayCurrency } from "@/lib/preferences/display-currency";
import { formatMonthLabel } from "@/lib/utils/dates";

export default async function MovimientosPage() {
  const [entityId, currency, month] = await Promise.all([
    currentEntityId(),
    getDisplayCurrency(),
    getActiveMonth(),
  ]);
  const [movements, allMembers] = await Promise.all([
    getMovementsForMonth(entityId, month),
    getMembershipsByEntity(entityId),
  ]);
  const members = allMembers.map((m) => ({ id: m.id, name: m.name }));

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
