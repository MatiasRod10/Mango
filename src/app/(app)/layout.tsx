import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { QuickAddProvider } from "@/components/shared/quick-add-provider";
import {
  currentEntity,
  currentMembership,
  currentUser,
  requireUser,
} from "@/lib/auth/current";
import { getMembershipsByEntity } from "@/lib/db/queries/entity";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  const [user, entity, membership] = await Promise.all([
    currentUser(),
    currentEntity(),
    currentMembership(),
  ]);

  if (!membership || !entity) {
    // Hay user pero no entity → onboarding
    redirect("/onboarding");
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
        userEmail={user?.primaryEmail ?? undefined}
      >
        {children}
      </AppShell>
    </QuickAddProvider>
  );
}
