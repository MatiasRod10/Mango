import { CategoryDonutChart } from "@/components/reports/category-donut-chart";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { MonthlyEvolutionChart } from "@/components/reports/monthly-evolution-chart";
import { NeedVsWantChart } from "@/components/reports/need-vs-want-chart";
import { SavingsRatioChart } from "@/components/reports/savings-ratio-chart";
import { currentEntityId } from "@/lib/auth/current";
import { getMovementsForMonths } from "@/lib/db/queries/movements";
import {
  categoryCompositionForGastos,
  gastosByPriorityByMonth,
  monthlyEvolution,
  savingsRatioByMonth,
} from "@/lib/reports/series";
import { getActiveMonth } from "@/lib/preferences/active-month";
import { getDisplayCurrency } from "@/lib/preferences/display-currency";
import { formatMonthLabel, lastNMonths } from "@/lib/utils/dates";

export default async function ReportesPage() {
  const [entityId, currency, activeMonth] = await Promise.all([
    currentEntityId(),
    getDisplayCurrency(),
    getActiveMonth(),
  ]);

  // Últimos 6 meses terminando en el mes activo del topbar
  const months = lastNMonths(6, activeMonth);
  const movements = await getMovementsForMonths(entityId, months);

  const evolution = monthlyEvolution(movements, months);
  const ratio = savingsRatioByMonth(movements, months);
  const priority = gastosByPriorityByMonth(movements, months);

  const activeMonthMovs = movements.filter((m) => m.month === activeMonth);
  const composition = categoryCompositionForGastos(activeMonthMovs, 8);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Últimos 6 meses (terminando en{" "}
            {formatMonthLabel(activeMonth).toLowerCase()})
          </p>
        </div>
        <ExportCsvButton />
      </div>

      <MonthlyEvolutionChart data={evolution} currency={currency} />

      <div className="grid gap-5 md:grid-cols-2">
        <CategoryDonutChart
          data={composition}
          currency={currency}
          title={`Gastos por categoría — ${formatMonthLabel(activeMonth)}`}
        />
        <SavingsRatioChart data={ratio} />
      </div>

      <NeedVsWantChart data={priority} />
    </div>
  );
}
