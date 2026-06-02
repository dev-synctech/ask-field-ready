import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { listAdminUsers, setEntitlementStatus } from "@/lib/admin.functions";
import { ArrowLeft, Beaker, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Admin · Users — At the Elbow Academy" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/login", search: { redirect: "/admin/users" } });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw redirect({ to: "/ask" });
  },
  component: AdminUsersPage,
});

const STATUSES = ["inactive", "active", "failed", "refunded", "disputed"] as const;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/15 text-success",
  inactive: "bg-secondary text-secondary-foreground",
  failed: "bg-destructive/15 text-destructive",
  refunded: "bg-warning/15 text-warning",
  disputed: "bg-destructive/15 text-destructive",
};

function AdminUsersPage() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listAdminUsers);
  const setStatus = useServerFn(setEntitlementStatus);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });

  const mutate = useMutation({
    mutationFn: async (args: { target_user_id: string; status: typeof STATUSES[number] }) => {
      const res = await setStatus({ data: args });
      if (!res.ok) throw new Error(res.error ?? "Failed");
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const users = data?.users ?? [];
  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: users.filter((u) => u.entitlement_status === s).length }),
    {} as Record<string, number>
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to admin
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Payment status, entitlement, and test-state controls.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {STATUSES.map((s) => (
            <span key={s} className={`px-2.5 py-1 rounded-full ${STATUS_STYLES[s]}`}>
              {s}: <span className="font-semibold">{counts[s] ?? 0}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1">
          <Beaker className="size-3.5" /> Test states
        </div>
        Switching a user's entitlement status here is for QA / support only. Real purchases and refunds flow exclusively through the
        Stripe webhook at <code className="font-mono">/api/public/payments/webhook</code>.
      </div>

      {isLoading && <div className="mt-8 text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="mt-8 text-sm text-destructive">{(error as Error).message}</div>}
      {data?.error && <div className="mt-8 text-sm text-destructive">{data.error}</div>}

      {!isLoading && users.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Entitlement</th>
                <th className="text-left px-4 py-3">Test state</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-t border-border align-middle">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.display_name || u.email || u.user_id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">{u.email ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        <ShieldCheck className="size-3" /> admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">member</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.amount_cents != null ? (
                      <div>
                        <div className="font-mono">${(u.amount_cents / 100).toFixed(2)}</div>
                        <div className="text-muted-foreground">
                          {u.granted_at ? new Date(u.granted_at).toLocaleDateString() : "—"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLES[u.entitlement_status] ?? ""}`}>
                      {u.entitlement_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.entitlement_status}
                      disabled={mutate.isPending}
                      onChange={(e) =>
                        mutate.mutate({
                          target_user_id: u.user_id,
                          status: e.target.value as typeof STATUSES[number],
                        })
                      }
                      className="h-8 text-xs px-2 rounded-lg border border-input bg-surface-elevated"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && users.length === 0 && !error && (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No users yet.
        </div>
      )}
    </div>
  );
}
