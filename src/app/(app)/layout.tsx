import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { QuickAddProvider } from "@/components/shared/quick-add-provider";
import {
  currentEntity,
  currentMembership,
  requireUser,
} from "@/lib/auth/current";
import { getMembershipsByEntity } from "@/lib/db/queries/entity";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate: si no hay user, redirect a sign-in (lo hace requireUser).
  await requireUser();

  const [entity, membership] = await Promise.all([
    currentEntity(),
    currentMembership(),
  ]);

  if (!membership || !entity) {
    // Tiene user pero no membership/entity. TODO: pantalla de onboarding.
    // Por ahora, lo mandamos a sign-in para que vuelva a empezar.
    redirect("/handler/sign-in");
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
