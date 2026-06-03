import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Sparkles, BookOpen, ListChecks, Film, ClipboardCheck,
  NotebookPen, Copy, Bookmark, Loader2, Clock, X, ShieldCheck,
  ThumbsUp, ThumbsDown, MessageSquarePlus, FileQuestion, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { askLaunch, STARTER_QUESTIONS, badgeForLaunchType, type AskAnswer, type MatchQuality } from "@/lib/launch-library";
import { ASK_SAFETY_LINE } from "@/lib/legal";
import type { ContentType, ContentItem } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({ meta: [{ title: "Ask — Mizly" }] }),
  component: AskPage,
});

const RECENT_KEY = "ate.ask.recent";
const SAVED_KEY = "ate.ask.saved";

const TYPE_META: Record<ContentType, { label: string; icon: any; cls: string }> = {
  lesson:    { label: "Lesson",    icon: BookOpen,       cls: "bg-primary-soft text-primary" },
  playbook:  { label: "Playbook",  icon: NotebookPen,    cls: "bg-warning/15 text-warning" },
  video:     { label: "Video",     icon: Film,           cls: "bg-accent text-accent-foreground" },
  checklist: { label: "Checklist", icon: ClipboardCheck, cls: "bg-success/15 text-success" },
  scenario:  { label: "Scenario",  icon: ListChecks,     cls: "bg-secondary text-secondary-foreground" },
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
  const r: AskAnswer | null = useMemo(
    () => (submitted.trim().length >= 2 ? askLaunch(submitted) : null),
    [submitted],
  );

  useEffect(() => { setRecent(readList(RECENT_KEY)); }, []);

  const run = (query: string) => {
    const t = query.trim(); if (t.length < 2) return;
    setQ(t); setLoading(true);
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
        <p className="mt-2 text-sm text-muted-foreground">Ask a go-live question. Get a short answer, the first 90 seconds, what to say, what to check, and when to escalate.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); run(q); }} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="e.g. A user cannot print a wristband. What should I check?"
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
              {STARTER_QUESTIONS.map(s => (
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
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="h-3 rounded bg-secondary animate-pulse w-2/3" />
              <div className="mt-3 h-3 rounded bg-secondary animate-pulse w-full" />
              <div className="mt-2 h-3 rounded bg-secondary animate-pulse w-5/6" />
            </div>
          ))}
        </div>
      )}

      {r && !loading && (
        <AnswerView answer={r} query={submitted} />
      )}
    </div>
  );
}

function AnswerView({ answer, query }: { answer: AskAnswer; query: string }) {
  const r = answer;
  const sourceBadge = r.sourceEntry ? badgeForLaunchType(r.sourceEntry.type) : null;

  return (
    <div className="mt-8 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Match quality bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <MatchBadge q={r.matchQuality} label={r.matchLabel} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const text = `${query}\n\nShort answer: ${r.shortAnswer}\n\nFirst 90 seconds:\n${r.first90.map((s,i)=>`${i+1}. ${s}`).join("\n")}\n\nWhat to say:\n${r.whatToSay.map(s=>`- ${s}`).join("\n")}\n\nWhat to check:\n${r.whatToCheck.map(s=>`- ${s}`).join("\n")}\n\nWhen to escalate: ${r.whenToEscalate}`;
              navigator.clipboard?.writeText(text);
              toast.success("Answer copied to clipboard");
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5">
            <Copy className="size-3.5" /> Copy
          </button>
          <button
            onClick={() => {
              const saved = readList(SAVED_KEY);
              writeList(SAVED_KEY, [query, ...saved.filter(x => x !== query)]);
              toast.success("Answer saved", { description: "Available in this browser." });
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5">
            <Bookmark className="size-3.5" /> Save
          </button>
        </div>
      </div>

      {/* Title + source */}
      {sourceBadge && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${sourceBadge.cls}`}>
            <ShieldCheck className="size-3" /> {sourceBadge.label} · Mizly library
          </div>
          <div className="mt-2 text-base font-display font-semibold">{r.title}</div>
          <p className="mt-2 text-sm leading-relaxed">{r.shortAnswer}</p>
          <p className="mt-3 text-xs text-muted-foreground italic border-l-2 border-warning/60 pl-3">
            {ASK_SAFETY_LINE}{" "}
            <Link to="/legal" className="underline hover:text-foreground">Trademark &amp; legal notice</Link>.
          </p>
        </div>
      )}

      <ListSection title="First 90 seconds" items={r.first90} ordered />
      <ListSection title="What to say" items={r.whatToSay} />
      <ListSection title="What to check" items={r.whatToCheck} />

      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
        <div className="text-[10px] uppercase tracking-wider text-warning font-medium mb-2 inline-flex items-center gap-1.5">
          <AlertTriangle className="size-3" /> When to escalate
        </div>
        <p className="text-sm leading-relaxed">{r.whenToEscalate}</p>
      </div>

      <RelatedGrid label="Related playbooks" type="playbook" items={r.related.playbooks} />
      <RelatedGrid label="Related checklists" type="checklist" items={r.related.checklists} />
      <RelatedGrid label="Related lessons" type="lesson" items={r.related.lessons} />
      <RelatedGrid label="Related scenarios" type="scenario" items={r.related.scenarios} />
      <RelatedGrid label="Related videos" type="video" items={r.related.videos} />

      {r.sources.length > 0 && (
        <Section title="Based on Mizly library">
          <div className="flex flex-wrap gap-2">
            {r.sources.map(s => (
              <span key={s.id} className="text-[11px] px-2 py-1 rounded-full inline-flex items-center gap-1.5 bg-primary-soft text-primary">
                <ShieldCheck className="size-3" /> {s.title}
              </span>
            ))}
          </div>
        </Section>
      )}

      <FeedbackBar query={query} />
    </div>
  );
}

function MatchBadge({ q, label }: { q: MatchQuality; label: string }) {
  const cls = q === "strong"
    ? "bg-success/15 text-success border-success/30"
    : q === "related"
    ? "bg-primary-soft text-primary border-primary/30"
    : "bg-warning/15 text-warning border-warning/30";
  const Icon = q === "strong" ? CheckCircle2 : q === "related" ? Sparkles : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon className="size-3" /> {label}
    </span>
  );
}

function ListSection({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  if (!items?.length) return null;
  return (
    <Section title={title}>
      {ordered ? (
        <ol className="space-y-2 text-sm">
          {items.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="size-6 shrink-0 rounded-full bg-primary-soft text-primary text-xs font-semibold flex items-center justify-center">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
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

function RelatedGrid({ label, type, items }: { label: string; type: ContentType; items: ContentItem[] }) {
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
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

function FeedbackBar({ query }: { query: string }) {
  const [given, setGiven] = useState<null | "up" | "down">(null);

  const send = (kind: "up" | "down" | "missing" | "request") => {
    // Mock-only: store locally for now.
    if (typeof window !== "undefined") {
      try {
        const key = "ate.ask.feedback";
        const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
        prev.push({ q: query, kind, ts: Date.now() });
        localStorage.setItem(key, JSON.stringify(prev.slice(-50)));
      } catch { /* noop */ }
    }
    if (kind === "up") { setGiven("up"); toast.success("Thanks — marked helpful"); }
    if (kind === "down") { setGiven("down"); toast.success("Thanks — we'll review this answer"); }
    if (kind === "missing") toast.success("Noted — 'missing something' logged");
    if (kind === "request") toast.success("Playbook request sent to the Mizly library team");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Was this helpful?</div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => send("up")}
          aria-pressed={given === "up"}
          className={`text-xs px-3 py-2 rounded-lg border inline-flex items-center gap-1.5 transition-colors ${given === "up" ? "bg-success/15 text-success border-success/30" : "bg-card border-border hover:bg-secondary"}`}>
          <ThumbsUp className="size-3.5" /> Helpful
        </button>
        <button
          onClick={() => send("down")}
          aria-pressed={given === "down"}
          className={`text-xs px-3 py-2 rounded-lg border inline-flex items-center gap-1.5 transition-colors ${given === "down" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-card border-border hover:bg-secondary"}`}>
          <ThumbsDown className="size-3.5" /> Not helpful
        </button>
        <button
          onClick={() => send("missing")}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5">
          <MessageSquarePlus className="size-3.5" /> Missing something?
        </button>
        <button
          onClick={() => send("request")}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5">
          <FileQuestion className="size-3.5" /> Request a playbook
        </button>
      </div>
    </div>
  );
}
