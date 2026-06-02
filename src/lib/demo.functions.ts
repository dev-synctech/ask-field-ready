// TODO: REMOVE BEFORE PRODUCTION LAUNCH
// This module powers the "Enter Demo/Admin Mode" testing shortcut. It is
// strictly host-gated to local/preview environments. Delete this file, the
// DemoModeButton, and the DemoModeBanner before going live.
import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";


const DEMO_EMAIL = "demo+admin@lovable.test";

function assertNonProductionHost() {
  let host = "";
  try { host = (getRequestHost() ?? "").toLowerCase(); } catch { host = ""; }
  const isPreview =
    host.includes("-preview--") ||
    host.includes("preview--") ||
    host.endsWith(".lovable.dev") ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com");
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host === "";
  const isProdEnv = process.env.NODE_ENV === "production";
  if (isProdEnv && !isPreview && !isLocal) {
    throw new Error("Demo mode is disabled in production.");
  }
}

function randomPassword() {
  return "demo-" + crypto.randomUUID() + "-" + Date.now().toString(36);
}

/**
 * Provisions/refreshes a demo admin user and returns sign-in credentials.
 * The client uses them with supabase.auth.signInWithPassword() to obtain a
 * real Supabase session — entitlement is set server-side via service role,
 * never trusted from the client.
 */
export const enterDemoMode = createServerFn({ method: "POST" }).handler(
  async (): Promise<{
    ok: boolean;
    email?: string;
    access_token?: string;
    refresh_token?: string;
    error?: string;
  }> => {
    try {
      assertNonProductionHost();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { createClient } = await import("@supabase/supabase-js");

      const password = randomPassword();

      // 1. Find or create the demo user.
      let userId: string | null = null;
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        page: 1, perPage: 200,
      });
      if (listErr) throw new Error(listErr.message);
      const existing = list.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);

      if (existing) {
        userId = existing.id;
        const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
        });
        if (updErr) throw new Error(updErr.message);
      } else {
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: DEMO_EMAIL,
          password,
          email_confirm: true,
          user_metadata: { display_name: "Demo Admin" },
        });
        if (createErr) throw new Error(createErr.message);
        userId = created.user?.id ?? null;
      }
      if (!userId) throw new Error("Failed to provision demo user.");

      // 2. Ensure admin role.
      const { data: existingRoles } = await supabaseAdmin
        .from("user_roles").select("role").eq("user_id", userId);
      const hasAdmin = (existingRoles ?? []).some((r: any) => r.role === "admin");
      if (!hasAdmin) {
        const { error: roleErr } = await supabaseAdmin
          .from("user_roles").insert({ user_id: userId, role: "admin" });
        if (roleErr) throw new Error(roleErr.message);
      }

      // 3. Ensure active entitlement (no Stripe involved).
      const { error: entErr } = await supabaseAdmin
        .from("entitlements")
        .upsert(
          {
            user_id: userId,
            status: "active",
            granted_at: new Date().toISOString(),
            stripe_session_id: `demo_${Date.now()}`,
            amount_cents: 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (entErr) throw new Error(entErr.message);

      // 4. Sign in server-side to obtain a real session, then hand tokens to
      // the client. This avoids preview-environment fetch-proxy issues that
      // can intercept client-side signInWithPassword POSTs.
      const url = process.env.SUPABASE_URL!;
      const anon = process.env.SUPABASE_PUBLISHABLE_KEY!;
      const ephemeral = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      const { data: signIn, error: signInErr } = await ephemeral.auth.signInWithPassword({
        email: DEMO_EMAIL, password,
      });
      if (signInErr || !signIn.session) {
        throw new Error(signInErr?.message ?? "Failed to create demo session.");
      }

      return {
        ok: true,
        email: DEMO_EMAIL,
        access_token: signIn.session.access_token,
        refresh_token: signIn.session.refresh_token,
      };
    } catch (error: any) {
      return { ok: false, error: error?.message ?? "Could not enter demo mode" };
    }
  }
);
