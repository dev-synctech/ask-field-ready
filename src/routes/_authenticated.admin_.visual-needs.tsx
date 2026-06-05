import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, CheckCircle2, Eye, Film, Filter, ImageIcon, MousePointerClick,
  PlayCircle, ShieldCheck, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  mergeVisualNeeds,
  readAskGapLog,
  type AskGapLogRecord,
  type VisualNeed,
  type VisualNeedSource,
  type VisualNeedStatus,
} from "@/lib/content-factory";
import type { VisualAidKind } from "@/lib/launch-library";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/visual-needs")({
  head: () => ({ meta: [{ title: "Visual Needs — Mizly Admin" }] }),
  component: VisualNeedsPage,
});

const STATUS_KEY = "mizly.admin.visual_need_status";

type KindFilter = "all" | VisualAidKind;
type SourceFilter = "all" | VisualNeedSource;
type StatusFilter = "all" | VisualNeedStatus;

const KIND_OPTIONS: KindFilter[] = ["all", "screenshot", "tasklet", "video"];
const SOURCE_OPTIONS: SourceFilter[] = ["all", "ask_gap", "library_gap"];
const STATUS_OPTIONS: StatusFilter[] = ["all", "new", "planned", "in_production", "done"];

function readStatusMap(): Record<string, VisualNeedStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(STATUS_KEY) ?? "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function writeStatusMap(map: Record<string, VisualNeedStatus>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATUS_KEY, JSON.stringify(map));
}

function VisualNeedsPage() {
  const [askGapLog, setAskGapLog] = useState(() => readAskGapLog());
  const [statusMap, setStatusMap] = useState<Record<string, VisualNeedStatus>>(() => readStatusMap());
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    setAskGapLog(readAskGapLog());
    setStatusMap(readStatusMap());
  }, []);

  const needs = useMemo(
    () => mergeVisualNeeds(askGapLog).map(need => ({ ...need, status: statusMap[need.id] ?? need.status })),
    [askGapLog, statusMap],
  );

  const visible = useMemo(() => needs.filter(need =>
    (kindFilter === "all" || need.kind === kindFilter) &&
    (sourceFilter === "all" || need.source === sourceFilter) &&
    (statusFilter === "all" || need.status === statusFilter)
  ), [needs, kindFilter, sourceFilter, statusFilter]);

  const counts = useMemo(() => ({
    total: needs.length,
    screenshots: needs.filter(n => n.kind === "screenshot").length,
    tasklets: needs.filter(n => n.kind === "tasklet").length,
    videos: needs.filter(n => n.kind === "video").length,
    high: needs.filter(n => n.priority === "high" && n.status !== "done").length,
  }), [needs]);

  function setNeedStatus(id: string, status: VisualNeedStatus) {
    const next = { ...statusMap, [id]: status };
    setStatusMap(next);
    writeStatusMap(next);
    toast.success(status === "done" ? "Visual task marked done" : `Visual task moved to ${status.replace("_", " ")}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to Admin
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <Header title="Visual Needs Queue" subtitle="Screenshots, click paths, and short training clips that Ask needs next." />
        <Link
          to="/admin/factory"
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 shadow-soft"
        >
          <Sparkles className="size-4" /> Factory
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPI label="Total needs" value={counts.total} tone="primary" />
        <KPI label="Screenshots" value={counts.screenshots} />
        <KPI label="Click paths" value={counts.tasklets} />
        <KPI label="Videos" value={counts.videos} />
        <KPI label="High priority" value={counts.high} tone="danger" />
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs leading-relaxed text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1">
          <ShieldCheck className="size-3.5 text-warning" /> Visual safety rule
        </div>
        Visuals must be Mizly-created and sanitized. Use mock screens, generic labels, and numbered callouts. Never use vendor screenshots, patient data, organization names, private links, or credentials.
      </div>

      <div className="mt-6 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center gap-1.5">
          <Filter className="size-3" /> Kind
        </span>
        {KIND_OPTIONS.map(kind => (
          <button key={kind} onClick={() => setKindFilter(kind)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${kindFilter === kind ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}>
            {kind === "all" ? "all" : kind}
          </button>
        ))}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium ml-2">Source</span>
        {SOURCE_OPTIONS.map(source => (
          <button key={source} onClick={() => setSourceFilter(source)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sourceFilter === source ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-secondary"}`}>
            {source === "all" ? "all" : source === "ask_gap" ? "Ask gaps" : "Library gaps"}
          </button>
        ))}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium ml-2">Status</span>
        {STATUS_OPTIONS.map(status => (
          <button key={status} onClick={() => setStatusFilter(status)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statusFilter === status ? "bg-teal text-white border-teal" : "bg-card border-border hover:bg-secondary"}`}>
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {visible.map(need => (
          <VisualNeedCard key={need.id} need={need} onStatus={setNeedStatus} />
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface">
            <div className="font-display font-semibold">No visual needs match</div>
            <div className="text-sm text-muted-foreground mt-1">Clear a filter or ask more questions that expose content gaps.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function VisualNeedCard({ need, onStatus }: { need: VisualNeed; onStatus: (id: string, status: VisualNeedStatus) => void }) {
  const Icon = need.kind === "screenshot" ? ImageIcon : need.kind === "tasklet" ? MousePointerClick : Film;
  const priorityCls = need.priority === "high"
    ? "bg-destructive/10 text-destructive"
    : need.priority === "medium"
      ? "bg-warning/15 text-warning"
      : "bg-secondary text-secondary-foreground";
  const statusCls = need.status === "done"
    ? "bg-success/15 text-success"
    : need.status === "in_production"
      ? "bg-primary-soft text-primary"
      : need.status === "planned"
        ? "bg-teal-soft text-teal"
        : "bg-secondary text-secondary-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="size-9 rounded-xl bg-primary-soft text-primary inline-flex items-center justify-center">
              <Icon className="size-4" />
            </span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityCls}`}>{need.priority}</span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${statusCls}`}>{need.status.replace("_", " ")}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {need.source === "ask_gap" ? "Ask gap" : "Library gap"}
            </span>
          </div>
          <div className="mt-3 font-display font-semibold">{need.workflowTitle}</div>
          <div className="mt-1 text-sm text-foreground/85">{need.title}</div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{need.reason}</p>
          <div className="mt-3 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs">
            <div className="font-medium text-foreground">Production output</div>
            <div className="mt-0.5 text-muted-foreground">{need.suggestedOutput}</div>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Trigger: <span className="text-foreground">{need.question}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:max-w-[260px]">
          {need.conversionId && (
            <Link
              to="/admin/conversions/$id"
              params={{ id: need.conversionId }}
              className="h-9 px-3 rounded-lg border border-border bg-card text-xs inline-flex items-center gap-1.5 hover:bg-secondary"
            >
              <PlayCircle className="size-3.5" /> Open source
            </Link>
          )}
          {need.status === "new" && (
            <button onClick={() => onStatus(need.id, "planned")} className="h-9 px-3 rounded-lg border border-border bg-card text-xs hover:bg-secondary">
              Plan
            </button>
          )}
          {need.status !== "in_production" && need.status !== "done" && (
            <button onClick={() => onStatus(need.id, "in_production")} className="h-9 px-3 rounded-lg border border-border bg-card text-xs hover:bg-secondary">
              Start
            </button>
          )}
          {need.status !== "done" && (
            <button onClick={() => onStatus(need.id, "done")} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "primary" | "danger" }) {
  const cls = tone === "danger" ? "text-destructive" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-2xl ${cls}`}>{value}</div>
    </div>
  );
}
