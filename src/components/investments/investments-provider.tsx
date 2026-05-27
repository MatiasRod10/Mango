"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { InvestmentSheet } from "./investment-sheet";
import { UpdateValueDialog } from "./update-value-dialog";
import type { Investment } from "@/lib/db/schema";

type SheetState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; investment: Investment };

type DialogState =
  | { mode: "closed" }
  | { mode: "update-value"; investment: Investment };

type Ctx = {
  openCreate: () => void;
  openEdit: (investment: Investment) => void;
  openUpdateValue: (investment: Investment) => void;
};

const InvestmentsCtx = createContext<Ctx | null>(null);

export function useInvestments(): Ctx {
  const ctx = useContext(InvestmentsCtx);
  if (!ctx) {
    throw new Error(
      "useInvestments debe usarse dentro de <InvestmentsProvider>",
    );
  }
  return ctx;
}

export function InvestmentsProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetState>({ mode: "closed" });
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });

  const openCreate = useCallback(() => setSheet({ mode: "create" }), []);
  const openEdit = useCallback(
    (inv: Investment) => setSheet({ mode: "edit", investment: inv }),
    [],
  );
  const openUpdateValue = useCallback(
    (inv: Investment) =>
      setDialog({ mode: "update-value", investment: inv }),
    [],
  );

  return (
    <InvestmentsCtx.Provider value={{ openCreate, openEdit, openUpdateValue }}>
      {children}

      <InvestmentSheet
        open={sheet.mode !== "closed"}
        onClose={() => setSheet({ mode: "closed" })}
        editing={sheet.mode === "edit" ? sheet.investment : undefined}
      />

      <UpdateValueDialog
        open={dialog.mode === "update-value"}
        onClose={() => setDialog({ mode: "closed" })}
        investment={
          dialog.mode === "update-value" ? dialog.investment : undefined
        }
      />
    </InvestmentsCtx.Provider>
  );
}
