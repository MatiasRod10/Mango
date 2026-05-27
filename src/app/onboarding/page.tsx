import { redirect } from "next/navigation";
import {
  currentMembership,
  currentUser,
  requireUser,
} from "@/lib/auth/current";
import { MangoLogo } from "@/components/shared/mango-logo";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  await requireUser();

  // Si ya tiene membership, no debería estar acá
  const membership = await currentMembership();
  if (membership) redirect("/dashboard");

  const user = await currentUser();
  const suggestedMemberName =
    user?.displayName || user?.primaryEmail?.split("@")[0] || "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <MangoLogo className="text-5xl" />
          <p className="mt-2 text-sm text-muted-foreground">
            Empecemos.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">¿Cómo te llamamos?</h1>
            <p className="text-sm text-muted-foreground">
              Vamos a crear tu espacio en Mango con tu nombre y el de tu
              grupo. Lo podés cambiar después.
            </p>
          </div>
          <OnboardingForm suggestedMemberName={suggestedMemberName} />
        </div>
      </div>
    </main>
  );
}
