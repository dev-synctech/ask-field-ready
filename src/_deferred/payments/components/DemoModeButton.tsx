// TODO: REMOVE BEFORE PRODUCTION LAUNCH — preview/testing shortcut only.
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FlaskConical, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { enterDemoMode } from "@/lib/demo.functions";

// TODO: REMOVE BEFORE PRODUCTION LAUNCH — staging/preview gate, includes Lovable published URL during testing.
export function isDemoModeAllowed() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname.toLowerCase();
  return (
    import.meta.env.DEV ||
    h.startsWith("localhost") ||
    h.startsWith("127.0.0.1") ||
    h.includes("-preview--") ||
    h.includes("preview--") ||
    h.endsWith(".lovable.dev") ||
    h.endsWith(".lovable.app") ||
    h.endsWith(".lovableproject.com")
  );
}

export function DemoModeButton({ variant = "default" }: { variant?: "default" | "compact" }) {
  const navigate = useNavigate();
  const enter = useServerFn(enterDemoMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isDemoModeAllowed()) return null;

  async function onClick() {
    setLoading(true); setError(null);
    try {
      const res = await enter();
      if (!res.ok || !res.access_token || !res.refresh_token) {
        throw new Error(res.error ?? "Demo mode unavailable");
      }
      // Clear any existing session and install the server-issued one.
      await supabase.auth.signOut().catch(() => {});
      const { error: setErr } = await supabase.auth.setSession({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      });
      if (setErr) throw setErr;
      try { sessionStorage.setItem("demo-mode", "1"); } catch {}
      navigate({ to: "/ask", replace: true });
    } catch (e: any) {
      console.error("[demo-mode] failed:", e);
      setError(e?.message ?? "Could not enter demo mode");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "compact") {
    return (
      <div className="mt-4">
        <button
          onClick={onClick}
          disabled={loading}
          className="w-full inline-flex h-10 items-center justify-center gap-2 px-4 rounded-xl border border-dashed border-warning/60 bg-warning/5 text-sm font-medium hover:bg-warning/10 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
          {loading ? "Entering demo…" : "Enter Demo/Admin Mode"}
        </button>
        {error && <div className="mt-2 text-xs text-destructive text-center">{error}</div>}
        <p className="mt-2 text-[11px] text-center text-muted-foreground">
          Preview only — no real payment processed.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-warning/60 bg-warning/5 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning">
        <FlaskConical className="size-4" /> Preview testing shortcut
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Sign in as a demo admin with full paid access. Available on dev/preview hosts
        only — never in production. No real payment is processed.
      </p>
      <button
        onClick={onClick}
        disabled={loading}
        className="mt-3 inline-flex h-10 items-center gap-2 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
        {loading ? "Entering demo…" : "Enter Demo/Admin Mode"}
      </button>
      {error && <div className="mt-2 text-xs text-destructive">{error}</div>}
    </div>
  );
}
