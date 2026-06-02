import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function assertNonProductionHost() {
  // Allow only on local dev and Lovable preview hosts — never on production.
  let host = "";
  try { host = (getRequestHost() ?? "").toLowerCase(); } catch { host = ""; }
  const isPreview = host.includes("-preview--") || host.includes("preview--") || host.endsWith(".lovable.dev");
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1") || host === "";
  const isProdEnv = process.env.NODE_ENV === "production";
  if (isProdEnv && !isPreview && !isLocal) {
    throw new Error("Test access bypass is disabled in production.");
  }
}


async function assertAdmin(supabase: any, userId: string) {
  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
  if (!isAdmin) throw new Error("Forbidden");
}

export type AdminUserRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  is_admin: boolean;
  entitlement_status: string;
  amount_cents: number | null;
  granted_at: string | null;
  stripe_payment_intent: string | null;
};

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ users: AdminUserRow[]; error?: string }> => {
    try {
      await assertAdmin(context.supabase, context.userId);

      // Admin client to read auth.users (emails) and join other tables.
      const { data: authList, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (authErr) throw new Error(authErr.message);

      const [{ data: profiles }, { data: roles }, { data: ents }] = await Promise.all([
        supabaseAdmin.from("profiles").select("id,display_name"),
        supabaseAdmin.from("user_roles").select("user_id,role"),
        supabaseAdmin.from("entitlements").select("user_id,status,amount_cents,granted_at,stripe_payment_intent"),
      ]);

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]));
      const adminSet = new Set((roles ?? []).filter((r: any) => r.role === "admin").map((r: any) => r.user_id));
      const entMap = new Map((ents ?? []).map((e: any) => [e.user_id, e]));

      const users: AdminUserRow[] = authList.users.map((u) => {
        const e: any = entMap.get(u.id);
        return {
          user_id: u.id,
          email: u.email ?? null,
          display_name: profileMap.get(u.id) ?? null,
          created_at: u.created_at,
          is_admin: adminSet.has(u.id),
          entitlement_status: e?.status ?? "inactive",
          amount_cents: e?.amount_cents ?? null,
          granted_at: e?.granted_at ?? null,
          stripe_payment_intent: e?.stripe_payment_intent ?? null,
        };
      });

      users.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      return { users };
    } catch (error: any) {
      return { users: [], error: error?.message ?? "Failed to load users" };
    }
  });

export const setEntitlementStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      target_user_id: z.string().uuid(),
      status: z.enum(["inactive", "active", "failed", "refunded", "disputed"]),
    }).parse
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean; error?: string }> => {
    try {
      await assertAdmin(context.supabase, context.userId);

      const patch: Record<string, any> = {
        user_id: data.target_user_id,
        status: data.status,
        updated_at: new Date().toISOString(),
      };
      if (data.status === "active") {
        patch.granted_at = new Date().toISOString();
        patch.stripe_session_id = `test_${Date.now()}`;
        patch.amount_cents = 10000;
      }

      const { error } = await supabaseAdmin
        .from("entitlements")
        .upsert(patch, { onConflict: "user_id" });
      if (error) throw new Error(error.message);

      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error?.message ?? "Update failed" };
    }
  });

/**
 * DEV/preview-only bypass: admin grants themselves an active entitlement
 * without going through Stripe. Refuses to run on production hosts.
 */
export const activateTestAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: boolean; error?: string }> => {
    try {
      assertNonProductionHost();
      await assertAdmin(context.supabase, context.userId);

      const { error } = await supabaseAdmin
        .from("entitlements")
        .upsert(
          {
            user_id: context.userId,
            status: "active",
            granted_at: new Date().toISOString(),
            stripe_session_id: `test_bypass_${Date.now()}`,
            amount_cents: 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw new Error(error.message);
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error?.message ?? "Could not activate test access" };
    }
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { data } = await context.supabase
      .from("user_roles").select("role").eq("user_id", context.userId);
    return { isAdmin: (data ?? []).some((r: any) => r.role === "admin") };
  });

