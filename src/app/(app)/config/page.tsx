import {
  Building2,
  ChevronRight,
  DollarSign,
  KeyRound,
  Palette,
  Tag,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/config/theme-toggle";

const COMING_SOON = [
  {
    icon: Building2,
    label: "Entidad",
    description: "Nombre, tipo, moneda base",
  },
  {
    icon: Users,
    label: "Miembros y roles",
    description: "Invitar gente y asignar permisos",
  },
  {
    icon: DollarSign,
    label: "Cotización del dólar",
    description: "Blue · oficial · MEP · CCL · manual",
  },
  {
    icon: Tag,
    label: "Categorías custom",
    description: "Editar las default y crear nuevas",
  },
  {
    icon: KeyRound,
    label: "Cuenta",
    description: "Email, contraseña, sesiones",
  },
] as const;

export default function ConfigPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Activos los settings que no necesitan auth ni DB.
        </p>
      </div>

      {/* Sección activa */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-4 p-4">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{
              background: "color-mix(in oklab, var(--primary) 12%, transparent)",
              color: "var(--primary-hover)",
            }}
          >
            <Palette className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Apariencia</p>
            <p className="text-[11px] text-muted-foreground">
              Tema claro, oscuro o seguir el del sistema
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Próximamente */}
      <div>
        <p className="mb-2 px-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          Próximamente
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {COMING_SOON.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-4 p-4" aria-disabled>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--secondary)" }}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
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
