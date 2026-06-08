import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck, EyeOff, Eye, Monitor, Lock } from "lucide-react";
import {
  VISUAL_MODE_WORKFLOWS,
  INTERNAL_REFERENCE_LABEL,
  isPublicLive,
  type VisualMode,
  type PublicVisualStatus,
  type VisualModeWorkflow,
} from "@/lib/visual-mode";
import {
  RealisticEHRVisual,
  hasRealisticVisual,
} from "@/components/realistic-ehr-visual";

export const Route = createFileRoute("/_authenticated/admin_/visual-mode")({
  head: () => ({ meta: [{ title: "Visual mode workbench — Mizly admin" }] }),
  component: VisualModePage,
});

const MODE_FILTERS: ("all" | VisualMode)[] = [
  "all",
  "public_mizly_visual",
  "internal_reference",
];

const STATUS_CLS: Record<PublicVisualStatus, string> = {
  not_started: "bg-secondary text-secondary-foreground",
  redrawn: "bg-primary-soft text-primary",
  needs_review: "bg-warning/15 text-warning",
  approved: "bg-accent text-accent-foreground",
  live: "bg-success/15 text-success",
};

function VisualModePage() {
  const [modeFilter, setModeFilter] = useState<"all" | VisualMode>("all");

  const counts = useMemo(() => {
    const total = VISUAL_MODE_WORKFLOWS.length;
    const live = VISUAL_MODE_WORKFLOWS.filter(isPublicLive).length;
    const internal = VISUAL_MODE_WORKFLOWS.filter(
      (w) => w.visual_mode === "internal_reference",
    ).length;
    return { total, live, internal };
  }, []);

  const rows = useMemo(() => {
    if (modeFilter === "all") return VISUAL_MODE_WORKFLOWS;
    return VISUAL_MODE_WORKFLOWS.filter((w) => w.visual_mode === modeFilter);
  }, [modeFilter]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to admin
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold text-foreground">Visual mode workbench</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Two visual modes. <strong>Internal reference</strong> shows source
          screenshots for review and stays behind admin route protection.{" "}
          <strong>Public Mizly visual</strong> is a redrawn realistic walkthrough
          that learners see only when status is <code>live</code>. Source
          screenshots, transcripts, and guide names never appear on learner
          routes.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <KPI label="Workflows tracked" value={counts.total} />
        <KPI label="Live public visuals" value={counts.live} tone="success" />
        <KPI label="Internal-only" value={counts.internal} tone="muted" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {MODE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setModeFilter(f)}
            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
              modeFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground/80 border-border hover:border-primary/40"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "public_mizly_visual"
                ? "Public Mizly visual"
                : "Internal reference"}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {rows.map((w) => (
          <WorkflowCard key={w.id} workflow={w} />
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
            No workflows match this filter.
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1">
          <ShieldCheck className="size-3.5 text-warning" /> Visual mode rules
        </div>
        Learner Ask only renders workflows where <strong>visual_mode = public_mizly_visual</strong> and{" "}
        <strong>public_visual_status = live</strong>. Internal references are
        labeled <em>"{INTERNAL_REFERENCE_LABEL}"</em> and never appear on
        learner or public routes. No vendor logos, PHI, MRNs, DOBs, org names,
        passwords, private links, or source guide names may appear on any public
        visual.
      </div>
    </div>
  );
}

function WorkflowCard({ workflow: w }: { workflow: VisualModeWorkflow }) {
  const live = isPublicLive(w);
  const isInternal = w.visual_mode === "internal_reference";
  const showPreview = !isInternal && hasRealisticVisual(w.realistic_visual_key);

  return (
    <div
      className={`rounded-xl border bg-card p-4 ${
        isInternal ? "border-warning/40" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {w.id}
            </span>
            <ModeBadge mode={w.visual_mode} />
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_CLS[w.public_visual_status]}`}
            >
              {w.public_visual_status}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground">
              source: {w.source_reference_available}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                live ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {live ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              {live ? "Learner-visible" : "Admin only"}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-foreground">
            {w.workflow_title}
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Related Ask IDs: {w.askIds.join(", ")}
          </p>
        </div>
      </div>

      {isInternal && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-2 text-[11px] text-warning">
          <Lock className="size-3.5 shrink-0 mt-0.5" />
          <span>{INTERNAL_REFERENCE_LABEL} — never render on learner or public routes.</span>
        </div>
      )}

      <div className="mt-3 grid md:grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
        <Field label="What screen this is">{w.screenshot_review_notes}</Field>
        <Field label="Transcript explanation">{w.transcript_explanation}</Field>
        <Field label="What user is trying to do">{w.what_user_is_trying_to_do}</Field>
        <Field label="Where to click">{w.where_to_click}</Field>
        <Field label="What to check">{w.what_to_check}</Field>
        <Field label="What to say">{w.what_to_say}</Field>
        <Field label="Escalation">{w.escalation_note}</Field>
        <Field label="Realistic-visual key">
          {w.realistic_visual_key ?? "(none)"}
        </Field>
      </div>

      {showPreview && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <Monitor className="size-3.5" />
            Public Mizly visual preview {live ? "(live)" : "(not yet live)"}
          </div>
          <RealisticEHRVisual visualKey={w.realistic_visual_key as never} />
        </div>
      )}
    </div>
  );
}

function ModeBadge({ mode }: { mode: VisualMode }) {
  if (mode === "internal_reference") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-warning/15 text-warning">
        <Lock className="size-3" /> internal_reference
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary-soft text-primary">
      <Monitor className="size-3" /> public_mizly_visual
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className="mt-0.5 text-foreground/90 break-words">{children}</div>
    </div>
  );
}

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "muted";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "muted"
        ? "text-muted-foreground"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </div>
  );
}
