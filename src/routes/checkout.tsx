import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { StripeEmbeddedCheckoutForm } from "@/components/StripeEmbeddedCheckout";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: '/login', search: { redirect: '/checkout' } });
    const { data: ent } = await supabase
      .from('entitlements').select('status').maybeSingle();
    if (ent?.status === 'active') throw redirect({ to: '/ask' });
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-semibold tracking-tight">At the Elbow Academy</Link>
          <Link to="/account" className="text-sm text-muted-foreground hover:text-foreground">Account</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-10 md:py-14 grid md:grid-cols-2 gap-10">
        <section>
          <div className="text-xs uppercase tracking-wider text-primary font-medium">One-time access</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-display font-semibold tracking-tight">Full library — $100</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pay once. Unlock the full Ask experience, every module, every playbook, video, scenario, and checklist.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              'Ask: structured answers with steps and sources',
              '10 core modules — from go-live readiness to downtime',
              'Playbooks, scenarios, videos, and checklists',
              'New content added — admin-reviewed and sanitized',
              'Works on phone, tablet, and laptop',
            ].map(t => (
              <li key={t} className="flex gap-3"><CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" /><span>{t}</span></li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4" /> Secure payment. Receipt emailed.
          </div>
        </section>
        <section>
          <StripeEmbeddedCheckoutForm />
        </section>
      </main>
    </div>
  );
}
