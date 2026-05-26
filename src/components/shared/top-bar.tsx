import { MonthSelector } from "./month-selector";
import { UsdRateBadge } from "./usd-rate-badge";
import { DUMMY_CURRENT_USER } from "@/lib/dummy/entity";
import { lastNMonths } from "@/lib/utils/dates";
import { getActiveMonth } from "@/lib/preferences/active-month";
import { fetchUsdRate } from "@/lib/usd-rate/fetch";

/**
 * Top bar consistente para todas las pantallas del app group.
 * Mobile: avatar + selector mes + USD rate.
 * Desktop: solo mes + USD rate.
 *
 * Async porque hace fetch server-side de la cotización + lee la cookie del mes activo.
 */
export async function TopBar() {
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
          aria-label={`Avatar de ${DUMMY_CURRENT_USER.name}`}
        >
          {DUMMY_CURRENT_USER.name.charAt(0)}
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
