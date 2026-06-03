// Mizly Source Conversion Queue — admin-only mock data.
// Maps raw source material to Mizly-original sanitized content via lineage.
// TODO: REMOVE BEFORE PRODUCTION LAUNCH — replace with Supabase-backed admin store.
import { useSyncExternalStore } from "react";

export type SourceConversionType =
  | "transcript"
  | "document"
  | "taxonomy"
  | "question_bank"
  | "admin_note";

export type RiskStatus = "low" | "medium" | "high" | "quarantined";

export type ConversionStatus =
  | "new"
  | "scanned"
  | "rewriting"
  | "needs_review"
  | "sanitized"
  | "published";

export interface SafetyChecklist {
  no_phi: boolean;
  no_org_names: boolean;
  no_vendor_assets: boolean;
  no_copied_text: boolean;
  no_credentials_or_links: boolean;
  vendor_names_admin_only: boolean;
  rewritten_original: boolean;
}

export const EMPTY_CHECKLIST: SafetyChecklist = {
  no_phi: false,
  no_org_names: false,
  no_vendor_assets: false,
  no_copied_text: false,
  no_credentials_or_links: false,
  vendor_names_admin_only: false,
  rewritten_original: false,
};

export interface ConversionDraft {
  mizly_title: string;
  target_type: "lesson" | "playbook" | "checklist" | "scenario" | "video";
  role_tags: string;
  domain_tags: string;
  phase_tags: string;
  urgency: number;
  escalation: number;
  frequency: string;
  short_summary: string;
  first90: string;
  what_to_say: string;
  what_to_check: string;
  when_to_escalate: string;
  related_content: string;
  internal_lineage_note: string;
  sanitized_approved: boolean;
  checklist: SafetyChecklist;
  status: "draft" | "published";
}

export interface ConvertedItemLineage {
  item_id: string;       // ContentItem id (in demo-data.ITEMS)
  converted_on: string;  // ISO date
  converted_by: string;  // Admin display name
  sanitized_approved: boolean;
}

export interface SourceConversion {
  id: string;
  title: string;
  type: SourceConversionType;
  risk: RiskStatus;
  status: ConversionStatus;
  suggested_domain: string;
  suggested_role: string;
  suggested_phase: string;
  scanner_flags: string[];
  admin_notes: string;
  lineage_id: string;             // internal source lineage ID
  excerpt: string;                // admin-only raw excerpt (NEVER shown to learners)
  converted_items: ConvertedItemLineage[];
  draft?: ConversionDraft;
  last_updated: string;           // ISO date
}

// --- Seed queue --------------------------------------------------------

const SEED: SourceConversion[] = [
  {
    id: "cv_bed_control",
    title: "Bed control workflow transcript",
    type: "transcript",
    risk: "medium",
    status: "published",
    suggested_domain: "Transfer / patient placement",
    suggested_role: "Bed control, inpatient nurse, registration, all roles",
    suggested_phase: "Cutover day 0, stabilization week 1",
    scanner_flags: ["Mentions vendor name (admin only)", "Mentions org acronym"],
    admin_notes: "Source captured from a bed control coordinator during a regional go-live. Vendor names appeared in source but are stripped from learner-facing output.",
    lineage_id: "LIN-2026-BC-001",
    excerpt: "[Admin-only excerpt — not shown to learners] Coordinator describes how placement requests arrive, the order/status check, and the handoff during shift change.",
    converted_items: [
      { item_id: "l16", converted_on: "2026-06-02", converted_by: "Admin", sanitized_approved: true },
      { item_id: "p17", converted_on: "2026-06-02", converted_by: "Admin", sanitized_approved: true },
      { item_id: "c11", converted_on: "2026-06-02", converted_by: "Admin", sanitized_approved: true },
      { item_id: "s10", converted_on: "2026-06-02", converted_by: "Admin", sanitized_approved: true },
      { item_id: "v13", converted_on: "2026-06-02", converted_by: "Admin", sanitized_approved: true },
    ],
    last_updated: "2026-06-02",
  },
  {
    id: "cv_first_shift",
    title: "First-shift readiness notes",
    type: "admin_note",
    risk: "low",
    status: "scanned",
    suggested_domain: "Go-Live Readiness",
    suggested_role: "Floor Consultant, all roles",
    suggested_phase: "Cutover day 0",
    scanner_flags: [],
    admin_notes: "Notes captured by a senior consultant before cutover day. Pre-shift checks plus the calm first-hour pattern.",
    lineage_id: "LIN-2026-FS-002",
    excerpt: "[Admin-only excerpt] Pre-shift readiness: badge, device, contact list, downtime kit. Find the charge nurse first.",
    converted_items: [],
    last_updated: "2026-06-01",
  },
  {
    id: "cv_printer_triage",
    title: "Printer triage notes",
    type: "document",
    risk: "medium",
    status: "needs_review",
    suggested_domain: "Printing",
    suggested_role: "Inpatient nurse, registration, all roles",
    suggested_phase: "Cutover day 0, stabilization week 1",
    scanner_flags: ["External link detected (stripped)"],
    admin_notes: "Workflow-only notes. Confirm printer-context patterns before publishing as Mizly-original.",
    lineage_id: "LIN-2026-PR-003",
    excerpt: "[Admin-only excerpt] Print job failing. Check workstation context, walk to physical printer, single reprint.",
    converted_items: [],
    last_updated: "2026-05-30",
  },
  {
    id: "cv_command_handoff",
    title: "Command center handoff notes",
    type: "admin_note",
    risk: "low",
    status: "rewriting",
    suggested_domain: "Command Center Escalation",
    suggested_role: "Floor Lead, Command Center",
    suggested_phase: "Cutover day 0, stabilization week 1",
    scanner_flags: [],
    admin_notes: "Three-sentence escalation pattern. Already aligned with Mizly tone; ready to draft.",
    lineage_id: "LIN-2026-CC-004",
    excerpt: "[Admin-only excerpt] What broke, scope + severity, what you need with callback number.",
    converted_items: [],
    last_updated: "2026-05-29",
  },
  {
    id: "cv_pain_taxonomy",
    title: "Consultant pain-point taxonomy",
    type: "taxonomy",
    risk: "low",
    status: "new",
    suggested_domain: "Floor Scenarios",
    suggested_role: "Floor Consultant",
    suggested_phase: "Cutover day 0, stabilization week 1",
    scanner_flags: [],
    admin_notes: "Tag list capturing recurring pain points. Will feed both Question Bank and Coverage targeting.",
    lineage_id: "LIN-2026-TX-005",
    excerpt: "[Admin-only excerpt] Pain points: lost time on logins, unclear bed assignments, printer context mismatches, vague escalations.",
    converted_items: [],
    last_updated: "2026-05-28",
  },
];

// --- Reactive in-memory store ------------------------------------------
let _store: SourceConversion[] = SEED.slice();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function useConversions(): SourceConversion[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => _store,
    () => _store,
  );
}

export function getConversion(id: string): SourceConversion | undefined {
  return _store.find(c => c.id === id);
}

export function updateConversion(id: string, patch: Partial<SourceConversion>) {
  _store = _store.map(c => c.id === id ? { ...c, ...patch, last_updated: new Date().toISOString().slice(0, 10) } : c);
  emit();
}

export function saveDraft(id: string, draft: ConversionDraft) {
  updateConversion(id, { draft, status: draft.sanitized_approved ? "sanitized" : "rewriting" });
}

export function publishConversion(id: string, draft: ConversionDraft) {
  const finalDraft: ConversionDraft = { ...draft, status: "published" };
  updateConversion(id, { draft: finalDraft, status: "published" });
}

export function markNeedsReview(id: string) {
  updateConversion(id, { status: "needs_review" });
}

// --- Labels ------------------------------------------------------------

export const TYPE_LABEL: Record<SourceConversionType, string> = {
  transcript: "Transcript",
  document: "Document",
  taxonomy: "Taxonomy",
  question_bank: "Question bank",
  admin_note: "Admin note",
};

export const RISK_LABEL: Record<RiskStatus, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  quarantined: "Quarantined",
};

export const RISK_CLS: Record<RiskStatus, string> = {
  low: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
  quarantined: "bg-destructive/15 text-destructive",
};

export const STATUS_LABEL: Record<ConversionStatus, string> = {
  new: "New",
  scanned: "Scanned",
  rewriting: "Rewriting",
  needs_review: "Needs review",
  sanitized: "Sanitized",
  published: "Published",
};

export const STATUS_CLS: Record<ConversionStatus, string> = {
  new: "bg-secondary text-secondary-foreground",
  scanned: "bg-primary-soft text-primary",
  rewriting: "bg-warning/15 text-warning",
  needs_review: "bg-accent text-accent-foreground",
  sanitized: "bg-success/15 text-success",
  published: "bg-success/15 text-success",
};

export const CHECKLIST_LABELS: { key: keyof SafetyChecklist; label: string }[] = [
  { key: "no_phi", label: "No PHI" },
  { key: "no_org_names", label: "No organization names" },
  { key: "no_vendor_assets", label: "No vendor screenshots or logos" },
  { key: "no_copied_text", label: "No copied proprietary training text" },
  { key: "no_credentials_or_links", label: "No credentials or private links" },
  { key: "vendor_names_admin_only", label: "Vendor names only in admin/legal metadata if needed" },
  { key: "rewritten_original", label: "Rewritten as Mizly-original guidance" },
];

export function allChecklistChecked(c: SafetyChecklist): boolean {
  return CHECKLIST_LABELS.every(({ key }) => c[key]);
}

// Map of ContentItem id -> source lineage (for admin-only display on item views).
export function lineageForItem(item_id: string): { source: SourceConversion; lineage: ConvertedItemLineage } | null {
  for (const c of _store) {
    const l = c.converted_items.find(ci => ci.item_id === item_id);
    if (l) return { source: c, lineage: l };
  }
  return null;
}
