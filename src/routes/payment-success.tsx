import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, Clock } from "lucide-react";

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 45_000;

export const Route = createFileRoute("/payment-success")({
  validateSearch: z.object({ session_id: z.string().optional() }).parse,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/login", search: { redirect: "/payment-success" } });
    }
  },
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);
  const redirectedRef = useRef(false);

  const { data: status } = useQuery({
    queryKey: ["entitlement-activation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entitlements")
        .select("status")
        .maybeSingle();
      if (error) throw error;
      return data?.status ?? null;
    },
    refetchInterval: (q) => (q.state.data === "active" || timedOut ? false : POLL_INTERVAL_MS),
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (import.meta.env.DEV) console.debug("[payment-success] mount, polling entitlement");
    const t = setTimeout(() => {
      if (import.meta.env.DEV) console.debug("[payment-success] poll timeout reached");
      setTimedOut(true);
    }, TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) console.debug("[payment-success] entitlement status:", status);
    if (status === "active" && !redirectedRef.current) {
      redirectedRef.current = true;
      if (import.meta.env.DEV) console.debug("[payment-success] active → navigating to /ask");
      navigate({ to: "/ask", replace: true });
    }
  }, [status, navigate]);

  const isActive = status === "active";

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-background">
      <div className="max-w-md text-center">
        {isActive ? (
          <>
            <div className="size-14 mx-auto rounded-2xl bg-success/15 text-success flex items-center justify-center">
              <CheckCircle2 className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-semibold">Access activated</h1>
            <p className="mt-2 text-sm text-muted-foreground">Taking you in…</p>
          </>
        ) : timedOut ? (
          <>
            <div className="size-14 mx-auto rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
              <Clock className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-semibold">Almost there</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Payment received. Access is still activating. Refresh this page in a moment, or contact support if it persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              Refresh
            </button>
          </>
        ) : (
          <>
            <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Loader2 className="size-7 animate-spin" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-semibold">Activating your access…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We're confirming your payment with our system. This usually takes just a few seconds.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
