"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { NewMovementSheet } from "./new-movement-sheet";
import { cn } from "@/lib/utils";
import type { Movement, Membership } from "@/lib/db/schema";

type MovementType = Movement["type"];

type Ctx = {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  openSheet: (preset?: MovementType) => void;
  closeSheet: () => void;
};

const QuickAddCtx = createContext<Ctx | null>(null);

export function useQuickAdd(): Ctx {
  const ctx = useContext(QuickAddCtx);
  if (!ctx) {
    throw new Error("useQuickAdd debe usarse dentro de <QuickAddProvider>");
  }
  return ctx;
}

type Action = {
  type: MovementType;
  label: string;
  icon: LucideIcon;
  color: string;
  angle: number;
};

const ACTIONS: Action[] = [
  { type: "ingreso",   label: "Ingreso",   icon: ArrowDownToLine, color: "var(--success)",       angle: 200 },
  { type: "gasto",     label: "Gasto",     icon: ArrowUpFromLine, color: "var(--destructive)",   angle: 235 },
  { type: "ahorro",    label: "Ahorro",    icon: PiggyBank,       color: "var(--primary)",       angle: 305 },
  { type: "inversion", label: "Invertir",  icon: TrendingUp,      color: "var(--primary-hover)", angle: 340 },
];

const RADIUS = 88;

function angleToOffset(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
}

type Props = {
  children: ReactNode;
  /** Memberships de la entidad para popular el "Quién" del form. */
  memberships: Pick<Membership, "id" | "name">[];
  /** Membership del user activo — default para el form. */
  currentMembershipId: string;
};

export function QuickAddProvider({
  children,
  memberships,
  currentMembershipId,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preset, setPreset] = useState<MovementType | undefined>();

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openSheet = useCallback((p?: MovementType) => {
    setMenuOpen(false);
    setPreset(p);
    setSheetOpen(true);
  }, []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useKeyboardShortcut("n", () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      openSheet();
    } else {
      openMenu();
    }
  });

  return (
    <QuickAddCtx.Provider
      value={{ menuOpen, openMenu, closeMenu, openSheet, closeSheet }}
    >
      {children}

      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={closeMenu}
        className={cn(
          "fixed inset-0 z-[45] transition-opacity md:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        tabIndex={menuOpen ? 0 : -1}
      />

      <div
        className="pointer-events-none fixed bottom-[60px] left-1/2 z-[48] -translate-x-1/2 md:hidden"
        aria-hidden={!menuOpen}
      >
        {ACTIONS.map((action, idx) => {
          const offset = angleToOffset(action.angle, RADIUS);
          const Icon = action.icon;
          return (
            <div
              key={action.type}
              className="absolute left-0 top-0"
              style={{
                transform: menuOpen
                  ? `translate(${offset.x}px, ${offset.y}px) scale(1)`
                  : "translate(0, 0) scale(0)",
                transition: `transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 40}ms, opacity 0.2s ${idx * 40}ms`,
                opacity: menuOpen ? 1 : 0,
              }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => openSheet(action.type)}
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)]"
                  style={{ background: action.color }}
                  aria-label={action.label}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </button>
                <span className="mt-1.5 block text-center text-[10px] font-medium text-white">
                  {action.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <NewMovementSheet
        open={sheetOpen}
        onClose={closeSheet}
        preset={preset}
        memberships={memberships}
        defaultMembershipId={currentMembershipId}
      />
    </QuickAddCtx.Provider>
  );
}
