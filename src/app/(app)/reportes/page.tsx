import { BarChart3, Download, LineChart, PieChart, Sigma, Target } from "lucide-react";

const COMING_SOON = [
  { icon: LineChart, label: "Evolución mensual", description: "Ingresos · gastos · ahorro · patrimonio neto" },
  { icon: PieChart, label: "Gastos por categoría", description: "Donut del mes seleccionado" },
  { icon: BarChart3, label: "Necesidad vs deseo", description: "Barras apiladas mes a mes" },
  { icon: Sigma, label: "Ratio de ahorro", description: "Tendencia mensual" },
  { icon: Target, label: "Comparativa anual", description: "Últimos 12 meses vs anteriores" },
  { icon: Download, label: "Exportar a CSV", description: "Para llevar a Excel o Google Sheets" },
] as const;

export default function ReportesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-sm text-muted-foreground">
          Gráficos y exportaciones — llegan en el Sprint 5.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {COMING_SOON.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: "color-mix(in oklab, var(--primary) 12%, transparent)",
                  color: "var(--primary-hover)",
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
