"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuickAdd } from "@/components/shared/quick-add-provider";
import { deleteMovementAction } from "@/lib/actions/movements";
import { categoryEmoji } from "@/lib/utils/category";
import { formatARS, formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Movement } from "@/lib/db/schema";
import type { DisplayCurrency } from "@/lib/preferences/display-currency";

export function MovementListItem({
  movement,
  currency,
}: {
  movement: Movement;
  currency: DisplayCurrency;
}) {
  const { openEditSheet } = useQuickAdd();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isIncome = movement.type === "ingreso";
  const isSaveOrInvest =
    movement.type === "ahorro" || movement.type === "inversion";

  const bgClass = isIncome
    ? "bg-[color-mix(in_oklab,var(--success)_15%,transparent)]"
    : isSaveOrInvest
      ? "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)]"
      : "bg-[color-mix(in_oklab,var(--destructive)_15%,transparent)]";

  const amountColor = isIncome
    ? "text-[var(--success)]"
    : isSaveOrInvest
      ? "text-[var(--primary-hover)]"
      : "text-[var(--destructive)]";

  const sign = isIncome ? "+" : "-";
  const amount = currency === "ARS" ? movement.amountArs : movement.amountUsd;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteMovementAction(movement.id);
      if (result.ok) {
        toast.success("Movimiento eliminado");
        setConfirmOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base",
              bgClass,
            )}
            aria-hidden
          >
            {categoryEmoji(movement.category)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {movement.description}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {movement.category} · {movement.memberName}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              amountColor,
            )}
          >
            {sign} {formatMoney(amount, currency)}
          </p>
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => openEditSheet(movement)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[var(--destructive)] focus:text-[var(--destructive)]"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Borrar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block">
                <strong className="text-foreground">
                  {movement.description}
                </strong>{" "}
                — {movement.category} ·{" "}
                <span className="tabular-nums">
                  {formatARS(movement.amountArs)}
                </span>
              </span>
              <span className="mt-2 block text-xs">
                Lo ocultamos de la app (soft delete) — los datos quedan en la
                base, recuperables.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Cancelar
            </AlertDialogCancel>
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
    </>
  );
}
