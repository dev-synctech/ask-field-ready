import { Link, useRouterState } from "@tanstack/react-router";
import {
  Search, BookOpen, ListChecks, Film, UserRound, Shield, NotebookPen, ClipboardCheck, MoreHorizontal, X,
} from "lucide-react";
import { ReactNode, useState } from "react";

const primaryNav = [
  { to: "/ask", label: "Ask", icon: Search },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/playbooks", label: "Playbooks", icon: NotebookPen },
  { to: "/scenarios", label: "Scenarios", icon: ListChecks },
  { to: "/videos", label: "Videos", icon: Film },
  { to: "/checklists", label: "Lists", icon: ClipboardCheck },
];

// Mobile bottom nav: Ask is first/default. More opens a sheet with everything else.
const mobileNav = [
  { to: "/ask", label: "Ask", icon: Search },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/playbooks", label: "Plays", icon: NotebookPen },
  { to: "/scenarios", label: "Scenarios", icon: ListChecks },
];

const moreItems = [
  { to: "/videos", label: "Videos", icon: Film },
  { to: "/checklists", label: "Checklists", icon: ClipboardCheck },
  { to: "/admin", label: "Admin", icon: Shield },
  { to: "/account", label: "Account", icon: UserRound },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreItems.some(i => path === i.to || path.startsWith(i.to + "/"));

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop side rail */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-surface px-4 py-6 sticky top-0 h-screen">
        <Link to="/ask" className="flex items-center gap-2 mb-8 px-2">
          <Logo />
          <div className="leading-tight">
            <div className="font-display font-semibold text-sm">Mizly</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Academy</div>
          </div>
        </Link>
        <nav className="space-y-1">
          {primaryNav.map(n => {
            const active = path === n.to || path.startsWith(n.to + "/");
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
          <Link to="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${path.startsWith('/admin') ? 'bg-primary-soft text-primary font-medium' : 'text-foreground/70 hover:bg-secondary'}`}>
            <Shield className="size-4" /> Admin
          </Link>
          <Link to="/account" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${path === '/account' ? 'bg-primary-soft text-primary font-medium' : 'text-foreground/70 hover:bg-secondary'}`}>
            <UserRound className="size-4" /> Account
          </Link>
          <div className="px-3 pt-3 text-[10px] uppercase tracking-wider text-muted-foreground">Demo build</div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/ask" className="flex items-center gap-2">
            <Logo />
            <span className="font-display font-semibold text-sm">Mizly</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/admin" className="size-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Admin">
              <Shield className="size-4" />
            </Link>
            <Link to="/account" className="size-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Account">
              <UserRound className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 min-w-0 pb-24 md:pb-10">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border pb-safe">
        <div className="grid grid-cols-5">
          {mobileNav.map(n => {
            const active = path === n.to || path.startsWith(n.to + "/");
            return (
              <Link key={n.to} to={n.to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <n.icon className="size-5" />
                {n.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${moreActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <MoreHorizontal className="size-5" />
            More
          </button>
        </div>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="w-full bg-card rounded-t-3xl border-t border-border p-5 pb-safe animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-semibold">More</div>
              <button onClick={() => setMoreOpen(false)} aria-label="Close" className="size-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map(i => (
                <Link key={i.to} to={i.to} onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-secondary text-sm font-medium">
                  <i.icon className="size-4 text-primary" /> {i.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground text-center">Demo build</div>
          </div>
        </div>
      )}
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
