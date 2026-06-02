import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight, Sparkles, BookOpen, ListChecks, Film, ClipboardCheck, NotebookPen } from "lucide-react";
import { answerFor } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({ meta: [{ title: "Ask — At the Elbow Academy" }] }),
  component: AskPage,
});

const STARTERS = [
  "Registration is down — what do I do first?",
  "How do I escalate a clinical doc issue?",
  "Floor support priorities for go-live day one",
  "Downtime workflow — five minute brief",
];

function AskPage() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const r = useMemo(() => (submitted.trim().length >= 2 ? answerFor(submitted) : null), [submitted]);

  const run = (query: string) => { setQ(query); setSubmitted(query); };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 md:py-14">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Sparkles className="size-3.5 text-primary" /> Ask the academy
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">What do you need to know?</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ask a go-live question. Get a short answer, steps, and the exact playbooks to reach for.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); run(q); }} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="e.g. What if a clinician can't sign an order?"
          className="w-full h-14 pl-11 pr-28 rounded-2xl border border-border bg-surface-elevated text-base shadow-card focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" disabled={q.trim().length < 2}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
          Ask
        </button>
      </form>

      {!r && (
        <div className="mt-6 grid sm:grid-cols-2 gap-2">
          {STARTERS.map(s => (
            <button key={s} onClick={() => run(s)}
              className="text-left rounded-xl border border-border bg-card hover:bg-secondary px-4 py-3 text-sm transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {r && (
        <div className="mt-8 space-y-5">
          <Section title="Short answer">
            <p className="text-base leading-relaxed">{r.shortAnswer}</p>
          </Section>

          {r.steps.length > 0 && (
            <Section title="Step-by-step">
              <ol className="space-y-2 text-sm">
                {r.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="size-6 shrink-0 rounded-full bg-primary-soft text-primary text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          <RelatedGrid icon={NotebookPen} label="Related playbooks" items={r.related.playbooks} />
          <RelatedGrid icon={Film} label="Related videos" items={r.related.videos} />
          <RelatedGrid icon={ClipboardCheck} label="Related checklists" items={r.related.checklists} />
          <RelatedGrid icon={ListChecks} label="Related scenarios" items={r.related.scenarios} />

          {r.sources.length > 0 && (
            <Section title="Sources">
              <div className="flex flex-wrap gap-2">
                {r.sources.map(s => (
                  <span key={s.id} className="text-[11px] px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {s.title} <span className="text-muted-foreground">· {s.type}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          {r.lessonId && (
            <Link to="/learn" className="w-full h-12 rounded-xl bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 hover:opacity-90">
              <BookOpen className="size-4" /> Open full lesson <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">{title}</div>
      {children}
    </div>
  );
}

function RelatedGrid({ icon: Icon, label, items }: { icon: any; label: string; items: { id: string; title: string; summary: string; content_type: string }[] }) {
  if (!items?.length) return null;
  return (
    <Section title={label}>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map(it => (
          <div key={it.id} className="rounded-xl border border-border p-3 hover:border-primary/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Icon className="size-3" /> {it.content_type}
            </div>
            <div className="mt-1 text-sm font-medium">{it.title}</div>
            {it.summary && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.summary}</div>}
          </div>
        ))}
      </div>
    </Section>
  );
}
