"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Mango app error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-16 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background:
            "color-mix(in oklab, var(--destructive) 15%, transparent)",
          color: "var(--destructive)",
        }}
      >
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">No pude cargar esta pantalla</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "Probá reintentar."}
        </p>
      </div>
      <Button onClick={reset} size="sm">
        <RotateCcw className="h-3.5 w-3.5" />
        Reintentar
      </Button>
    </div>
  );
}
