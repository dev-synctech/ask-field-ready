// Mizly Source Packs — admin-only package intake metadata.
// Raw source files never ship in the learner-facing app.
// TODO: REMOVE BEFORE PRODUCTION LAUNCH — replace with Supabase storage + server-side scanners.
import { useSyncExternalStore } from "react";

export type SourcePackStatus =
  | "uploaded"
  | "indexed"
  | "quarantined"
  | "ready_for_conversion"
  | "converted";

export type SourcePackRisk = "low" | "medium" | "high";
export type TopicCoverage = "rich" | "solid" | "thin";

export interface SourcePackRiskSignal {
  category: string;
  count: number;
  severity: SourcePackRisk;
  note: string;
}

export interface SourcePackTopic {
  id: string;
  label: string;
  artifacts: number;
  coverage: TopicCoverage;
  priority: number;
  recommended_outputs: string[];
  conversion_id?: string;
  note: string;
}

export interface SourcePack {
  id: string;
  title: string;
  file_name: string;
  uploaded_at: string;
  status: SourcePackStatus;
  risk: SourcePackRisk;
  summary: string;
  docs_count: number;
  transcripts_count: number;
  indexed_artifacts: number;
  topic_count: number;
  schema_detected: boolean;
  inventory_detected: boolean;
  clusters_detected: boolean;
  gap_report_detected: boolean;
  source_location_note: string;
  risk_signals: SourcePackRiskSignal[];
  topics: SourcePackTopic[];
  thin_topics: string[];
  guardrails: string[];
}

export const SOURCE_PACK_STATUS_LABEL: Record<SourcePackStatus, string> = {
  uploaded: "Uploaded",
  indexed: "Indexed",
  quarantined: "Quarantined",
  ready_for_conversion: "Ready for conversion",
  converted: "Converted",
};

export const SOURCE_PACK_STATUS_CLS: Record<SourcePackStatus, string> = {
  uploaded: "bg-secondary text-secondary-foreground",
  indexed: "bg-primary-soft text-primary",
  quarantined: "bg-destructive/15 text-destructive",
  ready_for_conversion: "bg-warning/15 text-warning",
  converted: "bg-success/15 text-success",
};

export const SOURCE_PACK_RISK_LABEL: Record<SourcePackRisk, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export const SOURCE_PACK_RISK_CLS: Record<SourcePackRisk, string> = {
  low: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
};

const ATE_DONE_TOPICS: SourcePackTopic[] = [
  {
    id: "login_access",
    label: "Login and access support",
    artifacts: 9,
    coverage: "solid",
    priority: 1,
    recommended_outputs: ["Ask entries", "first-90-seconds playbook", "checklist"],
    conversion_id: "cv_login_access_support",
    note: "High-frequency go-live support lane. Best first conversion because it helps every role.",
  },
  {
    id: "printer_device",
    label: "Printer and device support",
    artifacts: 4,
    coverage: "thin",
    priority: 1,
    recommended_outputs: ["Ask entries", "playbook", "quick checklist"],
    conversion_id: "cv_printer_triage",
    note: "Thin but urgent. Use as a small pack with clear checks and escalation language.",
  },
  {
    id: "patient_movement",
    label: "Patient movement and placement",
    artifacts: 6,
    coverage: "solid",
    priority: 2,
    recommended_outputs: ["lesson", "playbook", "checklist", "scenario"],
    conversion_id: "cv_bed_control",
    note: "Already has a converted bed-control pack; remaining sources can deepen transport and handoff coverage.",
  },
  {
    id: "patient_list_worklist",
    label: "Patient lists and worklists",
    artifacts: 14,
    coverage: "solid",
    priority: 2,
    recommended_outputs: ["lesson", "Ask entries", "role checklist"],
    conversion_id: "cv_patient_list_worklist",
    note: "Useful for new consultants because it answers where to start and what list/work queue to check.",
  },
  {
    id: "documentation_notes",
    label: "Documentation and notes",
    artifacts: 83,
    coverage: "rich",
    priority: 3,
    recommended_outputs: ["module", "lessons", "scenarios", "video scripts"],
    conversion_id: "cv_documentation_notes_basics",
    note: "Richest area. Convert in smaller role-based packs so it stays simple.",
  },
  {
    id: "orders_order_entry",
    label: "Orders and order entry",
    artifacts: 54,
    coverage: "rich",
    priority: 3,
    recommended_outputs: ["module", "playbooks", "scenarios", "Ask entries"],
    conversion_id: "cv_orders_entry_basics",
    note: "Large source pool. Needs careful rewrite because source language is system-heavy.",
  },
  {
    id: "medication",
    label: "Medication workflow support",
    artifacts: 18,
    coverage: "solid",
    priority: 4,
    recommended_outputs: ["safety playbook", "checklist", "escalation guide"],
    conversion_id: "cv_medication_support_basics",
    note: "Useful but higher safety bar. Keep it support-oriented and defer clinical interpretation.",
  },
  {
    id: "results_reports",
    label: "Results, reports, and reporting",
    artifacts: 53,
    coverage: "rich",
    priority: 4,
    recommended_outputs: ["lessons", "Ask entries", "checklists"],
    conversion_id: "cv_results_reports_basics",
    note: "Good for operational support questions about where to verify and when to escalate.",
  },
  {
    id: "charge_billing",
    label: "Charge and billing support",
    artifacts: 37,
    coverage: "rich",
    priority: 5,
    recommended_outputs: ["role pack", "playbook", "checklist"],
    conversion_id: "cv_charge_billing_support",
    note: "Strong source volume, but should ship after the field-floor workflows are stable.",
  },
  {
    id: "specialty_packs",
    label: "Specialty packs",
    artifacts: 8,
    coverage: "thin",
    priority: 6,
    recommended_outputs: ["video scripts", "role lessons", "scenario packs"],
    conversion_id: "cv_specialty_pack_planning",
    note: "Use after core workflows. Best candidates: lab, imaging, anesthesia, OB, ED.",
  },
];

const PACKS: SourcePack[] = [
  {
    id: "pack_ate_done_20260603_0947",
    title: "Mizly go-live source pack — 2026-06-03",
    file_name: "ATE_DONE_2026-06-03_0947EDT.zip",
    uploaded_at: "2026-06-03",
    status: "quarantined",
    risk: "high",
    summary:
      "Scrubbed source-library package with documents, transcripts, inventory, topic clusters, gap report, and a content schema. Use it as admin-only raw material for Mizly-original drafts.",
    docs_count: 312,
    transcripts_count: 5,
    indexed_artifacts: 281,
    topic_count: 17,
    schema_detected: true,
    inventory_detected: true,
    clusters_detected: true,
    gap_report_detected: true,
    source_location_note:
      "Stored outside learner-facing routes. Raw files, filenames, and source excerpts remain admin-only until rewritten and approved.",
    risk_signals: [
      {
        category: "Vendor/system references",
        count: 3898,
        severity: "high",
        note: "Keep as internal metadata only. Do not show raw terms or source labels to learners.",
      },
      {
        category: "PHI-field labels",
        count: 108,
        severity: "high",
        note: "Mostly workflow labels and placeholders, but every conversion must remove patient-identifying context.",
      },
      {
        category: "Credential/security wording",
        count: 115,
        severity: "high",
        note: "Use only as generic access-support guidance. Never publish credentials, URLs, or private-system references.",
      },
      {
        category: "Private or external links",
        count: 16,
        severity: "high",
        note: "Strip links from all learner-facing drafts and replace with local-policy language.",
      },
      {
        category: "Organization/source-name remnants",
        count: 30,
        severity: "medium",
        note: "Source filenames still contain org/source shorthand. Do not expose raw filenames in learner views.",
      },
    ],
    topics: ATE_DONE_TOPICS,
    thin_topics: [
      "Discharge handoff",
      "Personalization",
      "Treatment planning",
      "Specialty imaging",
      "Specialty lab",
      "Specialty OB",
      "Specialty anesthesia",
      "Specialty cardiology",
      "Onboarding and orientation",
      "Macros and automation",
    ],
    guardrails: [
      "Raw source pack is admin-only and quarantined by default.",
      "Do not publish raw files, raw filenames, or source excerpts.",
      "Rewrite every artifact as Mizly-original guidance.",
      "Remove organization names, private links, credentials, patient identifiers, and source-specific wording.",
      "Keep vendor/system family references as internal metadata only.",
      "Require sanitized approval before publishing to Ask, Learn, Playbooks, Checklists, Scenarios, or Videos.",
    ],
  },
];

const listeners = new Set<() => void>();

export function useSourcePacks(): SourcePack[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => PACKS,
    () => PACKS,
  );
}

export function getSourcePack(id: string): SourcePack | undefined {
  return PACKS.find(p => p.id === id);
}

export function priorityTopics(pack: SourcePack) {
  return pack.topics.slice().sort((a, b) => a.priority - b.priority || b.artifacts - a.artifacts);
}
