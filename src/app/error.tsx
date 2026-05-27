"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MangoLogo } from "@/components/shared/mango-logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción esto irá a un servicio de logs (Sentry, etc.)
    console.error("[Mango error boundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <MangoLogo className="text-5xl" />
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background:
              "color-mix(in oklab, var(--destructive) 15%, transparent)",
            color: "var(--destructive)",
          }}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Algo se rompió</h1>
          <p className="text-sm text-muted-foreground">
            {error.message || "Error inesperado en la app."}
          </p>
          {error.digest && (
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={reset}>Reintentar</Button>
          <Link href="/dashboard">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
