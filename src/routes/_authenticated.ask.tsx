import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, ArrowRight, Sparkles, BookOpen, ListChecks, Film, ClipboardCheck,
  NotebookPen, Copy, Bookmark, Loader2, Clock, X,
} from "lucide-react";
import { toast } from "sonner";
import { answerFor, type ContentType } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({ meta: [{ title: "Ask — Mizly" }] }),
  component: AskPage,
});

const STARTERS = [
  "Registration is down — what do I do first?",
  "How do I escalate a clinical doc issue?",
  "Floor support priorities for go-live day one",
  "Downtime workflow — five minute brief",
];

const RECENT_KEY = "ate.ask.recent";
const SAVED_KEY = "ate.ask.saved";

const TYPE_META: Record<ContentType, { label: string; icon: any; cls: string }> = {
  lesson:    { label: "Lesson",    icon: BookOpen,        cls: "bg-primary-soft text-primary" },
  playbook:  { label: "Playbook",  icon: NotebookPen,     cls: "bg-warning/15 text-warning" },
  video:     { label: "Video",     icon: Film,            cls: "bg-accent text-accent-foreground" },
  checklist: { label: "Checklist", icon: ClipboardCheck,  cls: "bg-success/15 text-success" },
  scenario:  { label: "Scenario",  icon: ListChecks,      cls: "bg-secondary text-secondary-foreground" },
};

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function writeList(key: string, arr: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 8)));
}

function AskPage() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const r = useMemo(() => (submitted.trim().length >= 2 ? answerFor(submitted) : null), [submitted]);

  useEffect(() => { setRecent(readList(RECENT_KEY)); }, []);

  const run = (query: string) => {
    const t = query.trim(); if (t.length < 2) return;
    setQ(t); setLoading(true);
    // Simulate a brief "thinking" state for the demo
    setTimeout(() => {
      setSubmitted(t); setLoading(false);
      const next = [t, ...recent.filter(x => x.toLowerCase() !== t.toLowerCase())];
      setRecent(next); writeList(RECENT_KEY, next);
    }, 350);
  };

  const removeRecent = (item: string) => {
    const next = recent.filter(x => x !== item);
    setRecent(next); writeList(RECENT_KEY, next);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 md:py-14">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Sparkles className="size-3.5 text-primary" /> Ask Mizly
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
        <button type="submit" disabled={q.trim().length < 2 || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1.5">
          {loading ? <><Loader2 className="size-3.5 animate-spin" /> Thinking</> : "Ask"}
        </button>
      </form>

      {!r && !loading && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-300">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Try one of these</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {STARTERS.map(s => (
                <button key={s} onClick={() => run(s)}
                  className="text-left rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-soft px-4 py-3 text-sm transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {recent.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                <Clock className="size-3" /> Recent questions
              </div>
              <ul className="space-y-1.5">
                {recent.map(item => (
                  <li key={item} className="group flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-secondary/60 transition-colors">
                    <button onClick={() => run(item)} className="flex-1 text-left text-sm px-3 py-2 truncate">{item}</button>
                    <button onClick={() => removeRecent(item)} aria-label="Remove" className="px-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-8 space-y-3 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="h-3 rounded bg-secondary animate-pulse w-2/3" />
            <div className="mt-3 h-3 rounded bg-secondary animate-pulse w-full" />
            <div className="mt-2 h-3 rounded bg-secondary animate-pulse w-5/6" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="h-3 rounded bg-secondary animate-pulse w-1/3" />
            <div className="mt-3 h-3 rounded bg-secondary animate-pulse w-full" />
            <div className="mt-2 h-3 rounded bg-secondary animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {r && !loading && (
        <div className="mt-8 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                const text = `${submitted}\n\n${r.shortAnswer}\n\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
                navigator.clipboard?.writeText(text);
                toast.success("Answer copied to clipboard");
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5">
              <Copy className="size-3.5" /> Copy response
            </button>
            <button
              onClick={() => {
                const saved = readList(SAVED_KEY);
                writeList(SAVED_KEY, [submitted, ...saved.filter(x => x !== submitted)]);
                toast.success("Answer saved", { description: "Available in this browser." });
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5">
              <Bookmark className="size-3.5" /> Save answer
            </button>
          </div>

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

          <RelatedGrid label="Related playbooks" type="playbook" items={r.related.playbooks} />
          <RelatedGrid label="Related videos" type="video" items={r.related.videos} />
          <RelatedGrid label="Related checklists" type="checklist" items={r.related.checklists} />
          <RelatedGrid label="Related scenarios" type="scenario" items={r.related.scenarios} />

          {r.sources.length > 0 && (
            <Section title="Sources">
              <div className="flex flex-wrap gap-2">
                {r.sources.map(s => {
                  const meta = TYPE_META[s.type as ContentType];
                  const Icon = meta.icon;
                  return (
                    <span key={s.id} className={`text-[11px] px-2 py-1 rounded-full inline-flex items-center gap-1.5 ${meta.cls}`}>
                      <Icon className="size-3" /> {s.title}
                    </span>
                  );
                })}
              </div>
            </Section>
          )}

          {r.lessonId && (
            <Link to="/lessons/$id" params={{ id: r.lessonId }} className="w-full h-12 rounded-xl bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 hover:opacity-90">
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

function linkForType(type: string, id: string): { to: any; params?: any } {
  switch (type) {
    case "lesson": return { to: "/lessons/$id", params: { id } };
    case "playbook": return { to: "/playbooks/$id", params: { id } };
    case "scenario": return { to: "/scenarios/$id", params: { id } };
    case "video": return { to: "/videos" };
    case "checklist": return { to: "/checklists" };
    default: return { to: "/learn" };
  }
}

function RelatedGrid({ label, type, items }: { label: string; type: ContentType; items: { id: string; title: string; summary: string; content_type: string }[] }) {
  if (!items?.length) return null;
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <Section title={label}>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(it => {
          const lk = linkForType(it.content_type, it.id);
          return (
            <Link key={it.id} to={lk.to} params={lk.params}
              className="group rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-soft transition-all block bg-card">
              <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.cls}`}>
                <Icon className="size-3" /> {meta.label}
              </div>
              <div className="mt-2 text-sm font-medium group-hover:text-primary transition-colors">{it.title}</div>
              {it.summary && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.summary}</div>}
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="size-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
