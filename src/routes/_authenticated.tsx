import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
    // Check entitlement + admin role
    const [{ data: ent }, { data: roles }] = await Promise.all([
      supabase.from('entitlements').select('status').maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', data.user.id),
    ]);
    const isPaid = ent?.status === 'active';
    const isAdmin = (roles ?? []).some(r => r.role === 'admin');
    // Allow /account regardless; admins always allowed; otherwise must be paid
    const path = location.pathname;
    if (!isPaid && !isAdmin && path !== '/account') {
      throw redirect({ to: '/checkout' });
    }
  },
  component: () => <AppShell><Outlet /></AppShell>,
});
