"use client";

import { useState, useTransition } from "react";
import {
  CircleDollarSign,
  MoreVertical,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvestments } from "./investments-provider";
import {
  deleteInvestmentAction,
  markInvestmentSoldAction,
} from "@/lib/actions/investments";
import { refreshInvestmentPriceAction } from "@/lib/actions/market-data";
import type { Investment } from "@/lib/db/schema";
import {
  ASSET_CLASS_EMOJI,
  ASSET_CLASS_LABEL,
  RISK_BADGE_CLASS,
  RISK_LABEL,
} from "@/lib/utils/asset-class";
import {
  formatARS,
  formatDate,
  formatPercent,
  formatUSD,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Props = { investment: Investment };

export function InvestmentCard({ investment: inv }: Props) {
  const { openEdit, openUpdateValue } = useInvestments();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSold, setConfirmSold] = useState(false);
  const [isPending, startTransition] = useTransition();

  const invUsd = parseFloat(inv.investedUsd);
  const curUsd = parseFloat(inv.currentValueUsd);
  const invArs = parseFloat(inv.investedArs);
  const curArs = parseFloat(inv.currentValueArs);

  const displayInUsd = [
    "acciones",
    "cedear",
    "cripto",
    "dolar",
    "inmueble",
  ].includes(inv.assetClass);
  const profitUsd = curUsd - invUsd;
  const profitArs = curArs - invArs;
  const profitPct = displayInUsd
    ? invUsd > 0
      ? (profitUsd / invUsd) * 100
      : 0
    : invArs > 0
      ? (profitArs / invArs) * 100
      : 0;

  const isOnlyCurrencyProfit =
    inv.assetClass === "dolar" && Math.abs(profitUsd) < 0.01;
  const profitColor = isOnlyCurrencyProfit
    ? "text-[var(--warning)]"
    : profitPct >= 0
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteInvestmentAction(inv.id);
      if (result.ok) {
        toast.success("Inversión eliminada");
        setConfirmDelete(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleMarkSold = () => {
    startTransition(async () => {
      const result = await markInvestmentSoldAction(inv.id);
      if (result.ok) {
        toast.success(`${inv.name} marcada como vendida`);
        setConfirmSold(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleAutoRefresh = () => {
    startTransition(async () => {
      const result = await refreshInvestmentPriceAction(inv.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.data.refreshed) {
        toast.success(`${inv.name} actualizado vía ${result.data.source}`);
      } else {
        toast.info("No pude actualizar automático", {
          description: result.data.reason,
        });
      }
    });
  };

  const autoSupported = ["cripto", "acciones", "cedear", "dolar"].includes(
    inv.assetClass,
  );

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg",
                RISK_BADGE_CLASS[inv.risk]
                  .split(" ")
                  .filter((c) => c.startsWith("bg-"))
                  .join(" "),
              )}
              aria-hidden
            >
              {ASSET_CLASS_EMOJI[inv.assetClass]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{inv.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {inv.ticker ? `${inv.ticker} · ` : ""}
                {ASSET_CLASS_LABEL[inv.assetClass]}
                {inv.brokerOrAccount ? ` · ${inv.brokerOrAccount}` : ""}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                RISK_BADGE_CLASS[inv.risk],
              )}
            >
              {RISK_LABEL[inv.risk]}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label="Acciones"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {autoSupported && (
                  <DropdownMenuItem
                    onClick={handleAutoRefresh}
                    disabled={isPending}
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-[var(--primary-hover)]" />
                    Auto-actualizar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => openUpdateValue(inv)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar manual
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEdit(inv)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConfirmSold(true)}>
                  <CircleDollarSign className="mr-2 h-4 w-4" />
                  Marcar como vendida
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-[var(--destructive)] focus:text-[var(--destructive)]"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Borrar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Invertí</p>
            <p className="tabular-nums font-medium">
              {displayInUsd
                ? formatUSD(inv.investedUsd)
                : formatARS(inv.investedArs)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Vale</p>
            <p className="tabular-nums font-medium">
              {displayInUsd
                ? formatUSD(inv.currentValueUsd)
                : formatARS(inv.currentValueArs)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Profit</p>
            <p className={cn("tabular-nums font-semibold", profitColor)}>
              {formatPercent(profitPct, { signed: true })}
            </p>
          </div>
        </div>

        {inv.notes && (
          <p className="mt-2 text-[11px] text-muted-foreground">{inv.notes}</p>
        )}

        <p className="mt-2 text-[11px] text-muted-foreground tabular-nums">
          Compra {formatDate(inv.date)}
        </p>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar esta inversión?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block">
                <strong className="text-foreground">{inv.name}</strong> —{" "}
                {ASSET_CLASS_LABEL[inv.assetClass]}
              </span>
              <span className="mt-2 block text-xs">
                Soft delete — queda en la base, recuperable. Si en cambio
                vendiste el activo, mejor usá "Marcar como vendida" para
                conservar el histórico.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
            >
              {isPending ? "Borrando..." : "Borrar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmSold} onOpenChange={setConfirmSold}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar como vendida?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">{inv.name}</strong> no va a
              aparecer más en el portfolio activo. Queda accesible en la
              sección de inversiones vendidas (cuando la implementemos).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleMarkSold();
              }}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Marcar vendida"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
