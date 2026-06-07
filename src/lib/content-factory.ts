import { ITEMS, MODULES, itemById, type ContentItem } from "./demo-data";
import { type SourceConversion, type ConversionStatus } from "./conversions-data";
import { type SourcePack } from "./source-packs-data";
import { LAUNCH_LIBRARY, type LaunchEntry, type VisualAidKind } from "./launch-library";
import { retrieveKbSupport } from "./kb-retrieval";

export type VisualNeedSource = "ask_gap" | "library_gap";
export type VisualNeedStatus = "new" | "planned" | "in_production" | "done";
export type VisualNeedPriority = "high" | "medium" | "low";

export interface AskGapLogRecord {
  query?: string;
  answerTitle?: string;
  gaps?: {
    kind?: VisualAidKind;
    label?: string;
    priority?: VisualNeedPriority;
  }[];
  ts?: number;
}

export interface VisualReferencePointer {
  pdf: string;
  section: string;
  refPattern: string;
  use: string;
  exposureStatus: string;
}

export interface VisualNeed {
  id: string;
  kind: VisualAidKind;
  priority: VisualNeedPriority;
  status: VisualNeedStatus;
  title: string;
  workflowTitle: string;
  question: string;
  reason: string;
  suggestedOutput: string;
  source: VisualNeedSource;
  conversionId?: string;
  relatedContentIds: string[];
  createdAt: string;
  reference?: VisualReferencePointer;
}

export interface FactoryStage {
  id: string;
  label: string;
  summary: string;
  count: number;
  to: string;
  tone: "primary" | "teal" | "warning" | "danger" | "muted";
}

export interface FactorySnapshot {
  kpis: {
    sourcePacks: number;
    queuedSources: number;
    visualNeeds: number;
    publishedItems: number;
    thinModules: number;
  };
  stages: FactoryStage[];
  priorityConversions: SourceConversion[];
  topVisualNeeds: VisualNeed[];
}

const VISUAL_KIND_LABEL: Record<VisualAidKind, string> = {
  screenshot: "Sanitized screenshot",
  video: "Training video",
  tasklet: "Click path",
};

const KIND_OUTPUT: Record<VisualAidKind, string> = {
  screenshot: "Create a Mizly-original mock screenshot with numbered callouts.",
  video: "Create a short Mizly training clip that follows the exact walkthrough.",
  tasklet: "Create a text-only click path using generic screen names and local-policy language.",
};

const PACK08_VISUAL_NEEDS: VisualNeed[] = [
  {
    id: "pack08_ll_schedule_appointment_not_visible_screenshot",
    kind: "screenshot",
    priority: "medium",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Appointment is not showing on the schedule",
    question: "Ask: appointment not showing",
    reason: "Pack 08 added a Mizly-original schedule mock screen with context, filter, refresh, and escalation callouts.",
    suggestedOutput: "Live at /visual-guides/schedule-appointment-missing.svg",
    source: "library_gap",
    conversionId: "cv_patient_list_worklist",
    relatedContentIds: ["p18", "c12", "v14"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack08_ll_document_scanned_to_wrong_encounter_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Scanned document may be attached to the wrong encounter",
    question: "Ask: document scanned to wrong encounter",
    reason: "Pack 08 added a Mizly-original document-details mock screen with document type, encounter/date, duplicate-risk, and owner callouts.",
    suggestedOutput: "Live at /visual-guides/document-wrong-encounter.svg",
    source: "library_gap",
    conversionId: "cv_documentation_notes_basics",
    relatedContentIds: ["p36", "c30", "v32"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack08_ll_flowsheet_row_hidden_or_time_column_wrong_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Flowsheet row is missing or charting in the wrong time column",
    question: "Ask: flowsheet row missing wrong time column",
    reason: "Pack 08 added a Mizly-original flowsheet mock screen with group, row, time-column, and file/save callouts.",
    suggestedOutput: "Live at /visual-guides/flowsheet-row-time-column.svg",
    source: "library_gap",
    conversionId: "cv_documentation_notes_basics",
    relatedContentIds: ["p23", "c17", "v19"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack08_ll_mar_med_not_showing_due_time_filter_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Medication is not showing on the MAR",
    question: "Ask: medication not showing on MAR",
    reason: "Pack 08 added a Mizly-original MAR mock screen with date/time, view-filter, order-status, and verification callouts.",
    suggestedOutput: "Live at /visual-guides/mar-medication-filter.svg",
    source: "library_gap",
    conversionId: "cv_orders_entry_basics",
    relatedContentIds: ["p22", "c16", "v18"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack08_ll_workqueue_item_assigned_to_wrong_owner_screenshot",
    kind: "screenshot",
    priority: "medium",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Workqueue item is in the wrong owner or pool",
    question: "Ask: workqueue item assigned to wrong owner",
    reason: "Pack 08 added a Mizly-original workqueue mock screen with queue, owner, filter, and route-action callouts.",
    suggestedOutput: "Live at /visual-guides/workqueue-owner-routing.svg",
    source: "library_gap",
    conversionId: "cv_results_reports_basics",
    relatedContentIds: ["p19", "c13", "v15"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack08_ll_escalation_packet_for_command_center_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Build a clean escalation packet",
    question: "Ask: what do I send command center",
    reason: "Pack 08 added a Mizly-original escalation packet card with scope, impact, blocker, tried-safely, owner, and callback callouts.",
    suggestedOutput: "Live at /visual-guides/escalation-packet.svg",
    source: "library_gap",
    conversionId: "cv_bed_control",
    relatedContentIds: ["p1", "c3", "v7"],
    createdAt: "2026-06-05",
  },
];

const PACK09_VISUAL_NEEDS: VisualNeed[] = [
  {
    id: "pack09_ll_allergy_or_reaction_blocks_order_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Allergy or reaction field is blocking medication workflow",
    question: "Ask: allergy",
    reason: "Pack 09 added a Mizly-original medication-safety mock screen with allergy context, blocked order, owner, and escalation callouts.",
    suggestedOutput: "Live at /visual-guides/allergy-reaction-block.svg",
    source: "library_gap",
    conversionId: "cv_orders_entry_basics",
    relatedContentIds: ["p31", "c25", "v27"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack09_ll_attestation_cosign_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Attestation or cosign routing question",
    question: "Ask: attestation",
    reason: "Pack 09 added a Mizly-original signature-routing mock screen with source action, owner role, task status, and route callouts.",
    suggestedOutput: "Live at /visual-guides/attestation-cosign-routing.svg",
    source: "library_gap",
    conversionId: "cv_orders_entry_basics",
    relatedContentIds: ["p28", "c22", "v24"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack09_ll_authorization_or_referral_status_missing_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Authorization or referral status is missing",
    question: "Ask: authorization missing",
    reason: "Pack 09 added a Mizly-original referral/auth mock screen with appointment context, status, coverage lane, and owner callouts.",
    suggestedOutput: "Live at /visual-guides/authorization-referral-status.svg",
    source: "library_gap",
    conversionId: "cv_charge_billing_support",
    relatedContentIds: ["p20", "c14", "v16"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack09_ll_downtime_backload_queue_after_restore_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Backloading after downtime or paper workflow",
    question: "Ask: backload",
    reason: "Pack 09 added a Mizly-original downtime backload mock screen with priority, owner, timestamp, and verification callouts.",
    suggestedOutput: "Live at /visual-guides/downtime-backload-queue.svg",
    source: "library_gap",
    conversionId: "cv_bed_control",
    relatedContentIds: ["p1", "c6", "v9"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack09_ll_ambulation_no_option_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Can't find wheelchair-to-bathroom under Transport",
    question: "Ask: ambulated",
    reason: "Pack 09 added a Mizly-original mobility documentation mock screen with ADL, Mobility, assist/device, and escalation callouts.",
    suggestedOutput: "Live at /visual-guides/ambulation-mobility-option.svg",
    source: "library_gap",
    conversionId: "cv_documentation_notes_basics",
    relatedContentIds: ["p35", "c29", "v31"],
    createdAt: "2026-06-05",
  },
  {
    id: "pack09_ll_consent_missing_before_procedure_screenshot",
    kind: "screenshot",
    priority: "high",
    status: "done",
    title: "Sanitized screenshot ready",
    workflowTitle: "Consent is missing before a procedure",
    question: "Ask: consent missing",
    reason: "Pack 09 added a Mizly-original consent status mock screen with procedure context, signed status, scan/link status, and owner callouts.",
    suggestedOutput: "Live at /visual-guides/consent-procedure-status.svg",
    source: "library_gap",
    conversionId: "cv_documentation_notes_basics",
    relatedContentIds: ["p36", "c30", "v32"],
    createdAt: "2026-06-05",
  },
];

const STATUS_WEIGHT: Record<ConversionStatus, number> = {
  needs_review: 0,
  scanned: 1,
  rewriting: 2,
  sanitized: 3,
  new: 4,
  published: 9,
};

const PRIORITY_WEIGHT: Record<VisualNeedPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64) || "item";
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function relatedItems(entry: LaunchEntry): ContentItem[] {
  return entry.related_ids.map(id => itemById(id)).filter(Boolean) as ContentItem[];
}

function priorityFor(entry: LaunchEntry, fallback: VisualNeedPriority): VisualNeedPriority {
  if (fallback === "high" || entry.urgency >= 3 || entry.escalation >= 3) return "high";
  if (fallback === "medium" || entry.urgency >= 2 || entry.escalation >= 2) return "medium";
  return "low";
}

function conversionFor(text: string): string | undefined {
  const hay = text.toLowerCase();
  if (hay.includes("login") || hay.includes("access") || hay.includes("password")) return "cv_login_access_support";
  if (hay.includes("print") || hay.includes("wristband") || hay.includes("label")) return "cv_printer_triage";
  if (hay.includes("patient list") || hay.includes("worklist") || hay.includes("list looks")) return "cv_patient_list_worklist";
  if (hay.includes("bed") || hay.includes("placement") || hay.includes("transfer")) return "cv_bed_control";
  if (hay.includes("billing") || hay.includes("charge") || hay.includes("coverage")) return "cv_charge_billing_support";
  if (hay.includes("order")) return "cv_orders_entry_basics";
  if (hay.includes("document") || hay.includes("note")) return "cv_documentation_notes_basics";
  if (hay.includes("result") || hay.includes("report")) return "cv_results_reports_basics";
  return undefined;
}

function scrubQuestion(input: string): string {
  return input
    .replace(/\b(epic|cerner|oracle health|meditech)\b/gi, "vendor system")
    .replace(/\bmrn\b\s*[:#-]?\s*[a-z0-9-]+/gi, "identifier [redacted]")
    .replace(/\bdob\b\s*[:#-]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/gi, "date field [redacted]")
    .replace(/\b(patient name|member name)\b\s*[:#-]?\s*[a-z ,.'-]+/gi, "person field [redacted]")
    .slice(0, 180);
}

function dedupeNeeds(needs: VisualNeed[]): VisualNeed[] {
  const seen = new Set<string>();
  return needs.filter(need => {
    const key = `${need.source}:${need.workflowTitle}:${need.kind}:${need.question}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function visualNeedsFromLibrary(limit = 18): VisualNeed[] {
  const needs = LAUNCH_LIBRARY.flatMap(entry => {
    const items = relatedItems(entry);
    const support = retrieveKbSupport(`${entry.title} ${entry.keywords.join(" ")}`, entry, items, "strong");
    return support.gaps.map(gap => ({
      id: `lib_${entry.id}_${gap.kind}`,
      kind: gap.kind,
      priority: priorityFor(entry, gap.priority),
      status: entry.visual_url && gap.kind === "screenshot" ? "done" as const : "new" as const,
      title: entry.visual_url && gap.kind === "screenshot" ? `${VISUAL_KIND_LABEL[gap.kind]} ready` : `${VISUAL_KIND_LABEL[gap.kind]} needed`,
      workflowTitle: entry.title,
      question: entry.keywords[0] ? `Ask: ${entry.keywords[0]}` : "Ask pattern coverage",
      reason: gap.prompt,
      suggestedOutput: entry.visual_url && gap.kind === "screenshot" ? `Live at ${entry.visual_url}` : KIND_OUTPUT[gap.kind],
      source: "library_gap" as const,
      conversionId: conversionFor(`${entry.title} ${entry.domains.join(" ")}`),
      relatedContentIds: entry.related_ids,
      createdAt: today(),
    }));
  });

  return dedupeNeeds(needs)
    .sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || a.workflowTitle.localeCompare(b.workflowTitle))
    .slice(0, limit);
}

export function visualNeedsFromAskGapLog(records: AskGapLogRecord[]): VisualNeed[] {
  const needs = records.flatMap((record, index) => {
    const workflowTitle = record.answerTitle?.trim() || "Ask answer";
    const safeQuestion = scrubQuestion(record.query?.trim() || "Question not stored");
    const stamp = record.ts ? new Date(record.ts).toISOString().slice(0, 10) : today();
    return (record.gaps ?? []).flatMap(gap => {
      if (gap.kind !== "screenshot" && gap.kind !== "video" && gap.kind !== "tasklet") return [];
      const priority = gap.priority ?? "medium";
      return [{
        id: `ask_${record.ts ?? index}_${slug(workflowTitle)}_${gap.kind}`,
        kind: gap.kind,
        priority,
        status: "new" as const,
        title: gap.label || `${VISUAL_KIND_LABEL[gap.kind]} needed`,
        workflowTitle,
        question: safeQuestion,
        reason: `${VISUAL_KIND_LABEL[gap.kind]} was missing when this Ask answer rendered.`,
        suggestedOutput: KIND_OUTPUT[gap.kind],
        source: "ask_gap" as const,
        conversionId: conversionFor(`${workflowTitle} ${safeQuestion}`),
        relatedContentIds: [],
        createdAt: stamp,
      }];
    });
  });

  return dedupeNeeds(needs).sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || b.createdAt.localeCompare(a.createdAt));
}

export function mergeVisualNeeds(logged: AskGapLogRecord[]): VisualNeed[] {
  return dedupeNeeds([
    ...PACK08_VISUAL_NEEDS,
    ...PACK09_VISUAL_NEEDS,
    ...visualNeedsFromAskGapLog(logged),
    ...visualNeedsFromLibrary(),
  ]).sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || b.createdAt.localeCompare(a.createdAt));
}

export function readAskGapLog(): AskGapLogRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem("mizly.ask.content_gaps") ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function thinModuleGaps() {
  const contentTypes = ["lesson", "playbook", "video", "checklist", "scenario"] as const;
  return MODULES.flatMap(module => {
    const missing = contentTypes.filter(type => !ITEMS.some(item => item.module_id === module.id && item.content_type === type && item.publish_status === "published"));
    return missing.map(type => ({ module, type }));
  });
}

export function buildFactorySnapshot(
  conversions: SourceConversion[],
  sourcePacks: SourcePack[],
  visualNeeds: VisualNeed[],
): FactorySnapshot {
  const queuedSources = conversions.filter(c => c.status !== "published");
  const priorityConversions = queuedSources
    .slice()
    .sort((a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status] || b.last_updated.localeCompare(a.last_updated))
    .slice(0, 6);

  const stages: FactoryStage[] = [
    {
      id: "intake",
      label: "Source intake",
      summary: "Uploaded source packs and admin-only inputs.",
      count: sourcePacks.length,
      to: "/admin/source-packs",
      tone: "primary",
    },
    {
      id: "scan",
      label: "Risk scan",
      summary: "Sources still needing review or quarantine decisions.",
      count: conversions.filter(c => c.status === "new" || c.status === "scanned" || c.status === "needs_review").length,
      to: "/admin/conversions",
      tone: "warning",
    },
    {
      id: "rewrite",
      label: "Rewrite",
      summary: "Mizly-original drafts in progress.",
      count: conversions.filter(c => c.status === "rewriting").length,
      to: "/admin/conversions",
      tone: "teal",
    },
    {
      id: "taxonomy",
      label: "Taxonomy",
      summary: "Role, domain, phase, urgency, and escalation tags.",
      count: sourcePacks.reduce((sum, pack) => sum + pack.topic_count, 0),
      to: "/admin/taxonomy",
      tone: "muted",
    },
    {
      id: "visuals",
      label: "Visual needs",
      summary: "Screenshots, click paths, and short clips still needed.",
      count: visualNeeds.filter(need => need.status !== "done").length,
      to: "/admin/visual-needs",
      tone: "danger",
    },
    {
      id: "publish",
      label: "Publish",
      summary: "Sanitized Mizly items already learner-facing.",
      count: ITEMS.filter(item => item.publish_status === "published").length,
      to: "/admin/coverage",
      tone: "primary",
    },
  ];

  return {
    kpis: {
      sourcePacks: sourcePacks.length,
      queuedSources: queuedSources.length,
      visualNeeds: visualNeeds.length,
      publishedItems: ITEMS.filter(item => item.publish_status === "published").length,
      thinModules: thinModuleGaps().length,
    },
    stages,
    priorityConversions,
    topVisualNeeds: visualNeeds.slice(0, 6),
  };
}
