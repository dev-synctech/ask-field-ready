import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, ShieldCheck, BookOpen, ListChecks, Film, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "At the Elbow Academy — Field-ready training for go-live support" },
      { name: "description", content: "A vendor-neutral training academy for healthcare go-live consultants and at-the-elbow support. Ask, learn, and ship." },
      { property: "og:title", content: "At the Elbow Academy" },
      { property: "og:description", content: "Field-ready training for healthcare go-live support." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="font-display font-semibold tracking-tight">At the Elbow Academy</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium px-3 py-2 hover:text-primary">Sign in</Link>
            <Link to="/login" search={{ mode: 'signup' }} className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Get access</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative grain">
        <div className="max-w-3xl mx-auto px-5 pt-16 md:pt-28 pb-16 md:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted-foreground mb-6">
            <Sparkles className="size-3 text-primary" />
            Vendor-neutral. Field-tested. Built by consultants.
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight text-foreground">
            Field-ready training for <span className="text-primary">go-live support.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            A premium, mobile-first academy for healthcare consultants and at-the-elbow support professionals. Ask any question, get a structured answer, and walk the floor with confidence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" search={{ mode: 'signup' }} className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-shadow">
              Get full access — $100
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/login" className="px-6 py-3 text-sm font-medium text-foreground/80 hover:text-foreground">
              Already a member? Sign in
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">One-time payment. Lifetime access to current library.</p>
        </div>

        {/* Mock Ask card */}
        <div className="max-w-2xl mx-auto px-5 pb-20">
          <div className="glass-card rounded-3xl p-6 shadow-elevated">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Search className="size-3.5" /> Ask any go-live question
            </div>
            <div className="text-lg font-display">"What do I do when registration goes down at 6am?"</div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs">
              {[
                ['Short answer', 'Switch to downtime forms. Capture MRN + DOB at minimum.'],
                ['Playbook', 'Registration Downtime — Phase 1'],
                ['Checklist', 'Pre-shift downtime kit'],
                ['Video', 'Floor handoff in 90 seconds'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border bg-surface-elevated p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                  <div className="mt-1 text-foreground">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-5">
        {[
          { icon: Search, title: 'Ask, get answers', desc: 'A structured response with steps, playbooks, videos, and sources — every time.' },
          { icon: BookOpen, title: '10 core modules', desc: 'From command center escalation to downtime workflow and end-user communication.' },
          { icon: ListChecks, title: 'Checklists & scenarios', desc: 'Carry-the-pager-ready references for the moments that matter.' },
          { icon: Film, title: 'Short, sharp videos', desc: 'Under three minutes. Transcripts included. No filler.' },
          { icon: ShieldCheck, title: 'Sanitized content', desc: 'No PHI. No vendor names. No organization names. Vendor-neutral by design.' },
          { icon: Sparkles, title: 'Built for the floor', desc: 'Mobile-first. Offline-friendly shell. Loads fast on hospital Wi-Fi.' },
        ].map(f => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="size-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-3">
              <f.icon className="size-4" />
            </div>
            <div className="font-display font-semibold">{f.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-5 pb-24">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary-soft to-surface p-8 md:p-12 text-center shadow-card">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Ready for your next go-live?</h2>
          <p className="mt-2 text-sm text-muted-foreground">One payment. Full library. Cancel anytime — there's nothing to cancel.</p>
          <Link to="/login" search={{ mode: 'signup' }} className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
            Get access — $100 <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-8 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© At the Elbow Academy. Vendor-neutral. No PHI.</div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground shadow-soft">
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17l-3 4V7a2 2 0 0 1 2-2h3" />
        <path d="M17 7l3-4v14a2 2 0 0 1-2 2h-3" />
        <path d="M9 13l3-3 3 3" />
      </svg>
    </div>
  );
}
