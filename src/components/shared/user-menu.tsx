"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/actions/auth";

type Props = {
  children: React.ReactNode;
  /** Para el header del menu. */
  userName: string;
  userEmail?: string;
};

export function UserMenu({ children, userName, userEmail }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(() => {
      signOutAction();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="block w-full text-left transition-colors hover:bg-secondary/30"
          aria-label="Menú de usuario"
        >
          {children}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userName}</span>
            {userEmail && (
              <span className="text-xs text-muted-foreground">
                {userEmail}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="text-[var(--destructive)] focus:text-[var(--destructive)]"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isPending ? "Cerrando..." : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
