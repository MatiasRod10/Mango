import { AppShell } from "@/components/shared/app-shell";
import { QuickAddProvider } from "@/components/shared/quick-add-provider";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuickAddProvider>
      <AppShell>{children}</AppShell>
    </QuickAddProvider>
  );
}
