"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
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
  updateEntitySchema,
  type UpdateEntityInput,
} from "@/lib/schemas/entity";
import { updateEntityAction } from "@/lib/actions/entity";
import type { Entity } from "@/lib/db/schema";
import { ConfigSection } from "./config-section";

const ENTITY_TYPES = [
  { value: "family", label: "Familia" },
  { value: "company", label: "Empresa" },
  { value: "project", label: "Proyecto" },
  { value: "personal", label: "Personal" },
] as const;

export function EntitySection({
  entity,
  canEdit,
}: {
  entity: Entity;
  canEdit: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateEntityInput>({
    resolver: zodResolver(updateEntitySchema),
    defaultValues: {
      name: entity.name,
      type: entity.type,
      displayCurrency: entity.displayCurrency as "ARS" | "USD",
    },
  });

  const type = form.watch("type");
  const displayCurrency = form.watch("displayCurrency");

  const onSubmit = (data: UpdateEntityInput) => {
    startTransition(async () => {
      const r = await updateEntityAction(data);
      if (r.ok) toast.success("Entidad actualizada");
      else toast.error(r.error);
    });
  };

  const isDirty = form.formState.isDirty;

  return (
    <ConfigSection
      icon={Building2}
      title="Entidad"
      description="Nombre, tipo y moneda base"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="entity-name">Nombre</Label>
          <Input
            id="entity-name"
            {...form.register("name")}
            disabled={!canEdit || isPending}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-[var(--destructive)]">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="entity-type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) =>
                form.setValue("type", v as UpdateEntityInput["type"], {
                  shouldDirty: true,
                })
              }
              disabled={!canEdit || isPending}
            >
              <SelectTrigger id="entity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entity-currency">Moneda base</Label>
            <Select
              value={displayCurrency}
              onValueChange={(v) =>
                form.setValue("displayCurrency", v as "ARS" | "USD", {
                  shouldDirty: true,
                })
              }
              disabled={!canEdit || isPending}
            >
              <SelectTrigger id="entity-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {canEdit ? (
          <Button
            type="submit"
            disabled={isPending || !isDirty}
            size="sm"
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Solo admin u owner pueden editar.
          </p>
        )}
      </form>
    </ConfigSection>
  );
}
