import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Wand2, Check, ShieldCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQuestions, updateQuestion, type QuestionRecord } from "@/lib/questions-data";
import { useTaxonomy, labelFor, type TaxonomyCategory } from "@/lib/taxonomy";
import type { ContentType } from "@/lib/demo-data";
import { GuardrailCard } from "@/components/GuardrailCard";
import { APPLIES_TO_OPTIONS, PUBLISH_CHECKLIST, type AppliesTo } from "@/lib/legal";

export const Route = createFileRoute("/_authenticated/admin_/questions_/$id")({
  head: () => ({ meta: [{ title: "Question — Mizly" }] }),
  component: QuestionDetailPage,
});

const CONVERT_TYPES: { type: ContentType | "ask"; label: string }[] = [
  { type: "ask", label: "Ask answer" },
  { type: "lesson", label: "Lesson" },
  { type: "playbook", label: "Playbook" },
  { type: "scenario", label: "Scenario" },
  { type: "checklist", label: "Checklist" },
];

interface DraftForm {
  target: ContentType | "ask";
  title: string;
  short_answer: string;
  first_90: string;
  steps: string;
  what_to_say: string;
  what_to_check: string;
  when_to_escalate: string;
  related: string;
  role_id: string;
  domain_id: string;
  phase_id: string;
  urgency_id: string;
  escalation_id: string;
  frequency_id: string;
  source_notes: string;
  sanitized: boolean;
}

function QuestionDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const questions = useQuestions();
  const taxonomy = useTaxonomy();
  const question = useMemo(() => questions.find(q => q.id === id), [questions, id]);

  const [draft, setDraft] = useState<DraftForm | null>(null);

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12 text-center">
        <h1 className="font-display font-semibold text-xl">Question not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The question <code className="text-xs">{id}</code> doesn't exist or was removed.
        </p>
        <Link to="/admin/questions" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to Question Bank
        </Link>
      </div>
    );
  }

  function startConvert() {
    if (!question) return;
    setDraft({
      target: "ask",
      title: question.text,
      short_answer: "",
      first_90: "",
      steps: "",
      what_to_say: "",
      what_to_check: "",
      when_to_escalate: "",
      related: "",
      role_id: question.role_id ?? "",
      domain_id: question.domain_id ?? "",
      phase_id: question.phase_id ?? "",
      urgency_id: question.urgency_id ?? "",
      escalation_id: question.escalation_id ?? "",
      frequency_id: question.frequency_id ?? "",
      source_notes: question.source_notes ?? "",
      sanitized: false,
    });
    setTimeout(() => document.getElementById("convert-form")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function saveDraft(publish: boolean) {
    if (!draft || !question) return;
    if (!draft.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (publish && !draft.sanitized) {
      toast.error("Publishing requires sanitized approval.");
      return;
    }
    // Mark question as converted (mock — would create a Mizly content draft server-side).
    updateQuestion(question.id, { status: "converted" });
    toast.success(publish ? `Published as ${draft.target} (mock)` : `Saved as ${draft.target} draft`);
    navigate({ to: "/admin/questions" });
  }

  function markReviewed() {
    if (!question) return;
    updateQuestion(question.id, { status: "reviewed" });
    toast.success("Marked as reviewed");
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Link to="/admin/questions" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Question Bank
      </Link>

      <div className="mt-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Question</div>
        <h1 className="mt-1 font-display font-semibold text-xl">{question.text}</h1>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
          <Meta label="Role" value={labelFor("roles", question.role_id)} />
          <Meta label="Domain" value={labelFor("domains", question.domain_id)} />
          <Meta label="Phase" value={labelFor("phases", question.phase_id)} />
          <Meta label="Urgency" value={labelFor("urgency", question.urgency_id)} />
          <Meta label="Escalation" value={labelFor("escalation", question.escalation_id)} />
          <Meta label="Frequency" value={labelFor("frequency", question.frequency_id)} />
        </div>
        {question.workflow_pattern && (
          <div className="mt-4 rounded-xl bg-secondary/60 p-3 text-sm">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Workflow pattern</div>
            {question.workflow_pattern}
          </div>
        )}
        {question.source_notes && (
          <div className="mt-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="size-3.5 text-warning" /> Source notes (admin-only)
            </div>
            {question.source_notes}
          </div>
        )}
        <div className="mt-4 flex gap-2 flex-wrap">
          <button onClick={startConvert} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Wand2 className="size-4" /> Convert to Mizly Draft
          </button>
          {question.status !== "reviewed" && question.status !== "converted" && (
            <button onClick={markReviewed} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary">
              <Check className="size-4" /> Mark reviewed
            </button>
          )}
          <span className="ml-auto self-center text-[11px] text-muted-foreground">
            Status: <span className="font-medium text-foreground">{question.status}</span>
          </span>
        </div>
      </div>

      {draft && (
        <form id="convert-form" onSubmit={e => { e.preventDefault(); saveDraft(false); }} className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
          <div className="font-display font-semibold flex items-center gap-2">
            <FileText className="size-4 text-primary" /> Convert to Mizly Draft
          </div>
          <Field label="Target type">
            <select value={draft.target} onChange={e => setDraft({ ...draft, target: e.target.value as DraftForm["target"] })} className={inputCls}>
              {CONVERT_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Title">
            <input required value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Short answer">
            <textarea value={draft.short_answer} onChange={e => setDraft({ ...draft, short_answer: e.target.value })} className={`${inputCls} h-20 py-2`} placeholder="One or two sentences. Plain language." />
          </Field>
          <Field label="First 90 seconds">
            <textarea value={draft.first_90} onChange={e => setDraft({ ...draft, first_90: e.target.value })} className={`${inputCls} h-20 py-2`} placeholder="What to do in the first minute and a half." />
          </Field>
          <Field label="Steps">
            <textarea value={draft.steps} onChange={e => setDraft({ ...draft, steps: e.target.value })} className={`${inputCls} h-24 py-2`} placeholder="1. …&#10;2. …&#10;3. …" />
          </Field>
          <Field label="What to say">
            <textarea value={draft.what_to_say} onChange={e => setDraft({ ...draft, what_to_say: e.target.value })} className={`${inputCls} h-20 py-2`} placeholder="Sample script for the end-user." />
          </Field>
          <Field label="What to check">
            <textarea value={draft.what_to_check} onChange={e => setDraft({ ...draft, what_to_check: e.target.value })} className={`${inputCls} h-20 py-2`} placeholder="Quick checks before escalating." />
          </Field>
          <Field label="When to escalate">
            <textarea value={draft.when_to_escalate} onChange={e => setDraft({ ...draft, when_to_escalate: e.target.value })} className={`${inputCls} h-16 py-2`} />
          </Field>
          <Field label="Related playbook / checklist / scenario">
            <input value={draft.related} onChange={e => setDraft({ ...draft, related: e.target.value })} className={inputCls} placeholder="e.g. Downtime — Registration" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <TaxSelect label="Role" cat="roles" value={draft.role_id} onChange={v => setDraft({ ...draft, role_id: v })} taxonomy={taxonomy} />
            <TaxSelect label="Domain" cat="domains" value={draft.domain_id} onChange={v => setDraft({ ...draft, domain_id: v })} taxonomy={taxonomy} />
            <TaxSelect label="Phase" cat="phases" value={draft.phase_id} onChange={v => setDraft({ ...draft, phase_id: v })} taxonomy={taxonomy} />
            <TaxSelect label="Urgency" cat="urgency" value={draft.urgency_id} onChange={v => setDraft({ ...draft, urgency_id: v })} taxonomy={taxonomy} />
            <TaxSelect label="Escalation" cat="escalation" value={draft.escalation_id} onChange={v => setDraft({ ...draft, escalation_id: v })} taxonomy={taxonomy} />
            <TaxSelect label="Frequency" cat="frequency" value={draft.frequency_id} onChange={v => setDraft({ ...draft, frequency_id: v })} taxonomy={taxonomy} />
          </div>

          <Field label="Source notes (admin-only)">
            <textarea value={draft.source_notes} onChange={e => setDraft({ ...draft, source_notes: e.target.value })} className={`${inputCls} h-16 py-2`} placeholder="Provenance, caveats, sanitization notes." />
          </Field>

          <label className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
            <input type="checkbox" checked={draft.sanitized} onChange={e => setDraft({ ...draft, sanitized: e.target.checked })} className="mt-0.5 size-4 accent-primary" />
            <div className="text-xs">
              <div className="font-medium">Sanitized approved</div>
              <div className="text-muted-foreground">No PHI, vendor names, organization names, or verbatim source text.</div>
              <div className="mt-1 text-[11px] text-muted-foreground italic">Drafts can be saved anytime. Publishing to Mizly requires sanitized approval.</div>
            </div>
          </label>

          <div className="flex gap-2 justify-end flex-wrap">
            <button type="button" onClick={() => setDraft(null)} className="h-11 px-4 rounded-xl border border-border text-sm">Cancel</button>
            <button type="submit" className="h-11 px-4 rounded-xl border border-border text-sm font-medium inline-flex items-center gap-2">
              <Check className="size-4" /> Save Mizly draft
            </button>
            <button
              type="button"
              onClick={() => saveDraft(true)}
              disabled={!draft.sanitized}
              title={draft.sanitized ? undefined : "Check 'Sanitized approved' to enable publishing"}
              aria-disabled={!draft.sanitized}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="size-4" /> Publish to Mizly
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-foreground/80">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function TaxSelect({ label, cat, value, onChange, taxonomy }: {
  label: string;
  cat: TaxonomyCategory;
  value: string;
  onChange: (v: string) => void;
  taxonomy: ReturnType<typeof useTaxonomy>;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-foreground/80 mb-1 block">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
        <option value="">— none —</option>
        {taxonomy[cat].map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
    </label>
  );
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-input bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-ring";
