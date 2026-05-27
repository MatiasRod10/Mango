"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { categoryEmoji } from "@/lib/utils/category";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  categories: readonly string[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Si true, ofrece "Crear: 'XXX'" cuando lo tipeado no matchea ninguna. */
  allowCustom?: boolean;
};

function normalize(s: string): string {
  // Para matcheo case-insensitive y sin acentos
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function CategoryCombobox({
  value,
  onChange,
  categories,
  placeholder = "Elegí...",
  disabled,
  id,
  allowCustom = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const trimmed = search.trim();
  const normalizedSearch = normalize(trimmed);

  const filtered =
    trimmed.length === 0
      ? categories
      : categories.filter((c) => normalize(c).includes(normalizedSearch));

  const exactMatch = categories.some(
    (c) => normalize(c) === normalizedSearch,
  );
  const showCreate = allowCustom && trimmed.length > 0 && !exactMatch;

  const select = (v: string) => {
    onChange(v);
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-2 truncate">
              <span aria-hidden>{categoryEmoji(value)}</span>
              <span className="truncate">{value}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o crear..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length === 0 && !showCreate && (
              <CommandEmpty>Sin coincidencias.</CommandEmpty>
            )}
            {filtered.length > 0 && (
              <CommandGroup heading={trimmed.length > 0 ? "Coincidencias" : "Categorías"}>
                {filtered.map((c) => (
                  <CommandItem
                    key={c}
                    value={c}
                    onSelect={() => select(c)}
                  >
                    <span className="mr-2" aria-hidden>
                      {categoryEmoji(c)}
                    </span>
                    {c}
                    <Check
                      className={cn(
                        "ml-auto h-3.5 w-3.5",
                        value === c ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showCreate && (
              <CommandGroup heading="Custom">
                <CommandItem value={`__create_${trimmed}`} onSelect={() => select(trimmed)}>
                  <Sparkles className="mr-2 h-3.5 w-3.5 text-[var(--primary-hover)]" />
                  Usar &ldquo;
                  <span className="font-medium">{trimmed}</span>
                  &rdquo;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
