import { useSyncExternalStore } from "react";
import registry from "@/data/org-library-registry.json";

// ============================================================
// Organization Content Library — frontend store + access rules.
// Demo-only: in-memory, seeded from JSON. No cross-tenant reads.
// ============================================================

export type Visibility =
  | "admin_only_source"
  | "org_ate_visible"
  | "public_mizly_demo";

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
let _assets: OrgAsset[] = [...seed.assets];
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
 * Single source of truth for whether a raw uploaded asset may be shown to an
 * ATE learner in the floor surfaces (Learn / Videos / Tip Sheets / Ask).
 *
 * - Must belong to the viewer's organization.
 * - Visibility must be org_ate_visible (admin_only_source never leaks).
 * - Must be explicitly approved by an org admin.
 * - Rights + PHI attestations must both be confirmed.
 * - public_mizly_demo content is handled by other registries, never here.
 */
export function isAteVisible(asset: OrgAsset, viewer: ViewerContext): boolean {
  return (
    asset.organization_id === viewer.organization_id &&
    asset.visibility === "org_ate_visible" &&
    asset.approval_status === "approved" &&
    asset.rights_attestation === true &&
    asset.phi_attestation === true
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
    Partial<Pick<OrgAsset, "visibility">>,
): OrgAsset {
  const a: OrgAsset = {
    id: `oa_${Date.now()}`,
    organization_id: _viewer.organization_id,
    visibility: input.visibility ?? "admin_only_source",
    approval_status: "pending",
    approved_by: null,
    approved_at: null,
    uploaded_at: new Date().toISOString(),
    ...input,
  };
  _assets = [a, ..._assets];
  logAudit({ actor: a.uploaded_by, action: "upload", asset_id: a.id });
  emit();
  return a;
}

export function updateAsset(id: string, patch: Partial<OrgAsset>) {
  _assets = _assets.map((a) => (a.id === id ? { ...a, ...patch } : a));
  logAudit({ actor: _viewer.role, action: "edit", asset_id: id });
  emit();
}

export function setVisibility(id: string, visibility: Visibility, actor: string) {
  _assets = _assets.map((a) => (a.id === id ? { ...a, visibility } : a));
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
  admin_only_source: "Admin only (source)",
  org_ate_visible: "ATE visible",
  public_mizly_demo: "Public Mizly demo",
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
