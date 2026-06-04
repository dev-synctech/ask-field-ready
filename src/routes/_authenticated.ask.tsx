import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Sparkles, BookOpen, ListChecks, Film, ClipboardCheck,
  NotebookPen, Copy, Bookmark, Loader2, Clock, X,
  CheckCircle2, AlertTriangle, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { askLaunch, STARTER_QUESTIONS, type AskAnswer } from "@/lib/launch-library";
import type { ContentType, ContentItem } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({ meta: [{ title: "Ask — Mizly" }] }),
  component: AskPage,
});

const RECENT_KEY = "ate.ask.recent";
const SAVED_KEY = "ate.ask.saved";
const CONTENT_GAP_KEY = "mizly.ask.content_gaps";

const TRADEMARK_DISCLAIMER =
  "Epic and EpicCare are registered trademarks of Epic Systems Corporation. Oracle Health and Cerner are trademarks of Oracle Corporation. MEDITECH is a registered trademark of Medical Information Technology, Inc. Mizly is an independent product not affiliated with or endorsed by these vendors.";

const TYPE_META: Record<ContentType, { label: string; icon: any; cls: string }> = {
  lesson:    { label: "Lessons",    icon: BookOpen,       cls: "bg-primary-soft text-primary" },
  playbook:  { label: "Playbooks",  icon: NotebookPen,    cls: "bg-warning/15 text-warning" },
  video:     { label: "Videos",     icon: Film,           cls: "bg-accent text-accent-foreground" },
  checklist: { label: "Checklists", icon: ClipboardCheck, cls: "bg-success/15 text-success" },
  scenario:  { label: "Scenarios",  icon: ListChecks,     cls: "bg-secondary text-secondary-foreground" },
};

// --- Slot parsing -----------------------------------------------------------

type VendorFamily =
  | "epic" | "cerner" | "oracle_health" | "meditech"
  | "sunquest" | "philips_careevent" | "unknown";

type ActionKind =
  | "place" | "sign" | "cosign" | "modify" | "discontinue"
  | "document" | "scan" | "schedule" | "route" | "reconcile" | "review" | "unknown";

type Slots = { vendor: VendorFamily; action: ActionKind };

const VENDOR_PATTERNS: Array<[RegExp, VendorFamily]> = [
  [/\b(epic|epiccare|hyperspace|storyboard|in[- ]?basket|smartset|smarttool|smarttools|wisdom|lumens|rehab)\b/i, "epic"],
  [/\b(cerner|powerchart|firstnet|surginet)\b/i, "cerner"],
  [/\boracle\s*health\b/i, "oracle_health"],
  [/\bmeditech\b/i, "meditech"],
  [/\bsunquest\b/i, "sunquest"],
  [/\bphilips(\s+care\s*event)?\b/i, "philips_careevent"],
];

const ACTION_PATTERNS: Array<[RegExp, ActionKind]> = [
  [/\bcosign|co-?sign\b/i, "cosign"],
  [/\bsign(ing|ed)?\b/i, "sign"],
  [/\bplace(d|ing)?\b|\bnew\s+order\b|\border(ing|s)?\b/i, "place"],
  [/\bmodif(y|ying|ied)\b|\bedit(ing|ed)?\b|\bchange\b/i, "modify"],
  [/\bdiscontinu|d\/c\b|\bstop\s+order\b/i, "discontinue"],
  [/\bdocument(ation|ing|ed)?\b|\bchart(ing|ed)?\b/i, "document"],
  [/\bscan(ning|ned)?\b/i, "scan"],
  [/\bschedul(e|ing|ed)\b/i, "schedule"],
  [/\broute(ing|d)?\b/i, "route"],
  [/\breconcil(e|ing|iation)\b/i, "reconcile"],
  [/\breview(ing|ed)?\b/i, "review"],
];

function parseSlots(text: string): Slots {
  let vendor: VendorFamily = "unknown";
  let action: ActionKind = "unknown";
  for (const [re, v] of VENDOR_PATTERNS) if (re.test(text)) { vendor = v; break; }
  for (const [re, a] of ACTION_PATTERNS) if (re.test(text)) { action = a; break; }
  return { vendor, action };
}

function mergeSlots(a: Slots, b: Slots): Slots {
  return {
    vendor: b.vendor !== "unknown" ? b.vendor : a.vendor,
    action: b.action !== "unknown" ? b.action : a.action,
  };
}

const VENDOR_LABEL: Record<VendorFamily, string> = {
  epic: "Epic", cerner: "Cerner", oracle_health: "Oracle Health",
  meditech: "MEDITECH", sunquest: "Sunquest", philips_careevent: "Philips CareEvent",
  unknown: "",
};
const ACTION_LABEL: Record<ActionKind, string> = {
  place: "place a new order", sign: "sign", cosign: "cosign", modify: "modify",
  discontinue: "discontinue", document: "document", scan: "scan",
  schedule: "schedule", route: "route", reconcile: "reconcile", review: "review",
  unknown: "",
};

// --- Storage helpers --------------------------------------------------------

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function writeList(key: string, arr: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 8)));
}

// --- Turn types -------------------------------------------------------------

type Turn =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "clarify-vendor" }
  | { id: string; kind: "clarify-vendor-detail" }
  | { id: string; kind: "clarify-action" }
  | { id: string; kind: "answer"; answer: AskAnswer; query: string }
  | { id: string; kind: "no-match"; related: AskAnswer["related"] };

let turnSeq = 0;
const tid = () => `t${++turnSeq}`;

// --- Component --------------------------------------------------------------

function AskPage() {
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [slots, setSlots] = useState<Slots>({ vendor: "unknown", action: "unknown" });
  const [clarifierCount, setClarifierCount] = useState(0);
  const [originalQuery, setOriginalQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const hasConversation = turns.length > 0;
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setRecent(readList(RECENT_KEY)); }, []);
  useEffect(() => {
    if (hasConversation) scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, hasConversation]);

  const resolveAnswer = (slotsNow: Slots, baseQuery: string) => {
    const vendorBits = slotsNow.vendor !== "unknown" ? VENDOR_LABEL[slotsNow.vendor] : "";
    const actionBits = slotsNow.action !== "unknown" ? ACTION_LABEL[slotsNow.action] : "";
    const synthesized = [vendorBits, actionBits, baseQuery].filter(Boolean).join(" ");
    const answer = askLaunch(synthesized || baseQuery);
    if (answer.matchQuality === "general") {
      setTurns(prev => [...prev, { id: tid(), kind: "no-match", related: answer.related }]);
    } else {
      setTurns(prev => [...prev, { id: tid(), kind: "answer", answer, query: baseQuery }]);
    }
  };

  const advance = (slotsNow: Slots, baseQuery: string, clarifiersSoFar: number) => {
    if (slotsNow.vendor !== "unknown" && slotsNow.action !== "unknown") {
      resolveAnswer(slotsNow, baseQuery); return;
    }
    if (clarifiersSoFar >= 2) {
      resolveAnswer(slotsNow, baseQuery); return;
    }
    if (slotsNow.vendor === "unknown") {
      setTurns(prev => [...prev, { id: tid(), kind: "clarify-vendor" }]);
    } else {
      setTurns(prev => [...prev, { id: tid(), kind: "clarify-action" }]);
    }
  };

  const submitFirst = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 2) return;
    setQ("");
    setOriginalQuery(trimmed);
    const parsed = parseSlots(trimmed);
    setSlots(parsed);
    setClarifierCount(0);
    setTurns([{ id: tid(), kind: "user", text: trimmed }]);
    setLoading(true);
    const next = [trimmed, ...recent.filter(x => x.toLowerCase() !== trimmed.toLowerCase())];
    setRecent(next); writeList(RECENT_KEY, next);
    setTimeout(() => {
      setLoading(false);
      advance(parsed, trimmed, 0);
    }, 280);
  };

  const handleChip = (kind: Turn["kind"], chipText: string, chipSlots: Partial<Slots>) => {
    setTurns(prev => [...prev, { id: tid(), kind: "user", text: chipText }]);
    if (kind === "clarify-vendor" && chipSlots.vendor === undefined) {
      // "Not sure" → ask vendor detail
      setTurns(prev => [...prev, { id: tid(), kind: "clarify-vendor-detail" }]);
      setClarifierCount(c => c + 1);
      return;
    }
    const merged = mergeSlots(slots, {
      vendor: chipSlots.vendor ?? "unknown",
      action: chipSlots.action ?? "unknown",
    });
    setSlots(merged);
    const newCount = clarifierCount + 1;
    setClarifierCount(newCount);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      advance(merged, originalQuery, newCount);
    }, 220);
  };

  const reset = () => {
    setTurns([]); setSlots({ vendor: "unknown", action: "unknown" });
    setClarifierCount(0); setOriginalQuery(""); setQ("");
  };

  const removeRecent = (item: string) => {
    const next = recent.filter(x => x !== item);
    setRecent(next); writeList(RECENT_KEY, next);
  };

  return (
    <div className={`max-w-[720px] mx-auto px-5 pb-40 md:pb-8 ${hasConversation ? "pt-4 md:pt-4" : "pt-6 md:pt-12"}`}>
      <div className={`${hasConversation ? "mb-2 flex items-center justify-between" : "md:text-center mb-6 md:mb-10"}`}>
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            <Sparkles className="size-3 text-teal" /> Ask Mizly
          </div>
          <h1 className={`${hasConversation ? "text-[18px] md:text-[22px]" : "text-[22px] md:text-[34px]"} leading-tight font-display font-semibold tracking-tight text-foreground`}>
            What just happened on the floor?
          </h1>
          {!hasConversation && (
            <p className="mt-2 text-[13px] md:text-sm text-muted-foreground max-w-lg md:mx-auto">
              No greeting. No theory. Get the exact next move, what to try if it fails, and when to escalate.
            </p>
          )}
        </div>
        {hasConversation && (
          <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5">
            <X className="size-3.5" /> New
          </button>
        )}
      </div>

      {/* Desktop composer */}
      <form onSubmit={e => { e.preventDefault(); submitFirst(q); }} className="relative hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="e.g. How do I scan a consent into the chart?"
          className={`${hasConversation ? "h-11" : "h-14"} w-full pl-11 pr-28 rounded-2xl border border-border bg-surface-elevated text-[15px] shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition`}
        />
        <button type="submit" disabled={q.trim().length < 2 || loading}
          className={`${hasConversation ? "h-8" : "h-10"} press absolute right-2 top-1/2 -translate-y-1/2 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 inline-flex items-center gap-1.5 hover:bg-primary/90 shadow-soft`}>
          {loading ? <><Loader2 className="size-3.5 animate-spin" /> Thinking</> : "Ask"}
        </button>
      </form>

      {/* Mobile sticky composer */}
      <form
        onSubmit={e => { e.preventDefault(); submitFirst(q); }}
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

      {/* Idle landing */}
      {!hasConversation && !loading && (
        <div className="mt-5 md:mt-6 space-y-6 animate-in fade-in duration-300">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Try one of these</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {STARTER_QUESTIONS.map(s => (
                <button key={s} onClick={() => submitFirst(s)}
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
                    <button onClick={() => submitFirst(item)} className="flex-1 text-left text-[13px] px-3 py-2.5 truncate">{item}</button>
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

      {/* Conversation */}
      {hasConversation && (
        <div className="mt-3 space-y-3">
          {turns.map(turn => {
            if (turn.kind === "user") {
              return (
                <div key={turn.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary text-primary-foreground px-3.5 py-2 text-sm leading-snug shadow-soft">
                    {turn.text}
                  </div>
                </div>
              );
            }
            if (turn.kind === "clarify-vendor") {
              return (
                <ClarifierBubble
                  key={turn.id}
                  prompt="Quick check — which system are you in?"
                  chips={[
                    { label: "Epic", onClick: () => handleChip("clarify-vendor", "Epic", { vendor: "epic" }) },
                    { label: "Cerner", onClick: () => handleChip("clarify-vendor", "Cerner", { vendor: "cerner" }) },
                    { label: "Oracle Health", onClick: () => handleChip("clarify-vendor", "Oracle Health", { vendor: "oracle_health" }) },
                    { label: "Not sure", onClick: () => handleChip("clarify-vendor", "Not sure", {}) },
                  ]}
                />
              );
            }
            if (turn.kind === "clarify-vendor-detail") {
              return (
                <ClarifierBubble
                  key={turn.id}
                  prompt="No problem — what does the top of your screen say?"
                  chips={[
                    { label: "Hyperspace / Storyboard", onClick: () => handleChip("clarify-vendor", "Hyperspace / Storyboard", { vendor: "epic" }) },
                    { label: "PowerChart / FirstNet", onClick: () => handleChip("clarify-vendor", "PowerChart / FirstNet", { vendor: "cerner" }) },
                    { label: "Still not sure", onClick: () => handleChip("clarify-action", "Still not sure", {}) },
                  ]}
                />
              );
            }
            if (turn.kind === "clarify-action") {
              return (
                <ClarifierBubble
                  key={turn.id}
                  prompt="Got it. What are you trying to do?"
                  chips={[
                    { label: "Place new", onClick: () => handleChip("clarify-action", "Place new", { action: "place" }) },
                    { label: "Sign / cosign", onClick: () => handleChip("clarify-action", "Sign / cosign", { action: "cosign" }) },
                    { label: "Modify existing", onClick: () => handleChip("clarify-action", "Modify existing", { action: "modify" }) },
                    { label: "Discontinue", onClick: () => handleChip("clarify-action", "Discontinue", { action: "discontinue" }) },
                  ]}
                />
              );
            }
            if (turn.kind === "answer") {
              return <AnswerView key={turn.id} answer={turn.answer} query={turn.query} />;
            }
            if (turn.kind === "no-match") {
              return <NoMatchView key={turn.id} related={turn.related} />;
            }
            return null;
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-2">
              <Loader2 className="size-3.5 animate-spin" /> Thinking…
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>
      )}
    </div>
  );
}

// --- Clarifier bubble -------------------------------------------------------

function ClarifierBubble({ prompt, chips }: {
  prompt: string;
  chips: { label: string; onClick: () => void }[];
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-border bg-card px-3.5 py-3 shadow-soft">
        <div className="text-sm text-foreground/90 leading-snug">{prompt}</div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map(chip => (
            <button key={chip.label} onClick={chip.onClick}
              className="press h-8 px-3 rounded-full border border-border bg-surface-elevated hover:bg-primary-soft hover:border-primary/30 text-xs font-medium inline-flex items-center gap-1.5 transition">
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Answer card ------------------------------------------------------------

type CompactVisual = { url: string; title: string; callouts?: string[] };

function AnswerView({ answer, query }: { answer: AskAnswer; query: string }) {
  const compact = compactAnswer(answer);
  const visual = visualForAnswer(answer);
  const navTrail = navTrailFor(answer);

  useEffect(() => {
    if (visual) return;
    logVisualGap(answer, query);
  }, [answer, query, visual]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div aria-label="Ask answer" className="rounded-[1.4rem] border border-border bg-card shadow-card overflow-hidden">
        {visual && <VisualHero visual={visual} />}

        <div className="p-4 md:p-4 space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ask answer</div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const text = `${query}\n\nWhat it is: ${compact.whatItIs}\n${navTrail ? `\nNav trail: ${navTrail}\n` : ""}\nFirst 90 seconds:\n${compact.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nIf it works: ${compact.ifWorks}\n\nIf it doesn't: ${compact.ifNot}\nEscalate to: ${compact.escalationTarget}`;
                  try {
                    await navigator.clipboard?.writeText(text);
                    toast.success("Answer copied");
                  } catch {
                    toast.error("Copy blocked by browser", { description: "Select the answer text and copy manually." });
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

          {navTrail && (
            <section>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">NAV TRAIL</div>
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                {navTrail.split(/\s*>\s*/).map((seg, i, arr) => (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    <span className="px-2 py-1 rounded-md bg-secondary/70 text-foreground/85 font-medium text-[13px]">{seg}</span>
                    {i < arr.length - 1 && <ChevronRight className="size-3.5 text-muted-foreground" />}
                  </span>
                ))}
              </div>
            </section>
          )}

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

          <MoreHelpGroups answer={answer} />

          <CompactFeedbackBar query={query} answer={answer} />

          <p className="text-[11px] leading-relaxed text-muted-foreground border-t border-border pt-3">
            {TRADEMARK_DISCLAIMER}{" "}
            <Link to="/legal" className="underline hover:text-foreground">Trademark &amp; legal notice</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- No-match ---------------------------------------------------------------

function NoMatchView({ related }: { related: AskAnswer["related"] }) {
  const empty = related.playbooks.length + related.checklists.length + related.videos.length
    + related.lessons.length + related.scenarios.length === 0;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="rounded-2xl border border-border bg-card p-4 md:p-4 shadow-soft space-y-3">
        {empty ? (
          <p className="text-sm text-foreground/85 leading-relaxed">
            Try rephrasing — mention the system (Epic, Cerner) and what you're trying to do.
          </p>
        ) : (
          <>
            <div className="text-sm font-medium text-foreground">Closest materials we have:</div>
            <MoreHelpGroupsFromRelated related={related} />
          </>
        )}
        <p className="text-[11px] leading-relaxed text-muted-foreground border-t border-border pt-3">
          {TRADEMARK_DISCLAIMER}{" "}
          <Link to="/legal" className="underline hover:text-foreground">Trademark &amp; legal notice</Link>.
        </p>
      </div>
    </div>
  );
}

// --- More help (grouped) ----------------------------------------------------

function MoreHelpGroups({ answer }: { answer: AskAnswer }) {
  const empty = answer.related.playbooks.length + answer.related.checklists.length
    + answer.related.videos.length + answer.related.lessons.length
    + answer.related.scenarios.length === 0;
  if (empty) return null;
  return (
    <section>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">MORE HELP</div>
      <MoreHelpGroupsFromRelated related={answer.related} />
    </section>
  );
}

function MoreHelpGroupsFromRelated({ related }: { related: AskAnswer["related"] }) {
  const groups: Array<{ type: ContentType; items: ContentItem[] }> = ([
    { type: "playbook" as ContentType, items: related.playbooks },
    { type: "checklist" as ContentType, items: related.checklists },
    { type: "video" as ContentType, items: related.videos },
    { type: "lesson" as ContentType, items: related.lessons },
    { type: "scenario" as ContentType, items: related.scenarios },
  ]).filter(g => g.items.length > 0);

  if (!groups.length) return null;

  return (
    <div className="space-y-2.5">
      {groups.map(g => {
        const meta = TYPE_META[g.type];
        const Icon = meta.icon;
        return (
          <div key={g.type}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">{meta.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.slice(0, 4).map(item => {
                const lk = linkForType(g.type, item.id);
                return (
                  <Link key={item.id} to={lk.to} params={lk.params}
                    className="h-9 px-3 rounded-full border border-border bg-surface-elevated hover:border-primary/35 hover:bg-primary-soft/45 text-xs font-medium inline-flex items-center gap-1.5 transition max-w-full">
                    <Icon className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function linkForType(type: ContentType, id: string): { to: any; params?: any } {
  switch (type) {
    case "lesson": return { to: "/lessons/$id", params: { id } };
    case "playbook": return { to: "/playbooks/$id", params: { id } };
    case "scenario": return { to: "/scenarios/$id", params: { id } };
    case "video": return { to: "/videos" };
    case "checklist": return { to: "/checklists" };
  }
}

// --- Compactors -------------------------------------------------------------

function compactAnswer(answer: AskAnswer) {
  const baseSteps = (answer.walkthrough.length ? answer.walkthrough : answer.first90).slice(0, 3);
  const fallbackSteps = [...baseSteps, ...answer.first90, ...answer.whatToCheck]
    .filter(Boolean).slice(0, 3);
  const steps = fallbackSteps.length
    ? fallbackSteps.map(step => limitWords(cleanStep(step), 14))
    : ["Confirm what changed.", "Check scope and context.", "Escalate with one clear sentence."];

  return {
    whatItIs: compactSentence(answer.shortAnswer || answer.title, 22),
    steps,
    ifWorks: "Confirm it worked, close the loop, and move to the next issue.",
    ifNot: limitWords(firstSentence(answer.ifThatFails[0] || answer.whenToEscalate), 24),
    escalationTarget: escalationTarget(answer.whenToEscalate),
  };
}

function navTrailFor(answer: AskAnswer): string | null {
  const candidates = [...answer.walkthrough, ...answer.first90];
  for (const step of candidates) {
    const cleaned = step.trim();
    const arrow = cleaned.match(/([A-Z][\w\/ ]+?\s*>\s*[\w\/ ]+(?:\s*>\s*[\w\/ ]+)*)/);
    if (arrow) {
      const trail = arrow[1].split(">").map(s => s.trim()).filter(Boolean).slice(0, 4);
      if (trail.length >= 2) return trail.join(" > ");
    }
  }
  return null;
}

function firstSentence(text: string): string {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const match = cleaned.match(/^.*?[.!?](?:\s|$)/);
  return (match?.[0] ?? cleaned).trim().replace(/[.!?]+$/, ".");
}

function compactSentence(text: string, max: number): string {
  const sentence = firstSentence(text);
  if (wordCount(sentence) <= max) return sentence;
  const clauses = sentence.split(/\s*(?:,|;|:|\s+-\s+|\s+then\s+|\s+before\s+)\s*/i)
    .map(c => c.trim()).filter(Boolean);
  const useful = clauses.find(c => { const w = wordCount(c); return w >= 4 && w <= max; });
  if (useful) return useful.replace(/[.!?]+$/, "") + ".";
  return limitWords(sentence, max);
}

function limitWords(text: string, max: number): string {
  const words = (text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length <= max) return (text || "").trim();
  return words.slice(0, max).join(" ").replace(/[,:;.-]+$/, "") + ".";
}

function wordCount(text: string): number {
  return (text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

function cleanStep(text: string): string {
  return stripOuterQuotes(text)
    .replace(/^\d+\.\s*/, "")
    .replace(/^Then\s+/i, "")
    .replace(/\s+—\s+/g, " ")
    .trim();
}

function stripOuterQuotes(text: string): string {
  return (text || "").trim().replace(/^['"`]+|['"`]+$/g, "");
}

function escalationTarget(text: string): string {
  const t = (text || "").toLowerCase();
  if (t.includes("command center")) return "Command center";
  if (t.includes("clinical informatics")) return "Clinical informatics";
  if (t.includes("him")) return "HIM";
  if (t.includes("or charge") || t.includes("or scheduling")) return "OR charge";
  if (t.includes("access")) return "Access support";
  if (t.includes("device")) return "Device support";
  if (t.includes("billing") || t.includes("registration")) return "Registration or billing owner";
  if (t.includes("template") || t.includes("build")) return "Template/build owner";
  if (t.includes("charge nurse") || t.includes("floor lead") || t.includes("unit lead")) return "Charge nurse";
  return "Charge nurse or command center";
}

function visualForAnswer(answer: AskAnswer): CompactVisual | null {
  const anyAnswer = answer as AskAnswer & { visual_url?: string; visualUrl?: string; visual_callouts?: string[] };
  const url = anyAnswer.visual_url ?? anyAnswer.visualUrl;
  if (url) return { url, title: answer.title, callouts: anyAnswer.visual_callouts };
  const screenshot = answer.visualAids.find(aid => aid.kind === "screenshot" && aid.href && !aid.href.startsWith("/videos"));
  if (!screenshot?.href) return null;
  return { url: screenshot.href, title: screenshot.title, callouts: screenshot.callouts };
}

function VisualHero({ visual }: { visual: CompactVisual }) {
  return (
    <div className="relative bg-secondary/40 border-b border-border">
      <img src={visual.url} alt={visual.title} className="w-full max-h-[280px] object-contain" loading="lazy" />
      {visual.callouts?.length ? (
        <div className="absolute left-3 right-3 bottom-3 rounded-xl bg-card/95 backdrop-blur border border-border p-2 shadow-soft">
          <div className="grid gap-1">
            {visual.callouts.slice(0, 4).map((callout, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-foreground/85">
                <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">{i + 1}</span>
                <span className="line-clamp-1">{callout.replace(/^\d+\s*-\s*/, "")}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// --- Feedback + telemetry ---------------------------------------------------

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
  } catch { /* best-effort */ }
  void postJsonSilently("/api/content-gaps/log", { answer_id: id, gap: "visual" });
}

async function postJsonSilently(url: string, body: unknown) {
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch { /* preview builds may not have endpoints */ }
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
      } catch { /* best-effort */ }
    }
    void postJsonSilently("/api/feedback", {
      question: query, answer_id: answerId(answer),
      rating: kind === "up" ? "helpful" : "not_helpful", note: noteText,
    });
    toast.success(kind === "up" ? "Marked helpful" : "Feedback sent");
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-medium">Was this what you needed?</div>
        <div className="flex gap-2">
          <button
            onClick={() => submit("up")} aria-pressed={vote === "up"}
            className={`h-10 min-w-12 px-3 rounded-xl border text-sm font-medium transition ${vote === "up" ? "bg-success/15 text-success border-success/30" : "bg-card border-border hover:bg-secondary"}`}
          >👍</button>
          <button
            onClick={() => setVote("down")} aria-pressed={vote === "down"}
            className={`h-10 min-w-12 px-3 rounded-xl border text-sm font-medium transition ${vote === "down" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-card border-border hover:bg-secondary"}`}
          >👎</button>
        </div>
      </div>
      {vote === "down" && (
        <form onSubmit={e => { e.preventDefault(); submit("down", note.trim()); setNote(""); }} className="mt-3 flex gap-2">
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="What was missing?"
            className="min-w-0 flex-1 h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35" />
          <button type="submit" className="h-10 px-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Send</button>
        </form>
      )}
    </div>
  );
}
