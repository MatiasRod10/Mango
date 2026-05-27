"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Check,
  Copy,
  MoreVertical,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createInvitationAction,
  removeMembershipAction,
} from "@/lib/actions/memberships";
import {
  createInvitationSchema,
  type CreateInvitationInput,
} from "@/lib/schemas/membership";
import type { Membership } from "@/lib/db/schema";
import { ConfigSection } from "./config-section";

type Props = {
  members: Membership[];
  currentMembershipId: string;
  canManage: boolean;
  appUrl: string;
};

const ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
] as const;

export function MembersSection({
  members,
  currentMembershipId,
  canManage,
  appUrl,
}: Props) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Membership | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const [linkCopied, setLinkCopied] = useState(false);

  const form = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { email: "", name: "", role: "member" },
  });

  const role = form.watch("role");

  const onInvite = (data: CreateInvitationInput) => {
    startTransition(async () => {
      const r = await createInvitationAction(data);
      if (r.ok) {
        const link = `${appUrl}/invite/${r.data.token}`;
        setInviteLink(link);
        toast.success("Invitación creada. Copiá el link y pasáselo.");
        form.reset({ email: "", name: "", role: "member" });
      } else {
        toast.error(r.error);
      }
    });
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Selectalo manualmente.");
    }
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    startRemove(async () => {
      const r = await removeMembershipAction(removeTarget.id);
      if (r.ok) {
        toast.success(`${removeTarget.name} removido`);
        setRemoveTarget(null);
      } else {
        toast.error(r.error);
      }
    });
  };

  return (
    <>
      <ConfigSection
        icon={Users}
        title="Miembros"
        description={`${members.length} ${members.length === 1 ? "miembro activo" : "miembros activos"}`}
        action={
          canManage ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowInvite((v) => !v);
                setInviteLink(null);
              }}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invitar
            </Button>
          ) : null
        }
      >
        <div className="space-y-3">
          {/* Lista de miembros */}
          <div className="divide-y divide-border rounded-xl border border-border">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background:
                      "color-mix(in oklab, var(--primary) 15%, transparent)",
                    color: "var(--primary-hover)",
                  }}
                >
                  {(m.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.name}
                    {m.id === currentMembershipId && (
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        (vos)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {m.invitedEmail ?? "Sin email"}
                    {!m.userId && " · pendiente"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                  {m.role}
                </span>
                {canManage && m.id !== currentMembershipId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        aria-label="Acciones"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-[var(--destructive)] focus:text-[var(--destructive)]"
                        onClick={() => setRemoveTarget(m)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>

          {/* Form de invitar */}
          {showInvite && canManage && (
            <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-3">
              <form
                onSubmit={form.handleSubmit(onInvite)}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-name">Nombre</Label>
                    <Input
                      id="invite-name"
                      placeholder="Sofía"
                      {...form.register("name")}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="invite-role">Rol</Label>
                    <Select
                      value={role}
                      onValueChange={(v) =>
                        form.setValue(
                          "role",
                          v as CreateInvitationInput["role"],
                        )
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="sofia@ejemplo.com"
                    {...form.register("email")}
                    disabled={isPending}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-[var(--destructive)]">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? "Generando..." : "Generar link de invitación"}
                </Button>
              </form>

              {inviteLink && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Pasale este link al miembro (expira en 7 días):
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={inviteLink}
                      onClick={(e) => e.currentTarget.select()}
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                    >
                      {linkCopied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ConfigSection>

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Remover a {removeTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Pierde acceso a la entidad. Los movimientos y datos que cargó
              quedan en la base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              disabled={isRemoving}
              className="bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
            >
              {isRemoving ? "Removiendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
