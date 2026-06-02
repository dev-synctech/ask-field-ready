import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/update-password")({
  component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Supabase auto-parses the recovery hash on load and fires PASSWORD_RECOVERY.
  // We just wait for an authenticated user (either via PKCE ?code= or hash token).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // PKCE flow: ?code=... in query string.
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && !cancelled) {
          setTokenError(error.message);
          return;
        }
      }
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !data.user) {
        setTokenError("This reset link is invalid or expired. Request a new one.");
        return;
      }
      setReady(true);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      // Phase 1 demo: no entitlements/checkout — always land on /ask.
      setTimeout(() => navigate({ to: "/ask", replace: true }), 1200);
    } catch (err: any) {
      setError(err?.message ?? "Could not update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 h-16 flex items-center">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">← Sign in</Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-5 pb-12">
        <div className="w-full max-w-sm">
          {tokenError ? (
            <div className="text-center">
              <div className="size-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="size-7" />
              </div>
              <h1 className="mt-5 text-2xl font-display font-semibold">Link unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">{tokenError}</p>
              <Link to="/reset-password" className="mt-6 inline-flex h-11 px-5 items-center rounded-xl bg-primary text-primary-foreground font-medium">
                Request a new link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="size-7" />
              </div>
              <h1 className="mt-5 text-2xl font-display font-semibold">Password updated</h1>
              <p className="mt-2 text-sm text-muted-foreground">Taking you to your account…</p>
            </div>
          ) : !ready ? (
            <p className="text-center text-sm text-muted-foreground">Verifying your reset link…</p>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-display font-semibold">Set a new password</h1>
                <p className="mt-1 text-sm text-muted-foreground">Choose a strong password you don't use elsewhere.</p>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-foreground/80">New password</span>
                  <input
                    type="password" required minLength={8} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full h-11 rounded-xl border border-input bg-surface-elevated px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-foreground/80">Confirm password</span>
                  <input
                    type="password" required minLength={8} value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full h-11 rounded-xl border border-input bg-surface-elevated px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </label>
                {error && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</div>}
                <button disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-60">
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
