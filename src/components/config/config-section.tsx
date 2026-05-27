import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

/**
 * Wrapper común para las secciones de /config — un card con header (icono +
 * título + descripción) y body.
 */
export function ConfigSection({
  icon: Icon,
  title,
  description,
  children,
  action,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-start gap-4 border-b border-border p-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in oklab, var(--primary) 12%, transparent)",
            color: "var(--primary-hover)",
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
