import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Admin · Users — At the Elbow Academy" }] }),
  component: AdminUsersPage,
});

// TODO: REMOVE BEFORE PRODUCTION LAUNCH — mock users for the demo build.
const SEED = [
  { id: "u1", display_name: "Demo Consultant", email: "demo@attheelbow.test", role: "admin", access: "full" as "full" | "none" },
  { id: "u2", display_name: "Alex Reyes", email: "alex@example.test", role: "member", access: "full" as "full" | "none" },
  { id: "u3", display_name: "Jordan Kim", email: "jordan@example.test", role: "member", access: "full" as "full" | "none" },
  { id: "u4", display_name: "Priya Singh", email: "priya@example.test", role: "member", access: "none" as "full" | "none" },
];

function AdminUsersPage() {
  const [users, setUsers] = useState(SEED);

  const setAccess = (id: string, access: "full" | "none") =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, access } : u));

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to admin
      </Link>
      <h1 className="mt-3 text-2xl md:text-3xl font-display font-semibold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">Preview list. Toggle demo access to test gated views later.</p>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1"><ShieldCheck className="size-3.5 text-warning" /> Mock data</div>
        Real users + roles are wired up in Phase 2. This list is in-memory only.
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card divide-y divide-border shadow-soft">
        {users.map(u => (
          <div key={u.id} className="p-4 flex items-center gap-3 flex-wrap">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-display font-semibold">
              {u.display_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{u.display_name}</div>
              <div className="text-xs text-muted-foreground truncate">{u.email}</div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-primary-soft text-primary" : "bg-secondary text-secondary-foreground"}`}>
              {u.role}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.access === "full" ? "bg-success/15 text-success" : "bg-secondary text-secondary-foreground"}`}>
              {u.access === "full" ? "active" : "inactive"}
            </span>
            <button
              onClick={() => setAccess(u.id, u.access === "full" ? "none" : "full")}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary"
            >
              {u.access === "full" ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
