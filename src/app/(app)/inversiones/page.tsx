import { CompositionDonut } from "@/components/investments/composition-donut";
import { InvestmentCard } from "@/components/investments/investment-card";
import { PortfolioHero } from "@/components/investments/portfolio-hero";
import { ProfitBreakdown } from "@/components/investments/profit-breakdown";
import { DUMMY_INVESTMENTS } from "@/lib/dummy/investments";
import {
  calculatePortfolioStats,
  calculateProfitBreakdown,
  compositionByAssetClass,
} from "@/lib/investments/stats";
import { getDisplayCurrency } from "@/lib/preferences/display-currency";
import { fetchUsdRate } from "@/lib/usd-rate/fetch";

export default async function InversionesPage() {
  const [currency, rate] = await Promise.all([
    getDisplayCurrency(),
    fetchUsdRate("blue"),
  ]);

  const stats = calculatePortfolioStats(DUMMY_INVESTMENTS);
  const breakdown = calculateProfitBreakdown(
    DUMMY_INVESTMENTS,
    parseFloat(rate.value),
  );
  const composition = compositionByAssetClass(DUMMY_INVESTMENTS);

  const sortedInvestments = [...DUMMY_INVESTMENTS]
    .filter((i) => i.status === "active")
    .sort((a, b) => {
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
