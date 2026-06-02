import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, FileText, AlertTriangle, RotateCw, Archive, ShieldCheck, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  useSources, rescanSource, archiveSource, updateSource,
  STATUSES, STATUS_LABEL, DOMAINS, ROLES,
  type SourceStatus,
} from "@/lib/sources-data";
import { MODULES, type ContentType } from "@/lib/demo-data";
import { Header } from "./_authenticated.learn";
import { StatusBadge, RiskBadge } from "./_authenticated.admin_.sources";

export const Route = createFileRoute("/_authenticated/admin_/sources_/$id")({
  head: () => ({ meta: [{ title: "Source — Mizly" }] }),
  component: SourceDetailPage,
});

const TYPES: ContentType[] = ["lesson", "playbook", "video", "checklist", "scenario"];
const inputCls = "h-9 w-full rounded-lg border border-input bg-surface-elevated px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring";

function SourceDetailPage() {
  const { id } = Route.useParams();
  const sources = useSources();
  const source = useMemo(() => sources.find(s => s.id === id), [sources, id]);

  if (!source) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/admin/sources" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to Source Library
        </Link>
        <div className="mt-6 rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Source not found.
        </div>
      </div>
    );
  }

  // Rewrite form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("lesson");
  const [moduleId, setModuleId] = useState("");
  const [domain, setDomain] = useState(source.domain ?? "");
  const [role, setRole] = useState(source.role ?? "");
  const [difficulty, setDifficulty] = useState<"foundational" | "intermediate" | "advanced">("foundational");
  const [minutes, setMinutes] = useState(5);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [checklistText, setChecklistText] = useState("");
  const [scenarioText, setScenarioText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [tags, setTags] = useState("");
  const [sourceNotes, setSourceNotes] = useState("");
  const [sanitized, setSanitized] = useState(false);

  const src = source;
  const blocked = src.status === "quarantined" || src.status === "archived";

  function publish() {
    if (!title.trim()) { toast.error("Title required"); return; }
    if (!sanitized) { toast.error("Confirm 'sanitized approved' before publishing."); return; }
    // Demo: do not actually inject into ITEMS — Phase 1 routes stay clean.
    toast.success(`Draft '${title.trim()}' created from source — pending review.`);
    updateSource(src.id, { status: "archived", notes: `Rewritten as: ${title.trim()}` });
  }

  function setStatus(s: SourceStatus) {
    updateSource(src.id, { status: s });
    toast.success(`Status: ${STATUS_LABEL[s]}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Link to="/admin/sources" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Source Library
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
        <Header title={source.file_name} subtitle={`${source.file_type.toUpperCase()} · ${formatKb(source.size_kb)} · uploaded ${new Date(source.uploaded_at).toLocaleString()}`} />
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={source.status} />
          <RiskBadge risk={source.risk_level} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button onClick={() => rescanSource(source.id)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
          <RotateCw className="size-3.5" /> Rescan
        </button>
        <select aria-label="Set status" value={source.status} onChange={e => setStatus(e.target.value as SourceStatus)}
          className="h-8 rounded-lg border border-input bg-surface-elevated px-2 text-xs">
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button onClick={() => { archiveSource(source.id); toast.success("Archived"); }} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
          <Archive className="size-3.5" /> Archive
        </button>
      </div>

      {/* Risk summary */}
      <div className="mt-5 grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-semibold flex items-center gap-2 mb-2">
            <AlertTriangle className="size-3.5 text-warning" /> Risk findings ({source.matched_terms.length})
          </div>
          {source.matched_terms.length === 0 ? (
            <div className="text-xs text-muted-foreground">No risky patterns detected. Still review before publishing.</div>
          ) : (
            <ul className="space-y-1.5">
              {source.matched_terms.map((m, i) => (
                <li key={i} className="text-[11px] flex items-center justify-between gap-2 px-2 py-1 rounded bg-warning/10">
                  <span className="text-foreground/80">{m.category}</span>
                  <code className="text-warning font-mono">{m.term}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs font-semibold flex items-center gap-2 mb-2">
            <FileText className="size-3.5 text-primary" /> Extracted excerpt
          </div>
          <div className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{source.excerpt}</div>
          {source.notes && <div className="mt-3 text-[11px] text-muted-foreground italic">Notes: {source.notes}</div>}
        </div>
      </div>

      {/* Rewrite Workspace */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 font-display font-semibold">
          <Sparkles className="size-4 text-primary" /> Rewrite into Mizly content
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Rewrite into vendor-neutral, Mizly-original content. Do not copy source text verbatim. Strip any vendor names, organization names, and PHI before publishing.
        </p>

        {blocked && (
          <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            This source is {source.status === "archived" ? "archived" : "quarantined"}. Resolve risks or restore status before rewriting.
          </div>
        )}

        <fieldset disabled={blocked} className="mt-4 space-y-3 disabled:opacity-60">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Calm a unit in five sentences" /></Field>
            <Field label="Type">
              <select value={type} onChange={e => setType(e.target.value as ContentType)} className={inputCls}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Module">
              <select value={moduleId} onChange={e => setModuleId(e.target.value)} className={inputCls}>
                <option value="">— none —</option>
                {MODULES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </Field>
            <Field label="Domain">
              <select value={domain} onChange={e => setDomain(e.target.value)} className={inputCls}>
                <option value="">— none —</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Role">
              <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
                <option value="">— none —</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Difficulty">
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className={inputCls}>
                <option value="foundational">foundational</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </Field>
            <Field label="Estimated minutes"><input type="number" min={1} value={minutes} onChange={e => setMinutes(+e.target.value)} className={inputCls} /></Field>
            <Field label="Tags (comma)"><input value={tags} onChange={e => setTags(e.target.value)} placeholder="downtime, registration" className={inputCls} /></Field>
          </div>

          <Field label="Summary">
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2}
              className="w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="One sentence." />
          </Field>

          <Field label="Body (markdown)">
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
              className="w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="## Heading&#10;Body…" />
          </Field>

          {type === "playbook" && (
            <Field label="Steps (one per line)">
              <textarea value={stepsText} onChange={e => setStepsText(e.target.value)} rows={4}
                className="w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Step 1: ...&#10;Step 2: ..." />
            </Field>
          )}
          {type === "checklist" && (
            <Field label="Checklist items (one per line)">
              <textarea value={checklistText} onChange={e => setChecklistText(e.target.value)} rows={4}
                className="w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Badge visible&#10;Downtime kit packed" />
            </Field>
          )}
          {type === "scenario" && (
            <Field label="Scenario steps (one per line)">
              <textarea value={scenarioText} onChange={e => setScenarioText(e.target.value)} rows={4}
                className="w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Situation: ...&#10;First 90 seconds: ..." />
            </Field>
          )}
          {type === "video" && (
            <Field label="Transcript / chapter notes">
              <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={4}
                className="w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Full transcript or chapter notes." />
            </Field>
          )}

          <Field label="Source notes (admin-only)">
            <textarea value={sourceNotes} onChange={e => setSourceNotes(e.target.value)} rows={2}
              className="w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Why this source, what was stripped, what to revisit." />
          </Field>

          <label className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
            <input type="checkbox" checked={sanitized} onChange={e => setSanitized(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
            <div className="text-xs">
              <div className="font-medium flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-success" /> Sanitized approved</div>
              <div className="text-muted-foreground">I confirm no PHI, vendor names, organization names, or proprietary documentation appears in this content.</div>
            </div>
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={publish} className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-50" disabled={blocked}>
              <Check className="size-4" /> Save Mizly draft
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = `f_${label.replace(/\W+/g, "_").toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="text-[11px] font-medium text-foreground/80 mb-1 block">{label}</span>
      <span id={id}>{children}</span>
    </label>
  );
}

function formatKb(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
