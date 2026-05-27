"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { previewMarketValueAction } from "@/lib/actions/preview";
import { getCedearRatio } from "@/lib/market-data/cedear-ratios";
import { formatARS, formatUSD } from "@/lib/utils/format";
import type { Investment } from "@/lib/db/schema";

type AssetClass = Investment["assetClass"];

type Props = {
  assetClass: AssetClass;
  ticker: string;
  quantity: number | undefined;
  /** Override del ratio CEDEAR (opcional). Solo aplica si assetClass = "cedear". */
  cedearRatioOverride?: number;
  onUseValue: (value: number, currency: "ARS" | "USD") => void;
  /** Moneda preferida para el botón "Usar este valor". */
  preferredCurrency: "ARS" | "USD";
};

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ok";
      valueArs: number;
      valueUsd: number;
      source: string;
      ratio?: number;
    }
  | { status: "error"; reason: string };

const SUPPORTED: AssetClass[] = ["cripto", "acciones", "cedear"];

export function MarketDataPreview({
  assetClass,
  ticker,
  quantity,
  cedearRatioOverride,
  onUseValue,
  preferredCurrency,
}: Props) {
  const [state, setState] = useState<PreviewState>({ status: "idle" });

  useEffect(() => {
    if (!ticker.trim() || !quantity || quantity <= 0) {
      setState({ status: "idle" });
      return;
    }
    if (!SUPPORTED.includes(assetClass)) {
      setState({ status: "idle" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });
    const timer = setTimeout(async () => {
      const result = await previewMarketValueAction({
        assetClass,
        ticker: ticker.trim(),
        quantity,
        cedearRatioOverride,
      });
      if (cancelled) return;
      if (result.ok) {
        setState({
          status: "ok",
          valueArs: result.valueArs,
          valueUsd: result.valueUsd,
          source: result.source,
          ratio: result.ratio,
        });
      } else {
        setState({ status: "error", reason: result.reason });
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [assetClass, ticker, quantity, cedearRatioOverride]);

  // No mostrar para asset classes no soportados (plazo_fijo, bonos, inmueble...)
  if (!SUPPORTED.includes(assetClass)) return null;
  if (!ticker.trim()) return null;

  const effectiveRatio =
    assetClass === "cedear"
      ? (cedearRatioOverride ?? getCedearRatio(ticker))
      : null;
  const isOverride =
    assetClass === "cedear" && cedearRatioOverride !== undefined;

  return (
    <div
      className="rounded-xl border border-dashed p-3 text-xs"
      style={{
        borderColor:
          "color-mix(in oklab, var(--primary) 30%, var(--border))",
        background: "color-mix(in oklab, var(--primary) 5%, transparent)",
      }}
    >
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary-hover)]" />
        <div className="flex-1 space-y-1.5">
          {assetClass === "cedear" && (
            <p className="text-muted-foreground">
              {effectiveRatio ? (
                <>
                  Ratio CEDEAR{" "}
                  <strong className="text-foreground">1:{effectiveRatio}</strong>
                  {" "}({isOverride ? "manual" : "tabla oficial"})
                </>
              ) : (
                <span className="text-[var(--warning)]">
                  Ratio CEDEAR no conocido — ponelo manualmente abajo o usá
                  "Actualizar manual" después.
                </span>
              )}
            </p>
          )}

          {state.status === "loading" && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Consultando precio actual...
            </p>
          )}

          {state.status === "error" && (
            <p className="text-[var(--destructive)]">{state.reason}</p>
          )}

          {state.status === "ok" && (!quantity || quantity <= 0 ? null : (
            <div className="space-y-1.5">
              <p className="text-muted-foreground">Valor actual estimado:</p>
              <p className="tabular-nums font-semibold text-sm text-foreground">
                {formatUSD(state.valueUsd.toString())} ·{" "}
                {formatARS(state.valueArs.toString())}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  const value =
                    preferredCurrency === "ARS"
                      ? state.valueArs
                      : state.valueUsd;
                  onUseValue(value, preferredCurrency);
                }}
              >
                Usar como "Vale ahora"
              </Button>
              <p className="text-[10px] text-muted-foreground">
                vía {state.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
