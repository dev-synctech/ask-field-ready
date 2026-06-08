import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck, ShieldAlert, Eye, EyeOff, FileImage } from "lucide-react";
import {
  SCREENSHOT_REGISTRY,
  SCREENSHOT_FOOTER_DISCLAIMER,
  isLearnerVisible,
  type RightsStatus,
  type ScreenshotRightsEntry,
} from "@/lib/screenshot-rights";

export const Route = createFileRoute("/_authenticated/admin_/screenshot-rights")({
  head: () => ({ meta: [{ title: "Screenshot rights — Mizly admin" }] }),
  component: ScreenshotRightsPage,
});

const FILTERS: ("all" | RightsStatus)[] = [
  "all",
  "unknown",
  "internal_only",
  "needs_legal_review",
  "cleared_for_public_training",
];

const STATUS_LABEL: Record<RightsStatus, string> = {
  unknown: "Unknown",
  internal_only: "Internal only",
  needs_legal_review: "Needs legal review",
  cleared_for_public_training: "Cleared for public training",
};

const STATUS_CLS: Record<RightsStatus, string> = {
  unknown: "bg-secondary text-secondary-foreground",
  internal_only: "bg-muted text-muted-foreground",
  needs_legal_review: "bg-warning/15 text-warning",
  cleared_for_public_training: "bg-success/15 text-success",
};

function ScreenshotRightsPage() {
  const [filter, setFilter] = useState<"all" | RightsStatus>("all");

  const counts = useMemo(() => {
    const total = SCREENSHOT_REGISTRY.length;
    const cleared = SCREENSHOT_REGISTRY.filter(
      (e) => e.rights_status === "cleared_for_public_training",
    ).length;
    const learner = SCREENSHOT_REGISTRY.filter(isLearnerVisible).length;
    return { total, cleared, learner };
  }, []);

  const rows = useMemo(() => {
    if (filter === "all") return SCREENSHOT_REGISTRY;
    return SCREENSHOT_REGISTRY.filter((e) => e.rights_status === filter);
  }, [filter]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to admin
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Screenshot rights</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Track which real EHR screenshots are rights-cleared, redacted, and safe
            to show learners. Only entries marked{" "}
            <span className="font-medium text-foreground">cleared_for_public_training</span>{" "}
            with a redacted image and <code>learner_visible: true</code> are eligible
            for public Ask, Learn, Videos, or any public route.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <KPI label="Total tracked" value={counts.total} />
        <KPI label="Rights-cleared" value={counts.cleared} tone="teal" />
        <KPI label="Learner-visible now" value={counts.learner} tone="success" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground/80 border-border hover:border-primary/40"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((entry) => (
          <RightsRow key={entry.id} entry={entry} />
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
            No entries match this filter.
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1">
          <ShieldCheck className="size-3.5 text-warning" /> Rights-clearance rules
        </div>
        Only screenshots marked <strong>cleared_for_public_training</strong> with a
        redacted image and <strong>learner_visible: true</strong> may appear in Ask,
        Learn, Videos, or any public route. PHI, patient names, MRNs, DOBs, org
        names, private URLs, passwords, and internal identifiers must be removed
        before learner exposure. Source PDFs and unapproved screenshots stay admin
        and offline only. Cleared screenshots render with this footer:
        <div className="mt-2 italic text-muted-foreground">
          "{SCREENSHOT_FOOTER_DISCLAIMER}"
        </div>
      </div>
    </div>
  );
}

function RightsRow({ entry }: { entry: ScreenshotRightsEntry }) {
  const learnerOk = isLearnerVisible(entry);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {entry.id}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_CLS[entry.rights_status]}`}
            >
              {STATUS_LABEL[entry.rights_status]}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground">
              {entry.asset_type}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground">
              redaction: {entry.redaction_status}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                learnerOk
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {learnerOk ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              {learnerOk ? "Learner-visible" : "Admin only"}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-foreground">{entry.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>
        </div>
        <FileImage className="size-5 text-muted-foreground shrink-0" />
      </div>

      <dl className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <Row k="Clearance note" v={entry.clearance_note} />
        <Row k="Approved by" v={entry.approved_by ?? "—"} />
        <Row k="Approval date" v={entry.approval_date ?? "—"} />
        <Row k="Image path" v={entry.image_path ?? "(none uploaded)"} />
        <Row
          k="Related Ask IDs"
          v={entry.related_ask_ids.length ? entry.related_ask_ids.join(", ") : "—"}
        />
      </dl>

      {!learnerOk && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldAlert className="size-3.5" />
          Hidden from learners — fails one or more clearance checks.
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground shrink-0">{k}:</dt>
      <dd className="text-foreground/90 break-words">{v}</dd>
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
  tone?: "teal" | "success" | "muted";
}) {
  const cls =
    tone === "teal"
      ? "text-teal"
      : tone === "success"
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
