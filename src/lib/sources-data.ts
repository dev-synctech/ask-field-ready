// Phase 2 — Sanitized Knowledge Pipeline
// Admin-only mock source library + risk scanner. PHI-free, vendor-neutral demo data.
// TODO: REMOVE BEFORE PRODUCTION LAUNCH — replace with Supabase-backed admin store.
import { useSyncExternalStore } from "react";

export type SourceStatus =
  | "new"
  | "scanning"
  | "needs_review"
  | "quarantined"
  | "ready_for_rewrite"
  | "archived";

export type RiskLevel = "low" | "medium" | "high";

export type SourceFileType = "pdf" | "docx" | "pptx" | "txt" | "md" | "mp4";

export interface RiskMatch {
  category: string;
  term: string;
}

export interface SourceRecord {
  id: string;
  file_name: string;
  file_type: SourceFileType;
  size_kb: number;
  uploaded_at: string; // ISO
  status: SourceStatus;
  risk_level: RiskLevel;
  matched_terms: RiskMatch[];
  excerpt: string; // mock extracted text
  domain?: string;
  role?: string;
  notes?: string;
}

// --- Risk patterns ---------------------------------------------------------

interface PatternDef {
  category: string;
  test: (text: string) => string[]; // returns matched terms
}

const VENDOR_TERMS = ["epic", "cerner", "oracle health", "meditech", "athenahealth", "allscripts", "nextgen"];
const ORG_TERMS = ["hospital", "medical center", "health system", "clinic", "memorial", "regional medical"];
const PHI_TERMS = ["mrn", "medical record number", "dob", "date of birth", "ssn", "patient name", "patient id"];
const DOC_TERMS = ["tip sheet", "tipsheet", "user manual", "training manual", "screenshot", "screen shot", "proprietary", "confidential"];

const RX_PHONE = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const RX_EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const RX_MRN = /\b(?:mrn[:#\s-]*)?\d{6,10}\b/gi;
const RX_DATE = /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g;
const RX_URL = /\bhttps?:\/\/[^\s)]+/gi;
const RX_ADDR = /\b\d{1,5}\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)\b/g;

function keywordHits(haystack: string, list: string[]): string[] {
  const lower = haystack.toLowerCase();
  return list.filter(k => lower.includes(k));
}

const PATTERNS: PatternDef[] = [
  { category: "Vendor name", test: t => keywordHits(t, VENDOR_TERMS) },
  { category: "Organization / hospital", test: t => keywordHits(t, ORG_TERMS) },
  { category: "PHI-like term", test: t => keywordHits(t, PHI_TERMS) },
  { category: "Proprietary doc language", test: t => keywordHits(t, DOC_TERMS) },
  { category: "Phone number", test: t => (t.match(RX_PHONE) ?? []).slice(0, 3) },
  { category: "Email address", test: t => (t.match(RX_EMAIL) ?? []).slice(0, 3) },
  { category: "MRN-like number", test: t => (t.match(RX_MRN) ?? []).filter(s => /\d{6,}/.test(s)).slice(0, 3) },
  { category: "Date / DOB", test: t => (t.match(RX_DATE) ?? []).slice(0, 3) },
  { category: "Proprietary link", test: t => (t.match(RX_URL) ?? []).slice(0, 3) },
  { category: "Street address", test: t => (t.match(RX_ADDR) ?? []).slice(0, 3) },
];

export interface ScanResult {
  matches: RiskMatch[];
  risk_level: RiskLevel;
  status: SourceStatus;
}

export function scanSource(fileName: string, text: string): ScanResult {
  const haystack = `${fileName}\n${text}`;
  const matches: RiskMatch[] = [];
  for (const p of PATTERNS) {
    const hits = p.test(haystack);
    for (const term of hits) matches.push({ category: p.category, term });
  }
  let risk_level: RiskLevel = "low";
  const highCats = new Set(matches.map(m => m.category));
  if (
    highCats.has("PHI-like term") ||
    highCats.has("MRN-like number") ||
    highCats.has("Vendor name") ||
    highCats.has("Email address") ||
    highCats.has("Phone number")
  ) risk_level = "high";
  else if (matches.length > 0) risk_level = "medium";

  const status: SourceStatus =
    risk_level === "high" ? "quarantined"
      : risk_level === "medium" ? "needs_review"
        : "ready_for_rewrite";

  return { matches, risk_level, status };
}

// --- Demo data -------------------------------------------------------------

function seed(file_name: string, file_type: SourceFileType, size_kb: number, excerpt: string, daysAgo = 1, overrides: Partial<SourceRecord> = {}): SourceRecord {
  const scan = scanSource(file_name, excerpt);
  return {
    id: `src_${Math.random().toString(36).slice(2, 9)}`,
    file_name,
    file_type,
    size_kb,
    uploaded_at: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
    status: scan.status,
    risk_level: scan.risk_level,
    matched_terms: scan.matches,
    excerpt,
    ...overrides,
  };
}

const DEMO_SOURCES: SourceRecord[] = [
  seed(
    "go-live-readiness-notes.md",
    "md",
    12,
    "Pre-shift readiness: badge, device, contact list, downtime kit. Walk the unit before the first hour. Find the charge nurse first.",
    1,
    { domain: "Go-Live Readiness", role: "Floor Consultant" },
  ),
  seed(
    "registration-downtime-draft.txt",
    "txt",
    8,
    "When the registration system is unresponsive for more than 3 minutes, switch to paper. Capture name, DOB, arrival time.",
    2,
    { domain: "Downtime Workflow", role: "Registration" },
  ),
  seed(
    "escalation-script-outline.docx",
    "docx",
    44,
    "Three-sentence escalation: what broke, scope and severity, what you need with callback number.",
    3,
    { domain: "Escalation", role: "Floor Lead" },
  ),
  seed(
    "vendor-tipsheet-import.pdf",
    "pdf",
    980,
    "Epic order entry tip sheet. Screenshot of the order signature workflow. Contact support@medicalcenter.org or call 555-123-4456. Proprietary — do not share.",
    4,
    { domain: "Clinical Documentation", role: "Floor Consultant" },
  ),
  seed(
    "bedside-coaching.mp4",
    "mp4",
    18_400,
    "Coaching clip: stand to the side, narrate gently, hand back control. No patient information captured.",
    5,
    { domain: "Bedside Support", role: "Floor Consultant" },
  ),
  seed(
    "command-center-flow.pptx",
    "pptx",
    1_240,
    "Command center routing diagram. Walks a ticket from floor to triage in 90 seconds. Includes severity matrix and a sample escalation timer.",
    6,
    { domain: "Command Center", role: "Command Center" },
  ),
  seed(
    "unit-rumor-recovery.md",
    "md",
    6,
    "Five-sentence calm-down script. Confirm with command before speaking. Use a low voice. No display issue is a save issue.",
    7,
    { domain: "End-User Communication", role: "Floor Consultant" },
  ),
];

// --- Reactive in-memory store ---------------------------------------------

let _sources: SourceRecord[] = DEMO_SOURCES.slice();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export function useSources(): SourceRecord[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => _sources,
    () => _sources,
  );
}

export function getSource(id: string): SourceRecord | undefined {
  return _sources.find(s => s.id === id);
}

export function addSource(partial: Omit<SourceRecord, "id" | "uploaded_at" | "status" | "risk_level" | "matched_terms"> & { excerpt: string }) {
  const scan = scanSource(partial.file_name, partial.excerpt);
  const rec: SourceRecord = {
    ...partial,
    id: `src_${Math.random().toString(36).slice(2, 9)}`,
    uploaded_at: new Date().toISOString(),
    status: "scanning",
    risk_level: "low",
    matched_terms: [],
  };
  _sources = [rec, ...sources()];
  emit();
  // simulate scan delay
  setTimeout(() => {
    _sources = _sources.map(s =>
      s.id === rec.id
        ? { ...s, status: scan.status, risk_level: scan.risk_level, matched_terms: scan.matches }
        : s,
    );
    emit();
  }, 700);
  return rec;
}

export function updateSource(id: string, patch: Partial<SourceRecord>) {
  _sources = _sources.map(s => s.id === id ? { ...s, ...patch } : s);
  emit();
}

export function archiveSource(id: string) {
  updateSource(id, { status: "archived" });
}

export function rescanSource(id: string) {
  const s = _sources.find(x => x.id === id);
  if (!s) return;
  updateSource(id, { status: "scanning" });
  setTimeout(() => {
    const r = scanSource(s.file_name, s.excerpt);
    updateSource(id, { status: r.status, risk_level: r.risk_level, matched_terms: r.matches });
  }, 500);
}

function sources() { return _sources; }

export const STATUS_LABEL: Record<SourceStatus, string> = {
  new: "New",
  scanning: "Scanning…",
  needs_review: "Needs review",
  quarantined: "Quarantined",
  ready_for_rewrite: "Ready for rewrite",
  archived: "Archived",
};

export const RISK_LABEL: Record<RiskLevel, string> = { low: "Low risk", medium: "Medium risk", high: "High risk" };

export const FILE_TYPES: SourceFileType[] = ["pdf", "docx", "pptx", "txt", "md", "mp4"];
export const STATUSES: SourceStatus[] = ["new", "scanning", "needs_review", "quarantined", "ready_for_rewrite", "archived"];
export const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];
export const DOMAINS = ["Go-Live Readiness", "Bedside Support", "Command Center", "Registration", "Clinical Documentation", "Downtime Workflow", "End-User Communication", "Issue Triage", "Floor Scenarios", "Professionalism"];
export const ROLES = ["Floor Consultant", "Floor Lead", "Command Center", "Registration", "Clinical SME"];
