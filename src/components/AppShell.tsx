import { Link, useRouterState } from "@tanstack/react-router";
import { Search, BookOpen, ListChecks, PlayCircle, Film, UserRound, Shield } from "lucide-react";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { ReactNode } from "react";

const nav = [
  { to: "/ask", label: "Ask", icon: Search },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/scenarios", label: "Scenarios", icon: ListChecks },
  { to: "/videos", label: "Videos", icon: Film },
  { to: "/checklists", label: "Lists", icon: PlayCircle },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user);
  const path = useRouterState({ select: s => s.location.pathname });

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop side rail */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-surface px-4 py-6 sticky top-0 h-screen">
        <Link to="/ask" className="flex items-center gap-2 mb-8 px-2">
          <Logo />
          <div className="leading-tight">
            <div className="font-display font-semibold text-sm">At the Elbow</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Academy</div>
          </div>
        </Link>
        <nav className="space-y-1">
          {nav.map(n => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-primary-soft text-primary font-medium' : 'text-foreground/70 hover:bg-secondary hover:text-foreground'}`}>
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-1">
          {isAdmin && (
            <Link to="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${path.startsWith('/admin') ? 'bg-primary-soft text-primary font-medium' : 'text-foreground/70 hover:bg-secondary'}`}>
              <Shield className="size-4" /> Admin
            </Link>
          )}
          <Link to="/account" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${path === '/account' ? 'bg-primary-soft text-primary font-medium' : 'text-foreground/70 hover:bg-secondary'}`}>
            <UserRound className="size-4" /> Account
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/ask" className="flex items-center gap-2">
            <Logo />
            <span className="font-display font-semibold text-sm">At the Elbow</span>
          </Link>
          <Link to="/account" className="size-9 rounded-full bg-secondary flex items-center justify-center">
            <UserRound className="size-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1 min-w-0 pb-24 md:pb-10">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border pb-safe">
        <div className="grid grid-cols-5">
          {nav.map(n => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <n.icon className="size-5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-soft"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17l-3 4V7a2 2 0 0 1 2-2h3" />
        <path d="M17 7l3-4v14a2 2 0 0 1-2 2h-3" />
        <path d="M9 13l3-3 3 3" />
      </svg>
    </div>
  );
}
