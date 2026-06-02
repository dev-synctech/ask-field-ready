import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Async: TanStack will not render the child route until this resolves.
    const { data, error } = await supabase.auth.getUser();
    if (import.meta.env.DEV) console.debug('[guard] getUser:', { userId: data.user?.id ?? null, error: error?.message });
    if (!data.user) {
      if (import.meta.env.DEV) console.debug('[guard] no user → /login');
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
    const [{ data: ent }, { data: roles }] = await Promise.all([
      supabase.from('entitlements').select('status').maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', data.user.id),
    ]);
    const isPaid = ent?.status === 'active';
    const isAdmin = (roles ?? []).some(r => r.role === 'admin');
    if (import.meta.env.DEV) console.debug('[guard] decision:', { path: location.pathname, isPaid, isAdmin });
    const path = location.pathname;
    if (!isPaid && !isAdmin && path !== '/account') {
      if (import.meta.env.DEV) console.debug('[guard] unpaid → /checkout');
      throw redirect({ to: '/checkout' });
    }
  },
  component: () => <AppShell><Outlet /></AppShell>,
});
