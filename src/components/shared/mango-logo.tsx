import { cn } from "@/lib/utils";

/**
 * Wordmark de Mango con gradient violeta.
 * Usar con `text-3xl`, `text-5xl`, etc. según contexto.
 */
export function MangoLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-br from-[#9963FF] to-[#7B3FF2] bg-clip-text font-bold tracking-tight text-transparent",
        className,
      )}
    >
      Mango
    </span>
  );
}
