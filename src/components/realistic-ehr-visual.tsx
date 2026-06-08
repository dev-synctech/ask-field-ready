import { Search, ChevronRight, AlertCircle, Check, FileText, ClipboardList, Pill, Activity, Calendar, MessageSquare, FlaskConical, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Realistic Mizly walkthrough visual.
 *
 * Renders as a tightly-spaced EHR workflow shell — patient/context header,
 * left activity sidebar, tabs/toolbar, search, center workspace table,
 * detail/error panel, action row — with numbered callouts indicating
 * where to look or click. Intentionally neutral: no vendor logos, no
 * patient names, no MRNs, no DOBs, no org names, no private URLs. Patient
 * identifiers are abstract placeholders (e.g. "Patient · 47y · MRN ••••").
 */

export type RealisticVisualKey =
  | "orders_workflow"
  | "notes_workflow"
  | "smartlink_workflow";

interface Callout {
  /** 1-indexed callout number rendered in the UI. */
  n: number;
  /** Where in the layout the callout pin sits. */
  anchor:
    | "sidebar"
    | "tabs"
    | "search"
    | "row"
    | "detail"
    | "action"
    | "header";
  label: string;
}

interface RowItem {
  primary: string;
  secondary: string;
  status: "ok" | "warn" | "error" | "pending";
}

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number;
}

interface RealisticVisualSpec {
  context: {
    activity: string; // e.g. "Orders"
    patientLine: string; // generic; never real PHI
    encounter: string;
  };
  sidebar: SidebarItem[];
  tabs: { label: string; active?: boolean }[];
  toolbarActions: string[];
  searchPlaceholder: string;
  rowsHeading: string;
  rows: RowItem[];
  detail: {
    title: string;
    fields: { label: string; value: string; status?: "ok" | "warn" | "error" }[];
    warning?: string;
  };
  actionRow: {
    primary: string;
    secondary: string;
    note: string;
  };
  callouts: Callout[];
}

const DEFAULT_SIDEBAR: SidebarItem[] = [
  { icon: Stethoscope, label: "Chart Review" },
  { icon: FileText, label: "Notes" },
  { icon: ClipboardList, label: "Orders", active: true },
  { icon: Pill, label: "Medications" },
  { icon: FlaskConical, label: "Results" },
  { icon: Activity, label: "Flowsheets" },
  { icon: Calendar, label: "Visits" },
  { icon: MessageSquare, label: "Messages", badge: 3 },
];

const SPECS: Record<RealisticVisualKey, RealisticVisualSpec> = {
  orders_workflow: {
    context: {
      activity: "Orders",
      patientLine: "Patient · 47y · MRN ••••",
      encounter: "Outpatient visit · today",
    },
    sidebar: DEFAULT_SIDEBAR,
    tabs: [
      { label: "Order Review" },
      { label: "Order Entry", active: true },
      { label: "Sign Basket" },
      { label: "Pending Cosign" },
    ],
    toolbarActions: ["New", "Reconcile", "Set Defaults", "Order Sets"],
    searchPlaceholder: "Search orders, panels, order sets…",
    rowsHeading: "Pending in basket",
    rows: [
      { primary: "Lipid panel", secondary: "Routine · today", status: "ok" },
      { primary: "Metformin 500 mg PO BID", secondary: "Refill 90 · pharmacy", status: "ok" },
      { primary: "Chest X-ray PA/LAT", secondary: "Priority missing", status: "error" },
      { primary: "TSH with reflex", secondary: "Routine · today", status: "ok" },
    ],
    detail: {
      title: "Chest X-ray PA/LAT",
      fields: [
        { label: "Priority", value: "— required —", status: "error" },
        { label: "Indication", value: "Cough, 3 weeks" },
        { label: "Authorizing provider", value: "Current user" },
        { label: "Encounter", value: "Outpatient visit · today" },
      ],
      warning: "Sign blocked: Priority is required before this order can be signed.",
    },
    actionRow: {
      primary: "Sign basket",
      secondary: "Save & hold",
      note: "Resolve the red row first, then Sign basket.",
    },
    callouts: [
      { n: 1, anchor: "sidebar", label: "Open Orders from the activity sidebar." },
      { n: 2, anchor: "tabs", label: "Switch to Order Entry to add or fix orders." },
      { n: 3, anchor: "row", label: "Red row = missing required field. Open it." },
      { n: 4, anchor: "detail", label: "Fill Priority, then re-check the warning clears." },
      { n: 5, anchor: "action", label: "Sign basket only after every row is clean." },
    ],
  },
  notes_workflow: {
    context: {
      activity: "Notes",
      patientLine: "Patient · 62y · MRN ••••",
      encounter: "Office visit · today",
    },
    sidebar: [
      { icon: Stethoscope, label: "Chart Review" },
      { icon: FileText, label: "Notes", active: true },
      { icon: ClipboardList, label: "Orders" },
      { icon: Pill, label: "Medications" },
      { icon: FlaskConical, label: "Results" },
      { icon: Activity, label: "Flowsheets" },
      { icon: Calendar, label: "Visits" },
      { icon: MessageSquare, label: "Messages" },
    ],
    tabs: [
      { label: "All Notes" },
      { label: "My Notes" },
      { label: "New Note", active: true },
      { label: "Cosign Queue" },
    ],
    toolbarActions: ["Insert SmartPhrase", "Template", "Voice", "Preview"],
    searchPlaceholder: "Search note type (e.g. Progress, H&P, Telephone)…",
    rowsHeading: "Recent note types for this encounter",
    rows: [
      { primary: "Progress Note — Office visit", secondary: "Suggested", status: "ok" },
      { primary: "Telephone Encounter", secondary: "Not for in-person visit", status: "pending" },
      { primary: "H&P", secondary: "Inpatient only", status: "pending" },
      { primary: "Addendum", secondary: "Requires signed note", status: "pending" },
    ],
    detail: {
      title: "Progress Note — Office visit",
      fields: [
        { label: "Subjective", value: "Documented" },
        { label: "Objective", value: "Documented" },
        { label: "Assessment / Plan", value: "Documented" },
        { label: "Attestation", value: "— required —", status: "error" },
      ],
      warning: "Sign blocked: Attestation block is required before signing this note type.",
    },
    actionRow: {
      primary: "Sign note",
      secondary: "Save as draft",
      note: "Complete attestation, then Sign note.",
    },
    callouts: [
      { n: 1, anchor: "sidebar", label: "Open Notes from the activity sidebar." },
      { n: 2, anchor: "tabs", label: "New Note → pick the note type for this encounter." },
      { n: 3, anchor: "row", label: "Pick the suggested row matching the encounter type." },
      { n: 4, anchor: "detail", label: "Fill every red field, including the attestation." },
      { n: 5, anchor: "action", label: "Sign note. If blocked, read the warning aloud." },
    ],
  },
  smartlink_workflow: {
    context: {
      activity: "Notes — SmartTools",
      patientLine: "Patient · 35y · MRN ••••",
      encounter: "Follow-up · today",
    },
    sidebar: [
      { icon: Stethoscope, label: "Chart Review" },
      { icon: FileText, label: "Notes", active: true },
      { icon: ClipboardList, label: "Orders" },
      { icon: Pill, label: "Medications" },
      { icon: FlaskConical, label: "Results" },
      { icon: Activity, label: "Flowsheets" },
      { icon: Calendar, label: "Visits" },
      { icon: MessageSquare, label: "Messages" },
    ],
    tabs: [
      { label: "Note Body", active: true },
      { label: "SmartTools" },
      { label: "Attachments" },
      { label: "Sign" },
    ],
    toolbarActions: ["Insert SmartLink", "Insert SmartPhrase", "Refresh links", "Preview"],
    searchPlaceholder: "Search SmartLink by name (e.g. LastA1c, ActiveProblems)…",
    rowsHeading: "Inserted SmartLinks in this note",
    rows: [
      { primary: "{LastA1c}", secondary: "Resolves to: — blank —", status: "error" },
      { primary: "{ActiveProblems}", secondary: "Resolves to: 3 items", status: "ok" },
      { primary: "{LastBP}", secondary: "Resolves to: 128 / 82 (today)", status: "ok" },
      { primary: "{AllergiesNKDA}", secondary: "Resolves to: NKDA", status: "ok" },
    ],
    detail: {
      title: "{LastA1c}",
      fields: [
        { label: "Source", value: "Lab results — A1c" },
        { label: "Encounter context", value: "Current encounter" },
        { label: "Last value found", value: "— none in chart —", status: "warn" },
        { label: "Renders as", value: "(blank)", status: "error" },
      ],
      warning:
        "SmartLink is blank because no A1c result exists in the chart yet. Order or document the value, then Refresh links.",
    },
    actionRow: {
      primary: "Refresh links",
      secondary: "Replace with literal value",
      note: "If the value belongs to another patient, stop and escalate.",
    },
    callouts: [
      { n: 1, anchor: "tabs", label: "Stay in the Note Body tab while you edit." },
      { n: 2, anchor: "search", label: "Search SmartLink by exact name." },
      { n: 3, anchor: "row", label: "Red row = blank or wrong-context SmartLink." },
      { n: 4, anchor: "detail", label: "Check what it resolves to. Blank ≠ wrong patient." },
      { n: 5, anchor: "action", label: "Refresh links. Escalate if it pulls the wrong chart." },
    ],
  },
};

export function hasRealisticVisual(key: string | null | undefined): key is RealisticVisualKey {
  return !!key && key in SPECS;
}

const STATUS_DOT: Record<RowItem["status"], string> = {
  ok: "bg-success",
  warn: "bg-warning",
  error: "bg-destructive",
  pending: "bg-muted-foreground/40",
};

const FIELD_TONE: Record<NonNullable<RealisticVisualSpec["detail"]["fields"][number]["status"]>, string> = {
  ok: "text-foreground",
  warn: "text-warning",
  error: "text-destructive",
};

function CalloutPin({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-background"
    >
      {n}
    </span>
  );
}

export function RealisticEHRVisual({ visualKey }: { visualKey: RealisticVisualKey }) {
  const spec = SPECS[visualKey];
  const calloutsByAnchor = spec.callouts.reduce<Record<Callout["anchor"], Callout | undefined>>(
    (acc, c) => {
      if (!acc[c.anchor]) acc[c.anchor] = c;
      return acc;
    },
    {} as Record<Callout["anchor"], Callout | undefined>,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-foreground">
      {/* Header / patient context */}
      <div className="relative flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-2 rounded-full bg-primary" />
          <span className="truncate text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
            {spec.context.activity}
          </span>
          <span className="text-muted-foreground/60">·</span>
          <span className="truncate text-[12px] text-foreground/90">{spec.context.patientLine}</span>
          <span className="text-muted-foreground/60">·</span>
          <span className="truncate text-[12px] text-muted-foreground">{spec.context.encounter}</span>
        </div>
        {calloutsByAnchor.header && <CalloutPin n={calloutsByAnchor.header.n} />}
      </div>

      <div className="grid grid-cols-[112px_1fr] sm:grid-cols-[140px_1fr]">
        {/* Sidebar */}
        <div className="relative border-r border-border bg-secondary/30 py-2">
          {calloutsByAnchor.sidebar && (
            <span className="absolute right-1 top-2">
              <CalloutPin n={calloutsByAnchor.sidebar.n} />
            </span>
          )}
          <ul className="space-y-0.5">
            {spec.sidebar.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <div
                    className={`flex items-center gap-2 px-2 py-1.5 text-[11px] ${
                      item.active
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-foreground/80 hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto inline-flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Center workspace */}
        <div className="min-w-0">
          {/* Tabs */}
          <div className="relative flex items-center gap-0.5 border-b border-border bg-secondary/40 px-2">
            {spec.tabs.map((t) => (
              <div
                key={t.label}
                className={`px-2.5 py-1.5 text-[11px] border-b-2 -mb-px ${
                  t.active
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-foreground/70"
                }`}
              >
                {t.label}
              </div>
            ))}
            {calloutsByAnchor.tabs && (
              <span className="ml-auto pr-1">
                <CalloutPin n={calloutsByAnchor.tabs.n} />
              </span>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1.5 border-b border-border px-2 py-1.5">
            {spec.toolbarActions.map((a) => (
              <button
                key={a}
                type="button"
                className="rounded-md border border-border bg-card px-2 py-1 text-[10.5px] text-foreground/80 hover:border-primary/40"
                disabled
              >
                {a}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative border-b border-border px-2 py-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
              <Search className="size-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{spec.searchPlaceholder}</span>
            </div>
            {calloutsByAnchor.search && (
              <span className="absolute right-1 top-1.5">
                <CalloutPin n={calloutsByAnchor.search.n} />
              </span>
            )}
          </div>

          {/* Rows + detail (grid) */}
          <div className="grid sm:grid-cols-[1.1fr_1fr]">
            {/* Rows */}
            <div className="relative border-b sm:border-b-0 sm:border-r border-border">
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30">
                {spec.rowsHeading}
              </div>
              <ul>
                {spec.rows.map((r, i) => {
                  const isError = r.status === "error";
                  const showPin = isError && calloutsByAnchor.row;
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-2 px-2 py-1.5 text-[11px] border-b border-border/60 last:border-b-0 ${
                        isError ? "bg-destructive/5" : ""
                      }`}
                    >
                      <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${STATUS_DOT[r.status]}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">{r.primary}</span>
                        <span className={`block truncate text-[10.5px] ${isError ? "text-destructive" : "text-muted-foreground"}`}>
                          {r.secondary}
                        </span>
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/60" />
                      {showPin && <CalloutPin n={calloutsByAnchor.row!.n} />}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Detail / error panel */}
            <div className="relative">
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30 flex items-center justify-between gap-2">
                <span className="truncate">Detail · {spec.detail.title}</span>
                {calloutsByAnchor.detail && <CalloutPin n={calloutsByAnchor.detail.n} />}
              </div>
              <dl className="px-2 py-2 space-y-1.5">
                {spec.detail.fields.map((f) => (
                  <div key={f.label} className="flex items-start gap-2 text-[11px]">
                    <dt className="w-28 shrink-0 text-muted-foreground">{f.label}</dt>
                    <dd className={`min-w-0 flex-1 font-medium ${f.status ? FIELD_TONE[f.status] : "text-foreground"}`}>
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {spec.detail.warning && (
                <div className="mx-2 mb-2 flex items-start gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[10.5px] text-destructive">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  <span>{spec.detail.warning}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action row */}
          <div className="relative flex items-center gap-2 border-t border-border bg-secondary/30 px-2 py-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground"
              disabled
            >
              <Check className="size-3.5" />
              {spec.actionRow.primary}
            </button>
            <button
              type="button"
              className="rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] text-foreground/80"
              disabled
            >
              {spec.actionRow.secondary}
            </button>
            <span className="ml-auto truncate text-[10.5px] text-muted-foreground">
              {spec.actionRow.note}
            </span>
            {calloutsByAnchor.action && <CalloutPin n={calloutsByAnchor.action.n} />}
          </div>
        </div>
      </div>

      {/* Callout legend */}
      <ol className="grid gap-1 border-t border-border bg-secondary/20 px-3 py-2 text-[11px]">
        {spec.callouts.map((c) => (
          <li key={c.n} className="flex items-start gap-2">
            <CalloutPin n={c.n} />
            <span className="text-foreground/85">{c.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
