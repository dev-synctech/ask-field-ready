import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Archive, FileArchive,
  Search, ShieldAlert, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { GuardrailCard } from "@/components/GuardrailCard";
import {
  SOURCE_PACK_RISK_CLS,
  SOURCE_PACK_RISK_LABEL,
  SOURCE_PACK_STATUS_CLS,
  SOURCE_PACK_STATUS_LABEL,
  priorityTopics,
  useSourcePacks,
  type SourcePackRisk,
} from "@/lib/source-packs-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/source-packs")({
  head: () => ({ meta: [{ title: "Source Packs — Mizly Admin" }] }),
  component: SourcePacksPage,
});

const inputCls = "h-10 w-full rounded-xl border border-input bg-surface-elevated px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function SourcePacksPage() {
  const packs = useSourcePacks();
  const [q, setQ] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return packs;
    return packs.filter(pack => `${pack.title} ${pack.summary} ${pack.file_name}`.toLowerCase().includes(term));
  }, [packs, q]);

  const totals = useMemo(() => ({
    packs: packs.length,
    docs: packs.reduce((sum, pack) => sum + pack.docs_count, 0),
    transcripts: packs.reduce((sum, pack) => sum + pack.transcripts_count, 0),
    topics: packs.reduce((sum, pack) => sum + pack.topic_count, 0),
    quarantined: packs.filter(pack => pack.status === "quarantined").length,
  }), [packs]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 pb-16">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="size-3.5" /> Back to Admin
          </Link>
          <Header
            title="Source Packs"
            subtitle="Content factory intake. Track full source bundles, keep them quarantined, and convert only Mizly-safe drafts."
          />
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="h-10 w-full justify-center px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 shadow-soft sm:w-auto"
        >
          <Upload className="size-4" /> Register pack
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPI label="Packs" value={totals.packs} />
        <KPI label="Docs" value={totals.docs} />
        <KPI label="Transcripts" value={totals.transcripts} />
        <KPI label="Topics" value={totals.topics} />
        <KPI label="Quarantined" value={totals.quarantined} tone="danger" />
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
          <div className="font-semibold flex items-center gap-2 mb-1">
            <ShieldAlert className="size-3.5 text-warning" /> Factory rule
          </div>
          A source pack is never learner-facing. It feeds admin review, topic coverage, and Mizly-original conversion drafts only.
        </div>
        <GuardrailCard />
      </div>

      <div className="mt-6 relative">
        <label htmlFor="source-pack-search" className="sr-only">Search source packs</label>
        <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          id="source-pack-search"
          value={q}
          onChange={e => setQ(e.target.value)}
          className={`${inputCls} pl-9`}
          placeholder="Search source packs..."
        />
      </div>

      <div className="mt-4 space-y-4">
        {visible.map(pack => {
          const topics = priorityTopics(pack).slice(0, 5);
          return (
            <section key={pack.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-wider text-secondary-foreground">
                      <FileArchive className="size-3" /> Source pack
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${SOURCE_PACK_STATUS_CLS[pack.status]}`}>
                      {SOURCE_PACK_STATUS_LABEL[pack.status]}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${SOURCE_PACK_RISK_CLS[pack.risk]}`}>
                      {SOURCE_PACK_RISK_LABEL[pack.risk]}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-xl font-semibold tracking-tight break-words">{pack.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground break-words">{pack.summary}</p>
                </div>
                <Link
                  to="/admin/source-packs/$id"
                  params={{ id: pack.id }}
                  className="h-10 w-full justify-center px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 sm:w-auto"
                >
                  Open pack <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Mini label="Docs" value={pack.docs_count} />
                <Mini label="Transcripts" value={pack.transcripts_count} />
                <Mini label="Indexed artifacts" value={pack.indexed_artifacts} />
                <Mini label="Topics" value={pack.topic_count} />
              </div>

              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Priority conversions</div>
                <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {topics.map(topic => <TopicShortcut key={topic.id} topic={topic} />)}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No source packs match that search.
        </div>
      )}

      {showRegister && <RegisterPackDialog onClose={() => setShowRegister(false)} />}
    </div>
  );
}

function RegisterPackDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-elevated" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 font-display font-semibold">
          <Archive className="size-4 text-primary" /> Register source pack
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo build note: the 2026-06-03 source package is already indexed from the local intake notes.
          In production this will upload to private storage, scan server-side, and create a quarantined pack record.
        </p>
        <div className="mt-4 rounded-2xl border border-border bg-surface-elevated p-4 text-xs text-foreground/80">
          Upload target: private admin storage only. Ask, Learn, Playbooks, Scenarios, Videos, and Checklists cannot read raw source packs.
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-sm">Close</button>
          <button
            onClick={() => {
              toast.success("Source pack already registered", { description: "Open the 2026-06-03 pack to start conversion." });
              onClose();
            }}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function TopicShortcut({ topic }: { topic: { id: string; label: string; priority: number; artifacts: number; conversion_id?: string } }) {
  const cls = "rounded-xl border border-border bg-surface-elevated p-3 hover:border-primary/30 hover:shadow-soft transition";
  const body = (
    <>
      <div className="text-[10px] font-mono text-primary">P{topic.priority}</div>
      <div className="mt-1 text-sm font-medium leading-snug">{topic.label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{topic.artifacts} artifacts</div>
    </>
  );

  if (topic.conversion_id) {
    return (
      <Link to="/admin/conversions/$id" params={{ id: topic.conversion_id }} className={cls}>
        {body}
      </Link>
    );
  }

  return (
    <Link to="/admin/conversions" className={cls}>
      {body}
    </Link>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "danger" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-semibold ${tone === "danger" ? "text-destructive" : "text-foreground"}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-3 py-2 min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}
