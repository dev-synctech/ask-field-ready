import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ShieldCheck, Users, Tag, Edit3, Eye, FileText, Check } from "lucide-react";
import { ITEMS, MODULES, type ContentItem, type ContentType } from "@/lib/demo-data";
import { Header, EmptyState } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — At the Elbow Academy" }] }),
  component: AdminPage,
});

const TYPES: ContentType[] = ["lesson", "playbook", "video", "checklist", "scenario"];

function AdminPage() {
  // TODO: REMOVE BEFORE PRODUCTION LAUNCH — admin uses in-memory mock content.
  const [items, setItems] = useState<ContentItem[]>(ITEMS);
  const [filter, setFilter] = useState<ContentType | "all">("all");
  const [preview, setPreview] = useState<ContentItem | null>(null);

  const [form, setForm] = useState({
    title: "", summary: "", content_type: "lesson" as ContentType,
    module_id: "", tags: "", difficulty: "foundational" as ContentItem["difficulty"],
    estimated_minutes: 5, body_md: "", transcript: "",
  });

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const id = `n_${Date.now()}`;
    setItems(prev => [{
      id,
      title: form.title.trim(),
      summary: form.summary.trim(),
      content_type: form.content_type,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      difficulty: form.difficulty,
      estimated_minutes: form.estimated_minutes,
      module_id: form.module_id || null,
      publish_status: "draft",
      body_md: form.body_md,
      transcript: form.transcript,
    }, ...prev]);
    setForm({ ...form, title: "", summary: "", tags: "", body_md: "", transcript: "" });
  }

  function togglePublish(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, publish_status: i.publish_status === "published" ? "draft" : "published" } : i));
  }

  const visible = useMemo(() => filter === "all" ? items : items.filter(i => i.content_type === filter), [items, filter]);
  const counts = useMemo(() => ({
    total: items.length,
    published: items.filter(i => i.publish_status === "published").length,
    drafts: items.filter(i => i.publish_status === "draft").length,
  }), [items]);

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Header title="Admin" subtitle="Create, tag, and publish — preview mode." />
        <div className="flex items-center gap-2">
          <Link to="/admin/users" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary">
            <Users className="size-4" /> Users
          </Link>
          <a href="#editor" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus className="size-4" /> New content
          </a>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <KPI label="Total content" value={counts.total} />
        <KPI label="Published" value={counts.published} tone="success" />
        <KPI label="Drafts" value={counts.drafts} tone="muted" />
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1"><ShieldCheck className="size-3.5 text-warning" /> Content rules</div>
        No PHI. No vendor or organization names. No proprietary documentation. Confirm content is sanitized before publishing.
      </div>

      {/* Editor */}
      <form id="editor" onSubmit={create} className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <div className="font-display font-semibold flex items-center gap-2"><Edit3 className="size-4 text-primary" /> Content editor</div>
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
        </div>
        <Field label="Summary"><textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} className={`${inputCls} h-20 py-2`} placeholder="One sentence." /></Field>
        <Field label="Body (markdown)"><textarea value={form.body_md} onChange={e => setForm({ ...form, body_md: e.target.value })} className={`${inputCls} h-28 py-2 font-mono text-xs`} placeholder="## Heading\nBody…" /></Field>
        {form.content_type === "video" && (
          <Field label="Transcript"><textarea value={form.transcript} onChange={e => setForm({ ...form, transcript: e.target.value })} className={`${inputCls} h-24 py-2`} /></Field>
        )}
        <div className="flex justify-end gap-2">
          <button type="submit" className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2">
            <Check className="size-4" /> Save as draft
          </button>
        </div>
      </form>

      {/* Filters + list */}
      <div className="mt-8 flex items-center gap-2 flex-wrap">
        {(["all", ...TYPES] as const).map(t => (
          <button key={t} onClick={() => setFilter(t as any)}
            className={`text-xs px-3 py-1.5 rounded-full border ${filter === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-secondary'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 font-display font-semibold">Content ({visible.length})</div>
      <div className="mt-2 space-y-2">
        {visible.map(it => (
          <div key={it.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.content_type} · {it.difficulty}</div>
              <div className="text-sm font-medium truncate">{it.title}</div>
              {it.tags.length > 0 && (
                <div className="mt-1 flex items-center gap-1 flex-wrap">
                  <Tag className="size-3 text-muted-foreground" />
                  {it.tags.slice(0, 4).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${it.publish_status === "published" ? "bg-success/15 text-success" : "bg-secondary text-secondary-foreground"}`}>
              {it.publish_status}
            </span>
            <button onClick={() => setPreview(it)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5">
              <Eye className="size-3.5" /> Preview
            </button>
            <button onClick={() => togglePublish(it.id)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">
              {it.publish_status === "published" ? "Unpublish" : "Publish"}
            </button>
          </div>
        ))}
        {visible.length === 0 && <EmptyState title="No content yet" desc="Use the editor above to create your first item." />}
      </div>

      {preview && (
        <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{preview.content_type} · {preview.difficulty}</div>
            <div className="mt-1 font-display font-semibold text-xl">{preview.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{preview.summary}</p>
            {preview.body_md && (
              <div className="mt-4 rounded-xl bg-secondary/60 p-4 text-sm whitespace-pre-wrap font-mono text-xs">
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
            <button onClick={() => setPreview(null)} className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Close</button>
          </div>
        </div>
      )}
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
