"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  List,
  Plus,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MangoLogo } from "./mango-logo";
import { useQuickAdd } from "./quick-add-provider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/movimientos", label: "Movimientos", icon: List },
  { href: "/inversiones", label: "Inversiones", icon: TrendingUp },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/config", label: "Configuración", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NewButton() {
  const { openSheet } = useQuickAdd();
  return (
    <Button className="w-full" size="lg" onClick={() => openSheet()}>
      <Plus className="h-4 w-4" />
      Nuevo movimiento
      <kbd className="ml-auto rounded border border-foreground/20 bg-foreground/10 px-1.5 py-0.5 text-[10px] font-medium">
        N
      </kbd>
    </Button>
  );
}

type Props = {
  className?: string;
  entityName: string;
  userName: string;
  userRole: string;
};

export function Sidebar({ className, entityName, userName, userRole }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <div className="px-6 py-6">
        <Link href="/dashboard" className="inline-block">
          <MangoLogo className="text-3xl" />
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">{entityName}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <NewButton />
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
            style={{
              background: "color-mix(in oklab, var(--primary) 15%, transparent)",
              color: "var(--primary-hover)",
            }}
          >
            {userName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {userRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
