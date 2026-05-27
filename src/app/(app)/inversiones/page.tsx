import { CompositionDonut } from "@/components/investments/composition-donut";
import { InvestmentCard } from "@/components/investments/investment-card";
import { InvestmentsProvider } from "@/components/investments/investments-provider";
import { NewInvestmentButton } from "@/components/investments/new-investment-button";
import { PortfolioHero } from "@/components/investments/portfolio-hero";
import { ProfitBreakdown } from "@/components/investments/profit-breakdown";
import { RefreshAllButton } from "@/components/investments/refresh-all-button";
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
    <InvestmentsProvider>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Inversiones
            </h1>
            <p className="text-sm text-muted-foreground">
              {sortedInvestments.length}{" "}
              {sortedInvestments.length === 1
                ? "instrumento activo"
                : "instrumentos activos"}
            </p>
          </div>
          <div className="flex gap-2">
            <RefreshAllButton />
            <NewInvestmentButton />
          </div>
        </div>
        <PortfolioHero stats={stats} currency={currency} />
        <ProfitBreakdown data={breakdown} />
        <CompositionDonut items={composition} />
        <div className="space-y-3">
          {sortedInvestments.map((inv) => (
            <InvestmentCard key={inv.id} investment={inv} />
          ))}
          {sortedInvestments.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Aún no cargaste inversiones. Tocá <strong>Nueva</strong> arriba a
              la derecha para empezar.
            </div>
          )}
        </div>
      </div>
    </InvestmentsProvider>
  );
}
