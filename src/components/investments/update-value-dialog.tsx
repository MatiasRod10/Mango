"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateInvestmentValueSchema,
  type UpdateInvestmentValueInput,
} from "@/lib/schemas/investment";
import { updateInvestmentValueAction } from "@/lib/actions/investments";
import { formatARS, formatUSD } from "@/lib/utils/format";
import type { Investment } from "@/lib/db/schema";

type Props = {
  open: boolean;
  onClose: () => void;
  investment?: Investment;
};

function defaults(inv: Investment): UpdateInvestmentValueInput {
  const showInUsd = [
    "acciones",
    "cedear",
    "cripto",
    "dolar",
    "inmueble",
  ].includes(inv.assetClass);
  return {
    currentValue: parseFloat(
      showInUsd ? inv.currentValueUsd : inv.currentValueArs,
    ),
    currentValueCurrency: showInUsd ? "USD" : "ARS",
  };
}

export function UpdateValueDialog({ open, onClose, investment }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateInvestmentValueInput>({
    resolver: zodResolver(updateInvestmentValueSchema),
    defaultValues: investment
      ? defaults(investment)
      : { currentValue: 0, currentValueCurrency: "USD" },
  });

  const currency = form.watch("currentValueCurrency");

  useEffect(() => {
    if (open && investment) form.reset(defaults(investment));
  }, [open, investment, form]);

  if (!investment) return null;

  const onSubmit = (data: UpdateInvestmentValueInput) => {
    startTransition(async () => {
      const result = await updateInvestmentValueAction(investment.id, data);
      if (result.ok) {
        toast.success(`Valor de ${investment.name} actualizado`);
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar valor</DialogTitle>
          <DialogDescription>
            <strong className="text-foreground">{investment.name}</strong>
            {" — "}
            antes:{" "}
            <span className="tabular-nums">
              {investment.assetClass === "dolar" ||
              investment.assetClass === "inmueble" ||
              investment.assetClass === "acciones" ||
              investment.assetClass === "cedear" ||
              investment.assetClass === "cripto"
                ? formatUSD(investment.currentValueUsd)
                : formatARS(investment.currentValueArs)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newValue">¿Cuánto vale hoy?</Label>
            <div className="grid grid-cols-[1fr_100px] gap-2">
              <Input
                id="newValue"
                type="number"
                step="0.01"
                inputMode="decimal"
                className="tabular-nums"
                {...form.register("currentValue", { valueAsNumber: true })}
                disabled={isPending}
                autoFocus
              />
              <Select
                value={currency}
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
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Guardando..." : "Actualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
