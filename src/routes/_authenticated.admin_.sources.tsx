import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Upload, Search, FileText, AlertTriangle, ShieldCheck, ShieldAlert, Archive, RotateCw,
  ArrowRight, ArrowLeft, FileType2, Film, Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSources, addSource, archiveSource, rescanSource,
  STATUSES, RISK_LEVELS, FILE_TYPES, DOMAINS, ROLES,
  STATUS_LABEL, RISK_LABEL,
  type SourceStatus, type RiskLevel, type SourceFileType,
} from "@/lib/sources-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/sources")({
  head: () => ({ meta: [{ title: "Source Library — Mizly" }] }),
  component: SourcesPage,
});

const inputCls = "h-9 w-full rounded-lg border border-input bg-surface-elevated px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring";

function SourcesPage() {
  const sources = useSources();
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<SourceStatus | "all">("all");
  const [riskF, setRiskF] = useState<RiskLevel | "all">("all");
  const [typeF, setTypeF] = useState<SourceFileType | "all">("all");
  const [domainF, setDomainF] = useState<string | "all">("all");
  const [roleF, setRoleF] = useState<string | "all">("all");
  const [showUpload, setShowUpload] = useState(false);

  const visible = useMemo(() => {
    const tk = q.trim().toLowerCase();
    return sources.filter(s => {
      if (statusF !== "all" && s.status !== statusF) return false;
      if (riskF !== "all" && s.risk_level !== riskF) return false;
      if (typeF !== "all" && s.file_type !== typeF) return false;
      if (domainF !== "all" && s.domain !== domainF) return false;
      if (roleF !== "all" && s.role !== roleF) return false;
      if (tk && !`${s.file_name} ${s.excerpt} ${s.domain ?? ""} ${s.role ?? ""}`.toLowerCase().includes(tk)) return false;
      return true;
    });
  }, [sources, q, statusF, riskF, typeF, domainF, roleF]);

  const counts = useMemo(() => ({
    total: sources.length,
    needs_review: sources.filter(s => s.status === "needs_review").length,
    quarantined: sources.filter(s => s.status === "quarantined").length,
    ready: sources.filter(s => s.status === "ready_for_rewrite").length,
  }), [sources]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="size-3.5" /> Back to admin
          </Link>
          <Header title="Source Library" subtitle="Admin-only. Sources never appear in Ask, Learn, Playbooks, Videos, Checklists, or Scenarios." />
        </div>
        <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Upload className="size-4" /> Upload source
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI label="Total" value={counts.total} />
        <KPI label="Needs review" value={counts.needs_review} tone="warning" />
        <KPI label="Quarantined" value={counts.quarantined} tone="danger" />
        <KPI label="Ready" value={counts.ready} tone="success" />
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1"><ShieldCheck className="size-3.5 text-warning" /> Pipeline rules</div>
        Source files are admin-only inputs. Nothing auto-publishes. Rewrite sources into Mizly-original, vendor-neutral content before publishing.
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="relative sm:col-span-2">
          <label htmlFor="src-q" className="sr-only">Search sources</label>
          <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input id="src-q" value={q} onChange={e => setQ(e.target.value)} placeholder="Search file, excerpt, domain…" className={`${inputCls} pl-8`} />
        </div>
        <FilterSelect id="f-status" label="Status" value={statusF} onChange={v => setStatusF(v as any)}
          options={[{ v: "all", l: "All status" }, ...STATUSES.map(s => ({ v: s, l: STATUS_LABEL[s] }))]} />
        <FilterSelect id="f-risk" label="Risk" value={riskF} onChange={v => setRiskF(v as any)}
          options={[{ v: "all", l: "All risk" }, ...RISK_LEVELS.map(r => ({ v: r, l: RISK_LABEL[r] }))]} />
        <FilterSelect id="f-type" label="File type" value={typeF} onChange={v => setTypeF(v as any)}
          options={[{ v: "all", l: "All types" }, ...FILE_TYPES.map(t => ({ v: t, l: t.toUpperCase() }))]} />
        <FilterSelect id="f-domain" label="Domain" value={domainF} onChange={v => setDomainF(v)}
          options={[{ v: "all", l: "All domains" }, ...DOMAINS.map(d => ({ v: d, l: d }))]} />
      </div>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-6 gap-2">
        <FilterSelect id="f-role" label="Role" value={roleF} onChange={v => setRoleF(v)}
          options={[{ v: "all", l: "All roles" }, ...ROLES.map(r => ({ v: r, l: r }))]} />
      </div>

      {/* List */}
      <div className="mt-4 font-display font-semibold">Sources ({visible.length})</div>
      <div className="mt-2 space-y-2">
        {visible.map(s => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-soft transition-shadow">
            <div className="flex items-start gap-3 flex-wrap">
              <FileIcon type={s.file_type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm font-medium truncate">{s.file_name}</div>
                  <StatusBadge status={s.status} />
                  <RiskBadge risk={s.risk_level} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {s.file_type.toUpperCase()} · {formatKb(s.size_kb)} · {new Date(s.uploaded_at).toLocaleDateString()}
                  {s.domain && <> · {s.domain}</>}
                  {s.role && <> · {s.role}</>}
                </div>
                {s.matched_terms.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                    <AlertTriangle className="size-3 text-warning" />
                    {s.matched_terms.slice(0, 5).map((m, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-warning/15 text-warning">
                        {m.category}
                      </span>
                    ))}
                    {s.matched_terms.length > 5 && (
                      <span className="text-[10px] text-muted-foreground">+{s.matched_terms.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={() => rescanSource(s.id)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
                  <RotateCw className="size-3.5" /> Rescan
                </button>
                <button onClick={() => { archiveSource(s.id); toast.success("Source archived"); }} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
                  <Archive className="size-3.5" /> Archive
                </button>
                <Link to="/admin/sources/$id" params={{ id: s.id }} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-1.5">
                  Open <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No sources match these filters.
          </div>
        )}
      </div>

      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function UploadDialog({ onClose }: { onClose: () => void }) {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<SourceFileType>("pdf");
  const [sizeKb, setSizeKb] = useState(120);
  const [domain, setDomain] = useState("");
  const [role, setRole] = useState("");
  const [excerpt, setExcerpt] = useState("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setSizeKb(Math.round(f.size / 1024));
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext && (FILE_TYPES as string[]).includes(ext)) setFileType(ext as SourceFileType);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileName.trim()) { toast.error("File name required"); return; }
    addSource({
      file_name: fileName.trim(),
      file_type: fileType,
      size_kb: sizeKb || 1,
      excerpt: excerpt.trim() || "(no extracted text)",
      domain: domain || undefined,
      role: role || undefined,
    });
    toast.success("Source uploaded — scanning for risk…");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 font-display font-semibold">
          <Upload className="size-4 text-primary" /> Upload source file
        </div>
        <p className="text-xs text-muted-foreground">Admin-only. The file's text excerpt is scanned for vendor names, organization names, PHI-like patterns, and proprietary doc language before it can be rewritten.</p>

        <Field label="File (PDF, DOCX, PPTX, TXT, MD, MP4)">
          <input type="file" accept=".pdf,.docx,.pptx,.txt,.md,.mp4" onChange={onFile} className="text-xs" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="File name"><input required value={fileName} onChange={e => setFileName(e.target.value)} className={inputCls} placeholder="my-source.pdf" /></Field>
          <Field label="Type">
            <select value={fileType} onChange={e => setFileType(e.target.value as SourceFileType)} className={inputCls}>
              {FILE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
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
        </div>
        <Field label="Extracted text excerpt (mock)">
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={4}
            className="w-full rounded-lg border border-input bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Paste a sample of the file's text. The risk scanner uses this in the demo." />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-sm">Cancel</button>
          <button type="submit" className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2">
            <Plus className="size-4" /> Add source
          </button>
        </div>
      </form>
    </div>
  );
}

// --- helpers ---

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = `f_${label.replace(/\W+/g, "_").toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="text-[11px] font-medium text-foreground/80 mb-1 block">{label}</span>
      {typeof children === "object" && children && "type" in (children as any)
        ? <span id={id}>{children}</span>
        : children}
    </label>
  );
}

function FilterSelect({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <select id={id} aria-label={label} value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

export function StatusBadge({ status }: { status: SourceStatus }) {
  const tone =
    status === "ready_for_rewrite" ? "bg-success/15 text-success"
      : status === "needs_review" ? "bg-warning/15 text-warning"
        : status === "quarantined" ? "bg-destructive/15 text-destructive"
          : status === "scanning" ? "bg-primary/15 text-primary"
            : status === "archived" ? "bg-muted text-muted-foreground"
              : "bg-secondary text-secondary-foreground";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${tone}`}>{STATUS_LABEL[status]}</span>;
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const Icon = risk === "high" ? ShieldAlert : ShieldCheck;
  const tone =
    risk === "high" ? "bg-destructive/15 text-destructive"
      : risk === "medium" ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success";
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${tone}`}>
      <Icon className="size-3" /> {RISK_LABEL[risk]}
    </span>
  );
}

function FileIcon({ type }: { type: SourceFileType }) {
  const Icon = type === "mp4" ? Film : type === "pdf" ? FileText : FileType2;
  return <div className="size-9 rounded-lg bg-secondary flex items-center justify-center"><Icon className="size-4 text-foreground/70" /></div>;
}

function formatKb(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" | "danger" }) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-display font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}
