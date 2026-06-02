import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, FileJson, ListChecks, Search, Upload, AlertTriangle, Eye, Archive } from "lucide-react";
import { toast } from "sonner";
import {
  useQuestions, importQuestionsJson, archiveQuestion,
  QUESTION_STATUSES, STATUS_LABEL,
  type ImportSummary, type QuestionStatus,
} from "@/lib/questions-data";
import { useTaxonomy, labelFor, type TaxonomyCategory } from "@/lib/taxonomy";

export const Route = createFileRoute("/_authenticated/admin_/questions")({
  head: () => ({ meta: [{ title: "Question Bank — Mizly" }] }),
  component: QuestionsListPage,
});

const FILTER_CATS: { cat: TaxonomyCategory; label: string; field: keyof QuestionFilter }[] = [
  { cat: "roles", label: "Role", field: "role_id" },
  { cat: "domains", label: "Domain", field: "domain_id" },
  { cat: "phases", label: "Phase", field: "phase_id" },
  { cat: "urgency", label: "Urgency", field: "urgency_id" },
  { cat: "escalation", label: "Escalation", field: "escalation_id" },
  { cat: "frequency", label: "Frequency", field: "frequency_id" },
];

interface QuestionFilter {
  role_id: string;
  domain_id: string;
  phase_id: string;
  urgency_id: string;
  escalation_id: string;
  frequency_id: string;
  status: QuestionStatus | "all";
}

const EMPTY_FILTER: QuestionFilter = {
  role_id: "", domain_id: "", phase_id: "",
  urgency_id: "", escalation_id: "", frequency_id: "",
  status: "all",
};

function QuestionsListPage() {
  const questions = useQuestions();
  const taxonomy = useTaxonomy();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<QuestionFilter>(EMPTY_FILTER);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const tk = q.trim().toLowerCase();
    return questions.filter(item => {
      if (filter.status !== "all" && item.status !== filter.status) return false;
      for (const { field } of FILTER_CATS) {
        const v = filter[field];
        if (v && (item[field as keyof typeof item] as string | undefined) !== v) return false;
      }
      if (tk && !item.text.toLowerCase().includes(tk)) return false;
      return true;
    });
  }, [questions, q, filter]);

  function runImport() {
    setParseError(null);
    let payload: unknown;
    try {
      payload = JSON.parse(importText);
    } catch (e) {
      setParseError("Invalid JSON. Paste a valid ate_question_taxonomy.json payload.");
      return;
    }
    const s = importQuestionsJson(payload);
    setSummary(s);
    toast.success(`Imported ${s.imported} question${s.imported === 1 ? "" : "s"}`);
  }

  function loadSample() {
    setImportText(JSON.stringify({
      title: "ate_question_taxonomy",
      version: "0.1.0",
      total: 3,
      questions: [
        { id: "print_paper", text: "Printers spitting blank labels — what do I check first?", role: "registration", domain: "printing", phase: "cutover_day_0", urgency: "3_blocking_workflow", escalation: "1_ate_handles", frequency: "high", workflow_pattern: "Driver/queue check — workflow may vary by site/system." },
        { id: "voice_rec", text: "Voice recognition keeps inserting the wrong patient — how do I reset context?", role: "inpatient_provider", domain: "voice_recognition", phase: "stabilization_week_1", urgency: "4_patient_safety_risk", escalation: "4_immediate_command_center_clinical_leadership", frequency: "low" },
        { id: "ed_tracker", text: "ED tracker board froze — what do we do for the next 10 minutes?", role: "ed", domain: "patient_lists", phase: "cutover_day_0", urgency: "3_blocking_workflow", escalation: "3_command_center_ticket", frequency: "medium" },
      ],
    }, null, 2));
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Back to Admin
          </Link>
          <h1 className="mt-1 font-display font-semibold text-2xl flex items-center gap-2">
            <ListChecks className="size-5 text-primary" /> Question Bank
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Structured go-live questions. Admin-only — never shown in Ask/Learn/Playbooks until converted to sanitized Mizly content.
          </p>
        </div>
        <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Upload className="size-4" /> Import JSON
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        Vendor-neutral and PHI-free. Use neutral wording like "workflow may vary by site/system." Do not copy raw source text verbatim.
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search question text…"
            className="h-9 w-full pl-8 pr-3 rounded-lg border border-input bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {FILTER_CATS.map(({ cat, label, field }) => (
            <label key={field} className="block">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
              <select
                value={filter[field] as string}
                onChange={e => setFilter({ ...filter, [field]: e.target.value })}
                className="mt-0.5 h-9 w-full px-2 rounded-lg border border-input bg-surface-elevated text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All</option>
                {taxonomy[cat].map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
          ))}
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</span>
            <select
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value as QuestionFilter["status"] })}
              className="mt-0.5 h-9 w-full px-2 rounded-lg border border-input bg-surface-elevated text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All</option>
              {QUESTION_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
        </div>
        {(q || Object.values(filter).some(v => v && v !== "all")) && (
          <button onClick={() => { setQ(""); setFilter(EMPTY_FILTER); }} className="text-xs text-primary hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-6 font-display font-semibold">Questions ({visible.length})</div>
      <div className="mt-2 space-y-2">
        {visible.map(item => (
          <div key={item.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.text}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge tone="primary">{labelFor("roles", item.role_id) ?? "—"}</Badge>
                  <Badge tone="accent">{labelFor("domains", item.domain_id) ?? "—"}</Badge>
                  <Badge tone="secondary">{labelFor("phases", item.phase_id) ?? "—"}</Badge>
                  {labelFor("urgency", item.urgency_id) && <Badge tone="warning">Urgency {labelFor("urgency", item.urgency_id)}</Badge>}
                  {labelFor("escalation", item.escalation_id) && <Badge tone="destructive">Escalation {labelFor("escalation", item.escalation_id)}</Badge>}
                  {labelFor("frequency", item.frequency_id) && <Badge tone="secondary">Freq {labelFor("frequency", item.frequency_id)}</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  item.status === "converted" ? "bg-success/15 text-success" :
                  item.status === "reviewed" ? "bg-primary/10 text-primary" :
                  item.status === "archived" ? "bg-muted text-muted-foreground" :
                  "bg-secondary text-secondary-foreground"
                }`}>{STATUS_LABEL[item.status]}</span>
                <Link to="/admin/questions/$id" params={{ id: item.id }} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" /> Open
                </Link>
                {item.status !== "archived" && (
                  <button onClick={() => { archiveQuestion(item.id); toast.success("Question archived"); }} className="text-xs px-2 py-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive inline-flex items-center gap-1">
                    <Archive className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No questions match. Try clearing filters or importing more.
          </div>
        )}
      </div>

      {/* Import modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setImportOpen(false)}>
          <div className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 font-display font-semibold text-lg">
              <FileJson className="size-5 text-primary" /> Import questions JSON
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste an <code className="text-[11px]">ate_question_taxonomy.json</code> payload. Required field: <code>questions[].text</code> (or <code>question</code>/<code>prompt</code>).
            </p>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder='{"title":"ate_question_taxonomy","version":"0.1.0","total":3,"questions":[...]}'
              className="mt-3 w-full h-64 px-3 py-2 rounded-lg border border-input bg-surface-elevated font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 flex gap-2 flex-wrap">
              <button onClick={loadSample} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">Load sample</button>
              <button onClick={runImport} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium">Parse & import</button>
              <button onClick={() => setImportOpen(false)} className="text-xs px-3 py-1.5 rounded-lg border border-border ml-auto">Close</button>
            </div>
            {parseError && (
              <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex gap-2">
                <AlertTriangle className="size-4 shrink-0" /> {parseError}
              </div>
            )}
            {summary && (
              <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-4 text-xs space-y-1">
                <div className="font-semibold text-sm">Import summary</div>
                <div><span className="text-muted-foreground">Title:</span> {summary.title ?? "—"}</div>
                <div><span className="text-muted-foreground">Version:</span> {summary.version ?? "—"}</div>
                <div><span className="text-muted-foreground">Declared total:</span> {summary.declared_total ?? "—"}</div>
                <div><span className="text-muted-foreground">Actual array count:</span> {summary.actual_total}</div>
                <div><span className="text-muted-foreground">Imported:</span> {summary.imported}</div>
                <div><span className="text-muted-foreground">Skipped (missing text / duplicate):</span> {summary.skipped}</div>
                {summary.warning && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-2 text-warning">
                    <AlertTriangle className="size-4 shrink-0" /> {summary.warning}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: "primary" | "accent" | "secondary" | "warning" | "destructive"; children: React.ReactNode }) {
  const cls = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cls}`}>{children}</span>;
}
