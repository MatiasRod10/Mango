import type { Movement } from "@/lib/db/schema";
import { categoryEmoji } from "@/lib/utils/category";
import { formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

/**
 * Item de movimiento — reutilizable entre Dashboard ("últimos movimientos")
 * y la lista filtrable de /movimientos.
 */
export function MovementListItem({
  movement,
  currency,
}: {
  movement: Movement;
  currency: DisplayCurrency;
}) {
  const isIncome = movement.type === "ingreso";
  const isSaveOrInvest =
    movement.type === "ahorro" || movement.type === "inversion";

  const bgClass = isIncome
    ? "bg-[color-mix(in_oklab,var(--success)_15%,transparent)]"
    : isSaveOrInvest
      ? "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)]"
      : "bg-[color-mix(in_oklab,var(--destructive)_15%,transparent)]";

  const amountColor = isIncome
    ? "text-[var(--success)]"
    : isSaveOrInvest
      ? "text-[var(--primary-hover)]"
      : "text-[var(--destructive)]";

  const sign = isIncome ? "+" : "-";
  const amount = currency === "ARS" ? movement.amountArs : movement.amountUsd;

  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base",
            bgClass,
          )}
          aria-hidden
        >
          {categoryEmoji(movement.category)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{movement.description}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {movement.category} · {movement.memberName}
          </p>
        </div>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          amountColor,
        )}
      >
        {sign} {formatMoney(amount, currency)}
      </p>
    </div>
  );
}
