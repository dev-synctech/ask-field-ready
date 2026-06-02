import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useEntitlement, useIsAdmin } from "@/hooks/use-auth";
import { Header } from "./_authenticated.learn";
import { LogOut, ShieldCheck, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — At the Elbow Academy" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useAuth();
  const { data: ent } = useEntitlement(user);
  const { data: isAdmin } = useIsAdmin(user);
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').maybeSingle();
      return data;
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: '/' });
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <Header title="Account" subtitle="Manage your access." />

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-display font-semibold text-lg">
            {(profile?.display_name ?? user?.email ?? '?')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold">{profile?.display_name ?? 'Member'}</div>
            <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><CreditCard className="size-3.5" /> Access</div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <div className="font-display font-semibold capitalize">{ent?.status ?? 'inactive'}</div>
            {ent?.granted_at && (
              <div className="text-xs text-muted-foreground">Since {new Date(ent.granted_at).toLocaleDateString()}</div>
            )}
          </div>
          {ent?.status !== 'active' && (
            <button onClick={() => navigate({ to: '/checkout' })}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              Get access
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-primary" />
            <div>
              <div className="font-display font-semibold">Admin access</div>
              <div className="text-xs text-muted-foreground">You can manage content.</div>
            </div>
          </div>
          <button onClick={() => navigate({ to: '/admin' })} className="text-sm text-primary font-medium">Open</button>
        </div>
      )}

      <button onClick={signOut} className="mt-6 w-full h-11 rounded-xl border border-border hover:bg-secondary text-sm font-medium inline-flex items-center justify-center gap-2">
        <LogOut className="size-4" /> Sign out
      </button>
    </div>
  );
}
