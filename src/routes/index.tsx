import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Search, BookOpen, ListChecks, NotebookPen, ShieldCheck,
  Sparkles, Clock, MessageSquare, CheckCircle2, AlertTriangle, Layers,
  ChevronDown, X, Mail,
} from "lucide-react";
import logoAsset from "@/assets/mizly-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mizly — Small answers for big go-live moments" },
      { name: "description", content: "The field-support academy and answer engine built for healthcare go-live consultants. Fast answers, playbooks, scenarios, and checklists in one mobile place." },
      { property: "og:title", content: "Mizly — Small answers for big go-live moments" },
      { property: "og:description", content: "Field-support academy and answer engine for healthcare go-live consultants." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  function scrollToPricing(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="Mizly" className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-foreground/70">
            <Link to="/ask" className="hover:text-foreground">Ask</Link>
            <Link to="/learn" className="hover:text-foreground">Learn</Link>
            <Link to="/playbooks" className="hover:text-foreground">Playbooks</Link>
            <a href="#pricing" onClick={scrollToPricing} className="hover:text-foreground">Pricing</a>
            <a href="#safety" className="hover:text-foreground">Safety</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/ask" className="hidden sm:inline-flex text-sm font-medium text-foreground/80 hover:text-foreground px-3 py-2">
              Open demo
            </Link>
            <button
              onClick={scrollToPricing}
              className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Join founding access
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle brand wash */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full opacity-[0.07] bg-primary blur-3xl" />
          <div className="absolute top-40 -left-32 h-[360px] w-[360px] rounded-full opacity-[0.05] bg-teal blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-5 pt-12 md:pt-24 pb-12 md:pb-20 grid md:grid-cols-[1.05fr_0.95fr] gap-12 md:gap-16 items-center">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated text-[11px] text-muted-foreground mb-6 shadow-soft">
              <span className="size-1.5 rounded-full bg-teal" />
              For healthcare go-live consultants
            </div>
            <h1 className="text-[44px] md:text-[68px] leading-[1.02] font-display font-semibold tracking-tight text-foreground">
              Mizly
            </h1>
            <div className="mt-2 h-[3px] w-14 rounded-full accent-rule" />
            <p className="mt-5 text-xl md:text-2xl font-display text-foreground/85 max-w-xl">
              Small answers for big go-live moments.
            </p>
            <p className="mt-5 text-[15px] md:text-base text-muted-foreground max-w-lg leading-relaxed">
              The field-support academy and answer engine built for healthcare go-live consultants. Ask what just happened on the floor and get the first 90 seconds, what to say, what to check, and when to escalate.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={scrollToPricing}
                className="press inline-flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-primary text-primary-foreground font-medium shadow-elevated hover:shadow-glow"
              >
                Join founding access
                <ArrowRight className="size-4" />
              </button>
              <Link
                to="/ask"
                className="press inline-flex items-center justify-center gap-2 px-5 h-12 rounded-xl border border-border bg-surface-elevated text-foreground font-medium hover:border-primary/30"
              >
                Open demo
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground max-w-md">
              Built for training, field support, and workflow confidence. Not a substitute for local policy or clinical judgment.
            </p>
          </div>

          {/* Phone mockup — faithful miniature of mobile /ask */}
          <div className="relative mx-auto md:mx-0 w-full max-w-[300px] animate-in fade-in zoom-in-95 duration-700">
            <div className="relative aspect-[9/19.5] rounded-[2.4rem] bg-foreground p-[3px] shadow-elevated">
              <div className="relative h-full w-full rounded-[2.2rem] bg-background overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center pointer-events-none z-10">
                  <div className="mt-1.5 h-4 w-24 rounded-full bg-foreground" />
                </div>
                {/* Status bar */}
                <div className="h-6 flex items-center justify-between px-5 text-[8.5px] font-medium text-foreground/70 shrink-0">
                  <span>9:41</span>
                  <span className="opacity-0">.</span>
                </div>

                {/* Top app bar */}
                <div className="px-3.5 h-9 flex items-center gap-2 border-b border-border shrink-0">
                  <img src={logoAsset.url} alt="" className="h-3.5 w-auto" />
                  <div className="ml-auto flex items-center gap-1">
                    <div className="size-6 rounded-md border border-border bg-card flex items-center justify-center">
                      <ShieldCheck className="size-3 text-muted-foreground" />
                    </div>
                    <div className="size-6 rounded-md border border-border bg-card flex items-center justify-center">
                      <div className="size-3 rounded-full bg-foreground/15" />
                    </div>
                  </div>
                </div>

                {/* Ask header + starters (scroll area) */}
                <div className="flex-1 px-4 pt-4 pb-2 overflow-hidden">
                  <div className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <Sparkles className="size-2.5 text-teal" /> Ask Mizly
                  </div>
                  <h3 className="mt-1.5 text-[15px] leading-[1.15] font-display font-semibold tracking-tight text-foreground">
                    What just happened on the floor?
                  </h3>
                  <p className="mt-1.5 text-[9.5px] leading-snug text-muted-foreground">
                    Short answer, first 90 seconds, what to say, what to check, and when to escalate.
                  </p>

                  <div className="mt-4 text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">Try one of these</div>
                  <div className="mt-2 space-y-1.5">
                    {[
                      "I can't log in — my password is not working.",
                      "The printer is not printing.",
                      "Where do I find my patient list?",
                    ].map(s => (
                      <div key={s} className="relative rounded-[10px] border border-border bg-card pl-3 pr-3 py-2 text-[9.5px] leading-snug text-foreground/85 overflow-hidden">
                        <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-teal/60" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticky composer */}
                <div className="px-2.5 pt-2 pb-2 border-t border-border bg-background/95 backdrop-blur shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-2.5 text-muted-foreground" />
                    <div className="h-8 pl-7 pr-14 rounded-[14px] border border-border bg-surface-elevated flex items-center text-[9.5px] text-muted-foreground">
                      Ask Mizly…
                    </div>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2.5 rounded-[10px] bg-primary text-primary-foreground text-[9px] font-semibold flex items-center shadow-soft">
                      Ask
                    </div>
                  </div>
                </div>

                {/* Bottom nav */}
                <div className="border-t border-border bg-surface px-1.5 pt-1 pb-2 grid grid-cols-5 gap-0.5 shrink-0">
                  {[
                    { l: "Ask", icon: Search, active: true },
                    { l: "Learn", icon: BookOpen },
                    { l: "Plays", icon: NotebookPen },
                    { l: "Scenarios", icon: ListChecks },
                    { l: "More", icon: Layers },
                  ].map(n => (
                    <div key={n.l} className="relative flex flex-col items-center gap-0.5 py-0.5">
                      {n.active && <span className="absolute -top-1 h-[2px] w-5 rounded-full bg-teal" />}
                      <n.icon className={`size-3 ${n.active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-[7px] leading-none ${n.active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{n.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Below-the-fold hint */}
        <div className="flex justify-center pb-6 text-muted-foreground/60">
          <ChevronDown className="size-5 animate-bounce" />
        </div>
      </section>

      {/* Video Preview */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-teal">
                <span className="size-1.5 rounded-full bg-teal" /> 24-second preview
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-display font-semibold tracking-tight">
                See Mizly in 24 seconds.
              </h2>
              <p className="mt-3 text-muted-foreground">
                A quick look at how Mizly turns go-live noise into clear next steps, playbooks, checklists, and practice moments.
              </p>
              <p className="mt-6 text-sm font-medium text-foreground">Music-only preview</p>
              <p className="mt-1 text-xs text-muted-foreground">Autoplays muted. Tap controls to hear the music.</p>
            </div>
            <div className="order-2 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[300px]">
                <div className="absolute -inset-6 -z-10 rounded-[2.4rem] bg-gradient-to-br from-primary-soft/60 via-transparent to-teal-soft/60 blur-2xl" />
                <div className="rounded-[1.75rem] border border-border bg-surface-elevated p-2 shadow-elevated ring-brand">
                  <video
                    src={videoAsset.url}
                    poster={posterAsset.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    aria-label="Mizly 24-second product preview"
                    className="block w-full aspect-[9/16] rounded-[1.4rem] bg-foreground object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Pillars */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
              Ask one question. Get the next move.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ask one question. Get the first 90 seconds, the words to use, the checks to run, and the point where you escalate.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Search, title: "Ask", desc: "Get fast answers to real go-live questions without digging through scattered notes." },
              { icon: NotebookPen, title: "Playbooks", desc: "Follow step-by-step guidance for common support moments: what to say, what to check, and when to escalate." },
              { icon: BookOpen, title: "Scenarios", desc: "Practice real-world workflows before, during, and after go-live." },
              { icon: ListChecks, title: "Checklists", desc: "Keep repeatable support steps close at hand during high-pressure shifts." },
            ].map(f => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-5 shadow-soft">
                <div className="size-9 rounded-md bg-primary-soft text-primary flex items-center justify-center mb-3">
                  <f.icon className="size-4" />
                </div>
                <div className="font-display font-semibold">{f.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Moments */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
              Built around the moments consultants actually face.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mizly organizes support content around practical field questions, not long manuals.
              Each answer is designed to help a consultant move from confusion to action.
            </p>
          </div>

          <ol className="mt-10 grid md:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { icon: Clock, label: "First 90 seconds", desc: "What to do immediately." },
              { icon: MessageSquare, label: "What to say", desc: "Calm, professional language for users." },
              { icon: CheckCircle2, label: "What to check", desc: "Quick validation steps." },
              { icon: AlertTriangle, label: "When to escalate", desc: "Clear handoff points." },
              { icon: Layers, label: "Related content", desc: "Lessons, playbooks, scenarios, and checklists." },
            ].map((m, i) => (
              <li key={m.label} className="rounded-lg border border-border bg-card p-5 shadow-soft relative">
                <div className="absolute top-3 right-4 text-[10px] font-mono text-muted-foreground">0{i + 1}</div>
                <div className="size-8 rounded-md bg-primary-soft text-primary flex items-center justify-center mb-3">
                  <m.icon className="size-4" />
                </div>
                <div className="font-display font-semibold text-sm">{m.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{m.desc}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section 3: More than a chat box */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-4xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
            More than an AI chat box.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mizly gives consultants a structured training library and a fast answer experience in one place.
            Learn the patterns before a shift, then use Ask when something comes up live.
          </p>
          <div className="mt-6 rounded-lg border-l-2 border-primary bg-card p-5 shadow-soft">
            <p className="text-sm text-foreground/85">
              Chatbot-only tools help when you already know what to ask. Mizly helps consultants
              <span className="text-foreground font-medium"> learn the workflow, practice the moment, and find the right answer</span> when the pressure is on.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Safety */}
      <section id="safety" className="border-t border-border">
        <div className="max-w-4xl mx-auto px-5 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <ShieldCheck className="size-3.5 text-primary" /> Vendor-neutral by design
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
            Built to keep training clean.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mizly content is designed to be rewritten, sanitized, and vendor-neutral before it reaches learners.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-2 text-sm">
            {[
              "No PHI",
              "No patient examples from real systems",
              "No hospital or organization names",
              "No vendor logos or screenshots",
              "No copied proprietary training text",
              "Vendor names used only descriptively when necessary",
              "Source material stays isolated until reviewed and approved",
            ].map(s => (
              <li key={s} className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/85">{s}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 text-sm">
            <Link to="/legal" className="text-primary hover:underline inline-flex items-center gap-1">
              Read the trademark notice <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5: Pricing */}
      <section id="pricing" className="border-t border-border bg-surface">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary-soft text-xs text-primary mb-4">
              <Sparkles className="size-3" /> Early access
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
              Founding access
            </h2>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card p-6 md:p-8 shadow-elevated">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl md:text-5xl font-display font-semibold">$99</div>
              <div className="text-sm text-muted-foreground">one-time founding access</div>
            </div>
            <p className="mt-4 text-sm text-foreground/85">
              Early users get access to the Mizly training library, playbooks, scenarios,
              checklists, and the evolving Ask experience while the platform is still being
              shaped with real go-live feedback.
            </p>

            <ul className="mt-5 space-y-2 text-sm">
              {[
                "Full training library access",
                "Playbooks, scenarios, and checklists",
                "Ask answer experience",
                "Founding-member feedback channel",
              ].map(b => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/85">{b}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setWaitlistOpen(true)}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
            >
              Join founding access
              <ArrowRight className="size-4" />
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              Founding pricing is an early-access offer and may change as Mizly adds team plans,
              monthly plans, and expanded AI usage.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-5 py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-center">
            Questions
          </h2>
          <div className="mt-8 space-y-3">
            <FAQItem q="Is Mizly affiliated with any EMR vendor?">
              No. Mizly is an independent training and field-support product. Product names may
              be used descriptively where helpful, but Mizly is not affiliated with, endorsed by,
              sponsored by, or certified by any EMR vendor. See the{" "}
              <Link to="/legal" className="text-primary hover:underline">trademark notice</Link>.
            </FAQItem>
            <FAQItem q="Does Mizly replace local policy?">
              No. Mizly supports training and field confidence. Consultants should always follow
              their organization's local policy, build, and escalation process.
            </FAQItem>
            <FAQItem q="What kind of content is inside Mizly?">
              Short lessons, practical playbooks, scenario walkthroughs, checklists, videos, and
              an Ask experience organized around real go-live support questions.
            </FAQItem>
            <FAQItem q="Can teams use Mizly?">
              Yes. Team and agency plans are planned after the founding access phase.
            </FAQItem>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex items-center gap-2 mb-4">
            <img src={logoAsset.url} alt="Mizly" className="h-6 w-auto" />
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
            Mizly is an independent training and field-support product. Other product names are
            trademarks of their respective owners. Mizly is not affiliated with, endorsed by,
            sponsored by, or certified by those companies.
          </p>
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted-foreground">
            <div>© Mizly</div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link to="/legal" className="hover:text-foreground">Trademark notice</Link>
              <a href="#safety" className="hover:text-foreground">Safety standards</a>
              <Link to="/ask" className="hover:text-foreground">Open app</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Waitlist modal */}
      {waitlistOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={() => setWaitlistOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-card border border-border shadow-elevated p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setWaitlistOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <div className="size-10 rounded-md bg-primary-soft text-primary flex items-center justify-center mb-3">
              <Mail className="size-5" />
            </div>
            <h3 className="text-lg font-display font-semibold">Join founding access</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Founding access isn't open for purchase yet. Email us to be first in line when
              Mizly opens enrollment.
            </p>
            <a
              href="mailto:hello@mizly.app?subject=Mizly%20founding%20access"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
            >
              Email hello@mizly.app
            </a>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              You can also <Link to="/ask" className="underline hover:text-foreground" onClick={() => setWaitlistOpen(false)}>open the demo</Link> in the meantime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FAQItem({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface"
        aria-expanded={open}
      >
        <span className="font-display font-medium text-sm md:text-base">{q}</span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
