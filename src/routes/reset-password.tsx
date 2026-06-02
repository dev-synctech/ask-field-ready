import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 h-16 flex items-center">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">← Back to sign in</Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-5 pb-12">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <MailCheck className="size-7" />
              </div>
              <h1 className="mt-5 text-2xl font-display font-semibold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for <span className="text-foreground font-medium">{email}</span>, we sent a password reset link.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 inline-flex h-11 px-5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-display font-semibold">Reset your password</h1>
                <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-foreground/80">Email</span>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@hospital-system.com"
                    className="mt-1 w-full h-11 rounded-xl border border-input bg-surface-elevated px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </label>
                {error && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</div>}
                <button disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-60">
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <div className="text-center mt-6 text-sm text-muted-foreground">
                Remembered it? <Link to="/login" className="text-primary font-medium">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
