import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/client";
import { entities, memberships } from "@/lib/db/schema";
import { stackServerApp } from "@/stack/server";
import { acceptInvitationAction } from "@/lib/actions/memberships";
import { Button } from "@/components/ui/button";
import { MangoLogo } from "@/components/shared/mango-logo";

type Params = { token: string };

export default async function InvitePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { token } = await params;

  const [invitation] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.inviteToken, token))
    .limit(1);

  if (!invitation) {
    return (
      <ErrorState
        title="Invitación inválida"
        description="Ese link no existe o ya fue usado."
      />
    );
  }

  const [entity] = await db
    .select()
    .from(entities)
    .where(eq(entities.id, invitation.entityId))
    .limit(1);

  if (!entity) {
    return (
      <ErrorState
        title="Entidad no encontrada"
        description="La invitación apunta a una familia que ya no existe."
      />
    );
  }

  const expired =
    invitation.inviteExpiresAt && invitation.inviteExpiresAt < new Date();
  if (expired) {
    return (
      <ErrorState
        title="Invitación expirada"
        description={`El link ya no es válido. Pedile a un admin de ${entity.name} que te mande uno nuevo.`}
      />
    );
  }

  if (invitation.userId) {
    return (
      <ErrorState
        title="Invitación ya usada"
        description={`Alguien ya aceptó esta invitación a ${entity.name}. Si pensás que es un error, contactá al admin.`}
      />
    );
  }

  const user = await stackServerApp.getUser();

  if (!user) {
    // Mandamos al sign-up con returnTo para volver al accept
    redirect(
      `/handler/sign-up?after_auth_return_to=${encodeURIComponent(`/invite/${token}`)}`,
    );
  }

  async function accept() {
    "use server";
    const result = await acceptInvitationAction(token);
    if (result.ok) {
      redirect("/dashboard");
    }
    throw new Error(result.error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center">
        <MangoLogo className="text-4xl" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            Te invitaron a {entity.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{invitation.name}</span>
            {" — "}
            rol{" "}
            <span className="font-medium capitalize text-foreground">
              {invitation.role}
            </span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Vas a poder ver y editar movimientos e inversiones según el rol
          asignado.
        </p>
        <form action={accept}>
          <Button type="submit" size="lg" className="w-full">
            Aceptar invitación
          </Button>
        </form>
        <Link
          href="/dashboard"
          className="block text-xs text-muted-foreground hover:text-foreground"
        >
          No, gracias
        </Link>
      </div>
    </main>
  );
}

function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center">
        <MangoLogo className="text-4xl" />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--primary-hover)] hover:underline"
        >
          Volver al dashboard →
        </Link>
      </div>
    </main>
  );
}
