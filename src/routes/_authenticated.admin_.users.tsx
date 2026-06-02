import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck, Search, MoreHorizontal, Eye, ShieldPlus, UserMinus, UserCheck } from "lucide-react";
import { DEMO_USERS, type DemoUser } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/admin_/users")({
  head: () => ({ meta: [{ title: "Admin · Users — At the Elbow Academy" }] }),
  component: AdminUsersPage,
});

function relativeDays(iso: string) {
  const d = new Date(iso + "T00:00:00Z").getTime();
  const days = Math.max(0, Math.floor((Date.parse("2026-06-02") - d) / (1000 * 60 * 60 * 24)));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function AdminUsersPage() {
  // TODO: REMOVE BEFORE PRODUCTION LAUNCH — mock users.
  const [users, setUsers] = useState<DemoUser[]>(DEMO_USERS);
  const [q, setQ] = useState("");
  const [view, setView] = useState<DemoUser | null>(null);

  const visible = useMemo(() => {
    const tk = q.trim().toLowerCase();
    if (!tk) return users;
    return users.filter(u => u.display_name.toLowerCase().includes(tk) || u.email.toLowerCase().includes(tk));
  }, [users, q]);

  const update = (id: string, patch: Partial<DemoUser>) =>
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to admin
      </Link>
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mock directory for the demo build. Actions update in-memory only.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search name or email"
            className="h-10 w-64 pl-9 pr-3 rounded-xl border border-input bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <KPI label="Total users" value={users.length} />
        <KPI label="Admins" value={users.filter(u => u.role === "admin").length} tone="primary" />
        <KPI label="Active" value={users.filter(u => u.access === "active").length} tone="success" />
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1"><ShieldCheck className="size-3.5 text-warning" /> Mock data</div>
        Real users + roles arrive in Phase 2. This table is in-memory only — refresh resets it.
      </div>

      {/* Desktop table */}
      <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs text-muted-foreground">
            <tr className="text-left">
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Access</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 font-medium">Last active</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map(u => (
              <tr key={u.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-display font-semibold">
                      {u.display_name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.display_name}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3">
                  <AccessBadge access={u.access} />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{u.joined_at}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{relativeDays(u.last_active)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconBtn label="View" onClick={() => setView(u)}><Eye className="size-3.5" /></IconBtn>
                    {u.role === "member" ? (
                      <IconBtn label="Make admin" onClick={() => update(u.id, { role: "admin" })}><ShieldPlus className="size-3.5" /></IconBtn>
                    ) : (
                      <IconBtn label="Revoke admin" onClick={() => update(u.id, { role: "member" })}><ShieldPlus className="size-3.5 rotate-180" /></IconBtn>
                    )}
                    {u.access === "active" ? (
                      <IconBtn label="Deactivate" tone="danger" onClick={() => update(u.id, { access: "inactive" })}><UserMinus className="size-3.5" /></IconBtn>
                    ) : (
                      <IconBtn label="Reactivate" tone="success" onClick={() => update(u.id, { access: "active" })}><UserCheck className="size-3.5" /></IconBtn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No users match "{q}"</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-6 space-y-2 md:hidden">
        {visible.map(u => (
          <div key={u.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-display font-semibold">
                {u.display_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{u.display_name}</div>
                <div className="text-xs text-muted-foreground truncate">{u.email}</div>
              </div>
              <RoleBadge role={u.role} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <AccessBadge access={u.access} />
              <span>Joined {u.joined_at} · {relativeDays(u.last_active)}</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <button onClick={() => setView(u)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
                <Eye className="size-3.5" /> View
              </button>
              <button onClick={() => update(u.id, { role: u.role === "admin" ? "member" : "admin" })} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
                <ShieldPlus className="size-3.5" /> {u.role === "admin" ? "Revoke admin" : "Make admin"}
              </button>
              <button onClick={() => update(u.id, { access: u.access === "active" ? "inactive" : "active" })} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
                {u.access === "active" ? <><UserMinus className="size-3.5" /> Deactivate</> : <><UserCheck className="size-3.5" /> Reactivate</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {view && (
        <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setView(null)}>
          <div className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-display font-semibold text-lg">
                {view.display_name[0]}
              </div>
              <div>
                <div className="font-display font-semibold">{view.display_name}</div>
                <div className="text-xs text-muted-foreground">{view.email}</div>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <DetailRow label="Role"><RoleBadge role={view.role} /></DetailRow>
              <DetailRow label="Access"><AccessBadge access={view.access} /></DetailRow>
              <DetailRow label="Joined">{view.joined_at}</DetailRow>
              <DetailRow label="Last active">{relativeDays(view.last_active)}</DetailRow>
            </dl>
            <button onClick={() => setView(null)} className="mt-6 w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: DemoUser["role"] }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${role === "admin" ? "bg-primary-soft text-primary" : "bg-secondary text-secondary-foreground"}`}>
      {role}
    </span>
  );
}
function AccessBadge({ access }: { access: DemoUser["access"] }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${access === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
      {access}
    </span>
  );
}
function IconBtn({ children, label, onClick, tone }: { children: React.ReactNode; label: string; onClick: () => void; tone?: "danger" | "success" }) {
  const cls = tone === "danger" ? "hover:bg-destructive/10 hover:text-destructive" : tone === "success" ? "hover:bg-success/10 hover:text-success" : "hover:bg-secondary";
  return (
    <button onClick={onClick} title={label} aria-label={label} className={`size-8 rounded-lg border border-border inline-flex items-center justify-center text-muted-foreground transition-colors ${cls}`}>
      {children}
    </button>
  );
}
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
function KPI({ label, value, tone }: { label: string; value: number; tone?: "primary" | "success" }) {
  const cls = tone === "success" ? "text-success" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-2xl ${cls}`}>{value}</div>
    </div>
  );
}
