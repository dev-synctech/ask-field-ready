import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FlaskConical, Loader2 } from "lucide-react";
import { activateTestAccess, checkIsAdmin } from "@/lib/admin.functions";

function isNonProdHost() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname.toLowerCase();
  return (
    import.meta.env.DEV ||
    h.startsWith("localhost") ||
    h.startsWith("127.0.0.1") ||
    h.includes("-preview--") ||
    h.includes("preview--") ||
    h.endsWith(".lovable.dev")
  );
}

export function TestAccessBypass() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(checkIsAdmin);
  const activate = useServerFn(activateTestAccess);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowed = isNonProdHost();

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    checkAdmin().then((r) => { if (!cancelled) setIsAdmin(r.isAdmin); }).catch(() => {});
    return () => { cancelled = true; };
  }, [allowed, checkAdmin]);

  if (!allowed || !isAdmin) return null;

  async function onActivate() {
    setLoading(true); setError(null);
    const res = await activate();
    setLoading(false);
    if (!res.ok) { setError(res.error ?? "Failed"); return; }
    navigate({ to: "/payment-success", replace: true });
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-warning/60 bg-warning/5 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning">
        <FlaskConical className="size-4" /> Test access only — no real payment processed
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Visible only to admins on dev/preview. Grants your account an active entitlement
        without going through Stripe. Disabled in production.
      </p>
      <button
        onClick={onActivate}
        disabled={loading}
        className="mt-3 inline-flex h-10 items-center gap-2 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
        {loading ? "Activating…" : "Activate test access"}
      </button>
      {error && <div className="mt-2 text-xs text-destructive">{error}</div>}
    </div>
  );
}
