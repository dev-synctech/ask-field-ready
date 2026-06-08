import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Sparkles, BookOpen, ListChecks, Film, ClipboardCheck,
  NotebookPen, Copy, Bookmark, Loader2, Clock, X, ShieldCheck,
  ThumbsUp, ThumbsDown, MessageSquarePlus, FileQuestion, CheckCircle2, AlertTriangle,
  ImageIcon, MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";
import {
  askLaunch,
  STARTER_QUESTIONS,
  badgeForLaunchType,
  type AskAction,
  type AskAnswer,
  type MatchQuality,
  type VendorFamily,
} from "@/lib/launch-library";
import { ASK_SAFETY_LINE } from "@/lib/legal";
import { searchItems, type ContentType, type ContentItem } from "@/lib/demo-data";
import { supabase } from "@/integrations/supabase/client";
import { learnerWorkflowsForAsk } from "@/lib/visual-mode";
import { RealisticEHRVisual, hasRealisticVisual } from "@/components/realistic-ehr-visual";

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

type KnownVendor = Exclude<VendorFamily, "unknown">;
type KnownAction = Exclude<AskAction, "unknown">;

type ParsedSlots = {
  vendor_family: VendorFamily;
  action: AskAction;
};

type ClarifierState = {
  baseQuery: string;
  vendor_family: VendorFamily;
  action: AskAction;
  stage: "vendor" | "action" | "screen";
  turns: number;
};

type NoMatchState = {
  query: string;
  slots: ParsedSlots;
};

type ActionOption = {
  action: KnownAction;
  label: string;
  query: string;
};

const VENDOR_OPTIONS: { value: VendorFamily; label: string; disabled?: boolean }[] = [
  { value: "epic", label: "Epic" },
  { value: "cerner", label: "Cerner (coming soon)", disabled: true },
  { value: "oracle_health", label: "Oracle Health (coming soon)", disabled: true },
  { value: "unknown", label: "Not sure" },
];

const SCREEN_CLUE_OPTIONS: { label: string; vendor: KnownVendor }[] = [
  { label: "Hyperspace / Storyboard", vendor: "epic" },
];

const ASK_TRADEMARK_LINE =
  "Epic and EpicCare are registered trademarks of Epic Systems Corporation. Oracle Health and Cerner are trademarks of Oracle Corporation. MEDITECH is a registered trademark of Medical Information Technology, Inc. Mizly is an independent product not affiliated with or endorsed by these vendors.";

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
  const [clarifier, setClarifier] = useState<ClarifierState | null>(null);
  const [noMatch, setNoMatch] = useState<NoMatchState | null>(null);
  const r: AskAnswer | null = useMemo(
    () => (submitted.trim().length >= 2 && !clarifier && !noMatch ? askLaunch(submitted) : null),
    [submitted, clarifier, noMatch],
  );
  const isNoMatchAnswer = Boolean(r && r.matchQuality === "general");
  const hasAnswer = Boolean((r || noMatch) && !loading && !clarifier);

  useEffect(() => { setRecent(readList(RECENT_KEY)); }, []);

  const rememberRecent = (t: string) => {
    const next = [t, ...recent.filter(x => x.toLowerCase() !== t.toLowerCase())];
    setRecent(next); writeList(RECENT_KEY, next);
  };

  const showAnswer = (query: string) => {
    setSubmitted(query);
    setClarifier(null);
    setNoMatch(null);
    setQ(query);
  };

  const run = (query: string, forceAnswer = false) => {
    const t = query.trim(); if (t.length < 2) return;
    setQ(t); setLoading(true);
    setTimeout(() => {
      const decision = forceAnswer ? { mode: "answer" as const } : decideAskMode(t);
      setLoading(false);
      rememberRecent(t);
      if (decision.mode === "clarifier") {
        setSubmitted(t);
        setClarifier(decision.state);
        setNoMatch(null);
        return;
      }
      if (decision.mode === "no-match") {
        setSubmitted("");
        setClarifier(null);
        setNoMatch({ query: t, slots: decision.slots });
        return;
      }
      showAnswer(t);
    }, 350);
  };

  const chooseVendor = (vendor: VendorFamily) => {
    if (!clarifier) return;
    if (vendor === "unknown") {
      if (clarifier.stage === "screen" || clarifier.turns >= 1) {
        setClarifier(null);
        setSubmitted("");
        setNoMatch({ query: clarifier.baseQuery, slots: { vendor_family: "unknown", action: clarifier.action } });
        return;
      }
      setClarifier({ ...clarifier, stage: "screen", turns: clarifier.turns + 1 });
      return;
    }

    const nextTurns = clarifier.turns + 1;
    const slots = { vendor_family: vendor, action: clarifier.action };
    if (slots.action !== "unknown") {
      showAnswer(enrichedQuery(clarifier.baseQuery, slots));
      return;
    }

    const actions = actionOptionsFor(clarifier.baseQuery);
    if (actions.length && nextTurns < 2) {
      setClarifier({ ...clarifier, vendor_family: vendor, stage: "action", turns: nextTurns });
      return;
    }

    setClarifier(null);
    setSubmitted("");
    setNoMatch({ query: clarifier.baseQuery, slots });
  };

  const chooseScreenVendor = (vendor: KnownVendor) => {
    if (!clarifier) return;
    chooseVendor(vendor);
  };

  const chooseAction = (option: ActionOption) => {
    if (!clarifier) return;
    const slots = { vendor_family: clarifier.vendor_family, action: option.action };
    showAnswer(enrichedQuery(option.query, slots));
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
            className="press absolute right-1 top-1/2 -translate-y-1/2 h-11 min-w-[72px] px-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium disabled:opacity-40 inline-flex items-center justify-center gap-1.5 shadow-soft">
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Ask"}
          </button>

        </div>
      </form>

      {!r && !loading && !clarifier && !noMatch && (
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

      {clarifier && !loading && (
        <ClarifierThread
          state={clarifier}
          query={submitted}
          onVendor={chooseVendor}
          onScreenVendor={chooseScreenVendor}
          onAction={chooseAction}
        />
      )}

      {noMatch && !loading && !clarifier && (
        <NoMatchView query={noMatch.query} slots={noMatch.slots} />
      )}

      {r && !loading && !clarifier && !isNoMatchAnswer && (
        <AnswerView answer={r} query={submitted} />
      )}

      {r && !loading && !clarifier && isNoMatchAnswer && (
        <NoMatchView query={submitted} slots={parseSlots(submitted)} />
      )}
    </div>
  );
}

type CompactVisual = {
  url: string;
  title: string;
  callouts?: string[];
};

function decideAskMode(query: string):
  | { mode: "answer" }
  | { mode: "clarifier"; state: ClarifierState }
  | { mode: "no-match"; slots: ParsedSlots } {
  const slots = parseSlots(query);
  if (hasSpecificPatternHit(query, slots)) return { mode: "answer" };

  // Phase A1: try direct matching first. Only show clarifier when match
  // confidence is genuinely low. askLaunch returns "strong" | "related" | "general".
  // Treat strong AND related as good enough to bypass clarifier (~0.55+ confidence).
  const directAnswer = askLaunch(query);
  if (directAnswer.matchQuality === "strong" || directAnswer.matchQuality === "related") {
    return { mode: "answer" };
  }

  const actionOptions = actionOptionsFor(query);
  if (slots.vendor_family === "unknown" && slots.action === "unknown" && !actionOptions.length) {
    return { mode: "no-match", slots };
  }

  if (shouldGoDirect(query, slots)) return { mode: "answer" };

  if (slots.vendor_family === "unknown" && slots.action === "unknown") {
    return {
      mode: "clarifier",
      state: { baseQuery: query, vendor_family: "unknown", action: "unknown", stage: "vendor", turns: 0 },
    };
  }

  if (slots.vendor_family === "unknown") {
    return {
      mode: "clarifier",
      state: { baseQuery: query, vendor_family: "unknown", action: slots.action, stage: "vendor", turns: 0 },
    };
  }

  if (slots.action === "unknown") {
    if (!actionOptions.length) return { mode: "no-match", slots };
    return {
      mode: "clarifier",
      state: { baseQuery: query, vendor_family: slots.vendor_family, action: "unknown", stage: "action", turns: 0 },
    };
  }

  return { mode: "answer" };
}

function hasSpecificPatternHit(query: string, slots: ParsedSlots) {
  const answer = askLaunch(query);
  const sourceId = answer.sourceEntry?.id ?? "";
  if (answer.matchQuality !== "strong" || !sourceId) return false;

  if (isPack12DirectAskAlias(query, sourceId)) return true;

  const text = query.toLowerCase();
  const tokenCount = text.match(/[a-z0-9]+/g)?.length ?? 0;
  const broadOrderOnly = /\borders?\b/.test(text) && !/\b(sign|cosign|co-sign|place|put|enter|new|modify|discontinue|cancel|diagnosis|indication|unsigned|pending|initiated|favorite|personal list|lispro|drip|mar|medication|procedure|scan|document|chart)\b/.test(text);
  const broadActionOnly = tokenCount <= 3 && /\b(sign|scan|document|schedule|orders?)\b/.test(text) && slots.vendor_family === "unknown";
  if (broadOrderOnly || broadActionOnly) return false;

  const specificSignals = [
    "lispro", "humalog", "drip row", "injection row", "insulin",
    "consent", "media manager", "paper document", "scan document",
    "change context", "change department", "change location", "wrong location context",
    "place an order", "put in an order", "enter an order", "can't place an order",
    "write my note", "where is the note", "where do i write my note",
    "charge capture", "visit charges", "get to charge capture",
    "procedure", "preference list", "case request", "surgeon",
    "wheelchair", "bathroom", "transport", "mobility",
    "treatment plan", "greyed", "grayed",
    "wrong chart", "wrong patient", "wrong encounter", "patient context",
    "patient list", "worklist", "rounding list", "relationship filter",
    "recurring medication", "recurring med", "refill", "renewal",
    "smartphrase", "smart phrase", "smarttext", "smart text",
    "smartlist", "smart list", "smartlink", "smart link",
    "smartset", "smart set", "order set", "powerplan",
    "prearrival", "pre-arrival", "tracking board", "ed board", "launchpoint",
    "ed discharge", "discharge paperwork", "discharge instructions",
    "dynamic documentation", "dyn doc", "note template", "note type",
    "claim attachment", "refresh claim", "resubmit claim", "refresh or resubmit",
    "resubmit this claim", "refresh this claim", "detail bill",
    "detailed bill", "adjustment", "approval queue", "write off",
    "har status", "hospital account status", "dnb edit", "discharged not billed",
    "stop bill", "claim edit", "claim error", "claim errors sidebar",
    "clearinghouse error", "external status code", "claim scrubber", "rapid retest",
    "late charge", "split claim", "guarantor balance", "statement inquiry",
    "payment plan", "self-pay follow-up", "self pay follow up", "bad debt",
    "coverage filing order", "filing order", "term coverage", "delete coverage",
    "account activity", "communication workflow", "billing communication",
    "beaker", "specimen", "accession", "lab label",
    "radiant", "radiology", "imaging", "protocol", "exam status",
    "radiant protocol", "ready for exam", "exam not ready", "modality queue",
    "anesthesia", "crna", "case record", "case event", "anesthesia macro",
    "diagnosis required", "diagnosis needed", "indication required", "link diagnosis",
    "unsigned order", "pending order", "initiated order", "order status",
    "discontinue order", "cancel order", "duplicate order",
    "med rec", "medication reconciliation", "home med", "home meds",
    "allergy alert", "allergy warning", "reaction field", "adverse reaction",
    "result not showing", "results not showing", "acknowledge result", "result acknowledgement",
    "wrong pool", "message pool", "proxy inbox", "delegate inbox", "message routing",
    "provider inbasket", "provider in basket", "inbasket overflowing", "in basket overflowing",
    "message folder filter", "pool view", "proxy view", "delegate view",
    "inbasket result", "in basket result", "refill message", "done button missing",
    "note won't sign", "note wont sign", "required field", "unsigned note",
    "addendum", "signed note", "late entry", "note correction",
    "copy forward", "copy-forward", "copied forward", "refresh note", "stale note data",
    "old assessment in note", "imported data wrong",
    "favorite order", "favorite orders", "personal list", "shortcut missing",
    "provider relationship", "location filter", "date filter", "list refresh",
    "clinical review", "provider clinical review", "inpatient clinical review", "patient summary missing",
    "signout", "sign out", "provider handoff", "team handoff",
    "case status", "periop status", "surgery case", "or case", "case board",
    "surgical workflow", "case not ready", "case readiness", "preop not ready", "procedure readiness",
    "procedure macro", "macro not applying", "macro missing", "macro not firing",
    "smarttools", "smart tools", "placeholder not resolving", "unresolved placeholder",
    "smartlink blank", "smartlist prompt",
    "smartset section", "smartset unchecked", "smartset hidden section", "order missing from smartset",
    "discharge blocked", "cannot discharge", "departure blocked", "patient cannot leave",
    "transfer stuck", "transport task", "patient movement", "receiving unit", "sending unit",
    "workqueue", "work queue", "report filter", "report missing", "wrong count",
    "charge not dropping", "charge did not drop", "charge capture", "charge queue",
    "authorization missing", "auth status", "referral status", "referral not linked",
    "insurance card", "coverage missing", "payer missing", "card image",
    "specimen collection", "collection task", "specimen not received", "recollect",
    "lab label reprint", "specimen label reprint", "wrong printer label", "duplicate label",
    "imaging delay", "exam delayed", "ready for exam", "radiology transport", "patient prep",
    "pharmacy verification", "pending verification", "waiting on pharmacy", "dispense status",
    "barcode mismatch", "med barcode", "bcma mismatch", "barcode alert",
    "therapy note", "therapy eval", "pt note", "ot note", "treatment note",
    "behavioral health", "safety assessment", "risk assessment", "behavioral treatment plan",
    "fetal monitoring", "fetalink", "delivery event", "fetal strip",
    "avs", "after visit summary", "patient instructions", "summary not generating",
    "case management", "discharge planning", "placement status", "facility placement",
    "eprescribe", "e-prescribe", "pharmacy send failed", "prescription not sent",
    "print prescription", "prescription printer", "rx printer", "troy printer", "print rx",
    "appointment not showing", "appointment missing", "schedule missing appointment",
    "slot unavailable", "no slots", "schedule template", "template locked", "overbook",
    "order not available", "order missing", "order search empty", "encounter type order",
    "signed order locked", "change signed order", "modify signed order", "order locked",
    "note area missing", "new note missing", "documentation sidebar", "collapsed sidebar",
    "flowsheet row missing", "wrong time column", "charted wrong time", "collapsed row",
    "med not showing on mar", "mar medication missing", "due med missing", "mar filter",
    "scanned wrong encounter", "document attached wrong encounter", "duplicate scanned document",
    "consent missing", "missing consent", "procedure consent", "signed consent missing",
    "referral not ready", "auth not ready", "authorization not ready", "referral pending review",
    "result routing", "result owner", "result in wrong queue", "can't acknowledge result",
    "workqueue wrong owner", "work queue wrong owner", "assigned wrong owner", "reassign workqueue",
    "scanner not working", "badge reader", "barcode reader", "scanner beeps but nothing",
    "backload", "downtime backload", "system restored", "paper workflow recovery",
    "escalation packet", "command center ticket", "ticket details", "support ticket",
  ];
  if (specificSignals.some(signal => text.includes(signal))) return true;

  return slots.vendor_family !== "unknown" && slots.action !== "unknown" && sourceId !== "ll_order_entry";
}

function isPack12DirectAskAlias(query: string, sourceId: string) {
  const text = query.toLowerCase();
  const directAliases: Record<string, RegExp> = {
    ll_p12r2_missing_activity_or_tab: /\b(provider\s+can(not|'?t)\s+see\s+(the\s+)?activity\s+tab\s+they\s+need|missing\s+(activity|tab|report)|(activity|tab|report)\s+(is\s+)?(missing|gone|hidden|not\s+showing)|can(not|'?t)\s+see\s+(the\s+)?(activity|tab|report))\b/,
    ll_p12r2_wrong_department_context: /\b(user\s+is\s+in\s+the\s+wrong\s+department\s+context|wrong\s+department\s+context|wrong\s+department|wrong\s+login\s+department|wrong\s+location\s+context)\b/,
    ll_p12r2_portal_proxy_access: /\b(proxy\s+can(not|'?t)\s+see\s+(the\s+)?patients?\s+portal\s+information|proxy\s+can(not|'?t)\s+see|caregiver\s+can(not|'?t)\s+see|proxy\s+access|portal\s+proxy)\b/,
    ll_p12r2_portal_scheduling_unavailable: /\b(online\s+scheduling\s+is\s+not\s+showing\s+the\s+visit\s+type|online\s+scheduling.*visit\s+type|visit\s+type.*not\s+showing|visit\s+type\s+(is\s+)?(missing|unavailable)|portal\s+visit\s+type)\b/,
    ll_p12r2_eye_exam_section_missing: /\b(eye\s+exam\s+section\s+is\s+missing|eye\s+exam\s+(section|field|layout)\s+(is\s+)?(missing|gone|hidden|not\s+showing))\b/,
    ll_p12r2_eye_imaging_wrong_view: /\b(image\s+is\s+not\s+showing\s+in\s+the\s+expected\s+eye\s+care\s+view|image\s+(is\s+)?not\s+showing.*(eye\s+care|view)|eye[- ]?care\s+(image|imaging)|expected\s+eye\s+care\s+view|image.*expected.*view)\b/,
  };

  return directAliases[sourceId]?.test(text) ?? false;
}

function parseSlots(query: string): ParsedSlots {
  const text = query.toLowerCase();
  return {
    vendor_family: parseVendor(text),
    action: parseAction(text),
  };
}

function parseVendor(text: string): VendorFamily {
  if (/\b(epic|epiccare|hyperspace|storyboard|smartset|smarttools|wisdom|lumens|rehab|hospital billing|single billing office|hb biller|epic hb|epic sbo|\bhb\b|\bsbo\b)\b/.test(text)) return "epic";
  if (/\b(oracle health)\b/.test(text)) return "oracle_health";
  if (/\b(cerner|powerchart|firstnet|surginet)\b/.test(text)) return "cerner";
  if (/\bmeditech\b/.test(text)) return "meditech";
  if (/\bsunquest\b/.test(text)) return "sunquest";
  if (/\b(philips careevent|careevent)\b/.test(text)) return "philips_careevent";
  return "unknown";
}

function parseAction(text: string): AskAction {
  if (/\b(scan|scanning|media manager|upload document|paper consent|consent|scanned wrong encounter|wrong encounter scan)\b/.test(text)) return "scan";
  if (/\b(co-?sign|cosign|attestation|attest|verbal order)\b/.test(text)) return "cosign";
  if (/\b(sign|signature|cannot sign|can't sign|wont sign|won't sign)\b/.test(text)) return "sign";
  if (/\b(discontinue|delete|remove|drop off|greyed out|grayed out|cancel order|duplicate order|stop order|dc order|d\/c order)\b/.test(text)) return "discontinue";
  if (/\b(lispro|humalog|drip row|injection row|wrong row|wrong flowsheet|modify|edit|change|correction|corrected|addendum|amend|late entry|signed note correction|note correction)\b/.test(text)) return "modify";
  if (/\b(smartset|smart set|order set|orderset|powerplan|place order|place an order|favorite orders|favorite order|diagnosis required|diagnosis needed|indication required|associate diagnosis|link diagnosis|order missing|order not available|order search empty)\b/.test(text)) return "place";
  if (/\b(schedule|scheduling|book|booking|appointment|case request|procedure code|preference list|doctor codes|provider codes|slot|slots|template|overbook|referral scheduling)\b/.test(text)) return "schedule";
  if (/\b(smarttools|smart tools|smarttool|smart tool|smartphrase|smart phrase|smarttext|smart text|smartlist|smart list|smartlink|smart link|placeholder|prompt|copy forward|copy-forward|copied forward|refresh note|note template|note type|dynamic documentation|dyn doc|ed discharge|discharge paperwork|discharge instructions|handoff|signout|sign out|therapy note|therapy eval|pt note|ot note|behavioral health note|safety assessment|fetal monitoring|fetalink|delivery event|anesthesia|crna|macro|case record|procedure macro|procedure template)\b/.test(text)) return "document";
  if (/\b(document|chart|flowsheet|flow sheet|adl|mobility|ambulat|wheelchair|note|wrong time column|collapsed row|backload|back loading|downtime backload)\b/.test(text)) return "document";
  if (/\b(place new|new order|place order|place an order|put in order|put in an order|enter order|enter an order|order entry|order composer)\b/.test(text)) return "place";
  if (/\b(route|routing|queue|in basket|inbasket|message|wrong pool|pool message|proxy inbox|delegate inbox|pool view|proxy view|delegate view|refill message|result message|follow up message|follow-up message)\b/.test(text)) return "route";
  if (/\b(reconcile|reconciliation|med rec|home med|home meds|medication history)\b/.test(text)) return "reconcile";
  if (/\b(patient list|worklist|workqueue|work queue|report|reports|clinical review|chart review|patient summary|wrong chart|wrong patient|wrong encounter|patient context|recurring medication|recurring med|refill|renewal|billing|hospital billing|revenue cycle|claim attachment|refresh claim|resubmit claim|refresh or resubmit|detail bill|detailed bill|adjustment|approval queue|charge|claim edit|claim error|clearinghouse|external status|late charge|split claim|har status|dnb|discharged not billed|stop bill|account status|guarantor|statement inquiry|payment plan|self-pay|self pay|bad debt|filing order|term coverage|delete coverage|account activity|billing communication|authorization|auth status|auth not ready|referral|coverage|insurance|payer|beaker|specimen|accession|lab label|radiant|radiology|imaging|protocol|exam status|ready for exam|modality queue|prearrival|pre-arrival|tracking board|launchpoint|allergy|reaction|result|results|pharmacy verification|barcode|badge reader|scanner not working|case status|periop status|surgery case|surgical workflow|case readiness|case not ready|transport|transfer|patient movement|bed assignment|discharge blocked|cannot discharge|departure blocked|case management|discharge planning|placement status|eprescribe|e-prescribe|prescription|print prescription|rx printer|prescription printer|escalation packet|command center ticket|support ticket)\b/.test(text)) return "review";
  if (/\b(review|verify|check)\b/.test(text)) return "review";
  return "unknown";
}

function shouldGoDirect(query: string, slots: ParsedSlots) {
  const text = query.toLowerCase();
  if (slots.vendor_family !== "unknown" && slots.action !== "unknown") return true;
  if (slots.action === "scan" && /\b(consent|chart|media manager|document|scan)\b/.test(text)) return true;
  if (slots.action === "schedule" && /\b(procedure|preference|case request|codes?|appointment|slot|template|overbook|referral)\b/.test(text)) return true;
  if (slots.action === "modify" && /\b(lispro|drip row|wrong row|insulin|change context|department|location)\b/.test(text)) return true;
  if (slots.action === "sign" && /\b(order|note|required field|unsigned|pending|initiated)\b/.test(text)) return true;
  if (slots.action === "place" && /\b(diagnosis|indication|favorite|order|smartset|powerplan)\b/.test(text)) return true;
  if (slots.action === "discontinue" && /\b(order|duplicate|cancel|stop|remove)\b/.test(text)) return true;
  if (slots.action === "reconcile" && /\b(home med|home meds|med rec|medication)\b/.test(text)) return true;
  if (slots.action === "route" && /\b(in basket|inbasket|message|pool|proxy|delegate|result message|refill message|follow up message|follow-up message)\b/.test(text)) return true;
  if (slots.action === "document" && /\b(note|documentation|document|template|required field|therapy|behavioral health|safety assessment|fetal|fetalink|delivery event|flowsheet|flow sheet|time column|backload|downtime|smarttools|smart tools|placeholder|prompt|copy forward|copy-forward|refresh note|macro)\b/.test(text)) return true;
  if (slots.action === "review" && /\b(result|allergy|reaction|case status|transport|transfer|discharge|bed assignment|patient movement|workqueue|work queue|report|clinical review|patient summary|billing|hospital billing|revenue|claim|account|guarantor|statement|payment plan|self-pay|self pay|dnb|har status|stop bill|clearinghouse|late charge|split claim|filing order|term coverage|delete coverage|charge|authorization|auth|referral|coverage|insurance|specimen|lab label|radiology|imaging|radiant|ready for exam|modality queue|pharmacy verification|barcode|scanner|badge reader|case management|placement|surgical workflow|case readiness|case not ready|eprescribe|prescription|print prescription|rx printer|prescription printer|escalation|command center|ticket)\b/.test(text)) return true;
  return false;
}

function actionOptionsFor(query: string): ActionOption[] {
  const text = query.toLowerCase();
  if (/\b(order|orders|order entry)\b/.test(text)) {
    return [
      { action: "place", label: "Place new", query: "Where do I put in an order and what order entry context matters?" },
      { action: "sign", label: "Sign / cosign", query: "The provider cannot sign an order. What do I check first?" },
      { action: "modify", label: "Modify existing", query: "An order is not showing or not populating. What do I check first?" },
      { action: "discontinue", label: "Discontinue", query: "How do I handle an order that needs to be discontinued or removed?" },
    ];
  }
  if (/\b(provider|resident|fellow|inpatient provider|provider workflow|provider efficiency)\b/.test(text)) {
    return [
      { action: "place", label: "Orders", query: "Provider cannot find or sign an order. What do I check first?" },
      { action: "document", label: "Notes", query: "Provider note copy forward or SmartTool prompt looks wrong. What do I check first?" },
      { action: "route", label: "In Basket", query: "Provider In Basket is overloaded or filtered wrong. What do I check first?" },
      { action: "review", label: "Clinical review", query: "Inpatient clinical review data is hidden or incomplete. What do I check first?" },
    ];
  }
  if (/\b(schedule|scheduling|cadence|appointment|booking|procedure|codes?)\b/.test(text)) {
    return [
      { action: "schedule", label: "Book procedure", query: "Procedure scheduling codes are not pulling in for the provider." },
      { action: "modify", label: "Change columns", query: "How do I change columns in the schedule line?" },
      { action: "review", label: "Review appointment", query: "An appointment is not showing on the schedule. What do I check first?" },
    ];
  }
  if (/\b(billing|hospital billing|revenue|claim|claims|account|guarantor|sbo|self-pay|self pay|payment|coverage|insurance)\b/.test(text)) {
    return [
      { action: "review", label: "Account / DNB", query: "Hospital account is DNB or billing status is unclear. What do I check first?" },
      { action: "review", label: "Claim edits", query: "Claim edit is in a workqueue and I am not sure who owns it." },
      { action: "review", label: "Charge / late charge", query: "Late charge or split claim is holding billing. What do I check first?" },
      { action: "review", label: "Guarantor / payment", query: "Guarantor has a balance or payment plan question. What do I check first?" },
    ];
  }
  if (/\b(document|documentation|flowsheet|flow sheet|note|scan|mobility|ambulat|wheelchair)\b/.test(text)) {
    return [
      { action: "document", label: "Document", query: "A flowsheet row or option is missing. What category should I use?" },
      { action: "scan", label: "Scan document", query: "How do I scan a document and attach it to the correct encounter?" },
      { action: "sign", label: "Sign note", query: "A note will not save or sign. What should I do first?" },
      { action: "modify", label: "Correct mismatch", query: "A medication appears in the wrong flowsheet row." },
    ];
  }
  return [];
}

function enrichedQuery(query: string, slots: ParsedSlots) {
  const vendor = vendorLabel(slots.vendor_family);
  const action = slots.action === "unknown" ? "" : ` ${slots.action}`;
  return slots.vendor_family === "unknown" ? query : `${vendor}${action}: ${query}`;
}

function vendorLabel(vendor: VendorFamily) {
  switch (vendor) {
    case "epic": return "Epic";
    case "cerner": return "Cerner";
    case "oracle_health": return "Oracle Health";
    case "meditech": return "MEDITECH";
    case "sunquest": return "Sunquest";
    case "philips_careevent": return "Philips CareEvent";
    default: return "Mizly";
  }
}

function ClarifierThread({
  state,
  query,
  onVendor,
  onScreenVendor,
  onAction,
}: {
  state: ClarifierState;
  query: string;
  onVendor: (vendor: VendorFamily) => void;
  onScreenVendor: (vendor: KnownVendor) => void;
  onAction: (option: ActionOption) => void;
}) {
  const actions = actionOptionsFor(state.baseQuery);
  const question = state.stage === "vendor"
    ? "Quick check - which system are you in?"
    : state.stage === "screen"
    ? "No problem - what does the top of your screen say?"
    : "Got it. What are you trying to do?";

  return (
    <div className="mt-3 md:mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-[1.4rem] border border-border bg-card shadow-card overflow-hidden">
        <div className="p-4 md:p-5 space-y-4">
          <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-border bg-secondary/45 px-3.5 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">You</div>
            <p className="mt-1 text-sm font-medium text-foreground">{query}</p>
          </div>

          <div className="ml-auto max-w-[86%] rounded-2xl rounded-br-md border border-primary/15 bg-primary-soft/50 px-3.5 py-3">
            <div className="text-[10px] uppercase tracking-wider text-primary font-medium">Mizly</div>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-foreground">{question}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {state.stage === "vendor" && VENDOR_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => !option.disabled && onVendor(option.value)}
                className={`press min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${option.disabled ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-70" : "border-border bg-surface-elevated hover:border-primary/35 hover:bg-primary-soft/45 hover:shadow-soft"}`}
              >
                {option.label}
              </button>
            ))}
            {state.stage === "screen" && SCREEN_CLUE_OPTIONS.map(option => (
              <button
                key={option.label}
                type="button"
                onClick={() => onScreenVendor(option.vendor)}
                className="press min-h-11 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium hover:border-primary/35 hover:bg-primary-soft/45 hover:shadow-soft transition"
              >
                {option.label}
              </button>
            ))}
            {state.stage === "screen" && (
              <button
                type="button"
                onClick={() => onVendor("unknown")}
                className="press min-h-11 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium hover:border-primary/35 hover:bg-primary-soft/45 hover:shadow-soft transition"
              >
                Still not sure
              </button>
            )}
            {state.stage === "action" && actions.map(option => (
              <button
                key={option.label}
                type="button"
                onClick={() => onAction(option)}
                className="press min-h-11 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium hover:border-primary/35 hover:bg-primary-soft/45 hover:shadow-soft transition"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnswerView({ answer, query }: { answer: AskAnswer; query: string }) {
  const compact = compactAnswer(answer);
  const visual = visualForAnswer(answer);
  const [mode, setMode] = useState<"answer" | "say" | "escalate">("answer");

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
                  const text = `${query}\n\nWhat it is: ${compact.whatItIs}\n\nFirst 90 seconds:\n${compact.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nCheck this:\n${compact.checkThis.map(s => `- ${s}`).join("\n")}\n\nSay this: \"${compact.sayThis}\"\n\nWhat should happen next: ${compact.ifWorks}\n\nIf you don't see it: ${compact.ifNot}\nEscalate to: ${compact.escalationTarget}`;
                  try {
                    await navigator.clipboard?.writeText(text);
                    toast.success("Answer copied");
                  } catch {
                    toast.error("Copy blocked by browser", {
                      description: "Select the answer text and copy manually.",
                    });
                  }
                }}
                className="h-11 md:h-9 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-xs inline-flex items-center gap-1.5"
              >
                <Copy className="size-3.5" /> Copy
              </button>
              <button
                onClick={() => {
                  const saved = readList(SAVED_KEY);
                  writeList(SAVED_KEY, [query, ...saved.filter(x => x !== query)]);
                  toast.success("Answer saved", { description: "Available in this browser." });
                }}
                className="h-11 md:h-9 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-xs inline-flex items-center gap-1.5"
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

          {answer.sourceEntry?.nav_trail && (
            <section>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">NAVIGATION TRAIL</div>
              <div className="text-[11px] leading-relaxed text-muted-foreground break-words [overflow-wrap:anywhere]">
                {answer.sourceEntry.nav_trail}
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
                  <StepLine text={step} />
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-xl bg-card border border-border px-3 py-2.5 text-sm">
              <span className="font-semibold text-foreground">Say this: </span>
              <span className="text-foreground/85">"{compact.sayThis}"</span>
            </div>
            <div className="mt-2 rounded-xl bg-card/70 border border-border px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Check: </span>
              {compact.checkThis.join(" | ")}
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">IF IT WORKS / IF IT DOESN'T</div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-success/25 bg-success/5 p-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                  <CheckCircle2 className="size-4" /> What should happen
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{compact.ifWorks}</p>
              </div>
              <div className="rounded-2xl border border-warning/35 bg-warning/10 p-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                  <AlertTriangle className="size-4" /> If you don't see it
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{compact.ifNot}</p>
                <div className="mt-2 inline-flex items-center rounded-full bg-card border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
                  Escalate to: {compact.escalationTarget}
                </div>
              </div>
            </div>
          </section>

          <MizlyClipChip answer={answer} />

          <section>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">MORE HELP</div>
            <MoreHelpChips answer={answer} />
          </section>

          <CompactFeedbackBar query={query} answer={answer} />

          <p className="text-[11px] leading-relaxed text-muted-foreground border-t border-border pt-3">
            {ASK_TRADEMARK_LINE}{" "}
            <Link to="/legal" className="underline hover:text-foreground">Trademark &amp; legal notice</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function MizlyClipChip({ answer }: { answer: AskAnswer }) {
  const clip = answer.related.videos.find(v => !!v.learner_video_url);
  if (!clip) return null;
  return (
    <section>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">MIZLY WALKTHROUGH VIDEO</div>
      <Link
        to="/videos"
        search={{ item: clip.id }}
        className="group flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary-soft/40 hover:bg-primary-soft/60 hover:border-primary/40 px-4 py-3 transition shadow-soft"
      >
        <span className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <PlayCircleIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] uppercase tracking-wider text-primary font-semibold">Watch · {clip.estimated_minutes ? `${clip.estimated_minutes} min` : "short clip"}</span>
          <span className="mt-0.5 block text-sm font-semibold text-foreground truncate">{clip.title}</span>
          {clip.related_topic && (
            <span className="mt-0.5 block text-[11px] text-muted-foreground truncate">{clip.related_topic}</span>
          )}
        </span>
        <span className="text-xs font-medium text-primary group-hover:underline shrink-0">Watch</span>
      </Link>
    </section>
  );
}

function PlayCircleIcon() {
  // small inline play glyph; reuses lucide PlayCircle imported at top
  return <Film className="size-5" />;
}



function compactAnswer(answer: AskAnswer) {
  const guide = answer.liveGuide;
  const steps = [
    `Do this first - ${guide.doThisFirst}`,
    `Where to look - ${guide.whereToLook}`,
    `What to click - ${guide.whatToClick}`,
  ].map(step => limitWords(cleanStep(step), 30));
  const safetyFail = answer.ifThatFails.find(step => /do not delete a signed entry/i.test(step));
  const ifNot = safetyFail
    ? "If correction is blocked, escalate; do not delete a signed entry on your own."
    : limitWords(firstSentence(guide.ifYouDontSeeIt), 34);

  return {
    whatItIs: compactSentence(answer.shortAnswer || answer.title, 20),
    steps,
    checkThis: guide.checkThis.map(item => limitWords(cleanStep(item), 14)).slice(0, 3),
    sayThis: limitWords(stripOuterQuotes(guide.whatToSay || answer.whatToSay[0] || "I'll stay with you until this is stable."), 24),
    ifWorks: limitWords(firstSentence(guide.whatShouldHappen), 30),
    ifNot,
    escalationTarget: escalationTarget(answer.whenToEscalate),
  };
}

function StepLine({ text }: { text: string }) {
  const parts = text.split(/\s+-\s+/);
  if (parts.length < 2) return <span className="pt-0.5">{text}</span>;
  return (
    <span className="pt-0.5">
      <strong className="font-semibold text-foreground">{parts[0]}</strong>
      <span className="text-muted-foreground"> - </span>
      <span>{parts.slice(1).join(" - ")}</span>
    </span>
  );
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
  const url = anyAnswer.visual_url ?? anyAnswer.visualUrl ?? answer.sourceEntry?.visual_url;
  if (url) {
    return {
      url,
      title: answer.title,
      callouts: anyAnswer.visual_callouts ?? answer.sourceEntry?.visual_callouts,
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
  const groups = relatedGroupsFor(answer);
  const vendor = answer.sourceEntry?.vendor_family ?? "unknown";

  if (!groups.length) return null;

  return <MoreHelpGroups groups={groups} vendor={vendor} answerId={answerId(answer)} />;
}

function MoreHelpGroups({
  groups,
  vendor,
  answerId,
}: {
  groups: { type: ContentType; items: ContentItem[] }[];
  vendor: VendorFamily;
  answerId: string;
}) {
  useEffect(() => {
    const itemIds = groups.flatMap(group => group.items.map(item => item.id));
    if (!itemIds.length) return;
    void postJsonSilently("/api/related-impression", { answer_id: answerId, item_ids: itemIds });
  }, [answerId, groups]);

  return (
    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
      {groups.map(group => {
        const meta = TYPE_META[group.type];
        const Icon = meta.icon;
        return (
          <div key={group.type}>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
              <Icon className="size-3" /> {meta.label}s
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.items.map(item => {
                const lk = linkForType(item.content_type, item.id);
                return (
                  <Link
                    key={`${item.content_type}:${item.id}`}
                    to={lk.to}
                    params={lk.params}
                    search={lk.search}
                    onClick={() => void postJsonSilently("/api/related-click", { answer_id: answerId, item_id: item.id, type: item.content_type })}
                    className="min-h-11 rounded-xl border border-border bg-surface-elevated px-3 py-2 hover:border-primary/35 hover:bg-primary-soft/45 transition group"
                  >
                    <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium rounded-full px-2 py-0.5 ${meta.cls}`}>
                      <Icon className="size-3" /> {meta.label}
                    </div>
                    <span className="ml-1 inline-flex rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {vendorLabel(vendor)}
                    </span>
                    <div className="mt-1 text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
                      {item.title}
                    </div>
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

function relatedGroupsFor(answer: AskAnswer): { type: ContentType; items: ContentItem[] }[] {
  const byType: { type: ContentType; items: ContentItem[] }[] = [
    { type: "playbook", items: answer.related.playbooks },
    { type: "checklist", items: answer.related.checklists },
    { type: "video", items: answer.related.videos },
    { type: "lesson", items: answer.related.lessons },
    { type: "scenario", items: answer.related.scenarios },
  ];
  const seen = new Set<string>();
  return byType
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        const key = `${item.content_type}:${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 5),
    }))
    .filter(group => group.items.length > 0);
}

function NoMatchView({ query, slots }: { query: string; slots: ParsedSlots }) {
  const groups = fallbackGroupsFor(query);

  return (
    <div className="mt-3 md:mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-[1.4rem] border border-border bg-card shadow-card p-4 md:p-5">
        {groups.length ? (
          <>
            <p className="text-sm text-muted-foreground mb-3">Closest materials we have:</p>
            <MoreHelpGroups groups={groups} vendor={slots.vendor_family} answerId={`no_match_${query.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Try rephrasing - mention the system (Epic, Cerner) and what you're trying to do.
          </p>
        )}
      </div>
    </div>
  );
}

function fallbackGroupsFor(query: string): { type: ContentType; items: ContentItem[] }[] {
  const text = query.toLowerCase();
  let items = searchItems(query).slice(0, 15);
  if (!items.length && /\b(glucometer|glucose|calibration|meter)\b/.test(text)) {
    items = searchItems("medication results safety").slice(0, 15);
  }

  const byType: { type: ContentType; items: ContentItem[] }[] = [
    { type: "playbook", items: items.filter(item => item.content_type === "playbook") },
    { type: "checklist", items: items.filter(item => item.content_type === "checklist") },
    { type: "video", items: items.filter(item => item.content_type === "video") },
    { type: "lesson", items: items.filter(item => item.content_type === "lesson") },
    { type: "scenario", items: items.filter(item => item.content_type === "scenario") },
  ];

  const seen = new Set<string>();
  return byType
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        const key = `${item.content_type}:${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 5),
    }))
    .filter(group => group.items.length > 0);
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
        prev.push({ q: query, answer_id: answerId(answer), answer_title: answer.title, kind, note: noteText, ts: Date.now() });
        localStorage.setItem(key, JSON.stringify(prev.slice(-80)));
      } catch {
        // Local feedback is best-effort.
      }
    }
    // Persist to Lovable Cloud so admin/feedback can read it.
    void supabase.from("ask_feedback").insert({
      question: query,
      answer_id: answerId(answer),
      answer_title: answer.title,
      rating: kind === "up" ? "helpful" : "not_helpful",
      note: noteText || null,
    }).then(({ error }) => { if (error) console.warn("ask_feedback insert failed", error.message); });
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

  // Public learner mode only: live, redrawn Mizly walkthrough visuals.
  const askId = answer.sourceEntry?.id;
  const learnerWorkflow = askId
    ? learnerWorkflowsForAsk(askId).find((w) => hasRealisticVisual(w.realistic_visual_key))
    : undefined;

  const realisticVisualBlock = learnerWorkflow ? (
    <figure className="rounded-xl border border-border bg-card p-3">
      <figcaption className="mb-2 flex items-center justify-between gap-2">
        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Mizly walkthrough visual
        </span>
        <span className="text-[10px] text-muted-foreground">{learnerWorkflow.workflow_title}</span>
      </figcaption>
      <RealisticEHRVisual visualKey={learnerWorkflow.realistic_visual_key as never} />
    </figure>
  ) : null;

  if (!answer.visualAids.length) {
    const topGap = answer.kbSupport.gaps[0];
    return (
      <Section title="VISUAL GUIDE">
        <div className="space-y-3">
          {realisticVisualBlock}
          {!realisticVisualBlock && (
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
          )}
        </div>
      </Section>
    );
  }

  return (
    <Section title="VISUAL GUIDE">
      <div className="space-y-3">
        {realisticVisualBlock}
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
              {aid.assetType === "rights_cleared_screenshot" &&
              aid.rightsStatus === "cleared_for_public_training" &&
              aid.imageHref ? (
                <figure className="mt-3">
                  <img
                    src={aid.imageHref}
                    alt={aid.title}
                    loading="lazy"
                    className="w-full rounded-lg border border-border"
                  />
                  <figcaption className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {aid.footerDisclaimer ??
                      "For explanatory purposes only. Mizly is not affiliated with, endorsed by, or certified by any healthcare software vendor."}
                  </figcaption>
                </figure>
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

function linkForType(type: string, id: string): { to: any; params?: any; search?: any } {
  switch (type) {
    case "lesson": return { to: "/lessons/$id", params: { id } };
    case "playbook": return { to: "/playbooks/$id", params: { id } };
    case "scenario": return { to: "/scenarios/$id", params: { id } };
    case "video": return { to: "/videos", search: { item: id } };
    case "checklist": return { to: "/checklists", search: { item: id } };
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
            <Link key={it.id} to={lk.to} params={lk.params} search={lk.search}
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
