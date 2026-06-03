import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Sparkles, BookOpen, ListChecks, Film, ClipboardCheck,
  NotebookPen, Copy, Bookmark, Loader2, Clock, X, ShieldCheck,
  ThumbsUp, ThumbsDown, MessageSquarePlus, FileQuestion, CheckCircle2, AlertTriangle,
  ImageIcon, MousePointerClick,
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
const CONTENT_GAP_KEY = "mizly.ask.content_gaps";

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
  const hasAnswer = Boolean(r && !loading);

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
    <div className={`max-w-[720px] mx-auto px-5 pb-40 md:pb-8 ${hasAnswer ? "pt-4 md:pt-4" : "pt-6 md:pt-12"}`}>
      <div className={`${hasAnswer ? "mb-1 md:mb-2" : "md:text-center mb-6 md:mb-10"}`}>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
          <Sparkles className="size-3 text-teal" /> Ask Mizly
        </div>
        <h1 className={`${hasAnswer ? "text-[20px] md:text-[26px]" : "text-[22px] md:text-[34px]"} leading-tight font-display font-semibold tracking-tight text-foreground`}>
          What just happened on the floor?
        </h1>
        <p className={`mt-2 text-[13px] md:text-sm text-muted-foreground max-w-lg ${hasAnswer ? "sr-only" : "md:mx-auto"}`}>
          No greeting. No theory. Get the exact next move, what to try if it fails, and when to escalate.
        </p>
      </div>

      {/* Desktop inline composer */}
      <form onSubmit={e => { e.preventDefault(); run(q); }} className={`relative hidden md:block ${hasAnswer ? "mb-0" : ""}`}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="e.g. The printer is not printing. What do I check first?"
          className={`${hasAnswer ? "h-11" : "h-14"} w-full pl-11 pr-28 rounded-2xl border border-border bg-surface-elevated text-[15px] shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition`}
        />
        <button type="submit" disabled={q.trim().length < 2 || loading}
          className={`${hasAnswer ? "h-8" : "h-10"} press absolute right-2 top-1/2 -translate-y-1/2 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 inline-flex items-center gap-1.5 hover:bg-primary/90 shadow-soft`}>
          {loading ? <><Loader2 className="size-3.5 animate-spin" /> Thinking</> : "Ask"}
        </button>

      </form>

      {/* Mobile sticky bottom composer (above bottom nav) */}
      <form
        onSubmit={e => { e.preventDefault(); run(q); }}
        className="md:hidden fixed left-0 right-0 z-20 px-3 pt-2 pb-2 bg-background/95 backdrop-blur-md border-t border-border"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 60px)' }}
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Ask Mizly…"
            className="w-full h-12 pl-10 pr-24 rounded-2xl border border-border bg-surface-elevated text-[15px] shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
          />
          <button type="submit" disabled={q.trim().length < 2 || loading}
            className="press absolute right-1.5 top-1/2 -translate-y-1/2 h-9 min-w-[68px] px-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-40 inline-flex items-center justify-center gap-1.5 shadow-soft">
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Ask"}
          </button>

        </div>
      </form>

      {!r && !loading && (
        <div className="mt-5 md:mt-6 space-y-6 animate-in fade-in duration-300">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Try one of these</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {STARTER_QUESTIONS.map(s => (
                <button key={s} onClick={() => run(s)}
                  className="press group relative text-left rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary-soft/40 hover:shadow-soft pl-4 pr-4 py-3 text-[13px] leading-snug overflow-hidden">
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-teal/0 group-hover:bg-teal transition-colors" />
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
                    <button onClick={() => run(item)} className="flex-1 text-left text-[13px] px-3 py-2.5 truncate">{item}</button>
                    <button onClick={() => removeRecent(item)} aria-label="Remove" className="px-3 py-2 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
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
        <div className="mt-6 md:mt-8 space-y-3 animate-in fade-in duration-200">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="h-2.5 rounded bg-secondary animate-pulse w-1/3" />
              <div className="mt-4 h-3 rounded bg-secondary animate-pulse w-full" />
              <div className="mt-2 h-3 rounded bg-secondary animate-pulse w-5/6" />
              <div className="mt-2 h-3 rounded bg-secondary animate-pulse w-2/3" />
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

type CompactVisual = {
  url: string;
  title: string;
  callouts?: string[];
};

function AnswerView({ answer, query }: { answer: AskAnswer; query: string }) {
  const compact = compactAnswer(answer);
  const visual = visualForAnswer(answer);

  useEffect(() => {
    if (visual) return;
    logVisualGap(answer, query);
  }, [answer, query, visual]);

  return (
    <div className="mt-3 md:mt-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div aria-label="Ask answer" className="rounded-[1.4rem] border border-border bg-card shadow-card overflow-hidden">
        {visual && <VisualHero visual={visual} />}

        <div className="p-4 md:p-4 space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ask answer</div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const text = `${query}\n\nWhat it is: ${compact.whatItIs}\n\nFirst 90 seconds:\n${compact.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nSay this: \"${compact.sayThis}\"\n\nIf it works: ${compact.ifWorks}\n\nIf it doesn't: ${compact.ifNot}\nEscalate to: ${compact.escalationTarget}`;
                  try {
                    await navigator.clipboard?.writeText(text);
                    toast.success("Answer copied");
                  } catch {
                    toast.error("Copy blocked by browser", {
                      description: "Select the answer text and copy manually.",
                    });
                  }
                }}
                className="h-9 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-xs inline-flex items-center gap-1.5"
              >
                <Copy className="size-3.5" /> Copy
              </button>
              <button
                onClick={() => {
                  const saved = readList(SAVED_KEY);
                  writeList(SAVED_KEY, [query, ...saved.filter(x => x !== query)]);
                  toast.success("Answer saved", { description: "Available in this browser." });
                }}
                className="h-9 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-xs inline-flex items-center gap-1.5"
              >
                <Bookmark className="size-3.5" /> Save
              </button>
            </div>
          </div>

          <section>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">WHAT IT IS</div>
            <p className="font-display font-semibold text-[18px] md:text-[20px] leading-snug text-foreground">
              {compact.whatItIs}
            </p>
          </section>

          <section className="rounded-2xl border border-success/25 bg-success/5 p-3.5 border-l-[5px] border-l-success">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-success font-semibold mb-3">
              <Clock className="size-3.5" /> FIRST 90 SECONDS
            </div>
            <ol className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-2">
              {compact.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-snug">
                  <span className="size-6 shrink-0 rounded-full bg-success/15 text-success text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-xl bg-card border border-border px-3 py-2.5 text-sm">
              <span className="font-semibold text-foreground">Say this: </span>
              <span className="text-foreground/85">"{compact.sayThis}"</span>
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">IF IT WORKS / IF IT DOESN'T</div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-success/25 bg-success/5 p-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                  <CheckCircle2 className="size-4" /> If it works
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{compact.ifWorks}</p>
              </div>
              <div className="rounded-2xl border border-warning/35 bg-warning/10 p-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                  <AlertTriangle className="size-4" /> If it doesn't
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{compact.ifNot}</p>
                <div className="mt-2 inline-flex items-center rounded-full bg-card border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
                  Escalate to: {compact.escalationTarget}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">MORE HELP</div>
            <MoreHelpChips answer={answer} />
          </section>

          <CompactFeedbackBar query={query} answer={answer} />

          <p className="text-[11px] leading-relaxed text-muted-foreground border-t border-border pt-3">
            {ASK_SAFETY_LINE}{" "}
            <Link to="/legal" className="underline hover:text-foreground">Trademark &amp; legal notice</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function compactAnswer(answer: AskAnswer) {
  const baseSteps = (answer.walkthrough.length ? answer.walkthrough : answer.first90).slice(0, 3);
  const fallbackSteps = [...baseSteps, ...answer.first90, ...answer.whatToCheck]
    .filter(Boolean)
    .slice(0, 3);
  const steps = fallbackSteps.length
    ? fallbackSteps.map(step => limitWords(cleanStep(step), 12))
    : ["Confirm what changed.", "Check scope and context.", "Escalate with one clear sentence."];

  return {
    whatItIs: compactSentence(answer.shortAnswer || answer.title, 20),
    steps,
    sayThis: limitWords(stripOuterQuotes(answer.whatToSay[0] || "I'll stay with you until this is stable."), 24),
    ifWorks: "Confirm it worked, close the loop, and move to the next issue.",
    ifNot: limitWords(firstSentence(answer.ifThatFails[0] || answer.whenToEscalate), 22),
    escalationTarget: escalationTarget(answer.whenToEscalate),
  };
}

function firstSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^.*?[.!?](?:\s|$)/);
  return (match?.[0] ?? cleaned).trim().replace(/[.!?]+$/, ".");
}

function compactSentence(text: string, max: number): string {
  const sentence = firstSentence(text);
  if (wordCount(sentence) <= max) return sentence;

  const clauses = sentence
    .split(/\s*(?:,|;|:|\s+-\s+|\s+then\s+|\s+before\s+)\s*/i)
    .map(clause => clause.trim())
    .filter(Boolean);

  const usefulClause = clauses.find(clause => {
    const words = wordCount(clause);
    return words >= 4 && words <= max;
  });

  if (usefulClause) return usefulClause.replace(/[.!?]+$/, "") + ".";
  return limitWords(sentence, max);
}

function limitWords(text: string, max: number): string {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length <= max) return text.trim();
  return words.slice(0, max).join(" ").replace(/[,:;.-]+$/, "") + ".";
}

function wordCount(text: string): number {
  return text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

function cleanStep(text: string): string {
  return stripOuterQuotes(text)
    .replace(/^\d+\.\s*/, "")
    .replace(/^Then\s+/i, "")
    .replace(/\s+—\s+/g, " ")
    .trim();
}

function stripOuterQuotes(text: string): string {
  return text.trim().replace(/^['"`]+|['"`]+$/g, "");
}

function escalationTarget(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("command center")) return "Command center";
  if (t.includes("access")) return "Access support";
  if (t.includes("device")) return "Device support";
  if (t.includes("clinical informatics")) return "Clinical informatics";
  if (t.includes("billing") || t.includes("registration")) return "Registration or billing owner";
  if (t.includes("template") || t.includes("build")) return "Template/build owner";
  if (t.includes("floor lead") || t.includes("unit lead")) return "Floor lead";
  return "Floor lead or command center";
}

function visualForAnswer(answer: AskAnswer): CompactVisual | null {
  const anyAnswer = answer as AskAnswer & { visual_url?: string; visualUrl?: string; visual_callouts?: string[] };
  const url = anyAnswer.visual_url ?? anyAnswer.visualUrl;
  if (url) {
    return {
      url,
      title: answer.title,
      callouts: anyAnswer.visual_callouts,
    };
  }
  const screenshot = answer.visualAids.find(aid => aid.kind === "screenshot" && aid.href && !aid.href.startsWith("/videos"));
  if (!screenshot?.href) return null;
  return {
    url: screenshot.href,
    title: screenshot.title,
    callouts: screenshot.callouts,
  };
}

function VisualHero({ visual }: { visual: CompactVisual }) {
  return (
    <div className="relative bg-secondary/40 border-b border-border">
      <img
        src={visual.url}
        alt={visual.title}
        className="w-full max-h-[280px] object-contain"
        loading="lazy"
      />
      {visual.callouts?.length ? (
        <div className="absolute left-3 right-3 bottom-3 rounded-xl bg-card/95 backdrop-blur border border-border p-2 shadow-soft">
          <div className="grid gap-1">
            {visual.callouts.slice(0, 4).map((callout, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-foreground/85">
                <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="line-clamp-1">{callout.replace(/^\d+\s*-\s*/, "")}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MoreHelpChips({ answer }: { answer: AskAnswer }) {
  const playbook = answer.related.playbooks[0];
  const checklist = answer.related.checklists[0];
  const video = answer.related.videos[0];
  const chips = [
    playbook && { key: "playbook", label: "Playbook", icon: NotebookPen, to: "/playbooks/$id" as const, params: { id: playbook.id } },
    checklist && { key: "checklist", label: "Checklist", icon: ClipboardCheck, to: "/checklists" as const },
    video && { key: "video", label: "Video", icon: Film, to: "/videos" as const },
  ].filter(Boolean) as {
    key: string;
    label: string;
    icon: typeof NotebookPen;
    to: any;
    params?: any;
  }[];

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(chip => {
        const Icon = chip.icon;
        return (
          <Link
            key={chip.key}
            to={chip.to}
            params={chip.params}
            className="h-10 px-3 rounded-xl border border-border bg-surface-elevated hover:border-primary/35 hover:bg-primary-soft/45 text-sm font-medium inline-flex items-center gap-2 transition"
          >
            <Icon className="size-4 text-primary" /> {chip.label}
          </Link>
        );
      })}
    </div>
  );
}

function answerId(answer: AskAnswer): string {
  return answer.sourceEntry?.id ?? answer.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function logVisualGap(answer: AskAnswer, query: string) {
  if (typeof window === "undefined") return;
  const id = answerId(answer);
  const seenKey = "mizly.ask.visual_gap_seen";
  const gapRecord = {
    query,
    answerTitle: answer.title,
    gaps: [{ kind: "screenshot", label: "Visual needed", priority: answer.matchQuality === "strong" ? "high" : "medium" }],
    ts: Date.now(),
  };

  try {
    const seen = JSON.parse(localStorage.getItem(seenKey) ?? "[]") as string[];
    const key = `${id}:${query.toLowerCase()}`;
    if (!seen.includes(key)) {
      const prev = JSON.parse(localStorage.getItem(CONTENT_GAP_KEY) ?? "[]");
      localStorage.setItem(CONTENT_GAP_KEY, JSON.stringify([...prev, gapRecord].slice(-80)));
      localStorage.setItem(seenKey, JSON.stringify([...seen, key].slice(-120)));
    }
  } catch {
    // Local gap logging is best-effort in the preview build.
  }

  void postJsonSilently("/api/content-gaps/log", { answer_id: id, gap: "visual" });
}

async function postJsonSilently(url: string, body: unknown) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Preview builds may not have server endpoints yet.
  }
}

function CompactFeedbackBar({ query, answer }: { query: string; answer: AskAnswer }) {
  const [vote, setVote] = useState<null | "up" | "down">(null);
  const [note, setNote] = useState("");

  const submit = (kind: "up" | "down", noteText = "") => {
    setVote(kind);
    if (typeof window !== "undefined") {
      try {
        const key = "ate.ask.feedback";
        const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
        prev.push({ q: query, answer_id: answerId(answer), kind, note: noteText, ts: Date.now() });
        localStorage.setItem(key, JSON.stringify(prev.slice(-80)));
      } catch {
        // Local feedback is best-effort.
      }
    }
    void postJsonSilently("/api/feedback", {
      question: query,
      answer_id: answerId(answer),
      rating: kind === "up" ? "helpful" : "not_helpful",
      note: noteText,
    });
    toast.success(kind === "up" ? "Marked helpful" : "Feedback sent");
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-medium">Was this what you needed?</div>
        <div className="flex gap-2">
          <button
            onClick={() => submit("up")}
            aria-pressed={vote === "up"}
            className={`h-10 min-w-12 px-3 rounded-xl border text-sm font-medium transition ${vote === "up" ? "bg-success/15 text-success border-success/30" : "bg-card border-border hover:bg-secondary"}`}
          >
            👍
          </button>
          <button
            onClick={() => setVote("down")}
            aria-pressed={vote === "down"}
            className={`h-10 min-w-12 px-3 rounded-xl border text-sm font-medium transition ${vote === "down" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-card border-border hover:bg-secondary"}`}
          >
            👎
          </button>
        </div>
      </div>
      {vote === "down" && (
        <form
          onSubmit={e => {
            e.preventDefault();
            submit("down", note.trim());
            setNote("");
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What was missing?"
            className="min-w-0 flex-1 h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35"
          />
          <button type="submit" className="h-10 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            Send
          </button>
        </form>
      )}
    </div>
  );
}

function LegacyAnswerView({ answer, query }: { answer: AskAnswer; query: string }) {
  const r = answer;
  const sourceBadge = r.sourceEntry ? badgeForLaunchType(r.sourceEntry.type) : null;

  useEffect(() => {
    if (typeof window === "undefined" || r.kbSupport.gaps.length === 0) return;
    try {
      const prev = JSON.parse(localStorage.getItem(CONTENT_GAP_KEY) ?? "[]");
      const next = [
        ...prev,
        {
          query,
          answerTitle: r.title,
          gaps: r.kbSupport.gaps.map(gap => ({
            kind: gap.kind,
            label: gap.label,
            priority: gap.priority,
          })),
          ts: Date.now(),
        },
      ];
      localStorage.setItem(CONTENT_GAP_KEY, JSON.stringify(next.slice(-80)));
    } catch {
      // Local gap logging is best-effort in the preview build.
    }
  }, [query, r.title, r.kbSupport.gaps]);

  return (
    <div className="mt-8 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Match quality bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <MatchBadge q={r.matchQuality} label={r.matchLabel} />
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const visualGuide = r.visualAids.length
                ? `\n\nVisual guide:\n${r.visualAids.map(a => `- ${a.title}: ${a.note}${a.callouts?.length ? `\n  ${a.callouts.join("\n  ")}` : ""}`).join("\n")}`
                : `\n\nVisual guide:\nNo sanitized screenshot/video yet. Written walkthrough only for now.`;
              const kbMatches = r.kbSupport.matches.length
                ? `\n\nMizly KB match:\n${r.kbSupport.matches.slice(0, 6).map(m => `- ${m.title} (${m.reason})`).join("\n")}`
                : "";
              const gaps = r.kbSupport.gaps.length
                ? `\n\nContent gaps:\n${r.kbSupport.gaps.map(g => `- ${g.label}: ${g.prompt}`).join("\n")}`
                : "";
              const text = `${query}\n\nShort answer: ${r.shortAnswer}\n\nDo this now:\n${r.walkthrough.map((s,i)=>`${i+1}. ${s}`).join("\n")}\n\nIf that fails:\n${r.ifThatFails.map(s=>`- ${s}`).join("\n")}${visualGuide}${kbMatches}${gaps}\n\nFirst 90 seconds:\n${r.first90.map((s,i)=>`${i+1}. ${s}`).join("\n")}\n\nWhat to say:\n${r.whatToSay.map(s=>`- ${s}`).join("\n")}\n\nWhat to check:\n${r.whatToCheck.map(s=>`- ${s}`).join("\n")}\n\nWhen to escalate: ${r.whenToEscalate}`;
              try {
                await navigator.clipboard?.writeText(text);
                toast.success("Answer copied to clipboard");
              } catch {
                toast.error("Copy blocked by browser", {
                  description: "Select the answer text and copy manually.",
                });
              }
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

      {/* 1. SHORT ANSWER */}
      <div className="relative rounded-2xl border border-border bg-card p-5 md:p-6 shadow-card overflow-hidden">
        <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r accent-rule-v" />
        <div className="flex items-center gap-2 mb-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Short answer</div>
          {sourceBadge && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${sourceBadge.cls}`}>
              <ShieldCheck className="size-3" /> {sourceBadge.label} · Mizly library
            </span>
          )}
        </div>
        <div className="text-[17px] md:text-lg font-display font-semibold leading-snug text-foreground">{r.title}</div>
        <p className="mt-2.5 text-[14px] leading-relaxed text-foreground/85">
          {r.shortAnswer?.trim() ? r.shortAnswer : "No direct Mizly match yet."}
        </p>
        <p className="mt-4 text-[11.5px] text-muted-foreground italic border-l-2 border-border pl-3">
          {ASK_SAFETY_LINE}{" "}
          <Link to="/legal" className="underline hover:text-foreground">Trademark &amp; legal notice</Link>.
        </p>
      </div>


      <WalkthroughSection answer={r} />
      <VisualGuideSection answer={r} />
      <KbMatchSection answer={r} />
      <ContentGapSection answer={r} />

      {/* Existing field-support sections */}
      <ListSection title="FIRST 90 SECONDS" items={r.first90} ordered />
      <ListSection title="WHAT TO SAY" items={r.whatToSay} />
      <ListSection title="WHAT TO CHECK" items={r.whatToCheck} />

      {/* 5. WHEN TO ESCALATE */}
      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
        <div className="text-[10px] uppercase tracking-wider text-warning font-medium mb-2 inline-flex items-center gap-1.5">
          <AlertTriangle className="size-3" /> WHEN TO ESCALATE
        </div>
        <p className="text-sm leading-relaxed">
          {r.whenToEscalate?.trim() ? r.whenToEscalate : "No direct Mizly match yet."}
        </p>
      </div>

      {/* 6-9. Related sections — always render */}
      <RelatedGrid label="RELATED PLAYBOOKS" type="playbook" items={r.related.playbooks} />
      <RelatedGrid label="RELATED CHECKLISTS" type="checklist" items={r.related.checklists} />
      <RelatedGrid label="RELATED LESSONS" type="lesson" items={r.related.lessons} />
      <RelatedGrid label="RELATED SCENARIOS" type="scenario" items={r.related.scenarios} />

      {/* 10. SOURCES / BASED ON MIZLY LIBRARY */}
      <Section title="SOURCES / BASED ON MIZLY LIBRARY">
        {r.sources.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {r.sources.map(s => (
              <span key={s.id} className="text-[11px] px-2 py-1 rounded-full inline-flex items-center gap-1.5 bg-primary-soft text-primary">
                <ShieldCheck className="size-3" /> {s.title}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No direct Mizly match yet.</p>
        )}
      </Section>

      {/* 11. WAS THIS HELPFUL? */}
      <FeedbackBar query={query} />
    </div>
  );
}

function MatchBadge({ q, label }: { q: MatchQuality; label: string }) {
  const cls = q === "strong"
    ? "bg-teal-soft text-teal border-teal/25"
    : q === "related"
    ? "bg-primary-soft text-primary border-primary/20"
    : "bg-warning/12 text-warning border-warning/25";
  const Icon = q === "strong" ? CheckCircle2 : q === "related" ? Sparkles : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon className="size-3" /> {label}
    </span>
  );
}

function WalkthroughSection({ answer }: { answer: AskAnswer }) {
  const video = answer.related.videos[0];
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary-soft/35 p-5 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-primary font-medium mb-3">DO THIS NOW</div>
      <ol className="space-y-2 text-sm">
        {answer.walkthrough.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="size-6 shrink-0 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">{i + 1}</span>
            <span className="pt-0.5 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      {answer.ifThatFails.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">IF THAT FAILS</div>
          <ul className="space-y-2 text-sm">
            {answer.ifThatFails.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary font-semibold">Then</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {video && !answer.visualAids.length && (
        <Link
          to="/videos"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:shadow-soft transition"
        >
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Training video instead</span>
            <span className="mt-0.5 block font-medium truncate">{video.title}</span>
          </span>
          <Film className="size-4 text-primary shrink-0" />
        </Link>
      )}
    </div>
  );
}

function VisualGuideSection({ answer }: { answer: AskAnswer }) {
  const iconFor = (kind: string) => {
    if (kind === "screenshot") return ImageIcon;
    if (kind === "tasklet") return MousePointerClick;
    return Film;
  };

  const labelFor = (kind: string) => {
    if (kind === "screenshot") return "Sanitized screenshot";
    if (kind === "tasklet") return "Click path";
    return "Training video";
  };

  if (!answer.visualAids.length) {
    const topGap = answer.kbSupport.gaps[0];
    return (
      <Section title="VISUAL GUIDE">
        <div className="rounded-xl border border-dashed border-border bg-secondary/45 p-4">
          <div className="flex items-start gap-3">
            <span className="size-9 shrink-0 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <ImageIcon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">No visual guide yet</span>
              <span className="mt-0.5 block text-sm font-semibold text-foreground">
                {topGap?.label ?? "Written walkthrough only for now"}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                Mizly has the written workflow. The content factory should add a sanitized screenshot, click path, or short training clip next.
              </span>
            </span>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="VISUAL GUIDE">
      <div className="space-y-3">
        {answer.visualAids.map((aid, i) => {
          const Icon = iconFor(aid.kind);
          const body = (
            <>
              <div className="flex items-start gap-3">
                <span className="size-9 shrink-0 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{labelFor(aid.kind)}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-foreground">{aid.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{aid.note}</span>
                </span>
              </div>
              {aid.callouts?.length ? (
                <ul className="mt-3 grid gap-1.5 text-xs text-foreground/80">
                  {aid.callouts.map((callout, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-teal" />
                      <span>{callout}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          );

          if (aid.href === "/videos") {
            return (
              <Link
                key={`${aid.kind}-${i}`}
                to="/videos"
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary/35 hover:shadow-soft transition-all"
              >
                {body}
              </Link>
            );
          }

          return (
            <div key={`${aid.kind}-${i}`} className="rounded-xl border border-border bg-card p-4">
              {body}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Mizly visuals must be recreated, sanitized, and vendor-neutral. Do not upload screenshots with patient data, vendor branding, private URLs, or organization names.
      </p>
    </Section>
  );
}

function isContentKind(kind: string): kind is ContentType {
  return ["lesson", "playbook", "video", "checklist", "scenario"].includes(kind);
}

function KbMatchSection({ answer }: { answer: AskAnswer }) {
  const matches = answer.kbSupport.matches.slice(0, 6);
  if (!matches.length) return null;

  const iconFor = (kind: string) => {
    if (isContentKind(kind)) return TYPE_META[kind].icon;
    if (kind === "screenshot") return ImageIcon;
    if (kind === "tasklet") return MousePointerClick;
    if (kind === "video") return Film;
    return ShieldCheck;
  };

  const card = (match: (typeof matches)[number]) => {
    const Icon = iconFor(match.kind);
    return (
      <div className="rounded-xl border border-border bg-card p-3.5 hover:border-primary/35 hover:shadow-soft transition-all">
        <div className="flex items-start gap-3">
          <span className="size-8 shrink-0 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
            <Icon className="size-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{match.kind}</span>
            <span className="mt-0.5 block text-sm font-medium text-foreground line-clamp-2">{match.title}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{match.reason}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <Section title="MIZLY KB MATCH">
      <p className="text-xs leading-relaxed text-muted-foreground mb-3">
        {answer.kbSupport.retrievalNote}
      </p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {matches.map(match => {
          if (isContentKind(match.kind)) {
            const lk = linkForType(match.kind, match.id);
            return (
              <Link key={match.id} to={lk.to} params={lk.params} className="block">
                {card(match)}
              </Link>
            );
          }
          if (match.href === "/videos") {
            return (
              <Link key={match.id} to="/videos" className="block">
                {card(match)}
              </Link>
            );
          }
          return <div key={match.id}>{card(match)}</div>;
        })}
      </div>
    </Section>
  );
}

function ContentGapSection({ answer }: { answer: AskAnswer }) {
  const gaps = answer.kbSupport.gaps;
  if (!gaps.length) return null;

  return (
    <Section title="CONTENT GAP LOGGED">
      <div className="space-y-2">
        {gaps.map(gap => (
          <div key={gap.id} className="rounded-xl border border-border bg-secondary/35 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">{gap.label}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{gap.prompt}</p>
              </div>
              <span className="shrink-0 rounded-full bg-card px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground border border-border">
                {gap.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ListSection({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  if (!items?.length) {
    return (
      <Section title={title}>
        <p className="text-sm text-muted-foreground">No direct Mizly match yet.</p>
      </Section>
    );
  }
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
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  if (!items?.length) {
    return (
      <Section title={label}>
        <p className="text-sm text-muted-foreground">No direct Mizly match yet.</p>
      </Section>
    );
  }
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
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">WAS THIS HELPFUL?</div>
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
