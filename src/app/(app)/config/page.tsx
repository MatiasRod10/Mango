import { ChevronRight, KeyRound, Palette, Tag } from "lucide-react";
import {
  currentEntity,
  currentMembership,
  requireUser,
} from "@/lib/auth/current";
import { getMembershipsByEntity } from "@/lib/db/queries/entity";
import { hasRole, type MemberRole } from "@/lib/auth/roles";
import { ConfigSection } from "@/components/config/config-section";
import { EntitySection } from "@/components/config/entity-section";
import { UsdRateSection } from "@/components/config/usd-rate-section";
import { MembersSection } from "@/components/config/members-section";
import { ThemeToggle } from "@/components/config/theme-toggle";
import { redirect } from "next/navigation";

const COMING_SOON = [
  {
    icon: Tag,
    label: "Categorías custom",
    description: "Editar las default y crear nuevas",
  },
  {
    icon: KeyRound,
    label: "Cuenta y sesiones",
    description: "Email, contraseña, dispositivos",
  },
] as const;

export default async function ConfigPage() {
  await requireUser();
  const [entity, membership] = await Promise.all([
    currentEntity(),
    currentMembership(),
  ]);
  if (!entity || !membership) redirect("/handler/sign-in");

  const allMembers = await getMembershipsByEntity(entity.id);
  const canEditEntity = hasRole(membership.role as MemberRole, "admin");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3003";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Entidad, miembros, cotización y apariencia.
        </p>
      </div>

      <EntitySection entity={entity} canEdit={canEditEntity} />

      <UsdRateSection entity={entity} canEdit={canEditEntity} />

      <MembersSection
        members={allMembers}
        currentMembershipId={membership.id}
        canManage={canEditEntity}
        appUrl={appUrl}
      />

      {/* Apariencia */}
      <ConfigSection
        icon={Palette}
        title="Apariencia"
        description="Tema claro, oscuro o seguir el del sistema"
        action={<ThemeToggle />}
      >
        <></>
      </ConfigSection>

      {/* Próximamente */}
      <div>
        <p className="mb-2 px-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          Próximamente
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {COMING_SOON.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center gap-4 p-4"
                aria-disabled
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--secondary)" }}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.description}
                  </p>
                </div>
                <span className="text-[10px] uppercase text-muted-foreground">
                  Soon
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
