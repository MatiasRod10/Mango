import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

/**
 * Shell del app group. Sidebar en desktop, bottom-nav en mobile.
 * El main pad-bottom extra en mobile para que el contenido no quede
 * tapado por el bottom-nav fijo.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden md:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-24 pt-2 md:px-8 md:pb-12">
          {children}
        </main>
      </div>
      <BottomNav className="md:hidden" />
    </div>
  );
}
