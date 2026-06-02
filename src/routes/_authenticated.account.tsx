import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, UserRound, BadgeCheck, Sparkles } from "lucide-react";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — Mizly" }] }),
  component: AccountPage,
});

function AccountPage() {
  // TODO: REMOVE BEFORE PRODUCTION LAUNCH — demo profile; replace with Supabase profile in Phase 2.
  const profile = { display_name: "Demo Consultant", email: "demo@mizly.test", role: "Admin (demo)" };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <Header title="Account" subtitle="Demo preview profile." />

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-display font-semibold text-lg">
            {profile.display_name[0]}
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold">{profile.display_name}</div>
            <div className="text-sm text-muted-foreground truncate">{profile.email}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <Stat icon={BadgeCheck} label="Access" value="Full (demo)" tone="success" />
        <Stat icon={UserRound} label="Role" value={profile.role} tone="primary" />
      </div>

      <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1"><Sparkles className="size-3.5 text-warning" /> Preview build</div>
        Sign-in, billing, and entitlements are intentionally disabled. Phase 2 adds auth, Phase 4 adds payments.
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><ShieldCheck className="size-3.5" /> Content rules</div>
        <p className="mt-1 text-sm">No PHI. No vendor or organization names. Everything in Mizly is vendor-neutral by design.</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/legal" className="text-xs text-muted-foreground hover:text-foreground underline">
          Trademark &amp; legal notice
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to landing</Link>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "success" | "primary" }) {
  const toneCls = tone === "success" ? "text-success bg-success/10" : "text-primary bg-primary-soft";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className={`size-6 rounded-md flex items-center justify-center ${toneCls}`}><Icon className="size-3.5" /></span>
        {label}
      </div>
      <div className="mt-1.5 font-display font-semibold">{value}</div>
    </div>
  );
}
