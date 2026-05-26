import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { QuickAddProvider } from "@/components/shared/quick-add-provider";
import { currentEntity, currentMembership } from "@/lib/auth/current";
import { getMembershipsByEntity } from "@/lib/db/queries/entity";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entity, membership] = await Promise.all([
    currentEntity(),
    currentMembership(),
  ]);

  if (!entity || !membership) {
    // Sin auth, no debería pasar — pero si pasa, mejor 404 que crash.
    notFound();
  }

  const memberships = await getMembershipsByEntity(entity.id);

  return (
    <QuickAddProvider
      memberships={memberships.map((m) => ({ id: m.id, name: m.name }))}
      currentMembershipId={membership.id}
    >
      <AppShell
        entityName={entity.name}
        userName={membership.name}
        userRole={membership.role}
      >
        {children}
      </AppShell>
    </QuickAddProvider>
  );
}
