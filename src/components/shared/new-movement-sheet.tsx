"use client";

import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  newMovementSchema,
  type NewMovementInput,
} from "@/lib/schemas/movement";
import { CATEGORIES_BY_TYPE } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";
import type { Membership, Movement } from "@/lib/db/schema";

type Props = {
  open: boolean;
  onClose: () => void;
  preset?: Movement["type"];
  memberships: Pick<Membership, "id" | "name">[];
  defaultMembershipId: string;
};

const TYPE_TABS = [
  { value: "ingreso" as const, label: "Ingreso", color: "var(--success)" },
  { value: "gasto" as const, label: "Gasto", color: "var(--destructive)" },
  { value: "ahorro" as const, label: "Ahorro", color: "var(--primary-hover)" },
  { value: "inversion" as const, label: "Inversión", color: "var(--primary-hover)" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultValues(
  preset: Movement["type"] | undefined,
  membershipId: string,
): NewMovementInput {
  return {
    type: preset ?? "gasto",
    description: "",
    amount: 0,
    currency: "ARS",
    date: todayISO(),
    category: "",
    paymentMethod: "credito",
    recurrence: "unico",
    membershipId,
  };
}

export function NewMovementSheet({
  open,
  onClose,
  preset,
  memberships,
  defaultMembershipId,
}: Props) {
  const form = useForm<NewMovementInput>({
    resolver: zodResolver(newMovementSchema),
    defaultValues: defaultValues(preset, defaultMembershipId),
  });

  const type = form.watch("type");
  const currency = form.watch("currency");
  const category = form.watch("category");
  const membershipId = form.watch("membershipId");

  useEffect(() => {
    if (open) form.reset(defaultValues(preset, defaultMembershipId));
  }, [open, preset, defaultMembershipId, form]);

  useEffect(() => {
    form.setValue("category", "");
  }, [type, form]);

  const onSubmit = (data: NewMovementInput) => {
    console.log("[NewMovement] submit (stub):", data);
    toast.success("Movimiento guardado", {
      description: "Es un stub — conectamos al Server Action en el próximo paso.",
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-2xl border-t border-border"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Nuevo movimiento</SheetTitle>
          <SheetDescription>
            Atajo: <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium">N</kbd>
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-4 pb-6"
        >
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {TYPE_TABS.map((t) => {
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => form.setValue("type", t.value)}
                  className={cn(
                    "shrink-0 rounded-full border border-border px-3 py-1.5 text-xs transition-colors",
                    active
                      ? "font-medium text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                  style={active ? { background: t.color } : undefined}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">¿Qué es?</Label>
            <Input
              id="description"
              autoComplete="off"
              {...form.register("description")}
              placeholder="Coto, Sueldo, Plazo fijo..."
            />
            {form.formState.errors.description && (
              <p className="text-xs text-[var(--destructive)]">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-[1fr_100px] gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                {...form.register("amount", { valueAsNumber: true })}
                placeholder="0"
                className="tabular-nums"
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-[var(--destructive)]">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                value={currency}
                onValueChange={(v) =>
                  form.setValue("currency", v as "ARS" | "USD")
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" type="date" {...form.register("date")} />
              {form.formState.errors.date && (
                <p className="text-xs text-[var(--destructive)]">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={category}
                onValueChange={(v) => form.setValue("category", v)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Elegí..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES_BY_TYPE[type].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-[var(--destructive)]">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member">Quién</Label>
            <Select
              value={membershipId}
              onValueChange={(v) => form.setValue("membershipId", v)}
            >
              <SelectTrigger id="member">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {memberships.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
