import { cn } from "@/lib/utils";

/**
 * Skeleton genérico — gris suave con animación pulse.
 * Usar para loading states de cards, líneas de texto, círculos, etc.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[color-mix(in_oklab,var(--secondary)_70%,var(--card))]",
        className,
      )}
      {...props}
    />
  );
}
