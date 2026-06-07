import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, Image as ImageIcon, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/visual-map")({
  head: () => ({ meta: [{ title: "Visual Correlation Map — Mizly Admin" }] }),
  component: VisualMapPage,
});

type VisualStatus = "none" | "reference_found" | "cleaned_attached" | "live_in_ask";
type QAStatus = "not_tested" | "pass" | "needs_fix";

type VisualMapRow = {
  workflowId: string;
  workflowTitle: string;
  exampleAsk: string;
  visualStatus: VisualStatus;
  visualPath?: string;
  calloutCount: number;
  learnerVisible: boolean;
  qaStatus: QAStatus;
  notes?: string;
};

const QA_STORAGE = "mizly.admin.visual_map_qa";

const SEED_ROWS: VisualMapRow[] = [
  // First 5 — completed
  {
    workflowId: "ll_claim_edit_workqueue_owner",
    workflowTitle: "Claim errors sidebar",
    exampleAsk: "Where do I see claim errors?",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/claim-errors-sidebar.svg",
    calloutCount: 4,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Cleaned. No vendor labels.",
  },
  {
    workflowId: "ll_detail_bill_request",
    workflowTitle: "Detail bill request",
    exampleAsk: "How do I request a detailed bill for a patient?",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/detail-bill-request.svg",
    calloutCount: 4,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Generic billing UI mock.",
  },
  {
    workflowId: "ll_p13_carecompass_patient_missing",
    workflowTitle: "CareCompass patient missing",
    exampleAsk: "Patient is missing from CareCompass list",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/carecompass-patient-missing.svg",
    calloutCount: 4,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Mock list view, no PHI.",
  },
  {
    workflowId: "ll_p12r2_smartlink_blank_or_wrong",
    workflowTitle: "SmartLink blank or wrong",
    exampleAsk: "SmartLink shows blank in my note",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/smartlink-blank-wrong.svg",
    calloutCount: 4,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Note editor mock.",
  },
  {
    workflowId: "ll_p12r2_portal_proxy_access",
    workflowTitle: "Portal proxy access missing",
    exampleAsk: "Proxy access not showing in MyChart for caregiver",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/mychart-proxy-access.svg",
    calloutCount: 4,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Admin record decision view.",
  },
  // Next 5 — Pack 13 Visual Batch 2: cleaned visuals now attached
  {
    workflowId: "ll_coverage_filing_order_term_delete",
    workflowTitle: "Coverage effective date issue",
    exampleAsk: "Coverage effective date issue",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/coverage-effective-date.svg",
    calloutCount: 5,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Coverage panel mock, no payer logos or PHI.",
  },
  {
    workflowId: "ll_clearinghouse_error_refresh_retest",
    workflowTitle: "Clearinghouse error",
    exampleAsk: "Clearinghouse error",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/clearinghouse-error.svg",
    calloutCount: 4,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Generic external-status panel mock.",
  },
  {
    workflowId: "ll_barcode_med_admin_scan_mismatch",
    workflowTitle: "Medication scan wrong patient / wrong med warning",
    exampleAsk: "medication scan wrong patient warning",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/medication-scan-wrong-patient-warning.svg",
    calloutCount: 5,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Safety-warning mock — no PHI, no MRN, no patient name.",
  },
  {
    workflowId: "ll_schedule_columns",
    workflowTitle: "Schedule columns / personalization",
    exampleAsk: "Schedule columns personalization",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/schedule-columns-personalization.svg",
    calloutCount: 5,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Generic schedule grid + personalize panel.",
  },
  {
    workflowId: "ll_prescription_printer_routing_wrong",
    workflowTitle: "Secure prescription printer",
    exampleAsk: "Secure prescription printer",
    visualStatus: "live_in_ask",
    visualPath: "/visual-guides/secure-prescription-printer.svg",
    calloutCount: 5,
    learnerVisible: true,
    qaStatus: "pass",
    notes: "Print dialog mock, generic printer names.",
  },
];

function readQA(): Record<string, QAStatus> {
  if (typeof window === "undefined") return {};
  try {
    const v = JSON.parse(localStorage.getItem(QA_STORAGE) ?? "{}");
    return v && typeof v === "object" ? v : {};
  } catch { return {}; }
}
function writeQA(map: Record<string, QAStatus>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QA_STORAGE, JSON.stringify(map));
}

const VISUAL_LABEL: Record<VisualStatus, string> = {
  none: "none",
  reference_found: "reference found",
  cleaned_attached: "cleaned visual attached",
  live_in_ask: "live in Ask",
};
const QA_LABEL: Record<QAStatus, string> = {
  not_tested: "not tested",
  pass: "pass",
  needs_fix: "needs fix",
};

function VisualMapPage() {
  const [qaMap, setQaMap] = useState<Record<string, QAStatus>>({});
  useEffect(() => { setQaMap(readQA()); }, []);

  const rows = useMemo(
    () => SEED_ROWS.map(r => ({ ...r, qaStatus: qaMap[r.workflowId] ?? r.qaStatus })),
    [qaMap],
  );

  const counts = useMemo(() => ({
    total: rows.length,
    live: rows.filter(r => r.visualStatus === "live_in_ask").length,
    backlog: rows.filter(r => r.visualStatus !== "live_in_ask").length,
    pass: rows.filter(r => r.qaStatus === "pass").length,
    needsFix: rows.filter(r => r.qaStatus === "needs_fix").length,
  }), [rows]);

  function setQA(id: string, status: QAStatus) {
    const next = { ...qaMap, [id]: status };
    setQaMap(next);
    writeQA(next);
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to Admin
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <Header title="Visual Correlation Map" subtitle="Trace each Ask workflow to its cleaned visual, callouts, learner visibility, and QA status." />
        <Link to="/admin/visual-needs" className="h-10 px-4 rounded-xl border border-border bg-card text-sm font-medium inline-flex items-center gap-2">
          <ImageIcon className="size-4" /> Visual Needs Queue
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPI label="Workflows" value={counts.total} />
        <KPI label="Live in Ask" value={counts.live} tone="primary" />
        <KPI label="Backlog" value={counts.backlog} />
        <KPI label="QA pass" value={counts.pass} tone="success" />
        <KPI label="Needs fix" value={counts.needsFix} tone="danger" />
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs leading-relaxed text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1">
          <ShieldCheck className="size-3.5 text-warning" /> Admin-only safety rule
        </div>
        Only sanitized Mizly-original visuals reach learner Ask. No raw source assets, vendor screens, org names, private links, passwords, or PHI in this tracker.
      </div>

      <div className="mt-4 space-y-3">
        {rows.map(row => (
          <MapRow key={row.workflowId} row={row} onQA={setQA} />
        ))}
      </div>
    </div>
  );
}

function MapRow({ row, onQA }: { row: VisualMapRow; onQA: (id: string, q: QAStatus) => void }) {
  const visualCls =
    row.visualStatus === "live_in_ask" ? "bg-success/15 text-success"
    : row.visualStatus === "cleaned_attached" ? "bg-primary-soft text-primary"
    : row.visualStatus === "reference_found" ? "bg-warning/15 text-warning"
    : "bg-secondary text-secondary-foreground";
  const qaCls =
    row.qaStatus === "pass" ? "bg-success/15 text-success"
    : row.qaStatus === "needs_fix" ? "bg-destructive/10 text-destructive"
    : "bg-secondary text-secondary-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${visualCls}`}>
              {VISUAL_LABEL[row.visualStatus]}
            </span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${qaCls}`}>
              QA: {QA_LABEL[row.qaStatus]}
            </span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${row.learnerVisible ? "bg-teal-soft text-teal" : "bg-secondary text-secondary-foreground"}`}>
              {row.learnerVisible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              learner {row.learnerVisible ? "visible" : "hidden"}
            </span>
          </div>
          <div className="mt-3 font-display font-semibold">{row.workflowTitle}</div>
          <div className="mt-0.5 text-xs text-muted-foreground font-mono">{row.workflowId}</div>
          <div className="mt-2 text-sm text-foreground/85">
            <span className="text-muted-foreground">Ask: </span>“{row.exampleAsk}”
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-surface px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Callouts</div>
              <div className="mt-0.5 font-medium">{row.calloutCount}</div>
            </div>
            <div className="rounded-lg border border-border bg-surface px-3 py-2 col-span-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cleaned visual</div>
              <div className="mt-0.5 font-mono text-[11px] truncate">
                {row.visualPath ?? "— not attached —"}
              </div>
            </div>
          </div>
          {row.notes && (
            <div className="mt-2 text-[11px] text-muted-foreground">{row.notes}</div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:max-w-[260px]">
          <button onClick={() => onQA(row.workflowId, "pass")}
            className="h-9 px-3 rounded-lg border border-border bg-card text-xs inline-flex items-center gap-1.5 hover:bg-secondary">
            <CheckCircle2 className="size-3.5" /> Pass
          </button>
          <button onClick={() => onQA(row.workflowId, "needs_fix")}
            className="h-9 px-3 rounded-lg border border-border bg-card text-xs inline-flex items-center gap-1.5 hover:bg-secondary">
            <AlertCircle className="size-3.5" /> Needs fix
          </button>
          <button onClick={() => onQA(row.workflowId, "not_tested")}
            className="h-9 px-3 rounded-lg border border-border bg-card text-xs hover:bg-secondary">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "primary" | "danger" | "success" }) {
  const cls = tone === "danger" ? "text-destructive" : tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-semibold text-2xl ${cls}`}>{value}</div>
    </div>
  );
}
