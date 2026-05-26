"use client";

import { useTransition } from "react";
import {
  setDisplayCurrency,
  type DisplayCurrency,
} from "@/lib/preferences/display-currency";
import { cn } from "@/lib/utils";

type Props = {
  value: DisplayCurrency;
  className?: string;
  size?: "sm" | "md";
};

export function CurrencyToggle({ value, className, size = "md" }: Props) {
  const [isPending, startTransition] = useTransition();

  const set = (currency: DisplayCurrency) => {
    if (currency === value || isPending) return;
    startTransition(() => {
      setDisplayCurrency(currency);
    });
  };

  const padClass = size === "sm" ? "px-2.5 py-0.5" : "px-3 py-1";

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-border bg-secondary p-0.5 text-xs",
        isPending && "opacity-70",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => set("ARS")}
        className={cn(
          "rounded-full transition-all",
          padClass,
          value === "ARS"
            ? "bg-foreground font-semibold text-background"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        ARS
      </button>
      <button
        type="button"
        onClick={() => set("USD")}
        className={cn(
          "rounded-full transition-all",
          padClass,
          value === "USD"
            ? "bg-foreground font-semibold text-background"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        USD
      </button>
    </div>
  );
}
