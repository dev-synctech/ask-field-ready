import { Link, useRouterState } from "@tanstack/react-router";
import {
  Search, BookOpen, ListChecks, Film, UserRound, Shield, NotebookPen, ClipboardCheck, MoreHorizontal, X, Scale,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { MizlyLogo } from "@/components/MizlyLogo";

const primaryNav = [
  { to: "/ask", label: "Ask", icon: Search },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/playbooks", label: "Playbooks", icon: NotebookPen },
  { to: "/scenarios", label: "Scenarios", icon: ListChecks },
  { to: "/videos", label: "Videos", icon: Film },
  { to: "/checklists", label: "Checklists", icon: ClipboardCheck },
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
  { to: "/account", label: "Account", icon: UserRound },
  { to: "/legal", label: "Legal", icon: Scale },
  { to: "/admin", label: "Admin", icon: Shield },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreItems.some(i => path === i.to || path.startsWith(i.to + "/"));

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop side rail */}
      <aside className="hidden md:flex md:w-60 md:flex-col border-r border-border bg-surface px-3 py-5 sticky top-0 h-screen">
        <Link to="/ask" className="flex items-center gap-2 mb-7 px-2 py-1">
          <MizlyLogo size={24} />
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">Field</div>
        </Link>
        <nav className="space-y-0.5">
          {primaryNav.map(n => {
            const active = path === n.to || path.startsWith(n.to + "/");
            return (
              <Link key={n.to} to={n.to}
                className={`group flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] transition-colors ${active ? 'bg-primary-soft text-primary font-medium' : 'text-foreground/65 hover:bg-card/60 hover:text-foreground'}`}>
                <n.icon className={`size-[15px] ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-0.5 pt-4 border-t border-border">
          <Link to="/admin" className={`flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] ${path.startsWith('/admin') ? 'bg-primary-soft text-primary font-medium' : 'text-foreground/65 hover:bg-card/60 hover:text-foreground'}`}>
            <Shield className={`size-[15px] ${path.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'}`} /> Admin
          </Link>
          <Link to="/account" className={`flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] ${path === '/account' ? 'bg-primary-soft text-primary font-medium' : 'text-foreground/65 hover:bg-card/60 hover:text-foreground'}`}>
            <UserRound className={`size-[15px] ${path === '/account' ? 'text-primary' : 'text-muted-foreground'}`} /> Account
          </Link>
          <div className="px-3 pt-3 text-[10px] uppercase tracking-wider text-muted-foreground/70">Demo build</div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border pt-safe">
        <div className="flex items-center justify-between px-4 h-13" style={{ height: 52 }}>
          <Link to="/ask" className="flex items-center gap-2" aria-label="Mizly home">
            <MizlyLogo size={24} />
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/admin" className="size-10 rounded-full hover:bg-secondary flex items-center justify-center text-foreground/70" aria-label="Admin">
              <Shield className="size-[18px]" />
            </Link>
            <Link to="/account" className="size-10 rounded-full hover:bg-secondary flex items-center justify-center text-foreground/70" aria-label="Account">
              <UserRound className="size-[18px]" />
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
                className={`relative flex flex-col items-center justify-center gap-0.5 min-h-12 py-2 text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {active && <span className="absolute top-0 h-[3px] w-10 rounded-full bg-teal" />}
                <n.icon className={`size-[20px] ${active ? 'text-primary' : ''}`} strokeWidth={active ? 2.2 : 1.8} />
                {n.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center gap-0.5 min-h-12 py-2 text-[10px] font-medium ${moreActive ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {moreActive && <span className="absolute top-0 h-[3px] w-10 rounded-full bg-teal" />}
            <MoreHorizontal className={`size-[20px] ${moreActive ? 'text-primary' : ''}`} strokeWidth={moreActive ? 2.2 : 1.8} />
            More
          </button>
        </div>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="w-full bg-card rounded-t-3xl border-t border-border p-5 pb-safe animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" />
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-semibold">More</div>
              <button onClick={() => setMoreOpen(false)} aria-label="Close" className="size-10 rounded-lg hover:bg-secondary inline-flex items-center justify-center">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map(i => (
                <Link key={i.to} to={i.to} onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 min-h-12 rounded-xl border border-border hover:bg-secondary text-sm font-medium">
                  <i.icon className="size-[18px] text-teal" /> {i.label}
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
  return <MizlyLogo size={size} />;
}
