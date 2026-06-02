// TODO: REMOVE BEFORE PRODUCTION LAUNCH — preview-only demo admin seeding.
import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";

export const DEMO_ADMIN_EMAIL = "demo-admin@attheelbow.test";
const DEMO_ADMIN_PASSWORD = "ATE-Demo-2026!";

function assertNonProductionHost() {
  let host = "";
  try { host = (getRequestHost() ?? "").toLowerCase(); } catch { host = ""; }
  const isPreview =
    host.includes("-preview--") ||
    host.includes("preview--") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovable.app");
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host === "";
  const isProdEnv = process.env.NODE_ENV === "production";
  if (isProdEnv && !isPreview && !isLocal) {
    throw new Error("Demo admin seeding is disabled in production.");
  }
}

/**
 * Ensures the fixed demo admin user exists with a known password, admin role,
 * a profile row, and an active entitlement. Idempotent.
 */
export const seedDemoAdmin = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: boolean; email?: string; error?: string }> => {
    try {
      assertNonProductionHost();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1. Find or create the user with the fixed credentials.
      let userId: string | null = null;
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        page: 1, perPage: 1000,
      });
      if (listErr) throw new Error(listErr.message);
      const existing = list.users.find(
        (u) => u.email?.toLowerCase() === DEMO_ADMIN_EMAIL,
      );

      if (existing) {
        userId = existing.id;
        const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          password: DEMO_ADMIN_PASSWORD,
          email_confirm: true,
        });
        if (updErr) throw new Error(updErr.message);
      } else {
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: DEMO_ADMIN_EMAIL,
          password: DEMO_ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { display_name: "Demo Admin" },
        });
        if (createErr) throw new Error(createErr.message);
        userId = created.user?.id ?? null;
      }
      if (!userId) throw new Error("Failed to provision demo admin user.");

      // 2. Ensure profile row.
      const { error: profErr } = await supabaseAdmin
        .from("profiles")
        .upsert(
          { id: userId, display_name: "Demo Admin", updated_at: new Date().toISOString() },
          { onConflict: "id" },
        );
      if (profErr) throw new Error(profErr.message);

      // 3. Ensure admin role.
      const { data: roles } = await supabaseAdmin
        .from("user_roles").select("role").eq("user_id", userId);
      if (!(roles ?? []).some((r: any) => r.role === "admin")) {
        const { error: roleErr } = await supabaseAdmin
          .from("user_roles").insert({ user_id: userId, role: "admin" });
        if (roleErr) throw new Error(roleErr.message);
      }

      // 4. Ensure active entitlement.
      const { error: entErr } = await supabaseAdmin
        .from("entitlements")
        .upsert(
          {
            user_id: userId,
            status: "active",
            granted_at: new Date().toISOString(),
            stripe_session_id: `demo_admin_${Date.now()}`,
            amount_cents: 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      if (entErr) throw new Error(entErr.message);

      return { ok: true, email: DEMO_ADMIN_EMAIL };
    } catch (error: any) {
      return { ok: false, error: error?.message ?? "Could not seed demo admin" };
    }
  },
);
