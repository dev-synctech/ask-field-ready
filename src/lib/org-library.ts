import { useSyncExternalStore } from "react";
import registry from "@/data/org-library-registry.json";

// ============================================================
// Organization Content Library — frontend store + access rules.
// Demo-only: in-memory, seeded from JSON. No cross-tenant reads.
// ============================================================

export type Visibility = "org_internal" | "ate_visible";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type AssetKind =
  | "pdf"
  | "docx"
  | "pptx"
  | "screenshot"
  | "mp4"
  | "external_video"
  | "learnshare_link"
  | "zoom_link"
  | "tip_sheet"
  | "checklist"
  | "transcript";

export type DocType =
  | "tip_sheet"
  | "checklist"
  | "training_video"
  | "source_doc"
  | "screenshot"
  | "transcript";

export interface OrgAsset {
  id: string;
  organization_id: string;
  project: string;
  department: string;
  role: string;
  workflow_area: string;
  system_label: string;
  doc_type: DocType;
  title: string;
  summary: string;
  asset_kind: AssetKind;
  file_name: string | null;
  external_url: string | null;
  timestamp: string | null;
  uploaded_by: string;
  uploaded_at: string;
  visibility: Visibility;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  rights_attestation: boolean;
  phi_attestation: boolean;
  download_disabled: boolean;
  watermark: boolean;
  risk_flags: string[];
  related_ask_ids: string[];
  tags?: string[];
  notes?: string;
}

export interface Organization {
  id: string;
  name: string;
  go_live_name: string;
}

export interface ViewerContext {
  organization_id: string;
  role: string;
  is_org_admin: boolean;
}

export interface AuditEntry {
  ts: string;
  actor: string;
  action:
    | "upload"
    | "edit"
    | "approve"
    | "unapprove"
    | "view"
    | "download"
    | "visibility_change";
  asset_id: string;
  note?: string;
}

type Registry = {
  organizations: Organization[];
  current_viewer: ViewerContext;
  assets: OrgAsset[];
};

const seed = registry as Registry;

// ---------- in-memory mutable store ----------
const LS_KEY = "mizly.org-library.user-assets";

function migrateVisibility(v: unknown): Visibility {
  if (v === "ate_visible" || v === "org_ate_visible") return "ate_visible";
  return "org_internal";
}

function normalizeAsset(a: OrgAsset): OrgAsset {
  return { ...a, visibility: migrateVisibility(a.visibility) };
}

function loadUserAssets(): OrgAsset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OrgAsset[]).map(normalizeAsset) : [];
  } catch {
    return [];
  }
}

function persistUserAssets() {
  if (typeof window === "undefined") return;
  const seedIds = new Set(seed.assets.map((a) => a.id));
  const userOnly = _assets.filter((a) => !seedIds.has(a.id));
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(userOnly));
  } catch {
    /* quota / SSR: ignore */
  }
}

let _assets: OrgAsset[] = [...loadUserAssets(), ...seed.assets.map(normalizeAsset)];
let _audit: AuditEntry[] = [];
const _orgs: Organization[] = seed.organizations;
const _viewer: ViewerContext = seed.current_viewer;

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// ---------- selectors / hooks ----------
export function useOrgAssets(): OrgAsset[] {
  return useSyncExternalStore(
    subscribe,
    () => _assets,
    () => _assets,
  );
}

export function useViewer(): ViewerContext {
  return _viewer;
}

export function useOrganizations(): Organization[] {
  return _orgs;
}

export function useAuditLog(): AuditEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => _audit,
    () => _audit,
  );
}

// ---------- access rules ----------
/**
 * Simplified gating: an asset is visible to ATE users when it belongs to the
 * viewer's organization and is marked ate_visible. No approval / attestation
 * gates — the org admin decides by toggling visibility.
 */
export function isAteVisible(asset: OrgAsset, viewer: ViewerContext): boolean {
  return (
    asset.organization_id === viewer.organization_id &&
    asset.visibility === "ate_visible"
  );
}

export function ateVisibleAssets(viewer: ViewerContext): OrgAsset[] {
  return _assets.filter((a) => isAteVisible(a, viewer));
}

export function orgAssetsForAsk(
  askId: string,
  viewer: ViewerContext,
): OrgAsset[] {
  return _assets.filter(
    (a) => a.related_ask_ids.includes(askId) && isAteVisible(a, viewer),
  );
}

// ---------- mutations ----------
function logAudit(entry: Omit<AuditEntry, "ts">) {
  _audit = [{ ts: new Date().toISOString(), ...entry }, ..._audit].slice(0, 500);
}

export function addAsset(
  input: Omit<
    OrgAsset,
    | "id"
    | "organization_id"
    | "uploaded_at"
    | "approval_status"
    | "approved_by"
    | "approved_at"
    | "visibility"
  > &
    Partial<Pick<OrgAsset, "visibility" | "approval_status">>,
): OrgAsset {
  const a: OrgAsset = {
    id: `oa_user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    organization_id: _viewer.organization_id,
    visibility: input.visibility ?? "org_internal",
    approval_status: input.approval_status ?? "approved",
    approved_by: input.uploaded_by,
    approved_at: new Date().toISOString(),
    uploaded_at: new Date().toISOString(),
    ...input,
  };
  _assets = [a, ..._assets];
  persistUserAssets();
  logAudit({ actor: a.uploaded_by, action: "upload", asset_id: a.id });
  emit();
  return a;
}

export function updateAsset(id: string, patch: Partial<OrgAsset>) {
  _assets = _assets.map((a) => (a.id === id ? { ...a, ...patch } : a));
  persistUserAssets();
  logAudit({ actor: _viewer.role, action: "edit", asset_id: id });
  emit();
}

export function setVisibility(id: string, visibility: Visibility, actor: string) {
  _assets = _assets.map((a) => (a.id === id ? { ...a, visibility } : a));
  persistUserAssets();
  logAudit({
    actor,
    action: "visibility_change",
    asset_id: id,
    note: visibility,
  });
  emit();
}

export function approveAsset(id: string, actor: string) {
  _assets = _assets.map((a) =>
    a.id === id
      ? {
          ...a,
          approval_status: "approved",
          approved_by: actor,
          approved_at: new Date().toISOString(),
        }
      : a,
  );
  persistUserAssets();
  logAudit({ actor, action: "approve", asset_id: id });
  emit();
}

export function unapproveAsset(id: string, actor: string) {
  _assets = _assets.map((a) =>
    a.id === id
      ? {
          ...a,
          approval_status: "pending",
          approved_by: null,
          approved_at: null,
        }
      : a,
  );
  persistUserAssets();
  logAudit({ actor, action: "unapprove", asset_id: id });
  emit();
}

export function recordView(id: string, actor: string) {
  logAudit({ actor, action: "view", asset_id: id });
  emit();
}

export function recordDownload(id: string, actor: string) {
  logAudit({ actor, action: "download", asset_id: id });
  emit();
}

// ---------- labels ----------
export const VISIBILITY_LABEL: Record<Visibility, string> = {
  org_internal: "Org internal",
  ate_visible: "ATE visible",
};

export const ASSET_KIND_LABEL: Record<AssetKind, string> = {
  pdf: "PDF",
  docx: "DOCX",
  pptx: "PPTX",
  screenshot: "Screenshot",
  mp4: "MP4",
  external_video: "External video",
  learnshare_link: "LearnShare link",
  zoom_link: "Zoom recording",
  tip_sheet: "Tip sheet",
  checklist: "Checklist",
  transcript: "Transcript",
};

export const DOC_TYPES: DocType[] = [
  "tip_sheet",
  "checklist",
  "training_video",
  "source_doc",
  "screenshot",
  "transcript",
];

export const ASSET_KINDS: AssetKind[] = [
  "pdf",
  "docx",
  "pptx",
  "screenshot",
  "mp4",
  "external_video",
  "learnshare_link",
  "zoom_link",
  "tip_sheet",
  "checklist",
  "transcript",
];

export const WATERMARK_TEXT = "Organization-provided training material";
