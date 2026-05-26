import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind, deduplicando conflictos.
 * Uso: cn("p-4", condition && "bg-primary")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
