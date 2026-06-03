import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, BarChart3, CheckCircle2, FileArchive, GitBranch,
  Layers, ShieldAlert, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { GuardrailCard } from "@/components/GuardrailCard";
import {
  SOURCE_PACK_RISK_CLS,
  SOURCE_PACK_RISK_LABEL,
  SOURCE_PACK_STATUS_CLS,
  SOURCE_PACK_STATUS_LABEL,
  getSourcePack,
  priorityTopics,
  type SourcePackTopic,
} from "@/lib/source-packs-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/source-packs_/$id")({
  head: () => ({ meta: [{ title: "Source Pack — Mizly Admin" }] }),
  component: SourcePackDetailPage,
});

function SourcePackDetailPage() {
  const { id } = useParams({ from: "/_authenticated/admin_/source-packs_/$id" });
  const pack = getSourcePack(id);

  if (!pack) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/admin/source-packs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to source packs
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold">Source pack not found</h1>
      </div>
    );
  }

  const sortedTopics = priorityTopics(pack);
  const highestPriority = sortedTopics.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 pb-16">
      <Link to="/admin/source-packs" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to source packs
      </Link>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <Header title={pack.title} subtitle="Quarantined source-pack workspace. Convert topics into Mizly-original drafts only." />
        </div>
        <Link to="/admin/conversions" className="h-10 w-full justify-center px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 shadow-soft sm:w-auto">
          <GitBranch className="size-4" /> Conversion queue
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft min-w-0">
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

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/85 break-words">{pack.summary}</p>
        <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
          <div className="font-semibold flex items-center gap-2 mb-1">
            <ShieldAlert className="size-3.5 text-warning" /> Quarantine posture
          </div>
          {pack.source_location_note}
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          <Mini label="Docs" value={pack.docs_count} />
          <Mini label="Transcripts" value={pack.transcripts_count} />
          <Mini label="Indexed" value={pack.indexed_artifacts} />
          <Mini label="Topics" value={pack.topic_count} />
          <Mini label="Schema" value={pack.schema_detected ? "Found" : "Missing"} />
          <Mini label="Gap report" value={pack.gap_report_detected ? "Found" : "Missing"} />
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_0.95fr] gap-4">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft min-w-0">
          <div className="font-display font-semibold flex items-center gap-2">
            <TriangleAlert className="size-4 text-warning" /> Risk signals
          </div>
          <div className="mt-3 space-y-2">
            {pack.risk_signals.map(signal => (
              <div key={signal.category} className="rounded-2xl border border-border bg-surface-elevated p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{signal.category}</div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${SOURCE_PACK_RISK_CLS[signal.severity]}`}>
                    {signal.count.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{signal.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 min-w-0">
          <GuardrailCard />
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="font-display font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Publish gates
            </div>
            <ul className="mt-3 space-y-2">
              {pack.guardrails.map(rule => (
                <li key={rule} className="flex gap-2 text-xs text-foreground/80">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-display font-semibold flex items-center gap-2">
              <Layers className="size-4 text-primary" /> Highest-priority conversions
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Start here for the fastest learner value.</p>
          </div>
          <Link to="/admin/conversions" className="text-xs text-primary hover:underline">View all conversions</Link>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {highestPriority.map(topic => <TopicCard key={topic.id} topic={topic} featured />)}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft min-w-0">
        <div className="font-display font-semibold flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" /> Topic matrix
        </div>
        <div className="mt-4 max-w-full overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium">Topic</th>
                <th className="py-2 px-3 text-left font-medium">Coverage</th>
                <th className="py-2 px-3 text-left font-medium">Artifacts</th>
                <th className="py-2 px-3 text-left font-medium">Recommended output</th>
                <th className="py-2 pl-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedTopics.map(topic => (
                <tr key={topic.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-3">
                    <div className="font-medium text-foreground">{topic.label}</div>
                    <div className="mt-0.5 text-muted-foreground">{topic.note}</div>
                  </td>
                  <td className="py-3 px-3"><CoverageBadge coverage={topic.coverage} /></td>
                  <td className="py-3 px-3">{topic.artifacts}</td>
                  <td className="py-3 px-3 text-muted-foreground">{topic.recommended_outputs.join(", ")}</td>
                  <td className="py-3 pl-3 text-right">
                    <ConversionLink topic={topic} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft min-w-0">
        <div className="font-display font-semibold">Thin topics to source later</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {pack.thin_topics.map(topic => (
            <span key={topic} className="rounded-full bg-warning/15 px-2.5 py-1 text-xs text-warning">{topic}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function TopicCard({ topic, featured }: { topic: SourcePackTopic; featured?: boolean }) {
  return (
    <div className={`rounded-2xl border ${featured ? "border-primary/25 bg-primary-soft/35" : "border-border bg-surface-elevated"} p-4 min-w-0`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-mono text-primary">P{topic.priority}</div>
        <CoverageBadge coverage={topic.coverage} />
      </div>
      <div className="mt-2 font-display font-semibold leading-snug break-words">{topic.label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{topic.artifacts} artifacts</div>
      <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{topic.note}</p>
      <ConversionLink topic={topic} block />
    </div>
  );
}

function ConversionLink({ topic, block }: { topic: SourcePackTopic; block?: boolean }) {
  if (topic.conversion_id) {
    return (
      <Link
        to="/admin/conversions/$id"
        params={{ id: topic.conversion_id }}
        className={`${block ? "mt-3 w-full justify-center" : ""} inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground`}
      >
        Convert <ArrowRight className="size-3.5" />
      </Link>
    );
  }

  return (
    <Link
      to="/admin/conversions"
      className={`${block ? "mt-3 w-full justify-center" : ""} inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium`}
    >
      Queue <ArrowRight className="size-3.5" />
    </Link>
  );
}

function CoverageBadge({ coverage }: { coverage: SourcePackTopic["coverage"] }) {
  const cls =
    coverage === "rich" ? "bg-success/15 text-success"
      : coverage === "solid" ? "bg-primary-soft text-primary"
        : "bg-warning/15 text-warning";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>{coverage}</span>;
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-3 py-2 min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display font-semibold">{typeof value === "number" ? value.toLocaleString() : value}</div>
    </div>
  );
}
