"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/schemas/onboarding";

const ENTITY_TYPES = [
  { value: "family", label: "Familia" },
  { value: "personal", label: "Personal (solo yo)" },
  { value: "project", label: "Proyecto" },
  { value: "company", label: "Empresa" },
] as const;

export function OnboardingForm({
  suggestedMemberName,
}: {
  suggestedMemberName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      entityName: "Mi familia",
      entityType: "family",
      memberName: suggestedMemberName,
    },
  });

  const entityType = form.watch("entityType");

  const onSubmit = (data: OnboardingInput) => {
    startTransition(async () => {
      const r = await completeOnboardingAction(data);
      if (r.ok) {
        toast.success("¡Listo! Bienvenido a Mango.");
        router.push("/dashboard");
      } else {
        toast.error(r.error);
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="memberName">Tu nombre</Label>
        <Input
          id="memberName"
          autoComplete="given-name"
          placeholder="Matías"
          {...form.register("memberName")}
          disabled={isPending}
        />
        {form.formState.errors.memberName && (
          <p className="text-xs text-[var(--destructive)]">
            {form.formState.errors.memberName.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="entityName">Nombre del espacio</Label>
        <Input
          id="entityName"
          placeholder="Familia García"
          {...form.register("entityName")}
          disabled={isPending}
        />
        {form.formState.errors.entityName && (
          <p className="text-xs text-[var(--destructive)]">
            {form.formState.errors.entityName.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="entityType">Tipo</Label>
        <Select
          value={entityType}
          onValueChange={(v) =>
            form.setValue("entityType", v as OnboardingInput["entityType"])
          }
          disabled={isPending}
        >
          <SelectTrigger id="entityType">
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

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isPending}
      >
        {isPending ? "Creando..." : "Empezar"}
      </Button>
    </form>
  );
}
