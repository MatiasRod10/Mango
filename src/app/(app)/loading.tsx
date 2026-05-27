import { Skeleton } from "@/components/shared/skeleton";

/**
 * Loading skeleton del app group. Aproxima la estructura de cualquier page
 * (hero + grid + lista) para que no se sienta como un flash.
 */
export default function AppLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Hero card grande */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Grid 4 acciones */}
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>

      {/* Stats 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
