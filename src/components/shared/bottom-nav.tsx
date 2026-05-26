"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  List,
  Plus,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuickAdd } from "./quick-add-provider";

const LEFT_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/movimientos", label: "Movs.", icon: List },
] as const;

const RIGHT_ITEMS = [
  { href: "/inversiones", label: "Inv.", icon: TrendingUp },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { menuOpen, openMenu, closeMenu } = useQuickAdd();

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4",
        className,
      )}
    >
      <div className="pointer-events-auto relative mx-auto max-w-[420px]">
        {/* FAB — abre / cierra el menú radial */}
        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Nuevo movimiento"}
          onClick={menuOpen ? closeMenu : openMenu}
          className={cn(
            "absolute -top-7 left-1/2 z-[49] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-[0_12px_32px_-8px_rgba(123,63,242,0.6)] transition-transform",
            menuOpen && "rotate-45",
          )}
          style={{
            background: "linear-gradient(135deg, #9963FF 0%, #7B3FF2 100%)",
          }}
        >
          {menuOpen ? (
            <X className="h-6 w-6" strokeWidth={2.5} />
          ) : (
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          )}
        </button>

        <nav className="flex items-center justify-around rounded-2xl border border-border bg-card py-3">
          {LEFT_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 transition-colors",
                  active ? "text-[var(--primary-hover)]" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className={cn("text-[10px]", active && "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Espacio reservado para el FAB */}
          <div className="w-14" aria-hidden="true" />

          {RIGHT_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 transition-colors",
                  active ? "text-[var(--primary-hover)]" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className={cn("text-[10px]", active && "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
