import { MonthSelector } from "./month-selector";
import { UsdRateBadge } from "./usd-rate-badge";
import { lastNMonths } from "@/lib/utils/dates";
import { getActiveMonth } from "@/lib/preferences/active-month";
import { fetchUsdRate } from "@/lib/usd-rate/fetch";

type Props = {
  /** Inicial mostrada en el avatar mobile (ej: "M" para "Matías"). */
  userInitial: string;
  userName: string;
};

/**
 * Top bar — fetch async del USD rate + active month. El user lo recibe como prop
 * (lo resuelve el layout via currentMembership).
 */
export async function TopBar({ userInitial, userName }: Props) {
  const [activeMonth, rate] = await Promise.all([
    getActiveMonth(),
    fetchUsdRate("blue"),
  ]);
  const monthOptions = lastNMonths(12, activeMonth);

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-4 md:px-8 md:py-5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold md:hidden"
          style={{
            background: "color-mix(in oklab, var(--primary) 15%, transparent)",
            color: "var(--primary-hover)",
          }}
          aria-label={`Avatar de ${userName}`}
        >
          {userInitial}
        </div>
        <MonthSelector month={activeMonth} options={monthOptions} />
      </div>
      <UsdRateBadge
        value={rate.value}
        type={rate.type}
        updatedAt={rate.updatedAt}
        stale={rate.stale}
      />
    </header>
  );
}
