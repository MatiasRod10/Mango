import { HeroBalance } from "@/components/dashboard/hero-balance";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TopCategories } from "@/components/dashboard/top-categories";
import { movementsForMonth } from "@/lib/dummy/movements";
import {
  calculateMonthlyStats,
  topGastoCategories,
} from "@/lib/movements/stats";
import { getActiveMonth } from "@/lib/preferences/active-month";
import { getDisplayCurrency } from "@/lib/preferences/display-currency";
import { previousMonth } from "@/lib/utils/dates";

export default async function DashboardPage() {
  const [currency, month] = await Promise.all([
    getDisplayCurrency(),
    getActiveMonth(),
  ]);
  const prev = previousMonth(month);

  const thisMonth = movementsForMonth(month);
  const lastMonth = movementsForMonth(prev);

  const stats = calculateMonthlyStats(thisMonth);
  const lastStats = calculateMonthlyStats(lastMonth);

  const balanceArs = parseFloat(stats.balanceArs);
  const lastBalanceArs = parseFloat(lastStats.balanceArs);
  const changePct =
    lastBalanceArs !== 0
      ? ((balanceArs - lastBalanceArs) / Math.abs(lastBalanceArs)) * 100
      : 0;

  const topCats = topGastoCategories(thisMonth, 4);
  const recent = thisMonth.slice(0, 8);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <HeroBalance
        balanceArs={stats.balanceArs}
        balanceUsd={stats.balanceUsd}
        changePct={changePct}
        currency={currency}
      />
      <QuickActions />
      <StatsGrid stats={stats} currency={currency} />
      <TopCategories items={topCats} currency={currency} />
      <RecentMovements movements={recent} currency={currency} />
    </div>
  );
}
