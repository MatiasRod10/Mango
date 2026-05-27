"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  newInvestmentSchema,
  type NewInvestmentInput,
} from "@/lib/schemas/investment";
import {
  insertInvestmentAction,
  updateInvestmentAction,
} from "@/lib/actions/investments";
import {
  ASSET_CLASS_EMOJI,
  ASSET_CLASS_LABEL,
  RISK_LABEL,
} from "@/lib/utils/asset-class";
import type { Investment } from "@/lib/db/schema";
import { MarketDataPreview } from "./market-data-preview";

type Props = {
  open: boolean;
  onClose: () => void;
  editing?: Investment;
};

const ASSET_CLASSES = [
  "dolar",
  "plazo_fijo",
  "fondo_comun",
  "acciones",
  "cedear",
  "cripto",
  "bonos",
  "inmueble",
  "otro",
] as const;

const RISKS = ["low", "medium", "high"] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultsCreate(): NewInvestmentInput {
  return {
    name: "",
    ticker: undefined,
    assetClass: "acciones",
    brokerOrAccount: undefined,
    date: todayISO(),
    invested: 0,
    investedCurrency: "USD",
    currentValue: 0,
    currentValueCurrency: "USD",
    quantity: undefined,
    risk: "medium",
    notes: undefined,
  };
}

function defaultsEdit(inv: Investment): NewInvestmentInput {
  // Para edit mostramos en USD si el activo es "naturalmente USD"; sino ARS.
  const showInUsd = ["acciones", "cedear", "cripto", "dolar", "inmueble"].includes(
    inv.assetClass,
  );
  return {
    name: inv.name,
    ticker: inv.ticker ?? undefined,
    assetClass: inv.assetClass,
    brokerOrAccount: inv.brokerOrAccount ?? undefined,
    date: inv.date,
    invested: parseFloat(showInUsd ? inv.investedUsd : inv.investedArs),
    investedCurrency: showInUsd ? "USD" : "ARS",
    currentValue: parseFloat(
      showInUsd ? inv.currentValueUsd : inv.currentValueArs,
    ),
    currentValueCurrency: showInUsd ? "USD" : "ARS",
    quantity: inv.quantity ? parseFloat(inv.quantity) : undefined,
    risk: inv.risk,
    notes: inv.notes ?? undefined,
  };
}

export function InvestmentSheet({ open, onClose, editing }: Props) {
  const isEdit = Boolean(editing);
  const [isPending, startTransition] = useTransition();

  const form = useForm<NewInvestmentInput>({
    resolver: zodResolver(newInvestmentSchema),
    defaultValues: editing ? defaultsEdit(editing) : defaultsCreate(),
  });

  const assetClass = form.watch("assetClass");
  const investedCurrency = form.watch("investedCurrency");
  const currentValueCurrency = form.watch("currentValueCurrency");
  const risk = form.watch("risk");
  const ticker = form.watch("ticker") ?? "";
  const quantity = form.watch("quantity");

  useEffect(() => {
    if (open) {
      form.reset(editing ? defaultsEdit(editing) : defaultsCreate());
    }
  }, [open, editing, form]);

  const onSubmit = (data: NewInvestmentInput) => {
    startTransition(async () => {
      const result = editing
        ? await updateInvestmentAction(editing.id, data)
        : await insertInvestmentAction(data);
      if (result.ok) {
        toast.success(editing ? "Inversión actualizada" : "Inversión cargada");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && !isPending && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-2xl border-t border-border"
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {isEdit ? "Editar inversión" : "Nueva inversión"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Datos básicos y valuación. Para actualizar solo el valor de mercado, usá 'Actualizar valor' en el menú de la card."
              : "Cargá un activo nuevo a tu portfolio."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-4 pb-6"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="assetClass">Tipo</Label>
              <Select
                value={assetClass}
                onValueChange={(v) =>
                  form.setValue(
                    "assetClass",
                    v as NewInvestmentInput["assetClass"],
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger id="assetClass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {ASSET_CLASS_EMOJI[c]} {ASSET_CLASS_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="risk">Riesgo</Label>
              <Select
                value={risk}
                onValueChange={(v) =>
                  form.setValue("risk", v as NewInvestmentInput["risk"])
                }
                disabled={isPending}
              >
                <SelectTrigger id="risk">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISKS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {RISK_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              autoComplete="off"
              placeholder="Apple, BTC, Plazo fijo Galicia..."
              {...form.register("name")}
              disabled={isPending}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-[var(--destructive)]">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                autoComplete="off"
                placeholder={
                  assetClass === "cripto"
                    ? "bitcoin"
                    : assetClass === "cedear"
                      ? "AAPL"
                      : assetClass === "acciones"
                        ? "AAPL"
                        : "Opcional"
                }
                {...form.register("ticker")}
                disabled={isPending}
              />
              {assetClass === "cripto" && (
                <p className="text-[10px] text-muted-foreground">
                  Slug de CoinGecko (`bitcoin`, `ethereum`, `solana`)
                </p>
              )}
              {assetClass === "acciones" && (
                <p className="text-[10px] text-muted-foreground">
                  Símbolo Twelve Data — US tickers (AAPL, MSFT, SPY...)
                </p>
              )}
              {assetClass === "cedear" && (
                <p className="text-[10px] text-muted-foreground">
                  Ticker del subyacente US — aplicamos el ratio CEDEAR (SPY,
                  QQQ, AAPL, MELI...)
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="broker">Broker / cuenta</Label>
              <Input
                id="broker"
                autoComplete="off"
                placeholder="Cocos, Galicia..."
                {...form.register("brokerOrAccount")}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="date">Fecha de compra</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                inputMode="decimal"
                placeholder="10"
                className="tabular-nums"
                {...form.register("quantity", { valueAsNumber: true })}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/30 p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Lo que invertí
            </p>
            <div className="grid grid-cols-[1fr_100px] gap-2">
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                className="tabular-nums"
                {...form.register("invested", { valueAsNumber: true })}
                disabled={isPending}
              />
              <Select
                value={investedCurrency}
                onValueChange={(v) =>
                  form.setValue("investedCurrency", v as "ARS" | "USD")
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.formState.errors.invested && (
              <p className="text-xs text-[var(--destructive)]">
                {form.formState.errors.invested.message}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-secondary/30 p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Vale ahora
            </p>
            <div className="grid grid-cols-[1fr_100px] gap-2">
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                className="tabular-nums"
                {...form.register("currentValue", { valueAsNumber: true })}
                disabled={isPending}
              />
              <Select
                value={currentValueCurrency}
                onValueChange={(v) =>
                  form.setValue("currentValueCurrency", v as "ARS" | "USD")
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.formState.errors.currentValue && (
              <p className="text-xs text-[var(--destructive)]">
                {form.formState.errors.currentValue.message}
              </p>
            )}

            <MarketDataPreview
              assetClass={assetClass}
              ticker={ticker}
              quantity={quantity}
              preferredCurrency={currentValueCurrency}
              onUseValue={(value, currency) => {
                form.setValue("currentValue", value, { shouldValidate: true });
                form.setValue("currentValueCurrency", currency);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="TNA 110%, vence 18/07..."
              {...form.register("notes")}
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Guardar"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
