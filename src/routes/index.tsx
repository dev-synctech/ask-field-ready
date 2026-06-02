import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, ShieldCheck, BookOpen, ListChecks, Film, Sparkles, NotebookPen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mizly — Field-ready training for go-live support" },
      { name: "description", content: "A vendor-neutral training academy for healthcare go-live consultants and at-the-elbow support. Ask, learn, and ship." },
      { property: "og:title", content: "Mizly" },
      { property: "og:description", content: "Field-ready training for healthcare go-live support." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="font-display font-semibold tracking-tight">Mizly</span>
          </Link>
          <Link to="/ask" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
            Enter Demo
          </Link>
        </div>
      </header>

      <section className="relative grain">
        <div className="max-w-3xl mx-auto px-5 pt-16 md:pt-28 pb-12 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted-foreground mb-6">
            <Sparkles className="size-3 text-primary" />
            Vendor-neutral · Field-tested · Demo preview
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight text-foreground">
            Field-ready training for <span className="text-primary">go-live support.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            A premium, mobile-first academy for healthcare consultants and at-the-elbow support professionals. Ask any question, get a structured answer, and walk the floor with confidence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/ask" className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow transition-shadow">
              Enter Demo
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/learn" className="px-6 py-3 text-sm font-medium text-foreground/80 hover:text-foreground">
              Browse modules
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Open preview — no sign-in, no payment. Every section is navigable.</p>
        </div>

        <div className="max-w-2xl mx-auto px-5 pb-20">
          <div className="glass-card rounded-3xl p-6 shadow-elevated">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Search className="size-3.5" /> Ask any go-live question
            </div>
            <div className="text-lg font-display">"What do I do when registration goes down at 6am?"</div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs">
              {[
                ['Short answer', 'Switch to paper. Capture identity at minimum. Log timestamps.'],
                ['Playbook', 'Registration downtime — first 15 minutes'],
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

      <section className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-5">
        {[
          { icon: Search, title: 'Ask, get answers', desc: 'A structured response with steps, playbooks, videos, and sources — every time.' },
          { icon: BookOpen, title: '10 core modules', desc: 'From command center escalation to downtime workflow and end-user communication.' },
          { icon: NotebookPen, title: 'Playbooks for the floor', desc: 'Step-by-step references built for the moment a unit needs you most.' },
          { icon: ListChecks, title: 'Scenarios & checklists', desc: 'Carry-the-pager-ready references for the moments that matter.' },
          { icon: Film, title: 'Short, sharp videos', desc: 'Under three minutes. Transcripts included. No filler.' },
          { icon: ShieldCheck, title: 'Vendor-neutral by design', desc: 'No PHI. No vendor names. No organization names. Safe to share.' },
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

      <section className="max-w-3xl mx-auto px-5 pb-24">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary-soft to-surface p-8 md:p-12 text-center shadow-card">
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Ready for your next go-live?</h2>
          <p className="mt-2 text-sm text-muted-foreground">This is a preview build. Tap below to walk through the full experience.</p>
          <Link to="/ask" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
            Enter Demo <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-8 text-xs text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© Mizly · Vendor-neutral · No PHI</div>
          <div className="flex gap-4">
            <Link to="/ask" className="hover:text-foreground">Enter Demo</Link>
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
