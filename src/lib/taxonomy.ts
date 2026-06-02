// Phase 2 — Taxonomy Manager
// Controls how Mizly routes questions, filters content, and later powers Ask retrieval.
// Vendor-neutral, PHI-free. TODO: REMOVE BEFORE PRODUCTION LAUNCH — replace with Supabase-backed taxonomy.
import { useSyncExternalStore } from "react";

export type TaxonomyCategory =
  | "roles"
  | "domains"
  | "phases"
  | "urgency"
  | "escalation"
  | "frequency";

export interface TaxonomyTerm {
  id: string;
  label: string;
  // optional ordinal for urgency / escalation
  level?: number;
}

export const CATEGORY_LABEL: Record<TaxonomyCategory, string> = {
  roles: "Roles",
  domains: "Domains",
  phases: "Phases",
  urgency: "Urgency",
  escalation: "Escalation",
  frequency: "Frequency",
};

export const CATEGORY_HELP: Record<TaxonomyCategory, string> = {
  roles: "Who the content is for. Used to filter Learn, Playbooks, Scenarios, and later route Ask.",
  domains: "What workflow or area the content covers. Used for filters and Ask retrieval.",
  phases: "Where in the go-live timeline the content applies.",
  urgency: "How time-sensitive the question or content is. Drives routing.",
  escalation: "How far up to escalate, from ATE handling to immediate command center + leadership.",
  frequency: "How often the question or workflow comes up.",
};

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const t = (label: string): TaxonomyTerm => ({ id: slug(label), label });
const tl = (level: number, label: string): TaxonomyTerm => ({
  id: `${level}_${slug(label)}`,
  label: `${level} · ${label}`,
  level,
});

// --- Seed taxonomy (healthcare go-live support) ---------------------------

const SEED: Record<TaxonomyCategory, TaxonomyTerm[]> = {
  roles: [
    "Inpatient nurse",
    "Inpatient provider",
    "Ambulatory provider",
    "Resident / fellow",
    "APP",
    "Anesthesia / CRNA",
    "OR / surgical",
    "ED",
    "Pharmacist",
    "Lab / phlebotomy",
    "Radiology",
    "Respiratory therapy",
    "Behavioral health",
    "Women's health / L&D",
    "Pediatrics / NICU",
    "Case management",
    "Registration",
    "Scheduling",
    "Billing / coding / HIM",
    "Bed control",
    "Front desk",
    "All roles",
  ].map(t),
  domains: [
    "Login",
    "Printing",
    "Patient lists",
    "Order entry",
    "Order reconciliation",
    "Documentation",
    "BCMA / MAR",
    "Discharge",
    "Transfer",
    "In-basket",
    "Results",
    "Downtime",
    "Mobile apps",
    "Voice recognition",
    "Personalization",
    "Registration",
    "Billing",
  ].map(t),
  phases: [
    "Pre-go-live",
    "Cutover day 0",
    "Stabilization week 1",
    "Optimization weeks 2-4",
    "Post-go-live",
  ].map(t),
  urgency: [
    tl(1, "Educational"),
    tl(2, "Normal workflow"),
    tl(3, "Blocking workflow"),
    tl(4, "Patient-safety risk"),
  ],
  escalation: [
    tl(1, "ATE handles"),
    tl(2, "Confirm with super-user"),
    tl(3, "Command center ticket"),
    tl(4, "Immediate command center + clinical leadership"),
  ],
  frequency: [t("High"), t("Medium"), t("Low")],
};

export const ALL_CATEGORIES: TaxonomyCategory[] = [
  "roles", "domains", "phases", "urgency", "escalation", "frequency",
];

// --- Reactive in-memory store --------------------------------------------

let _data: Record<TaxonomyCategory, TaxonomyTerm[]> = {
  roles: SEED.roles.slice(),
  domains: SEED.domains.slice(),
  phases: SEED.phases.slice(),
  urgency: SEED.urgency.slice(),
  escalation: SEED.escalation.slice(),
  frequency: SEED.frequency.slice(),
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function useTaxonomy(): Record<TaxonomyCategory, TaxonomyTerm[]> {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => _data,
    () => _data,
  );
}

export function getTerms(cat: TaxonomyCategory): TaxonomyTerm[] {
  return _data[cat];
}

export function addTerm(cat: TaxonomyCategory, label: string) {
  const clean = label.trim();
  if (!clean) return;
  const id = slug(clean);
  if (_data[cat].some(t => t.id === id)) return;
  _data = { ..._data, [cat]: [..._data[cat], { id, label: clean }] };
  emit();
}

export function removeTerm(cat: TaxonomyCategory, id: string) {
  _data = { ..._data, [cat]: _data[cat].filter(t => t.id !== id) };
  emit();
}

export function resetCategory(cat: TaxonomyCategory) {
  _data = { ..._data, [cat]: SEED[cat].slice() };
  emit();
}

// --- Content metadata shape (shared by editor + rewrite workspace) ------

export interface ContentTaxonomy {
  role_id?: string;
  domain_id?: string;
  phase_id?: string;
  urgency_id?: string;
  escalation_id?: string;
  frequency_id?: string;
}

export function labelFor(cat: TaxonomyCategory, id?: string): string | undefined {
  if (!id) return undefined;
  return _data[cat].find(t => t.id === id)?.label;
}
