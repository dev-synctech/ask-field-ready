// Phase 2 — Question Bank
// Admin-only structured go-live questions. Vendor-neutral, PHI-free.
// TODO: REMOVE BEFORE PRODUCTION LAUNCH — replace with Supabase-backed store.
import { useSyncExternalStore } from "react";

export type QuestionStatus = "new" | "reviewed" | "converted" | "archived";

export interface QuestionRecord {
  id: string;
  text: string;
  role_id?: string;
  domain_id?: string;
  phase_id?: string;
  urgency_id?: string;
  escalation_id?: string;
  frequency_id?: string;
  workflow_pattern?: string; // neutral pattern wording
  source_notes?: string; // admin-only
  status: QuestionStatus;
  imported_from?: string; // taxonomy file / batch name
  created_at: string; // ISO, fixed
}

export const QUESTION_STATUSES: QuestionStatus[] = ["new", "reviewed", "converted", "archived"];

export const STATUS_LABEL: Record<QuestionStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  converted: "Converted",
  archived: "Archived",
};

// --- Seed (healthcare go-live, vendor-neutral, PHI-free) ------------------

function q(
  id: string,
  text: string,
  meta: Omit<QuestionRecord, "id" | "text" | "status" | "created_at"> & { status?: QuestionStatus; daysAgo?: number },
): QuestionRecord {
  const { daysAgo = 1, status = "new", ...rest } = meta;
  return {
    id,
    text,
    status,
    ...rest,
    created_at: new Date(Date.UTC(2026, 5, 1) - daysAgo * 86_400_000).toISOString(),
  };
}

const SEED: QuestionRecord[] = [
  q("q_print_wristband", "Wristband won't print at registration — what do I do in the first 60 seconds?", {
    role_id: "registration",
    domain_id: "printing",
    phase_id: "cutover_day_0",
    urgency_id: "3_blocking_workflow",
    escalation_id: "2_confirm_with_super_user",
    frequency_id: "high",
    workflow_pattern: "Printer mapping or queue stall — workflow may vary by site/system.",
    source_notes: "Common day-0 blocker. Confirm printer is mapped to the correct device pool.",
    daysAgo: 1,
  }),
  q("q_login_locked", "I'm locked out at the start of my shift — who do I call first?", {
    role_id: "inpatient_nurse",
    domain_id: "login",
    phase_id: "cutover_day_0",
    urgency_id: "3_blocking_workflow",
    escalation_id: "2_confirm_with_super_user",
    frequency_id: "high",
    workflow_pattern: "Identity/credential reset — workflow may vary by site/system.",
    daysAgo: 2,
  }),
  q("q_med_admin_offline", "BCMA scanner is offline mid-pass — how do I document and stay safe?", {
    role_id: "inpatient_nurse",
    domain_id: "bcma_mar",
    phase_id: "stabilization_week_1",
    urgency_id: "4_patient_safety_risk",
    escalation_id: "4_immediate_command_center_clinical_leadership",
    frequency_id: "medium",
    workflow_pattern: "Fall back to two-nurse verification and paper MAR.",
    source_notes: "Patient-safety priority. Never bypass barcode without a witness.",
    daysAgo: 2,
  }),
  q("q_order_recon", "Where do I find admit order reconciliation if the usual list is empty?", {
    role_id: "inpatient_provider",
    domain_id: "order_reconciliation",
    phase_id: "cutover_day_0",
    urgency_id: "3_blocking_workflow",
    escalation_id: "1_ate_handles",
    frequency_id: "high",
    workflow_pattern: "Patient list filter or context selection issue — workflow may vary by site/system.",
    daysAgo: 3,
  }),
  q("q_downtime_kit", "We just went down. What's in the downtime kit and where is it?", {
    role_id: "all_roles",
    domain_id: "downtime",
    phase_id: "cutover_day_0",
    urgency_id: "4_patient_safety_risk",
    escalation_id: "4_immediate_command_center_clinical_leadership",
    frequency_id: "low",
    workflow_pattern: "Site downtime binder + paper forms. Locations vary by site.",
    daysAgo: 4,
  }),
  q("q_discharge_meds", "Discharge med list looks wrong — can I edit and reprint?", {
    role_id: "inpatient_provider",
    domain_id: "discharge",
    phase_id: "stabilization_week_1",
    urgency_id: "2_normal_workflow",
    escalation_id: "1_ate_handles",
    frequency_id: "medium",
    workflow_pattern: "Reconcile then re-sign the discharge order set.",
    daysAgo: 5,
  }),
  q("q_inbasket_overflow", "My in-basket is overflowing — what can I safely defer?", {
    role_id: "ambulatory_provider",
    domain_id: "in_basket",
    phase_id: "optimization_weeks_2_4",
    urgency_id: "1_educational",
    escalation_id: "1_ate_handles",
    frequency_id: "medium",
    workflow_pattern: "Inbox triage pattern: results > messages > administrative.",
    daysAgo: 6,
  }),
  q("q_rumor_recovery", "A unit is convinced the system 'lost' a chart — how do I respond?", {
    role_id: "all_roles",
    domain_id: "documentation",
    phase_id: "stabilization_week_1",
    urgency_id: "3_blocking_workflow",
    escalation_id: "3_command_center_ticket",
    frequency_id: "medium",
    workflow_pattern: "Verify context (patient + encounter) before declaring data loss.",
    source_notes: "Most 'lost chart' calls resolve as wrong-context selection.",
    daysAgo: 7,
  }),
];

// --- Reactive store -------------------------------------------------------

let _questions: QuestionRecord[] = SEED.slice();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function useQuestions(): QuestionRecord[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => _questions,
    () => _questions,
  );
}

export function getQuestion(id: string): QuestionRecord | undefined {
  return _questions.find(q => q.id === id);
}

export function updateQuestion(id: string, patch: Partial<QuestionRecord>) {
  _questions = _questions.map(q => q.id === id ? { ...q, ...patch } : q);
  emit();
}

export function archiveQuestion(id: string) {
  updateQuestion(id, { status: "archived" });
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "q";

// --- JSON import ----------------------------------------------------------

export interface ImportSummary {
  title?: string;
  version?: string;
  declared_total?: number;
  actual_total: number;
  imported: number;
  skipped: number;
  warning?: string;
}

// Accepts an `ate_question_taxonomy.json`-style payload.
// Tolerant shape: { title, version, total, questions: [{ id?, text|question|prompt, role?, domain?, phase?, urgency?, escalation?, frequency?, workflow_pattern?, source_notes? }] }
export function importQuestionsJson(payload: unknown): ImportSummary {
  if (!payload || typeof payload !== "object") {
    return { actual_total: 0, imported: 0, skipped: 0, warning: "Payload is not an object." };
  }
  const p = payload as Record<string, any>;
  const list: any[] = Array.isArray(p.questions) ? p.questions : Array.isArray(p.items) ? p.items : [];
  const declared = typeof p.total === "number" ? p.total
    : typeof p.declared_total === "number" ? p.declared_total
    : typeof p.count === "number" ? p.count
    : undefined;

  const importedRecords: QuestionRecord[] = [];
  let skipped = 0;
  list.forEach((row, i) => {
    const text: string = row.text ?? row.question ?? row.prompt ?? "";
    if (!text || typeof text !== "string") { skipped++; return; }
    const id = `qi_${row.id ? slug(String(row.id)) : `${slug(text)}_${i}`}`;
    if (_questions.some(x => x.id === id)) { skipped++; return; }
    importedRecords.push({
      id,
      text: text.trim(),
      role_id: row.role_id ?? row.role,
      domain_id: row.domain_id ?? row.domain,
      phase_id: row.phase_id ?? row.phase,
      urgency_id: row.urgency_id ?? row.urgency,
      escalation_id: row.escalation_id ?? row.escalation,
      frequency_id: row.frequency_id ?? row.frequency,
      workflow_pattern: row.workflow_pattern ?? row.pattern,
      source_notes: row.source_notes ?? row.notes,
      status: "new",
      imported_from: typeof p.title === "string" ? p.title : "ate_question_taxonomy.json",
      created_at: new Date(Date.UTC(2026, 5, 1)).toISOString(),
    });
  });

  _questions = [...importedRecords, ..._questions];
  emit();

  const actual = list.length;
  const warning =
    typeof declared === "number" && declared !== actual
      ? `Partial export or count mismatch — declared ${declared}, actual ${actual}.`
      : undefined;

  return {
    title: typeof p.title === "string" ? p.title : undefined,
    version: typeof p.version === "string" ? p.version : undefined,
    declared_total: declared,
    actual_total: actual,
    imported: importedRecords.length,
    skipped,
    warning,
  };
}
