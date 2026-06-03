import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, ShieldCheck, Users, Tag, Edit3, Eye, FileText, Check, Trash2, X, Search,
  GripVertical, ListChecks, ClipboardCheck, FolderInput, Tags, Info, HelpCircle,
  BarChart3, MessageSquare, GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import {
  ITEMS, MODULES, CHECKLIST_ITEMS, SCENARIO_DETAIL,
  type ContentItem, type ContentType, type ChecklistItem,
} from "@/lib/demo-data";
import {
  useTaxonomy, labelFor,
  type TaxonomyCategory,
} from "@/lib/taxonomy";
import { Header, EmptyState } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Mizly" }] }),
  component: AdminPage,
});

const TYPES: ContentType[] = ["lesson", "playbook", "video", "checklist", "scenario"];
type PublishFilter = "all" | "published" | "draft";

type EditorialStatus =
  | "Draft"
  | "Needs sanitized approval"
  | "Ready to publish"
  | "Published"
  | "Needs rewrite"
  | "Needs review";

const STATUS_FILTERS: ("all" | EditorialStatus)[] = [
  "all",
  "Draft",
  "Needs sanitized approval",
  "Ready to publish",
  "Published",
  "Needs rewrite",
  "Needs review",
];

function editorialStatus(it: ContentItem): EditorialStatus {
  if (it.publish_status === "published") return "Published";
  if (!it.sanitized_approved) return "Needs sanitized approval";
  return "Ready to publish";
}

const STATUS_CLS: Record<EditorialStatus, string> = {
  "Draft":                       "bg-secondary text-secondary-foreground",
  "Needs sanitized approval":    "bg-warning/15 text-warning",
  "Ready to publish":            "bg-primary-soft text-primary",
  "Published":                   "bg-success/15 text-success",
  "Needs rewrite":               "bg-destructive/15 text-destructive",
  "Needs review":                "bg-accent text-accent-foreground",
};


interface EditorForm {
  title: string;
  summary: string;
  content_type: ContentType;
  module_id: string;
  tags: string;
  difficulty: ContentItem["difficulty"];
  estimated_minutes: number;
  body_md: string;
  transcript: string;
  sanitized: boolean;
  role_id: string;
  domain_id: string;
  phase_id: string;
  urgency_id: string;
  escalation_id: string;
  frequency_id: string;
  checklistItems: ChecklistItem[];
  scenarioSteps: { title: string; body: string }[];
}

const EMPTY_FORM: EditorForm = {
  title: "", summary: "", content_type: "lesson",
  module_id: "", tags: "", difficulty: "foundational",
  estimated_minutes: 5, body_md: "", transcript: "",
  sanitized: false,
  role_id: "", domain_id: "", phase_id: "",
  urgency_id: "", escalation_id: "", frequency_id: "",
  checklistItems: [],
  scenarioSteps: [],
};

function AdminPage() {
  // TODO: REMOVE BEFORE PRODUCTION LAUNCH — admin uses in-memory mock content.
  const taxonomy = useTaxonomy();
  const [items, setItems] = useState<ContentItem[]>(ITEMS);
  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [pubFilter, setPubFilter] = useState<PublishFilter>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | EditorialStatus>("all");
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<ContentItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ContentItem | null>(null);
  const [form, setForm] = useState<EditorForm>(EMPTY_FORM);

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);

    const meta = {
      role_id: form.role_id || undefined,
      domain_id: form.domain_id || undefined,
      phase_id: form.phase_id || undefined,
      urgency_id: form.urgency_id || undefined,
      escalation_id: form.escalation_id || undefined,
      frequency_id: form.frequency_id || undefined,
      sanitized_approved: form.sanitized,
    };

    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? {
        ...i,
        title: form.title.trim(),
        summary: form.summary.trim(),
        content_type: form.content_type,
        module_id: form.module_id || null,
        difficulty: form.difficulty,
        estimated_minutes: form.estimated_minutes,
        tags,
        body_md: form.body_md,
        transcript: form.transcript,
        ...meta,
      } : i));
      toast.success(form.sanitized ? "Changes saved (sanitized approved)" : "Draft saved");
    } else {
      const id = `n_${Date.now()}`;
      setItems(prev => [{
        id,
        title: form.title.trim(),
        summary: form.summary.trim(),
        content_type: form.content_type,
        tags,
        difficulty: form.difficulty,
        estimated_minutes: form.estimated_minutes,
        module_id: form.module_id || null,
        publish_status: "draft",
        body_md: form.body_md,
        transcript: form.transcript,
        ...meta,
      }, ...prev]);
      toast.success("Draft created");
    }
    resetForm();
  }

  function startEdit(it: ContentItem) {
    setEditingId(it.id);
    setForm({
      title: it.title, summary: it.summary, content_type: it.content_type,
      module_id: it.module_id ?? "", tags: it.tags.join(", "),
      difficulty: it.difficulty, estimated_minutes: it.estimated_minutes,
      body_md: it.body_md ?? "", transcript: it.transcript ?? "",
      sanitized: it.sanitized_approved ?? false,
      role_id: it.role_id ?? "",
      domain_id: it.domain_id ?? "",
      phase_id: it.phase_id ?? "",
      urgency_id: it.urgency_id ?? "",
      escalation_id: it.escalation_id ?? "",
      frequency_id: it.frequency_id ?? "",
      checklistItems: CHECKLIST_ITEMS[it.id] ?? [],
      scenarioSteps: SCENARIO_DETAIL[it.id]?.first90.map((b, i) => ({ title: `Step ${i + 1}`, body: b })) ?? [],
    });
    if (typeof document !== "undefined") {
      document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function togglePublish(id: string) {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      // Publishing requires sanitized_approved. Unpublishing is always allowed.
      if (i.publish_status === "draft" && !i.sanitized_approved) {
        toast.error("Sanitized approval required to publish. Edit and confirm 'sanitized approved'.");
        return i;
      }
      return { ...i, publish_status: i.publish_status === "published" ? "draft" : "published" };
    }));
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirmDelete(null);
    if (editingId === id) resetForm();
    toast.success("Content deleted");
  }

  const visible = useMemo(() => {
    const tk = q.trim().toLowerCase();
    return items.filter(i => {
      if (typeFilter !== "all" && i.content_type !== typeFilter) return false;
      if (pubFilter !== "all" && i.publish_status !== pubFilter) return false;
      if (statusFilter !== "all" && editorialStatus(i) !== statusFilter) return false;
      if (tk) {
        const hay = `${i.title} ${i.summary} ${i.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(tk)) return false;
      }
      return true;
    });
  }, [items, typeFilter, pubFilter, statusFilter, q]);

  const counts = useMemo(() => ({
    total: items.length,
    published: items.filter(i => i.publish_status === "published").length,
    drafts: items.filter(i => i.publish_status === "draft").length,
  }), [items]);

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Header title="Admin" subtitle="Create, sanitize, tag, and publish Mizly-original support content." />
        <a href="#editor" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-soft">
          <Plus className="size-4" /> New content
        </a>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <KPI label="Total content" value={counts.total} />
        <KPI label="Published" value={counts.published} tone="teal" />
        <KPI label="Drafts" value={counts.drafts} tone="muted" />
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
        <AdminTile to="/admin/conversions" icon={GitBranch} title="Source conversion queue" desc="Sanitize and route raw sources into Mizly content." />
        <AdminTile to="/admin/feedback" icon={MessageSquare} title="Feedback" desc="Answers learners marked unhelpful or missing." />
        <AdminTile to="/admin/coverage" icon={BarChart3} title="Coverage" desc="Where the library is thin across roles and phases." />
        <AdminTile to="/admin/sources" icon={FolderInput} title="Source library" desc="Admin-only raw source material." />
        <AdminTile to="/admin/questions" icon={HelpCircle} title="Question bank" desc="Curated questions and their routed answers." />
        <AdminTile to="/admin/taxonomy" icon={Tags} title="Taxonomy" desc="Roles, domains, phases, urgency, escalation." />
        <AdminTile to="/admin/users" icon={Users} title="Users" desc="Roles and access." />
      </div>


      <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground/80 flex gap-2">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div>Taxonomy controls how Mizly routes questions, filters content, and later powers Ask retrieval.</div>
      </div>

      <div className="mt-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1"><ShieldCheck className="size-3.5 text-warning" /> Content rules</div>
        No PHI. No learner-facing vendor names or organization names. No vendor screenshots or logos. No copied proprietary training text. Drafts save anytime — publishing requires sanitized approval.
      </div>

      {/* Editor */}
      <form id="editor" onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-display font-semibold flex items-center gap-2">
            <Edit3 className="size-4 text-primary" /> {editingId ? "Edit content" : "Content editor"}
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <X className="size-3.5" /> Cancel edit
            </button>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title"><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Escalation in 3 sentences" /></Field>
          <Field label="Type">
            <select value={form.content_type} onChange={e => setForm({ ...form, content_type: e.target.value as ContentType })} className={inputCls}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Module">
            <select value={form.module_id} onChange={e => setForm({ ...form, module_id: e.target.value })} className={inputCls}>
              <option value="">— none —</option>
              {MODULES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value as ContentItem["difficulty"] })} className={inputCls}>
              <option value="foundational">foundational</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </Field>
          <Field label="Tags (comma)"><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="downtime, registration" className={inputCls} /></Field>
          <Field label="Est. minutes"><input type="number" min={1} value={form.estimated_minutes} onChange={e => setForm({ ...form, estimated_minutes: +e.target.value })} className={inputCls} /></Field>
          <TaxSelect label="Role" cat="roles" value={form.role_id} onChange={v => setForm({ ...form, role_id: v })} taxonomy={taxonomy} />
          <TaxSelect label="Domain" cat="domains" value={form.domain_id} onChange={v => setForm({ ...form, domain_id: v })} taxonomy={taxonomy} />
          <TaxSelect label="Phase" cat="phases" value={form.phase_id} onChange={v => setForm({ ...form, phase_id: v })} taxonomy={taxonomy} />
          <TaxSelect label="Urgency" cat="urgency" value={form.urgency_id} onChange={v => setForm({ ...form, urgency_id: v })} taxonomy={taxonomy} />
          <TaxSelect label="Escalation" cat="escalation" value={form.escalation_id} onChange={v => setForm({ ...form, escalation_id: v })} taxonomy={taxonomy} />
          <TaxSelect label="Frequency" cat="frequency" value={form.frequency_id} onChange={v => setForm({ ...form, frequency_id: v })} taxonomy={taxonomy} />
        </div>
        <Field label="Summary"><textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} className={`${inputCls} h-20 py-2`} placeholder="One sentence." /></Field>
        <Field label="Body (markdown)"><textarea value={form.body_md} onChange={e => setForm({ ...form, body_md: e.target.value })} className={`${inputCls} h-28 py-2 font-mono text-xs`} placeholder="## Heading&#10;Body…" /></Field>

        {form.content_type === "video" && (
          <Field label="Transcript">
            <textarea value={form.transcript} onChange={e => setForm({ ...form, transcript: e.target.value })} className={`${inputCls} h-24 py-2`} placeholder="Full spoken transcript — used in transcript search." />
          </Field>
        )}

        {form.content_type === "checklist" && (
          <div>
            <div className="text-[11px] font-medium text-foreground/80 mb-1.5 inline-flex items-center gap-1.5">
              <ClipboardCheck className="size-3.5 text-primary" /> Checklist items
            </div>
            <ItemBuilder
              items={form.checklistItems}
              placeholder="e.g. Badge visible"
              onAdd={(text) => setForm({ ...form, checklistItems: [...form.checklistItems, { id: crypto.randomUUID(), text }] })}
              onRemove={(id) => setForm({ ...form, checklistItems: form.checklistItems.filter(c => c.id !== id) })}
            />
          </div>
        )}

        {form.content_type === "scenario" && (
          <div>
            <div className="text-[11px] font-medium text-foreground/80 mb-1.5 inline-flex items-center gap-1.5">
              <ListChecks className="size-3.5 text-primary" /> Scenario steps
            </div>
            <StepBuilder
              steps={form.scenarioSteps}
              onAdd={(title, body) => setForm({ ...form, scenarioSteps: [...form.scenarioSteps, { title, body }] })}
              onRemove={(i) => setForm({ ...form, scenarioSteps: form.scenarioSteps.filter((_, idx) => idx !== i) })}
            />
          </div>
        )}

        <label className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
          <input type="checkbox" checked={form.sanitized} onChange={e => setForm({ ...form, sanitized: e.target.checked })} className="mt-0.5 size-4 accent-primary" />
          <div className="text-xs">
            <div className="font-medium">Sanitized approved</div>
            <div className="text-muted-foreground">I confirm no PHI, vendor names, or organization names appear in this content.</div>
            <div className="mt-1 text-[11px] text-muted-foreground italic">Drafts can be saved anytime. Publishing to Mizly requires sanitized approval.</div>
          </div>
        </label>

        <div className="flex justify-end gap-2">
          <button type="submit" className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-50">
            <Check className="size-4" /> {editingId ? "Save changes" : "Save as draft"}
          </button>
        </div>
      </form>

      {/* Filters + search */}
      <div className="mt-8 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <label htmlFor="admin-search" className="sr-only">Search content</label>
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input id="admin-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search title, summary, tag…"
            className="h-9 w-64 pl-8 pr-3 rounded-lg border border-input bg-surface-elevated text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", ...TYPES] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t as any)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${typeFilter === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-secondary'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {(["all", "published", "draft"] as const).map(p => (
            <button key={p} onClick={() => setPubFilter(p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${pubFilter === p ? 'bg-foreground text-background border-foreground' : 'bg-card border-border hover:bg-secondary'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mr-1">Status</span>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s as any)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statusFilter === s ? 'bg-foreground text-background border-foreground' : 'bg-card border-border hover:bg-secondary'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 font-display font-semibold">Content ({visible.length})</div>

      <div className="mt-2 space-y-2">
        {visible.map(it => (
          <div key={it.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 flex-wrap hover:shadow-soft transition-shadow">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.content_type} · {it.difficulty}</div>
              <div className="text-sm font-medium truncate">{it.title}</div>
              <TaxBadges item={it} />
              {it.tags.length > 0 && (
                <div className="mt-1 flex items-center gap-1 flex-wrap">
                  <Tag className="size-3 text-muted-foreground" />
                  {it.tags.slice(0, 4).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CLS[editorialStatus(it)]}`}>
              {editorialStatus(it)}
            </span>
            <button onClick={() => setPreview(it)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
              <Eye className="size-3.5" /> Preview
            </button>
            <button onClick={() => startEdit(it)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
              <Edit3 className="size-3.5" /> Edit
            </button>
            <button onClick={() => togglePublish(it.id)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">
              {it.publish_status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button onClick={() => setConfirmDelete(it)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive inline-flex items-center gap-1.5">
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        ))}
        {visible.length === 0 && <EmptyState title="Nothing matches" desc="Try a different search or filter." />}
      </div>

      {preview && (
        <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{preview.content_type} · {preview.difficulty} · {preview.estimated_minutes} min</div>
                <div className="mt-1 font-display font-semibold text-xl">{preview.title}</div>
              </div>
              <button onClick={() => setPreview(null)} aria-label="Close" className="size-8 rounded-lg hover:bg-secondary inline-flex items-center justify-center">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{preview.summary}</p>
            <TaxBadges item={preview} className="mt-2" />
            {preview.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {preview.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{t}</span>)}
              </div>
            )}
            {preview.body_md && (
              <div className="mt-4 rounded-xl bg-secondary/60 p-4 whitespace-pre-wrap font-mono text-xs">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  <FileText className="size-3" /> Body
                </div>
                {preview.body_md}
              </div>
            )}
            {preview.transcript && (
              <div className="mt-3 rounded-xl bg-secondary/60 p-4 text-sm">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  <FileText className="size-3" /> Transcript
                </div>
                {preview.transcript}
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <button onClick={() => { startEdit(preview); setPreview(null); }} className="flex-1 h-11 rounded-xl border border-border bg-card text-sm font-medium inline-flex items-center justify-center gap-1.5">
                <Edit3 className="size-4" /> Edit
              </button>
              <button onClick={() => setPreview(null)} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-card rounded-2xl border border-border shadow-elevated w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="font-display font-semibold">Delete this item?</div>
            <p className="mt-1 text-sm text-muted-foreground">"{confirmDelete.title}" will be removed from the demo list.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-xl border border-border text-sm">Cancel</button>
              <button onClick={() => remove(confirmDelete.id)} className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaxSelect({ label, cat, value, onChange, taxonomy }: {
  label: string;
  cat: TaxonomyCategory;
  value: string;
  onChange: (v: string) => void;
  taxonomy: ReturnType<typeof useTaxonomy>;
}) {
  const id = `tax_${cat}`;
  return (
    <label htmlFor={id} className="block">
      <span className="text-[11px] font-medium text-foreground/80 mb-1 block">{label}</span>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
        <option value="">— none —</option>
        {taxonomy[cat].map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
    </label>
  );
}

function TaxBadges({ item, className = "" }: { item: ContentItem; className?: string }) {
  const pairs: { tone: string; label: string }[] = [];
  const role = labelFor("roles", item.role_id); if (role) pairs.push({ tone: "bg-primary/10 text-primary", label: role });
  const domain = labelFor("domains", item.domain_id); if (domain) pairs.push({ tone: "bg-accent/15 text-accent-foreground", label: domain });
  const phase = labelFor("phases", item.phase_id); if (phase) pairs.push({ tone: "bg-secondary text-secondary-foreground", label: phase });
  const urgency = labelFor("urgency", item.urgency_id); if (urgency) pairs.push({ tone: "bg-warning/15 text-warning", label: `Urgency ${urgency}` });
  const escalation = labelFor("escalation", item.escalation_id); if (escalation) pairs.push({ tone: "bg-destructive/10 text-destructive", label: `Escalation ${escalation}` });
  const freq = labelFor("frequency", item.frequency_id); if (freq) pairs.push({ tone: "bg-secondary text-secondary-foreground", label: `Freq ${freq}` });
  if (pairs.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {pairs.map((p, i) => (
        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full ${p.tone}`}>{p.label}</span>
      ))}
    </div>
  );
}

function ItemBuilder({ items, placeholder, onAdd, onRemove }: {
  items: ChecklistItem[];
  placeholder: string;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const add = () => { if (text.trim()) { onAdd(text.trim()); setText(""); } };
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-3">
      {items.length > 0 && (
        <ul className="space-y-1.5 mb-2">
          {items.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2">
              <GripVertical className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0">{i + 1}.</span>
              <span className="text-sm flex-1 min-w-0 truncate">{c.text}</span>
              <button type="button" onClick={() => onRemove(c.id)} aria-label="Remove" className="size-6 rounded-md hover:bg-destructive/10 hover:text-destructive inline-flex items-center justify-center">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <label htmlFor="builder-item-input" className="sr-only">{placeholder}</label>
        <input id="builder-item-input" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} className={`${inputCls} h-9`} />
        <button type="button" onClick={add} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5">
          <Plus className="size-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

function StepBuilder({ steps, onAdd, onRemove }: {
  steps: { title: string; body: string }[];
  onAdd: (title: string, body: string) => void;
  onRemove: (i: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const add = () => { if (title.trim() && body.trim()) { onAdd(title.trim(), body.trim()); setTitle(""); setBody(""); } };
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-3 space-y-2">
      {steps.length > 0 && (
        <ol className="space-y-1.5">
          {steps.map((s, i) => (
            <li key={i} className="rounded-lg bg-card border border-border px-3 py-2 flex items-start gap-2">
              <div className="size-6 shrink-0 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center mt-0.5">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{s.body}</div>
              </div>
              <button type="button" onClick={() => onRemove(i)} aria-label="Remove" className="size-6 rounded-md hover:bg-destructive/10 hover:text-destructive inline-flex items-center justify-center">
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ol>
      )}
      <label htmlFor="step-title" className="sr-only">Step title</label>
      <input id="step-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Step title" className={`${inputCls} h-9`} />
      <label htmlFor="step-body" className="sr-only">Step body</label>
      <textarea id="step-body" value={body} onChange={e => setBody(e.target.value)} placeholder="Step body" className={`${inputCls} h-16 py-2`} />
      <button type="button" onClick={add} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5">
        <Plus className="size-3.5" /> Add step
      </button>
    </div>
  );
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-input bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-foreground/80">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "success" | "muted" }) {
  const cls = tone === "success" ? "text-success" : tone === "muted" ? "text-muted-foreground" : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-2xl ${cls}`}>{value}</div>
    </div>
  );
}

function AdminTile({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to as any} className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-border-strong hover:shadow-soft transition-all">
      <div className="size-9 rounded-lg bg-secondary text-foreground/70 flex items-center justify-center group-hover:text-teal shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</div>
      </div>
    </Link>
  );
}
