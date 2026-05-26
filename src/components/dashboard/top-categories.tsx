import { categoryEmoji } from "@/lib/utils/category";
import { formatMoney } from "@/lib/utils/format";
import type { CategoryStat } from "@/lib/movements/stats";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

type Props = {
  items: CategoryStat[];
  currency: DisplayCurrency;
};

export function TopCategories({ items, currency }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Top categorías</h3>
        <button type="button" className="text-xs text-muted-foreground">
          Ver todo
        </button>
      </div>
      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">
          Sin gastos cargados este mes.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const amount =
              currency === "ARS" ? item.amountArs : item.amountUsd;
            return (
              <div key={item.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-base">
                      {categoryEmoji(item.category)}
                    </span>
                    {item.category}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatMoney(amount, currency)}
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--secondary)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, item.percent)}%`,
                      background: "var(--primary)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
