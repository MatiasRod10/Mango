import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MangoLogo } from "@/components/shared/mango-logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <MangoLogo className="text-5xl" />
        <div className="space-y-2">
          <p className="text-6xl font-bold tracking-tight text-muted-foreground">
            404
          </p>
          <h1 className="text-xl font-semibold">Esta página no existe</h1>
          <p className="text-sm text-muted-foreground">
            O capaz te equivocaste de link. O capaz la borré yo y olvidé
            avisarte.
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="lg">Volver al inicio</Button>
        </Link>
      </div>
    </main>
  );
}
