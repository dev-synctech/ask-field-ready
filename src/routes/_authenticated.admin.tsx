import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header, EmptyState } from "./_authenticated.learn";
import { Plus, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — At the Elbow Academy" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', u.user!.id);
    if (!(roles ?? []).some(r => r.role === 'admin')) throw redirect({ to: '/ask' });
  },
  component: AdminPage,
});

const TYPES = ['lesson', 'playbook', 'video', 'checklist', 'scenario'] as const;

function AdminPage() {
  const qc = useQueryClient();
  const { data: modules } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: async () => {
      const { data } = await supabase.from('modules').select('*').order('sort_order');
      return data ?? [];
    },
  });
  const { data: items } = useQuery({
    queryKey: ['admin-items'],
    queryFn: async () => {
      const { data } = await supabase.from('content_items').select('*').order('created_at', { ascending: false }).limit(100);
      return data ?? [];
    },
  });
  const { data: paidCount } = useQuery({
    queryKey: ['admin-paid-count'],
    queryFn: async () => {
      const { count } = await supabase.from('entitlements').select('*', { count: 'exact', head: true }).eq('status', 'active');
      return count ?? 0;
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from('content_items').insert({ ...payload, created_by: u.user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-items'] }),
  });
  const publish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase.from('content_items')
        .update({ publish_status: publish ? 'published' : 'draft' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-items'] }),
  });

  const [form, setForm] = useState({
    title: '', summary: '', content_type: 'lesson' as typeof TYPES[number],
    module_id: '', tags: '', difficulty: 'foundational' as 'foundational' | 'intermediate' | 'advanced',
    estimated_minutes: 5, transcript: '', body_md: '',
    sanitized_approved: false, admin_reviewed: false,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate({
      ...form,
      module_id: form.module_id || null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      publish_status: 'draft',
    });
    setForm({ ...form, title: '', summary: '', tags: '', transcript: '', body_md: '' });
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between gap-4">
        <Header title="Admin" subtitle="Create, review, publish." />
        <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
          <span className="text-muted-foreground">Paid members: </span>
          <span className="font-display font-semibold">{paidCount ?? 0}</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1"><ShieldCheck className="size-3.5" /> Content rules</div>
        No PHI. No vendor or organization names. No proprietary documentation. Confirm content is sanitized before publishing.
      </div>

      <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <div className="font-display font-semibold flex items-center gap-2"><Plus className="size-4 text-primary" /> New content</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title"><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} /></Field>
          <Field label="Type">
            <select value={form.content_type} onChange={e => setForm({ ...form, content_type: e.target.value as any })} className={inputCls}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Module">
            <select value={form.module_id} onChange={e => setForm({ ...form, module_id: e.target.value })} className={inputCls}>
              <option value="">— none —</option>
              {(modules ?? []).map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value as any })} className={inputCls}>
              <option value="foundational">foundational</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </Field>
          <Field label="Tags (comma)"><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="downtime, registration" className={inputCls} /></Field>
          <Field label="Est. minutes"><input type="number" value={form.estimated_minutes} onChange={e => setForm({ ...form, estimated_minutes: +e.target.value })} className={inputCls} /></Field>
        </div>
        <Field label="Summary"><textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} className={`${inputCls} h-20`} /></Field>
        <Field label="Body (markdown)"><textarea value={form.body_md} onChange={e => setForm({ ...form, body_md: e.target.value })} className={`${inputCls} h-32 font-mono text-xs`} /></Field>
        {form.content_type === 'video' && (
          <Field label="Transcript"><textarea value={form.transcript} onChange={e => setForm({ ...form, transcript: e.target.value })} className={`${inputCls} h-24`} /></Field>
        )}
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.sanitized_approved} onChange={e => setForm({ ...form, sanitized_approved: e.target.checked })} /> Sanitized (no PHI / vendor / org names)</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.admin_reviewed} onChange={e => setForm({ ...form, admin_reviewed: e.target.checked })} /> Reviewed</label>
        </div>
        <button disabled={create.isPending} className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-60">
          {create.isPending ? 'Saving…' : 'Save as draft'}
        </button>
        {create.isError && <div className="text-xs text-destructive">{(create.error as any)?.message}</div>}
      </form>

      <div className="mt-8">
        <div className="font-display font-semibold mb-3">Content ({(items ?? []).length})</div>
        <div className="space-y-2">
          {(items ?? []).map((it: any) => (
            <div key={it.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.content_type} · {it.difficulty}</div>
                <div className="text-sm font-medium truncate">{it.title}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${it.publish_status === 'published' ? 'bg-success/15 text-success' : 'bg-secondary text-secondary-foreground'}`}>
                {it.publish_status}
              </span>
              <button
                onClick={() => publish.mutate({ id: it.id, publish: it.publish_status !== 'published' })}
                disabled={!it.sanitized_approved && it.publish_status !== 'published'}
                title={!it.sanitized_approved ? 'Mark sanitized first' : ''}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40">
                {it.publish_status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          ))}
          {(items ?? []).length === 0 && (
            <EmptyState title="No content yet" desc="Use the form above to create your first item." />
          )}
        </div>
      </div>
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
