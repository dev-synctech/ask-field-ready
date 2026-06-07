import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, ShieldCheck, Search, ExternalLink, Download, Upload,
  CheckCircle2, AlertTriangle, EyeOff, Eraser, Pencil, HelpCircle, SkipForward,
} from "lucide-react";
import { Header } from "./_authenticated.learn";
import referenceMap from "@/data/visual-correlation-map.json";

export const Route = createFileRoute("/_authenticated/admin_/visual-review")({
  head: () => ({ meta: [{ title: "Visual Review Viewer — Mizly Admin" }] }),
  component: VisualReviewPage,
});

type ReferenceRow = {
  id: string;
  pdf: string;
  pdfPage: number | string;
  sectionNumber: number | string;
  sectionTitle: string;
  sourceTitle: string;
  sourcePage: number | string;
  aliases: string;
  priority: string;
  status: string;
  cleanedAsset: string;
  exposureRule: string;
  adminAction: string;
};

const REFS = referenceMap as ReferenceRow[];

type Decision = "unreviewed" | "use" | "needs_blur" | "needs_redraw" | "skip" | "unsure";
type Lifecycle = "raw_reference" | "cleaned_in_progress" | "cleaned_ready" | "learner_visible";

type ReviewState = {
  decision: Decision;
  cleanedNeeded: "yes" | "no" | "unset";
  lifecycle: Lifecycle;
  notes: string;
  updatedAt: string;
};

type ReviewMap = Record<string, ReviewState>;

const STORAGE_KEY = "mizly.admin.visual_review_v1";

const DEFAULT_STATE: ReviewState = {
  decision: "unreviewed",
  cleanedNeeded: "unset",
  lifecycle: "raw_reference",
  notes: "",
  updatedAt: "",
};

const DECISION_META: Record<Decision, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  unreviewed:   { label: "Unreviewed",   cls: "bg-secondary text-secondary-foreground", icon: HelpCircle },
  use:          { label: "Use as-is",    cls: "bg-success/15 text-success",              icon: CheckCircle2 },
  needs_blur:   { label: "Needs blur",   cls: "bg-warning/15 text-warning",              icon: Eraser },
  needs_redraw: { label: "Needs redraw", cls: "bg-primary-soft text-primary",            icon: Pencil },
  skip:         { label: "Skip",         cls: "bg-muted text-muted-foreground",          icon: SkipForward },
  unsure:       { label: "Unsure",       cls: "bg-accent text-accent-foreground",        icon: HelpCircle },
};

const LIFECYCLE_META: Record<Lifecycle, { label: string; cls: string }> = {
  raw_reference:        { label: "Raw reference",        cls: "bg-secondary text-secondary-foreground" },
  cleaned_in_progress:  { label: "Cleaning in progress", cls: "bg-warning/15 text-warning" },
  cleaned_ready:        { label: "Cleaned, pending QA",  cls: "bg-primary-soft text-primary" },
  learner_visible:      { label: "Learner-visible",      cls: "bg-success/15 text-success" },
};

function loadReviews(): ReviewMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveReviews(map: ReviewMap) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch {}
}

const PAGE_SIZE = 50;
const PDFS = Array.from(new Set(REFS.map(r => r.pdf)));
const PRIORITIES = Array.from(new Set(REFS.map(r => r.priority))).sort();

function VisualReviewPage() {
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setReviews(loadReviews()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) saveReviews(reviews); }, [reviews, hydrated]);

  const [q, setQ] = useState("");
  const [pdfFilter, setPdfFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [decisionFilter, setDecisionFilter] = useState<Decision | "all">("all");
  const [lifecycleFilter, setLifecycleFilter] = useState<Lifecycle | "all">("all");
  const [cleanedFilter, setCleanedFilter] = useState<"all" | "yes" | "no" | "unset">("all");
  const [page, setPage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const getState = useCallback(
    (id: string): ReviewState => reviews[id] ?? DEFAULT_STATE,
    [reviews]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return REFS.filter(r => {
      if (pdfFilter !== "all" && r.pdf !== pdfFilter) return false;
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      const st = getState(r.id);
      if (decisionFilter !== "all" && st.decision !== decisionFilter) return false;
      if (lifecycleFilter !== "all" && st.lifecycle !== lifecycleFilter) return false;
      if (cleanedFilter !== "all" && st.cleanedNeeded !== cleanedFilter) return false;
      if (term) {
        const hay = `${r.id} ${r.sectionTitle} ${r.sourceTitle} ${r.aliases} ${r.pdf}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [q, pdfFilter, priorityFilter, decisionFilter, lifecycleFilter, cleanedFilter, getState]);

  useEffect(() => { setPage(0); }, [q, pdfFilter, priorityFilter, decisionFilter, lifecycleFilter, cleanedFilter]);

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const counts = useMemo(() => {
    const c = { total: REFS.length, reviewed: 0, use: 0, needs_blur: 0, needs_redraw: 0, skip: 0, unsure: 0, learner_visible: 0, cleaned_ready: 0 };
    for (const r of REFS) {
      const s = getState(r.id);
      if (s.decision !== "unreviewed") c.reviewed++;
      if (s.decision === "use") c.use++;
      if (s.decision === "needs_blur") c.needs_blur++;
      if (s.decision === "needs_redraw") c.needs_redraw++;
      if (s.decision === "skip") c.skip++;
      if (s.decision === "unsure") c.unsure++;
      if (s.lifecycle === "learner_visible") c.learner_visible++;
      if (s.lifecycle === "cleaned_ready") c.cleaned_ready++;
    }
    return c;
  }, [getState]);

  const update = useCallback((id: string, patch: Partial<ReviewState>) => {
    setReviews(prev => {
      const cur = prev[id] ?? DEFAULT_STATE;
      const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };
      return { ...prev, [id]: next };
    });
  }, []);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(reviews, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mizly-visual-review-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === "object") {
          setReviews(prev => ({ ...prev, ...parsed }));
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  const active = activeId ? REFS.find(r => r.id === activeId) ?? null : null;
  const activeState = active ? getState(active.id) : null;

  return (
    <>
      <Header title="Visual Review Viewer" subtitle="Admin-only triage of raw visual references" />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <nav className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
          <Link to="/admin" className="hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin
          </Link>
          <span>/</span>
          <Link to="/admin/visual-map" className="hover:underline">Visual map</Link>
          <span>/</span>
          <span className="text-foreground">Visual review viewer</span>
        </nav>

        <header className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" /> ADMIN ONLY
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Visual Review Viewer</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Triage every raw visual reference before any learner sees a cleaned Mizly version.
            Raw screenshots are never exposed to learners. If a reference contains names, PHI-looking data,
            org names, passwords, private links, or other sensitive details, mark <strong>needs blur</strong> or
            <strong> needs redraw</strong> and note exactly what to redact before a cleaned visual is published.
          </p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          <Stat label="Total refs" value={counts.total} />
          <Stat label="Reviewed" value={`${counts.reviewed} / ${counts.total}`} />
          <Stat label="Use" value={counts.use} />
          <Stat label="Needs blur" value={counts.needs_blur} />
          <Stat label="Needs redraw" value={counts.needs_redraw} />
          <Stat label="Skip" value={counts.skip} />
          <Stat label="Cleaned ready" value={counts.cleaned_ready} />
          <Stat label="Learner-visible" value={counts.learner_visible} />
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <label className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search id, section, source, aliases, pdf…"
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Select label="PDF" value={pdfFilter} onChange={setPdfFilter} options={[["all", "All PDFs"], ...PDFS.map(p => [p, p.replace("Mizly_Visual_Reference_", "").replace(".pdf", "")] as [string, string])]} />
              <Select label="Priority" value={priorityFilter} onChange={setPriorityFilter} options={[["all", "All"], ...PRIORITIES.map(p => [p, p] as [string, string])]} />
              <Select label="Decision" value={decisionFilter} onChange={v => setDecisionFilter(v as Decision | "all")} options={[["all", "All"], ...(Object.keys(DECISION_META) as Decision[]).map(d => [d, DECISION_META[d].label] as [string, string])]} />
              <Select label="Lifecycle" value={lifecycleFilter} onChange={v => setLifecycleFilter(v as Lifecycle | "all")} options={[["all", "All"], ...(Object.keys(LIFECYCLE_META) as Lifecycle[]).map(l => [l, LIFECYCLE_META[l].label] as [string, string])]} />
              <Select label="Cleaned needed" value={cleanedFilter} onChange={v => setCleanedFilter(v as "all" | "yes" | "no" | "unset")} options={[["all", "All"], ["yes", "Yes"], ["no", "No"], ["unset", "Unset"]]} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{filtered.length.toLocaleString()} of {REFS.length.toLocaleString()} references</span>
            <div className="flex gap-2">
              <button onClick={exportJson} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> Export reviews
              </button>
              <label className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-secondary cursor-pointer">
                <Upload className="h-3.5 w-3.5" /> Import
                <input type="file" accept="application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ""; }} />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Ref ID</th>
                  <th className="text-left px-3 py-2">Section / Source</th>
                  <th className="text-left px-3 py-2">PDF · page</th>
                  <th className="text-left px-3 py-2">Priority</th>
                  <th className="text-left px-3 py-2">Decision</th>
                  <th className="text-left px-3 py-2">Cleaned?</th>
                  <th className="text-left px-3 py-2">Lifecycle</th>
                  <th className="text-left px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(r => {
                  const s = getState(r.id);
                  const Dec = DECISION_META[s.decision];
                  return (
                    <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                      <td className="px-3 py-2 max-w-md">
                        <div className="font-medium truncate">{r.sectionTitle}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.sourceTitle} · src p.{r.sourcePage}</div>
                      </td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        {r.pdf.replace("Mizly_Visual_Reference_", "").replace(".pdf", "")} · p.{r.pdfPage}
                      </td>
                      <td className="px-3 py-2 text-xs">{r.priority}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${Dec.cls}`}>
                          <Dec.icon className="h-3 w-3" /> {Dec.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {s.cleanedNeeded === "unset" ? "—" : s.cleanedNeeded.toUpperCase()}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${LIFECYCLE_META[s.lifecycle].cls}`}>
                          {LIFECYCLE_META[s.lifecycle].label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => setActiveId(r.id)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pageRows.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground text-sm">No references match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="rounded border border-border px-2 py-1 disabled:opacity-40">Prev</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} className="rounded border border-border px-2 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        </section>

        {active && activeState && (
          <ReviewDrawer
            refRow={active}
            state={activeState}
            onClose={() => setActiveId(null)}
            onChange={(patch) => update(active.id, patch)}
          />
        )}
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="text-xs flex items-center gap-1">
      <span className="text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-2 py-1 text-xs max-w-[12rem]"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function ReviewDrawer({ refRow: ref, state, onClose, onChange }: {
  refRow: ReferenceRow;
  state: ReviewState;
  onClose: () => void;
  onChange: (patch: Partial<ReviewState>) => void;
}) {
  // Best-effort link to the combined review PDF page. Files don't ship in /public;
  // the URL is provided for admins who keep the PDFs locally / on a private bucket.
  const pdfHref = `/visual-references/${ref.pdf}#page=${ref.pdfPage}`;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <div
        className="bg-background w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl border border-border shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="sticky top-0 bg-background border-b border-border px-5 py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin review · raw reference not for learners
            </div>
            <h2 className="text-base font-semibold truncate">{ref.sectionTitle}</h2>
            <div className="text-xs text-muted-foreground truncate">
              <span className="font-mono">{ref.id}</span> · {ref.sourceTitle} · src p.{ref.sourcePage} · priority {ref.priority}
            </div>
          </div>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </header>

        <div className="p-5 space-y-5">
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Combined review PDF</div>
                <div className="font-medium">{ref.pdf} · page {ref.pdfPage}</div>
              </div>
              <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open PDF page
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-start gap-1">
              <EyeOff className="h-3 w-3 mt-0.5 shrink-0" />
              Raw screenshots stay admin-only. Learners only see cleaned, blurred, or redrawn Mizly visuals after approval.
            </p>
          </div>

          {ref.aliases && (
            <div className="text-xs">
              <div className="text-muted-foreground mb-1">Search aliases</div>
              <div className="rounded-md bg-secondary/40 px-3 py-2">{ref.aliases}</div>
            </div>
          )}

          <Field label="Decision">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(DECISION_META) as Decision[]).filter(d => d !== "unreviewed").map(d => {
                const M = DECISION_META[d];
                const active = state.decision === d;
                return (
                  <button
                    key={d}
                    onClick={() => onChange({ decision: d })}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${active ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-secondary"}`}
                  >
                    <M.icon className="h-3.5 w-3.5" /> {M.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Cleaned visual needed?">
            <div className="flex gap-2">
              {(["yes", "no", "unset"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => onChange({ cleanedNeeded: v })}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium ${state.cleanedNeeded === v ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-secondary"}`}
                >
                  {v === "unset" ? "Not set" : v.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Lifecycle">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LIFECYCLE_META) as Lifecycle[]).map(l => {
                const active = state.lifecycle === l;
                return (
                  <button
                    key={l}
                    onClick={() => onChange({ lifecycle: l })}
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium text-left ${active ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-secondary"}`}
                  >
                    {LIFECYCLE_META[l].label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              Only flip to <strong className="mx-1">Learner-visible</strong> after the cleaned/blurred/redrawn Mizly visual is approved.
            </p>
          </Field>

          <Field label="Notes — what to blur, redact, or redraw">
            <textarea
              value={state.notes}
              onChange={e => onChange({ notes: e.target.value })}
              rows={5}
              placeholder="e.g. blur patient name top-right, redact MRN row, redraw sidebar without org logo, remove email signature…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>

          {state.updatedAt && (
            <div className="text-[11px] text-muted-foreground">Last updated {new Date(state.updatedAt).toLocaleString()}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-foreground">{label}</div>
      {children}
    </div>
  );
}
