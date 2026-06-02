import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

// TODO: REMOVE BEFORE PRODUCTION LAUNCH — demo build has no auth gate.
// Phase 2 will restore the Supabase auth + entitlement check.
export const Route = createFileRoute("/_authenticated")({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
