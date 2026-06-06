import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, ThumbsDown, ThumbsUp, FileQuestion, Sparkles, Filter } from "lucide-react";
import { Header } from "./_authenticated.learn";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin_/feedback")({
  head: () => ({ meta: [{ title: "Ask Feedback Inbox — Mizly Admin" }] }),
  component: FeedbackPage,
});

type FeedbackKind = "helpful" | "not_helpful" | "missing" | "request_playbook";
type Status = "new" | "triaged" | "resolved" | "dismissed";

interface FeedbackItem {
  id: string;
  kind: FeedbackKind;
  question: string;
  note?: string;
  matchedTitle?: string;
  createdAt: string;
  status: Status;
}

// Mock feedback — vendor-neutral, no PHI.
const SEED: FeedbackItem[] = [
  { id: "f1", kind: "request_playbook", question: "How do I handle a printer queue jam during admission?", note: "Saw this twice last week; no clear playbook.", createdAt: "2026-06-02", status: "new" },
  { id: "f2", kind: "missing", question: "What if a clinician refuses the workaround?", matchedTitle: "Bedside assist with a hesitant clinician", note: "Needs a de-escalation script.", createdAt: "2026-06-02", status: "new" },
  { id: "f3", kind: "not_helpful", question: "A user cannot print a wristband. What should I check?", matchedTitle: "Patient identification mismatch at registration", note: "Answer skipped the printer-side checks.", createdAt: "2026-06-01", status: "triaged" },
  { id: "f4", kind: "helpful", question: "Registration is down. What do I do first?", matchedTitle: "Registration downtime — first 15 minutes", createdAt: "2026-06-01", status: "resolved" },
  { id: "f5", kind: "missing", question: "How do I escalate when the floor lead is unreachable?", note: "Need a backup escalation path.", createdAt: "2026-05-31", status: "new" },
  { id: "f6", kind: "request_playbook", question: "First shift of a multi-site go-live — what changes?", createdAt: "2026-05-31", status: "new" },
  { id: "f7", kind: "helpful", question: "What should I carry before my first go-live shift?", matchedTitle: "What to carry on your first shift", createdAt: "2026-05-30", status: "resolved" },
  { id: "f8", kind: "not_helpful", question: "A provider is frustrated and says the system is broken.", matchedTitle: "Three words that defuse a frustrated clinician", note: "Needs a longer script.", createdAt: "2026-05-30", status: "triaged" },
  { id: "f9", kind: "missing", question: "Two consultants giving different answers — what now?", matchedTitle: "Two consultants give a unit different answers", createdAt: "2026-05-29", status: "new" },
  { id: "f10", kind: "request_playbook", question: "Recovery batch order when multiple workflows queued.", createdAt: "2026-05-29", status: "triaged" },
];

const KIND_META: Record<FeedbackKind, { label: string; cls: string; icon: typeof ThumbsUp }> = {
  helpful:           { label: "Helpful",           cls: "bg-success/15 text-success",           icon: ThumbsUp },
  not_helpful:       { label: "Not helpful",       cls: "bg-destructive/10 text-destructive",   icon: ThumbsDown },
  missing:           { label: "Missing something", cls: "bg-warning/15 text-warning",           icon: FileQuestion },
  request_playbook:  { label: "Playbook request",  cls: "bg-primary-soft text-primary",         icon: Sparkles },
};

const STATUS_CLS: Record<Status, string> = {
  new:       "bg-primary-soft text-primary",
  triaged:   "bg-warning/15 text-warning",
  resolved:  "bg-success/15 text-success",
  dismissed: "bg-muted text-muted-foreground",
};

function FeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>(SEED);
  const [kindFilter, setKindFilter] = useState<"all" | FeedbackKind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  useEffect(() => {
    const extras: FeedbackItem[] = [];
    // Merge local thumbs feedback (demo / signed-out)
    if (typeof window !== "undefined") {
      try {
        const raw = JSON.parse(localStorage.getItem("ate.ask.feedback") ?? "[]");
        for (const f of raw) {
          extras.push({
            id: `local_${f.ts}`,
            kind: f.kind === "up" ? "helpful" : "not_helpful",
            question: f.q,
            note: f.note || undefined,
            matchedTitle: f.answer_title,
            createdAt: new Date(f.ts).toISOString().slice(0, 10),
            status: "new",
          });
        }
      } catch { /* ignore */ }
    }
    // Pull from Lovable Cloud (admin only — RLS will block otherwise)
    void supabase
      .from("ask_feedback")
      .select("id,question,answer_title,rating,note,status,created_at")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const cloud: FeedbackItem[] = (data ?? []).map((r: any) => ({
          id: r.id,
          kind: r.rating === "helpful" ? "helpful" : "not_helpful",
          question: r.question,
          note: r.note ?? undefined,
          matchedTitle: r.answer_title ?? undefined,
          createdAt: (r.created_at as string).slice(0, 10),
          status: (r.status as Status) ?? "new",
        }));
        const all = [...cloud, ...extras, ...SEED];
        // newest first by createdAt desc
        all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setItems(all);
      });
  }, []);


  const visible = useMemo(() => items.filter(i =>
    (kindFilter === "all" || i.kind === kindFilter) &&
    (statusFilter === "all" || i.status === statusFilter)
  ), [items, kindFilter, statusFilter]);

  const counts = useMemo(() => ({
    total: items.length,
    new: items.filter(i => i.status === "new").length,
    requests: items.filter(i => i.kind === "request_playbook" || i.kind === "missing").length,
    helpful: items.filter(i => i.kind === "helpful").length,
  }), [items]);

  function setStatus(id: string, status: Status) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to Admin
      </Link>
      <Header title="Ask Feedback Inbox" subtitle="What learners said after using Ask, and what the library should cover next." />

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI label="Total" value={counts.total} />
        <KPI label="New" value={counts.new} tone="primary" />
        <KPI label="Content requests" value={counts.requests} tone="warning" />
        <KPI label="Helpful votes" value={counts.helpful} tone="success" />
      </div>

      <div className="mt-6 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center gap-1.5">
          <Filter className="size-3" /> Type
        </span>
        {(["all", "helpful", "not_helpful", "missing", "request_playbook"] as const).map(k => (
          <button key={k} onClick={() => setKindFilter(k)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${kindFilter === k ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-secondary'}`}>
            {k === "all" ? "all" : KIND_META[k].label}
          </button>
        ))}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium ml-3">Status</span>
        {(["all", "new", "triaged", "resolved", "dismissed"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statusFilter === s ? 'bg-foreground text-background border-foreground' : 'bg-card border-border hover:bg-secondary'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 font-display font-semibold flex items-center gap-2">
        <MessageSquare className="size-4 text-primary" /> Feedback ({visible.length})
      </div>

      <div className="mt-2 space-y-2">
        {visible.map(f => {
          const meta = KIND_META[f.kind];
          const Icon = meta.icon;
          return (
            <div key={f.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${meta.cls}`}>
                      <Icon className="size-3" /> {meta.label}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CLS[f.status]}`}>{f.status}</span>
                    <span className="text-[10px] text-muted-foreground">{f.createdAt}</span>
                  </div>
                  <div className="mt-1.5 text-sm font-medium">{f.question}</div>
                  {f.matchedTitle && (
                    <div className="mt-0.5 text-xs text-muted-foreground">Matched: <span className="text-foreground">{f.matchedTitle}</span></div>
                  )}
                  {f.note && (
                    <div className="mt-1.5 text-xs text-foreground/80 rounded-lg bg-secondary/60 px-3 py-2">"{f.note}"</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 w-full min-w-0 max-w-full sm:w-auto sm:shrink-0">
                  {f.status === "new" && (
                    <button onClick={() => setStatus(f.id, "triaged")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">Review</button>
                  )}
                  <button onClick={() => toast.success("Converted to draft in the content editor")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">Convert to draft</button>
                  {f.status !== "resolved" && (
                    <button onClick={() => setStatus(f.id, "resolved")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-success/10 hover:text-success">Mark resolved</button>
                  )}
                  {f.status !== "dismissed" && (
                    <button onClick={() => setStatus(f.id, "dismissed")} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground">Dismiss</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface">
            <div className="font-display font-semibold">No feedback matches</div>
            <div className="text-sm text-muted-foreground mt-1">Try a different filter.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "primary" | "success" | "warning" }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-2xl ${cls}`}>{value}</div>
    </div>
  );
}
