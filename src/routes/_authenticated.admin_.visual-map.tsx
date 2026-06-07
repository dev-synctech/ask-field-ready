import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, Image as ImageIcon, ShieldCheck, Eye, EyeOff, Search } from "lucide-react";
import { Header } from "./_authenticated.learn";
import referenceMap from "@/data/visual-correlation-map.json";
import priorityWorkflows from "@/data/visual-priority-workflows.json";

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

type ReferenceRow = {
  id: string;
  pdf: string;
  pdfPage: number | string;
  sectionNumber: number | string;
  sectionTitle: string;
  sourceTitle: string;
  sourcePage: number | string;
  aliases: string;
  priority: string;
  status: string;
  cleanedAsset: string;
  exposureRule: string;
  adminAction: string;
};

type PriorityRow = {
  priority: string;
  workflowTitle: string;
  askId: string;
  selector: string;
  aliases: string;
  action: string;
};

const REFS = referenceMap as ReferenceRow[];
const PRIORITY = priorityWorkflows as PriorityRow[];

const QA_STORAGE = "mizly.admin.visual_map_qa";

const SEED_ROWS: VisualMapRow[] = [
  { workflowId: "ll_claim_edit_workqueue_owner", workflowTitle: "Claim errors sidebar", exampleAsk: "Where do I see claim errors?", visualStatus: "live_in_ask", visualPath: "/visual-guides/claim-errors-sidebar.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Cleaned. No vendor labels." },
  { workflowId: "ll_detail_bill_request", workflowTitle: "Detail bill request", exampleAsk: "How do I request a detailed bill for a patient?", visualStatus: "live_in_ask", visualPath: "/visual-guides/detail-bill-request.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Generic billing UI mock." },
  { workflowId: "ll_p13_carecompass_patient_missing", workflowTitle: "CareCompass patient missing", exampleAsk: "Patient is missing from CareCompass list", visualStatus: "live_in_ask", visualPath: "/visual-guides/carecompass-patient-missing.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Mock list view, no PHI." },
  { workflowId: "ll_p12r2_smartlink_blank_or_wrong", workflowTitle: "SmartLink blank or wrong", exampleAsk: "SmartLink shows blank in my note", visualStatus: "live_in_ask", visualPath: "/visual-guides/smartlink-blank-wrong.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Note editor mock." },
  { workflowId: "ll_p12r2_portal_proxy_access", workflowTitle: "Portal proxy access missing", exampleAsk: "Proxy access not showing in MyChart for caregiver", visualStatus: "live_in_ask", visualPath: "/visual-guides/mychart-proxy-access.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Admin record decision view." },
  { workflowId: "ll_coverage_filing_order_term_delete", workflowTitle: "Coverage effective date issue", exampleAsk: "Coverage effective date issue", visualStatus: "live_in_ask", visualPath: "/visual-guides/coverage-effective-date.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Coverage panel mock, no payer logos or PHI." },
  { workflowId: "ll_clearinghouse_error_refresh_retest", workflowTitle: "Clearinghouse error", exampleAsk: "Clearinghouse error", visualStatus: "live_in_ask", visualPath: "/visual-guides/clearinghouse-error.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Generic external-status panel mock." },
  { workflowId: "ll_barcode_med_admin_scan_mismatch", workflowTitle: "Medication scan wrong patient / wrong med warning", exampleAsk: "medication scan wrong patient warning", visualStatus: "live_in_ask", visualPath: "/visual-guides/medication-scan-wrong-patient-warning.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Safety-warning mock — no PHI, no MRN, no patient name." },
  { workflowId: "ll_schedule_columns", workflowTitle: "Schedule columns / personalization", exampleAsk: "Schedule columns personalization", visualStatus: "live_in_ask", visualPath: "/visual-guides/schedule-columns-personalization.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Generic schedule grid + personalize panel." },
  { workflowId: "ll_prescription_printer_routing_wrong", workflowTitle: "Secure prescription printer", exampleAsk: "Secure prescription printer", visualStatus: "live_in_ask", visualPath: "/visual-guides/secure-prescription-printer.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Print dialog mock, generic printer names." },
  { workflowId: "ll_barcode_med_admin_scan_mismatch__failure_variant", workflowTitle: "Medication scan failure", exampleAsk: "medication scan failure", visualStatus: "live_in_ask", visualPath: "/visual-guides/medication-scan-failure.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Original scan-failure mock (package barcode / device / clinical owner routing)." },
  { workflowId: "ll_p13_iview_correction_uncharting", workflowTitle: "IView correction / uncharting", exampleAsk: "IView correction uncharting", visualStatus: "live_in_ask", visualPath: "/visual-guides/iview-correction-uncharting.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Flowsheet correction mock — no PHI." },
  { workflowId: "ll_p13_beaker_specimen_collection", workflowTitle: "Beaker specimen collection", exampleAsk: "Beaker specimen collection", visualStatus: "live_in_ask", visualPath: "/visual-guides/beaker-specimen-collection.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Generic collect-specimens mock." },
  { workflowId: "ll_p13_beaker_verified_result_correction", workflowTitle: "Beaker verified result correction", exampleAsk: "Beaker verified result correction", visualStatus: "live_in_ask", visualPath: "/visual-guides/beaker-verified-result-correction.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Amendment-path mock, no result values." },
  { workflowId: "ll_p13_radiant_snapboard_scheduling", workflowTitle: "Radiant scheduling / Snapboard", exampleAsk: "Radiant scheduling Snapboard", visualStatus: "live_in_ask", visualPath: "/visual-guides/radiant-scheduling-snapboard.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Generic scheduling-board mock, no patient names." },
  // Pack 14 batch 1 — 10 newly cleaned visuals
  { workflowId: "ll_level_of_service_selection", workflowTitle: "Level of Service selection / missing LOS", exampleAsk: "level of service", visualStatus: "live_in_ask", visualPath: "/visual-guides/level-of-service.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Mock visit-charge / LOS panel." },
  { workflowId: "ll_note_sidebar_or_note_type_missing", workflowTitle: "Note area or note type hard to find", exampleAsk: "where do I write my note", visualStatus: "live_in_ask", visualPath: "/visual-guides/note-sidebar-area.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Mock notes sidebar." },
  { workflowId: "ll_dynamic_note_template_missing", workflowTitle: "Dynamic note template missing", exampleAsk: "note template missing", visualStatus: "live_in_ask", visualPath: "/visual-guides/dynamic-note-template.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Template search mock." },
  { workflowId: "ll_note_unsigned_missing_required_field", workflowTitle: "Note required field / cannot sign", exampleAsk: "note won't sign required field", visualStatus: "live_in_ask", visualPath: "/visual-guides/note-required-field-sign.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Sign-error banner mock." },
  { workflowId: "ll_signed_note_addendum_correction", workflowTitle: "Signed note addendum / correction", exampleAsk: "addendum signed note", visualStatus: "live_in_ask", visualPath: "/visual-guides/signed-note-addendum.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Addendum lane mock." },
  { workflowId: "ll_order_entry", workflowTitle: "Ambulatory orders / order entry", exampleAsk: "where do I put orders", visualStatus: "live_in_ask", visualPath: "/visual-guides/order-entry-ambulatory.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Order search mock." },
  { workflowId: "ll_profile_or_department_context_wrong", workflowTitle: "Session information / profile context", exampleAsk: "wrong profile department context", visualStatus: "live_in_ask", visualPath: "/visual-guides/profile-department-context.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Profile/department switcher mock." },
  { workflowId: "ll_sbo_payment_plan_or_self_pay_followup", workflowTitle: "Payment plan setup", exampleAsk: "payment plan", visualStatus: "live_in_ask", visualPath: "/visual-guides/payment-plan-setup.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Account / plan terms mock." },
  { workflowId: "ll_p12_portal_message_or_result_missing", workflowTitle: "MyChart result release", exampleAsk: "patient cant see result in portal", visualStatus: "live_in_ask", visualPath: "/visual-guides/mychart-result-release.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Release status mock." },
  { workflowId: "ll_p12r2_portal_message_routing", workflowTitle: "MyChart message routing", exampleAsk: "portal message routing", visualStatus: "live_in_ask", visualPath: "/visual-guides/mychart-message-routing.svg", calloutCount: 4, learnerVisible: true, qaStatus: "pass", notes: "Actual vs intended pool mock." },
  { workflowId: "ll_patient_chart_not_loading_after_admission", workflowTitle: "Patient chart does not load after admission", exampleAsk: "patient chart not loading after admission", visualStatus: "live_in_ask", visualPath: "/visual-guides/patient-chart-not-loading-after-admission.svg", calloutCount: 5, learnerVisible: true, qaStatus: "pass", notes: "Generic EHR mock — search, encounter banner, blank/spinner state, context/access check, escalation packet. No PHI, vendor logos, or org names." },
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

type Tab = "workflows" | "priority" | "reference";

function VisualMapPage() {
  const [qaMap, setQaMap] = useState<Record<string, QAStatus>>({});
  const [tab, setTab] = useState<Tab>("workflows");
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
    refTotal: REFS.length,
    refP0: REFS.filter(r => r.priority === "P0").length,
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
        <KPI label="Reference rows" value={counts.refTotal} />
        <KPI label="P0 refs" value={counts.refP0} tone="success" />
      </div>

      <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs leading-relaxed text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1">
          <ShieldCheck className="size-3.5 text-warning" /> Admin-only safety rule
        </div>
        Only sanitized Mizly-original visuals reach learner Ask. The reference rows below are admin tracking — raw PDFs, raw screenshots, guide names, org names, MRNs, DOBs, and vendor logos never reach learner-facing surfaces.
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-xl border border-border bg-card p-1 text-xs">
          <TabBtn current={tab} value="workflows" onClick={setTab}>Workflows ({rows.length})</TabBtn>
          <TabBtn current={tab} value="priority" onClick={setTab}>Priority Roadmap ({PRIORITY.length})</TabBtn>
          <TabBtn current={tab} value="reference" onClick={setTab}>Reference DB ({REFS.length})</TabBtn>
        </div>
        <Link
          to="/admin/visual-review"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary-soft text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition"
        >
          <ShieldCheck className="size-3.5" /> Open Visual Review Viewer
        </Link>
      </div>

      <div className="mt-4">
        {tab === "workflows" && (
          <div className="space-y-3">
            {rows.map(row => <MapRow key={row.workflowId} row={row} onQA={setQA} />)}
          </div>
        )}
        {tab === "priority" && <PriorityTable rows={PRIORITY} liveIds={new Set(rows.filter(r => r.visualStatus === "live_in_ask").map(r => r.workflowId))} />}
        {tab === "reference" && <ReferenceTable rows={REFS} />}
      </div>
    </div>
  );
}

function TabBtn({ current, value, onClick, children }: { current: Tab; value: Tab; onClick: (v: Tab) => void; children: React.ReactNode }) {
  const active = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-3 py-1.5 rounded-lg font-medium ${active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-secondary"}`}
    >{children}</button>
  );
}

function PriorityTable({ rows, liveIds }: { rows: PriorityRow[]; liveIds: Set<string> }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(r =>
      r.workflowTitle.toLowerCase().includes(needle) ||
      r.askId.toLowerCase().includes(needle) ||
      r.aliases.toLowerCase().includes(needle) ||
      r.priority.toLowerCase().includes(needle),
    );
  }, [rows, q]);
  return (
    <div className="space-y-3">
      <SearchBox value={q} onChange={setQ} placeholder="Filter by title, ask id, alias, priority…" />
      <div className="rounded-2xl border border-border bg-card divide-y">
        {filtered.map((r, i) => {
          const live = liveIds.has(r.askId);
          return (
            <div key={`${r.askId}-${i}`} className="p-4 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{r.priority}</span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${live ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                  {live ? "cleaned visual live" : "needs cleaned visual"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-mono">{r.selector}</span>
              </div>
              <div className="mt-2 font-medium">{r.workflowTitle}</div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">{r.askId}</div>
              <div className="mt-2 text-xs text-foreground/80"><span className="text-muted-foreground">Aliases:</span> {r.aliases}</div>
              <div className="mt-1 text-xs text-foreground/80"><span className="text-muted-foreground">Action:</span> {r.action}</div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground">No matching priority rows.</div>}
      </div>
    </div>
  );
}

function ReferenceTable({ rows }: { rows: ReferenceRow[] }) {
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => {
      if (priority !== "all" && r.priority !== priority) return false;
      if (status !== "all" && r.status !== status) return false;
      if (!needle) return true;
      return (
        r.sectionTitle.toLowerCase().includes(needle) ||
        r.sourceTitle.toLowerCase().includes(needle) ||
        r.aliases.toLowerCase().includes(needle) ||
        r.id.toLowerCase().includes(needle)
      );
    });
  }, [rows, q, priority, status]);

  const shown = filtered.slice(0, 200);
  const priorities = useMemo(() => Array.from(new Set(rows.map(r => r.priority))).sort(), [rows]);
  const statuses = useMemo(() => Array.from(new Set(rows.map(r => r.status))).sort(), [rows]);

  return (
    <div className="space-y-3">
      <SearchBox value={q} onChange={setQ} placeholder="Filter by section, source, alias, ref id…" />
      <div className="flex gap-2 flex-wrap text-xs">
        <Select value={priority} onChange={setPriority} options={["all", ...priorities]} label="Priority" />
        <Select value={status} onChange={setStatus} options={["all", ...statuses]} label="Status" />
        <div className="ml-auto text-muted-foreground self-center">
          {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} rows{filtered.length > shown.length ? ` (showing first ${shown.length})` : ""}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="text-left p-2 font-medium">Ref</th>
              <th className="text-left p-2 font-medium">Priority</th>
              <th className="text-left p-2 font-medium">Section</th>
              <th className="text-left p-2 font-medium">Source</th>
              <th className="text-left p-2 font-medium">Page</th>
              <th className="text-left p-2 font-medium">Status</th>
              <th className="text-left p-2 font-medium">Aliases</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-2 font-mono whitespace-nowrap">{r.id}</td>
                <td className="p-2">{r.priority}</td>
                <td className="p-2 max-w-[220px]">{r.sectionNumber} — {r.sectionTitle}</td>
                <td className="p-2 max-w-[200px]">{r.sourceTitle}</td>
                <td className="p-2 whitespace-nowrap">p.{r.sourcePage}</td>
                <td className="p-2 whitespace-nowrap">{r.status}</td>
                <td className="p-2 max-w-[260px] text-muted-foreground">{r.aliases}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No matching reference rows.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Reference rows are admin-only. Learner Ask only shows cleaned Mizly visuals attached to an entry's <code className="font-mono">visual_url</code>.
      </p>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 h-10 rounded-xl border border-border bg-card text-sm"
      />
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-transparent outline-none text-foreground">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
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
