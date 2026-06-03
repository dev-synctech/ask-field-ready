import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck, AlertTriangle, Save, Send, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  getConversion, saveDraft, publishConversion, markNeedsReview,
  EMPTY_CHECKLIST, CHECKLIST_LABELS, allChecklistChecked,
  TYPE_LABEL, RISK_LABEL, RISK_CLS, STATUS_LABEL, STATUS_CLS,
  type ConversionDraft, type SafetyChecklist,
} from "@/lib/conversions-data";
import { itemById } from "@/lib/demo-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/conversions_/$id")({
  head: () => ({ meta: [{ title: "Conversion — Mizly Admin" }] }),
  component: ConversionDetailPage,
});

const DEFAULT_DRAFT: ConversionDraft = {
  mizly_title: "", target_type: "playbook",
  role_tags: "", domain_tags: "", phase_tags: "",
  urgency: 2, escalation: 2, frequency: "",
  short_summary: "", first90: "", what_to_say: "", what_to_check: "",
  when_to_escalate: "", related_content: "", internal_lineage_note: "",
  sanitized_approved: false, checklist: EMPTY_CHECKLIST, status: "draft",
};

function ConversionDetailPage() {
  const { id } = useParams({ from: "/_authenticated/admin_/conversions_/$id" });
  const navigate = useNavigate();
  const source = getConversion(id);
  const [draft, setDraft] = useState<ConversionDraft>(() => source?.draft ?? {
    ...DEFAULT_DRAFT,
    mizly_title: source ? `Mizly: ${source.title}` : "",
    domain_tags: source?.suggested_domain ?? "",
    role_tags: source?.suggested_role ?? "",
    phase_tags: source?.suggested_phase ?? "",
    internal_lineage_note: source ? `Source lineage: ${source.lineage_id}` : "",
  });

  const canPublish = useMemo(
    () => draft.sanitized_approved && allChecklistChecked(draft.checklist),
    [draft],
  );

  if (!source) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/admin/conversions" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to queue
        </Link>
        <h1 className="mt-4 text-2xl font-display font-semibold">Conversion not found</h1>
      </div>
    );
  }

  const setChecklist = (k: keyof SafetyChecklist, v: boolean) =>
    setDraft(d => ({ ...d, checklist: { ...d.checklist, [k]: v } }));

  const onSaveDraft = () => { saveDraft(source.id, draft); toast.success("Draft saved"); };
  const onPublish = () => {
    if (!canPublish) { toast.error("Sanitized approval + full safety checklist required"); return; }
    publishConversion(source.id, draft);
    toast.success("Published to Mizly");
  };
  const onNeedsReview = () => { markNeedsReview(source.id); toast.success("Marked needs review"); };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 pb-16">
      <Link to="/admin/conversions" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to queue
      </Link>
      <Header title="Source conversion" subtitle="Admin-only workspace. Raw source material is never shown to learners." />

      {/* Source summary */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 inline-flex items-center gap-1.5">
          <Eye className="size-3 text-primary" /> Source summary (admin only)
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{TYPE_LABEL[source.type]}</span>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${RISK_CLS[source.risk]}`}>{RISK_LABEL[source.risk]} risk</span>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_CLS[source.status]}`}>{STATUS_LABEL[source.status]}</span>
        </div>
        <div className="font-display font-semibold">{source.title}</div>
        <div className="mt-2 text-xs text-muted-foreground">Lineage ID: <code className="bg-secondary px-1.5 py-0.5 rounded">{source.lineage_id}</code></div>
        {source.scanner_flags.length > 0 && (
          <div className="mt-3 text-xs">
            <div className="font-medium mb-1 inline-flex items-center gap-1"><AlertTriangle className="size-3 text-warning" /> Scanner flags</div>
            <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">{source.scanner_flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        )}
        <div className="mt-3 text-xs">
          <div className="font-medium mb-1">Admin notes</div>
          <p className="text-muted-foreground">{source.admin_notes}</p>
        </div>
        <div className="mt-3 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs italic text-foreground/80">
          {source.excerpt}
        </div>
        {source.converted_items.length > 0 && (
          <div className="mt-3 text-xs">
            <div className="font-medium mb-1">Converted items</div>
            <ul className="space-y-1">
              {source.converted_items.map(ci => {
                const it = itemById(ci.item_id);
                return (
                  <li key={ci.item_id} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="size-3 text-success" />
                    <span>{it?.title ?? ci.item_id}</span>
                    <span className="text-[10px]">· {ci.converted_on} · by {ci.converted_by} · sanitized: {ci.sanitized_approved ? "yes" : "no"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Workspace */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <div className="font-display font-semibold">Conversion workspace</div>
        <Row label="Suggested Mizly title"><Input v={draft.mizly_title} on={v => setDraft({ ...draft, mizly_title: v })} /></Row>
        <Row label="Target type">
          <select value={draft.target_type} onChange={e => setDraft({ ...draft, target_type: e.target.value as ConversionDraft["target_type"] })} className={inputCls}>
            {["lesson","playbook","checklist","scenario","video"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </Row>
        <div className="grid sm:grid-cols-3 gap-3">
          <Row label="Role tags"><Input v={draft.role_tags} on={v => setDraft({ ...draft, role_tags: v })} /></Row>
          <Row label="Domain tags"><Input v={draft.domain_tags} on={v => setDraft({ ...draft, domain_tags: v })} /></Row>
          <Row label="Phase tags"><Input v={draft.phase_tags} on={v => setDraft({ ...draft, phase_tags: v })} /></Row>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Row label="Urgency (1-4)"><Input v={String(draft.urgency)} on={v => setDraft({ ...draft, urgency: +v || 1 })} type="number" /></Row>
          <Row label="Escalation (1-4)"><Input v={String(draft.escalation)} on={v => setDraft({ ...draft, escalation: +v || 1 })} type="number" /></Row>
          <Row label="Frequency"><Input v={draft.frequency} on={v => setDraft({ ...draft, frequency: v })} /></Row>
        </div>
        <Row label="Short summary"><Area v={draft.short_summary} on={v => setDraft({ ...draft, short_summary: v })} /></Row>
        <Row label="First 90 seconds"><Area v={draft.first90} on={v => setDraft({ ...draft, first90: v })} /></Row>
        <Row label="What to say"><Area v={draft.what_to_say} on={v => setDraft({ ...draft, what_to_say: v })} /></Row>
        <Row label="What to check"><Area v={draft.what_to_check} on={v => setDraft({ ...draft, what_to_check: v })} /></Row>
        <Row label="When to escalate"><Area v={draft.when_to_escalate} on={v => setDraft({ ...draft, when_to_escalate: v })} /></Row>
        <Row label="Related content"><Area v={draft.related_content} on={v => setDraft({ ...draft, related_content: v })} /></Row>
        <Row label="Internal source lineage note"><Area v={draft.internal_lineage_note} on={v => setDraft({ ...draft, internal_lineage_note: v })} /></Row>
      </div>

      {/* Safety gate */}
      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-5">
        <div className="font-display font-semibold flex items-center gap-2 mb-3">
          <ShieldCheck className="size-4 text-warning" /> Safety gate
        </div>
        <div className="space-y-2">
          {CHECKLIST_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-start gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={draft.checklist[key]} onChange={e => setChecklist(key, e.target.checked)} className="mt-0.5 size-4 accent-primary" />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <label className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-card p-3 cursor-pointer">
          <input type="checkbox" checked={draft.sanitized_approved} onChange={e => setDraft({ ...draft, sanitized_approved: e.target.checked })} className="mt-0.5 size-4 accent-primary" />
          <div className="text-xs">
            <div className="font-medium">Sanitized approved</div>
            <div className="text-muted-foreground">I confirm the conversion is Mizly-original and safe to publish.</div>
          </div>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-end">
        <button onClick={() => navigate({ to: "/admin/conversions" })} className="h-10 px-4 rounded-xl border border-border bg-card text-sm">Back to queue</button>
        <button onClick={onNeedsReview} className="h-10 px-4 rounded-xl border border-border bg-card text-sm">Mark needs review</button>
        <button onClick={onSaveDraft} className="h-10 px-4 rounded-xl border border-border bg-card text-sm inline-flex items-center gap-1.5">
          <Save className="size-4" /> Save Mizly draft
        </button>
        <button onClick={onPublish} disabled={!canPublish}
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
          <Send className="size-4" /> Publish to Mizly
        </button>
      </div>
      {!canPublish && (
        <p className="mt-2 text-right text-[11px] text-muted-foreground">Publishing requires sanitized approval and all checklist items.</p>
      )}
    </div>
  );
}

const inputCls = "h-9 w-full px-3 rounded-lg border border-input bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-ring";
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-foreground/80 block mb-1">{label}</span>
      {children}
    </label>
  );
}
function Input({ v, on, type }: { v: string; on: (s: string) => void; type?: string }) {
  return <input type={type ?? "text"} value={v} onChange={e => on(e.target.value)} className={inputCls} />;
}
function Area({ v, on }: { v: string; on: (s: string) => void }) {
  return <textarea value={v} onChange={e => on(e.target.value)} className={`${inputCls} h-20 py-2`} />;
}
