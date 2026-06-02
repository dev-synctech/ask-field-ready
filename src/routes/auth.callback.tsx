import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Modern PKCE flow: ?code=... in the query string.
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        // Legacy magic-link / recovery flow uses a #access_token=... hash —
        // supabase-js auto-detects and persists it on load. Nothing to do here.

        // Re-validate with the Auth server before deciding the destination.
        const { data, error: userErr } = await supabase.auth.getUser();
        if (userErr || !data.user) {
          throw userErr ?? new Error("Could not complete sign-in.");
        }

        const { data: ent } = await supabase
          .from("entitlements").select("status").maybeSingle();
        const target = ent?.status === "active" ? "/ask" : "/checkout";
        if (!cancelled) navigate({ to: target, replace: true });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Sign-in could not be completed.");
      }
    })();

    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <div className="max-w-sm text-center">
        {error ? (
          <>
            <div className="size-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-semibold">Sign-in failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <a
              href="/login"
              className="inline-flex mt-6 h-11 px-5 items-center rounded-xl bg-primary text-primary-foreground font-medium"
            >
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Loader2 className="size-7 animate-spin" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-semibold">Confirming your account…</h1>
            <p className="mt-2 text-sm text-muted-foreground">One moment while we finish signing you in.</p>
          </>
        )}
      </div>
    </div>
  );
}
