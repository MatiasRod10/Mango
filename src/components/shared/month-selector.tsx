"use client";

import { useTransition } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { setActiveMonth } from "@/lib/preferences/active-month";
import { formatMonthLabel } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

type Props = {
  month: string; // YYYY-MM activo
  options: string[]; // lista de YYYY-MM, descendente
};

export function MonthSelector({ month, options }: Props) {
  const [isPending, startTransition] = useTransition();
  const label = formatMonthLabel(month);
  const [m, y] = label.split(" ");

  const handleSelect = (target: string) => {
    if (target === month || isPending) return;
    startTransition(() => {
      setActiveMonth(target);
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm transition-colors hover:bg-secondary/70",
            isPending && "opacity-70",
          )}
        >
          <span className="text-muted-foreground">{m}</span>
          <span className="font-medium">{y}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-56 p-1">
        <div className="max-h-72 overflow-y-auto">
          {options.map((opt) => {
            const active = opt === month;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-secondary font-medium"
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{formatMonthLabel(opt)}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
