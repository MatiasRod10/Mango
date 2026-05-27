import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

type Props = {
  children: React.ReactNode;
  entityName: string;
  userName: string;
  userRole: string;
  userEmail?: string;
};

export function AppShell({
  children,
  entityName,
  userName,
  userRole,
  userEmail,
}: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        className="hidden md:flex"
        entityName={entityName}
        userName={userName}
        userRole={userRole}
        userEmail={userEmail}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar userInitial={userName.charAt(0)} userName={userName} />
        <main className="flex-1 px-4 pb-24 pt-2 md:px-8 md:pb-12">
          {children}
        </main>
      </div>
      <BottomNav className="md:hidden" />
    </div>
  );
}
