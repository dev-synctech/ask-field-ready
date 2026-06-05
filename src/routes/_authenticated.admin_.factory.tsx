import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Edit3, Eye, FileArchive,
  GitBranch, ShieldCheck, Sparkles,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useConversions, RISK_CLS, RISK_LABEL, STATUS_CLS, STATUS_LABEL, TYPE_LABEL } from "@/lib/conversions-data";
import { useSourcePacks } from "@/lib/source-packs-data";
import {
  buildFactorySnapshot,
  mergeVisualNeeds,
  readAskGapLog,
  type VisualNeed,
  type FactoryStage,
} from "@/lib/content-factory";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/factory")({
  head: () => ({ meta: [{ title: "Content Factory — Mizly Admin" }] }),
  component: ContentFactoryPage,
});

function ContentFactoryPage() {
  const conversions = useConversions();
  const sourcePacks = useSourcePacks();
  const [askGapLog, setAskGapLog] = useState(() => readAskGapLog());

  useEffect(() => {
    setAskGapLog(readAskGapLog());
  }, []);

  const visualNeeds = useMemo(() => mergeVisualNeeds(askGapLog), [askGapLog]);
  const snapshot = useMemo(
    () => buildFactorySnapshot(conversions, sourcePacks, visualNeeds),
    [conversions, sourcePacks, visualNeeds],
  );

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to Admin
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <Header title="Content Factory" subtitle="Move source material from intake to sanitized Mizly-original content." />
        <Link
          to="/admin/visual-needs"
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 shadow-soft"
        >
          <Eye className="size-4" /> Visual queue
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPI label="Source packs" value={snapshot.kpis.sourcePacks} tone="primary" />
        <KPI label="Queued sources" value={snapshot.kpis.queuedSources} tone="warning" />
        <KPI label="Visual needs" value={snapshot.kpis.visualNeeds} tone="danger" />
        <KPI label="Published" value={snapshot.kpis.publishedItems} tone="success" />
        <KPI label="Thin gaps" value={snapshot.kpis.thinModules} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-display font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Production pipeline
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">admin-only workflow</span>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {snapshot.stages.map(stage => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-display font-semibold flex items-center gap-2">
              <GitBranch className="size-4 text-primary" /> Convert next
            </div>
            <Link to="/admin/conversions" className="text-xs text-primary hover:underline">Open full queue →</Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {snapshot.priorityConversions.map(item => (
              <Link
                key={item.id}
                to="/admin/conversions/$id"
                params={{ id: item.id }}
                className="block rounded-xl border border-border bg-surface-elevated px-4 py-3 hover:border-primary/35 hover:shadow-soft transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {TYPE_LABEL[item.type]}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${RISK_CLS[item.risk]}`}>
                        {RISK_LABEL[item.risk]}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_CLS[item.status]}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-foreground">{item.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.admin_notes}</div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-display font-semibold flex items-center gap-2">
              <Eye className="size-4 text-primary" /> Visual work
            </div>
            <Link to="/admin/visual-needs" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {snapshot.topVisualNeeds.map(need => (
              <VisualNeedMini key={need.id} need={need} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs leading-relaxed text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1">
          <ShieldCheck className="size-3.5 text-warning" /> Factory guardrails
        </div>
        Source material stays admin-only. Every learner-facing output must be rewritten as Mizly-original guidance, sanitized-approved, vendor-neutral, PHI-free, and free of private links, credentials, organization names, vendor screenshots, or copied proprietary wording.
      </div>
    </div>
  );
}

function StageCard({ stage }: { stage: FactoryStage }) {
  const tone = {
    primary: "text-primary bg-primary-soft",
    teal: "text-teal bg-teal-soft",
    warning: "text-warning bg-warning/15",
    danger: "text-destructive bg-destructive/10",
    muted: "text-muted-foreground bg-secondary",
  }[stage.tone];

  const Icon = stage.id === "intake" ? FileArchive
    : stage.id === "visuals" ? Eye
    : stage.id === "publish" ? CheckCircle2
    : stage.id === "taxonomy" ? BarChart3
    : Edit3;

  return (
    <Link to={stage.to as any} className="group rounded-xl border border-border bg-surface-elevated p-4 hover:border-primary/35 hover:shadow-soft transition-all">
      <div className="flex items-start justify-between gap-3">
        <span className={`size-10 rounded-xl flex items-center justify-center ${tone}`}>
          <Icon className="size-4" />
        </span>
        <span className="font-display font-semibold text-xl">{stage.count}</span>
      </div>
      <div className="mt-3 text-sm font-semibold group-hover:text-primary transition-colors">{stage.label}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{stage.summary}</p>
    </Link>
  );
}

function VisualNeedMini({ need }: { need: VisualNeed }) {
  const cls = need.priority === "high"
    ? "bg-destructive/10 text-destructive"
    : need.priority === "medium"
      ? "bg-warning/15 text-warning"
      : "bg-secondary text-secondary-foreground";

  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-3 py-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 ${cls}`}>{need.priority}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{need.kind}</span>
      </div>
      <div className="mt-1.5 text-sm font-medium line-clamp-2">{need.workflowTitle}</div>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{need.suggestedOutput}</p>
    </div>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "primary" | "success" | "warning" | "danger" }) {
  const cls = tone === "success" ? "text-success"
    : tone === "warning" ? "text-warning"
      : tone === "danger" ? "text-destructive"
        : tone === "primary" ? "text-primary"
          : "text-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-2xl ${cls}`}>{value}</div>
    </div>
  );
}
