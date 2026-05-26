import {
  ASSET_CLASS_COLOR,
  ASSET_CLASS_LABEL,
} from "@/lib/utils/asset-class";
import { formatPercent } from "@/lib/utils/format";
import type { CompositionItem } from "@/lib/investments/stats";

function buildGradient(items: CompositionItem[]): string {
  if (items.length === 0) return "var(--secondary)";
  let cursor = 0;
  const stops: string[] = [];
  items.forEach((item) => {
    const start = cursor;
    const end = cursor + item.percent;
    stops.push(
      `${ASSET_CLASS_COLOR[item.assetClass]} ${start.toFixed(2)}% ${end.toFixed(2)}%`,
    );
    cursor = end;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

export function CompositionDonut({ items }: { items: CompositionItem[] }) {
  const gradient = buildGradient(items);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Composición</h3>
      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">
          Sin inversiones activas.
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-[140px] w-[140px] shrink-0">
            <div
              className="h-full w-full rounded-full"
              style={{ background: gradient }}
            />
            <div
              className="absolute inset-[14px] rounded-full"
              style={{ background: "var(--card)" }}
            />
          </div>
          <div className="flex-1 space-y-1.5 text-xs">
            {items.map((item) => (
              <div
                key={item.assetClass}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: ASSET_CLASS_COLOR[item.assetClass] }}
                  />
                  {ASSET_CLASS_LABEL[item.assetClass]}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatPercent(item.percent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
