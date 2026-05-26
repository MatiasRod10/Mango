import { CompositionDonut } from "@/components/investments/composition-donut";
import { InvestmentCard } from "@/components/investments/investment-card";
import { PortfolioHero } from "@/components/investments/portfolio-hero";
import { ProfitBreakdown } from "@/components/investments/profit-breakdown";
import { currentEntityId } from "@/lib/auth/current";
import { getActiveInvestmentsByEntity } from "@/lib/db/queries/investments";
import {
  calculatePortfolioStats,
  calculateProfitBreakdown,
  compositionByAssetClass,
} from "@/lib/investments/stats";
import { getDisplayCurrency } from "@/lib/preferences/display-currency";
import { fetchUsdRate } from "@/lib/usd-rate/fetch";

export default async function InversionesPage() {
  const [entityId, currency, rate] = await Promise.all([
    currentEntityId(),
    getDisplayCurrency(),
    fetchUsdRate("blue"),
  ]);

  const allInvestments = await getActiveInvestmentsByEntity(entityId);

  const stats = calculatePortfolioStats(allInvestments);
  const breakdown = calculateProfitBreakdown(
    allInvestments,
    parseFloat(rate.value),
  );
  const composition = compositionByAssetClass(allInvestments);

  const sortedInvestments = [...allInvestments].sort((a, b) => {
    const aInv = parseFloat(a.investedUsd);
    const aCur = parseFloat(a.currentValueUsd);
    const aPct = aInv > 0 ? (aCur - aInv) / aInv : 0;
    const bInv = parseFloat(b.investedUsd);
    const bCur = parseFloat(b.currentValueUsd);
    const bPct = bInv > 0 ? (bCur - bInv) / bInv : 0;
    return bPct - aPct;
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PortfolioHero stats={stats} currency={currency} />
      <ProfitBreakdown data={breakdown} />
      <CompositionDonut items={composition} />
      <div className="space-y-3">
        {sortedInvestments.map((inv) => (
          <InvestmentCard key={inv.id} investment={inv} />
        ))}
      </div>
    </div>
  );
}
