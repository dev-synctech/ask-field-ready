// TODO: REMOVE BEFORE PRODUCTION LAUNCH — preview/testing banner only.
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isDemoModeAllowed } from "./DemoModeButton";

export function DemoModeBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!isDemoModeAllowed()) return;

    let cancelled = false;
    async function check() {
      const flag = (() => { try { return sessionStorage.getItem("demo-mode") === "1"; } catch { return false; } })();
      if (flag) { if (!cancelled) setActive(true); return; }
      // Fallback: detect demo entitlement (amount_cents 0 + demo_ session id).
      const { data } = await supabase
        .from("entitlements")
        .select("status,amount_cents,stripe_session_id")
        .maybeSingle();
      const isDemo =
        data?.status === "active" &&
        (data?.amount_cents === 0 || (data?.stripe_session_id ?? "").startsWith("demo_"));
      if (!cancelled) setActive(!!isDemo);
    }
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  if (!active) return null;

  async function exit() {
    try { sessionStorage.removeItem("demo-mode"); } catch {}
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="w-full bg-warning/15 border-b border-warning/30 px-4 py-2 text-center text-xs text-foreground/80 flex items-center justify-center gap-3">
      <span>Demo/Admin testing mode — no real payment processed.</span>
      <Link to="/admin/users" className="underline">Admin</Link>
      <button onClick={exit} className="underline">Exit demo</button>
    </div>
  );
}
