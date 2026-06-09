import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Upload, Search, ShieldCheck, ShieldAlert, Check, X,
  FileText, Film, Link2, Eye, EyeOff, AlertTriangle, ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import {
  useOrgAssets, useViewer, useAuditLog,
  addAsset, approveAsset, unapproveAsset, setVisibility, updateAsset,
  VISIBILITY_LABEL, ASSET_KIND_LABEL, DOC_TYPES, ASSET_KINDS,
  type OrgAsset, type Visibility, type AssetKind, type DocType,
} from "@/lib/org-library";
import { LAUNCH_LIBRARY, type LaunchEntry } from "@/lib/launch-library";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/org-library")({
  head: () => ({ meta: [{ title: "Org Content Library — Mizly" }] }),
  component: OrgLibraryAdmin,
});

const inputCls = "h-9 w-full rounded-lg border border-input bg-surface-elevated px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring";

function OrgLibraryAdmin() {
  const assets = useOrgAssets();
  const viewer = useViewer();
  const audit = useAuditLog();
  const [q, setQ] = useState("");
  const [visF, setVisF] = useState<Visibility | "all">("all");
  const [docF, setDocF] = useState<DocType | "all">("all");
  const [showUpload, setShowUpload] = useState(false);

  const visible = useMemo(() => {
    const tk = q.trim().toLowerCase();
    return assets
      .filter((a) => a.organization_id === viewer.organization_id)
      .filter((a) => (visF === "all" ? true : a.visibility === visF))
      .filter((a) => (docF === "all" ? true : a.doc_type === docF))
      .filter((a) => {
        if (!tk) return true;
        return `${a.title} ${a.summary} ${a.workflow_area} ${a.department} ${a.role}`
          .toLowerCase()
          .includes(tk);
      });
  }, [assets, viewer, visF, docF, q]);

  const counts = useMemo(() => ({
    total: assets.length,
    ate: assets.filter((a) => a.visibility === "org_ate_visible" && a.approval_status === "approved").length,
    pending: assets.filter((a) => a.approval_status === "pending").length,
    flagged: assets.filter((a) => a.risk_flags.length > 0).length,
  }), [assets]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="size-3.5" /> Back to admin
          </Link>
          <Header
            title="Organization Content Library"
            subtitle="Upload org-owned docs, tip sheets, screenshots, and training links. ATEs only see what you mark ATE-visible and approve."
          />
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Upload className="size-4" /> Upload / Add link
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI label="Total assets" value={counts.total} />
        <KPI label="ATE-visible" value={counts.ate} tone="success" />
        <KPI label="Pending approval" value={counts.pending} tone="warning" />
        <KPI label="Risk-flagged" value={counts.flagged} tone="danger" />
      </div>

      <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-foreground/80">
        <div className="font-semibold flex items-center gap-2 mb-1">
          <ShieldCheck className="size-3.5 text-warning" /> Organization-scoped
        </div>
        Raw docs and videos never leave your organization. ATEs see only items you mark ATE-visible and approve. Default for new uploads is admin-only.
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div className="relative sm:col-span-2">
          <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, workflow, dept…" className={`${inputCls} pl-8`} />
        </div>
        <select value={visF} onChange={(e) => setVisF(e.target.value as Visibility | "all")} className={inputCls}>
          <option value="all">All visibility</option>
          <option value="admin_only_source">Admin only</option>
          <option value="org_ate_visible">ATE-visible</option>
        </select>
        <select value={docF} onChange={(e) => setDocF(e.target.value as DocType | "all")} className={inputCls}>
          <option value="all">All doc types</option>
          {DOC_TYPES.map((d) => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="mt-4 font-display font-semibold">Assets ({visible.length})</div>
      <div className="mt-2 space-y-2">
        {visible.map((a) => <AssetRow key={a.id} asset={a} viewerEmail={viewer.role + "@admin"} />)}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No assets match these filters.
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="font-display font-semibold flex items-center gap-2"><ClipboardList className="size-4 text-primary" /> Audit log</div>
        <div className="mt-2 rounded-xl border border-border bg-card divide-y divide-border max-h-64 overflow-y-auto">
          {audit.length === 0 && <div className="p-4 text-xs text-muted-foreground">No activity yet.</div>}
          {audit.map((e, i) => (
            <div key={i} className="px-3 py-2 text-[11px] flex items-center gap-3 flex-wrap">
              <span className="text-muted-foreground">{new Date(e.ts).toLocaleString()}</span>
              <span className="font-medium">{e.actor}</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{e.action}</span>
              <span className="text-muted-foreground">{e.asset_id}</span>
              {e.note && <span className="text-muted-foreground">— {e.note}</span>}
            </div>
          ))}
        </div>
      </div>

      {showUpload && <UploadDialog viewerEmail={`uploader@${viewer.organization_id}`} onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function AssetRow({ asset, viewerEmail }: { asset: OrgAsset; viewerEmail: string }) {
  const isLink = !!asset.external_url;
  const Icon = isLink ? Link2 : asset.asset_kind === "mp4" || asset.asset_kind === "external_video" ? Film : FileText;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="size-9 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="size-4 text-foreground/70" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-medium truncate">{asset.title}</div>
            <VisibilityBadge v={asset.visibility} />
            <ApprovalBadge status={asset.approval_status} />
            {(!asset.phi_attestation || !asset.rights_attestation) && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning inline-flex items-center gap-1">
                <AlertTriangle className="size-3" /> Needs attestation
              </span>
            )}
            {asset.risk_flags.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive inline-flex items-center gap-1">
                <ShieldAlert className="size-3" /> {asset.risk_flags.length} risk
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {ASSET_KIND_LABEL[asset.asset_kind]} · {asset.department} · {asset.role} · {asset.workflow_area}
            {asset.timestamp && <> · @ {asset.timestamp}</>}
          </div>
          <div className="text-xs mt-1 text-foreground/80 line-clamp-2">{asset.summary}</div>
          {!asset.phi_attestation && (
            <div className="mt-2 text-[11px] text-warning inline-flex items-center gap-1">
              <AlertTriangle className="size-3" /> PHI attestation missing — cannot mark ATE-visible until confirmed.
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {asset.visibility === "admin_only_source" ? (
            <button
              onClick={() => {
                if (!asset.phi_attestation || !asset.rights_attestation) {
                  toast.error("Confirm rights + PHI attestation before exposing to ATEs.");
                  return;
                }
                setVisibility(asset.id, "org_ate_visible", viewerEmail);
                toast.success("Marked ATE-visible");
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5"
            >
              <Eye className="size-3.5" /> Make ATE-visible
            </button>
          ) : (
            <button
              onClick={() => { setVisibility(asset.id, "admin_only_source", viewerEmail); toast.success("Reverted to admin-only"); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5"
            >
              <EyeOff className="size-3.5" /> Admin only
            </button>
          )}
          {asset.approval_status !== "approved" ? (
            <button
              onClick={() => {
                if (!asset.phi_attestation || !asset.rights_attestation) {
                  toast.error("Both attestations required to approve.");
                  return;
                }
                approveAsset(asset.id, viewerEmail);
                toast.success("Approved");
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-1.5"
            >
              <Check className="size-3.5" /> Approve
            </button>
          ) : (
            <button
              onClick={() => { unapproveAsset(asset.id, viewerEmail); toast("Approval revoked"); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5"
            >
              <X className="size-3.5" /> Unapprove
            </button>
          )}
          {!asset.phi_attestation && (
            <button
              onClick={() => { updateAsset(asset.id, { phi_attestation: true }); toast.success("PHI attestation confirmed"); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary"
            >
              Confirm PHI ok
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VisibilityBadge({ v }: { v: Visibility }) {
  const cls =
    v === "org_ate_visible" ? "bg-success/15 text-success"
      : v === "public_mizly_demo" ? "bg-primary/15 text-primary"
        : "bg-muted text-muted-foreground";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${cls}`}>{VISIBILITY_LABEL[v]}</span>;
}

function ApprovalBadge({ status }: { status: OrgAsset["approval_status"] }) {
  const cls =
    status === "approved" ? "bg-success/15 text-success"
      : status === "rejected" ? "bg-destructive/15 text-destructive"
        : "bg-warning/15 text-warning";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${cls}`}>{status}</span>;
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" | "danger" }) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-display font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}

function UploadDialog({ viewerEmail, onClose }: { viewerEmail: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [kind, setKind] = useState<AssetKind>("tip_sheet");
  const [docType, setDocType] = useState<DocType>("tip_sheet");
  const [project, setProject] = useState("Spring Go-Live 2026");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [workflow, setWorkflow] = useState("");
  const [systemLabel, setSystemLabel] = useState("EHR");
  const [externalUrl, setExternalUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");
  const [askIds, setAskIds] = useState<string[]>([]);
  const [askQuery, setAskQuery] = useState("");
  const [rights, setRights] = useState(false);
  const [phi, setPhi] = useState(false);
  const [approval, setApproval] = useState<"draft" | "approved">("draft");
  const [ateVisible, setAteVisible] = useState(false);
  const [confirmAte, setConfirmAte] = useState(false);

  const isLinkKind = ["external_video", "learnshare_link", "zoom_link"].includes(kind);
  const canBeAteVisible = rights && phi && approval === "approved";
  const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

  const askMatches = useMemo(() => {
    const tk = askQuery.trim().toLowerCase();
    const list = LAUNCH_LIBRARY.filter((e: LaunchEntry) => !askIds.includes(e.id));
    if (!tk) return list.slice(0, 6);
    return list
      .filter((e: LaunchEntry) =>
        `${e.id} ${e.title} ${e.summary} ${e.keywords.join(" ")}`.toLowerCase().includes(tk),
      )
      .slice(0, 8);
  }, [askQuery, askIds]);

  function commit() {
    addAsset({
      project,
      department,
      role,
      workflow_area: workflow,
      system_label: systemLabel,
      doc_type: docType,
      title: title.trim(),
      summary: summary.trim(),
      asset_kind: kind,
      file_name: isLinkKind ? null : (fileName.trim() || null),
      external_url: isLinkKind ? externalUrl.trim() : null,
      timestamp: timestamp.trim() || null,
      uploaded_by: viewerEmail,
      rights_attestation: rights,
      phi_attestation: phi,
      download_disabled: isLinkKind,
      watermark: true,
      risk_flags: phi ? [] : ["needs_phi_review"],
      related_ask_ids: askIds,
      tags,
      notes: notes.trim() || undefined,
      approval_status: approval === "approved" ? "approved" : "pending",
      visibility: ateVisible && canBeAteVisible ? "org_ate_visible" : "admin_only_source",
    });
    toast.success("Asset saved");
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title required"); return; }
    if (isLinkKind && !externalUrl.trim()) { toast.error("Link URL required"); return; }
    if (ateVisible && !canBeAteVisible) {
      toast.error("ATE-visible requires approved + both attestations.");
      return;
    }
    if (ateVisible) { setConfirmAte(true); return; }
    commit();
  }

  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="font-display font-semibold flex items-center gap-2">
            <Upload className="size-4 text-primary" /> Add organization asset
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground p-1" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-2.5 text-[11px] text-foreground/80">
          Only <strong>approved + ATE-visible</strong> assets with both attestations appear to floor support users.
        </div>

        <Field label="Title*">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Short description">
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className={`${inputCls} h-16 py-2`} placeholder="One-line summary shown in chips." />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Field label="Asset kind">
            <select value={kind} onChange={(e) => setKind(e.target.value as AssetKind)} className={inputCls}>
              {ASSET_KINDS.map((k) => <option key={k} value={k}>{ASSET_KIND_LABEL[k]}</option>)}
            </select>
          </Field>
          <Field label="Doc type">
            <select value={docType} onChange={(e) => setDocType(e.target.value as DocType)} className={inputCls}>
              {DOC_TYPES.map((d) => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
            </select>
          </Field>
          <Field label="Workflow area"><input value={workflow} onChange={(e) => setWorkflow(e.target.value)} className={inputCls} placeholder="e.g. Notes / Orders" /></Field>
          <Field label="Role"><input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} placeholder="e.g. Provider" /></Field>
          <Field label="Department"><input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls} /></Field>
          <Field label="Project / go-live"><input value={project} onChange={(e) => setProject(e.target.value)} className={inputCls} /></Field>
          <Field label="System / vendor"><input value={systemLabel} onChange={(e) => setSystemLabel(e.target.value)} className={inputCls} /></Field>
          <Field label="Timestamp (optional)"><input value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="04:32" className={inputCls} /></Field>
        </div>

        {isLinkKind ? (
          <Field label="Source URL*">
            <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} className={inputCls} placeholder="https://…" />
          </Field>
        ) : (
          <Field label="File name / placeholder">
            <input value={fileName} onChange={(e) => setFileName(e.target.value)} className={inputCls} placeholder="my-tip-sheet.pdf" />
          </Field>
        )}

        <Field label="Tags (comma-separated)">
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputCls} placeholder="notes, signing, smartphrase" />
        </Field>

        <div>
          <span className="text-[11px] font-medium text-foreground/80 mb-1 block">Related Ask topics</span>
          <div className="rounded-xl border border-border bg-surface-elevated p-2 space-y-2">
            {askIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {askIds.map((id) => {
                  const entry = LAUNCH_LIBRARY.find((e: LaunchEntry) => e.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-primary/15 text-primary">
                      {entry?.title ?? id}
                      <button
                        type="button"
                        onClick={() => setAskIds(askIds.filter((x) => x !== id))}
                        className="hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <input
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="Search Ask topics by keyword or id…"
              className={inputCls}
            />
            {askMatches.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg divide-y divide-border bg-card">
                {askMatches.map((e: LaunchEntry) => (
                  <button
                    type="button"
                    key={e.id}
                    onClick={() => { setAskIds([...askIds, e.id]); setAskQuery(""); }}
                    className="w-full text-left px-3 py-2 hover:bg-secondary text-[11px]"
                  >
                    <div className="font-medium text-foreground">{e.title}</div>
                    <div className="text-muted-foreground">{e.id}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            ATE users see this asset in More Help when they ask about the linked topics.
          </div>
        </div>

        <Field label="Internal notes (admin only)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} h-14 py-2`} />
        </Field>

        <label className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
          <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
          <div className="text-xs">
            <div className="font-medium">Rights attestation</div>
            <div className="text-muted-foreground">The organization has permission to use this content for internal training.</div>
          </div>
        </label>
        <label className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
          <input type="checkbox" checked={phi} onChange={(e) => setPhi(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
          <div className="text-xs">
            <div className="font-medium">PHI attestation</div>
            <div className="text-muted-foreground">No PHI is present, or PHI has been approved for internal use.</div>
          </div>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Field label="Approval status">
            <select value={approval} onChange={(e) => setApproval(e.target.value as "draft" | "approved")} className={inputCls}>
              <option value="draft">Draft (admin review)</option>
              <option value="approved">Approved</option>
            </select>
          </Field>
          <Field label="Visibility">
            <select
              value={ateVisible ? "ate" : "admin"}
              onChange={(e) => setAteVisible(e.target.value === "ate")}
              className={inputCls}
            >
              <option value="admin">Admin only (source)</option>
              <option value="ate" disabled={!canBeAteVisible}>
                ATE visible{!canBeAteVisible ? " — needs approved + attestations" : ""}
              </option>
            </select>
          </Field>
        </div>

        <PreviewCard
          title={title}
          summary={summary}
          kind={kind}
          ateVisible={ateVisible && canBeAteVisible}
          approved={approval === "approved"}
          attested={rights && phi}
          askCount={askIds.length}
        />

        <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-card">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl border border-border text-sm">Cancel</button>
          <button type="submit" className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Save asset</button>
        </div>
      </form>

      {confirmAte && (
        <div className="fixed inset-0 z-50 bg-foreground/60 flex items-center justify-center p-4" onClick={() => setConfirmAte(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-elevated max-w-sm w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="font-display font-semibold flex items-center gap-2">
              <Eye className="size-4 text-primary" /> Make ATE-visible?
            </div>
            <p className="text-xs text-muted-foreground">
              This asset will appear in floor support users' Ask More Help for the {askIds.length} linked topic{askIds.length === 1 ? "" : "s"}. You can revert any time.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmAte(false)} className="h-9 px-3 rounded-lg border border-border text-xs">Cancel</button>
              <button
                onClick={() => { setConfirmAte(false); commit(); }}
                className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              >
                Confirm & publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewCard({
  title, summary, kind, ateVisible, approved, attested, askCount,
}: {
  title: string; summary: string; kind: AssetKind;
  ateVisible: boolean; approved: boolean; attested: boolean; askCount: number;
}) {
  const Icon = ["external_video", "mp4", "zoom_link"].includes(kind) ? Film
    : ["learnshare_link"].includes(kind) ? Link2
    : FileText;
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Preview — how this looks in Ask More Help
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[10px] font-semibold text-primary mb-1">ORG-APPROVED</div>
        <div className="flex items-start gap-2">
          <div className="size-8 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="size-3.5 text-foreground/70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{title || "Asset title"}</div>
            <div className="text-[11px] text-muted-foreground truncate">{summary || ASSET_KIND_LABEL[kind]}</div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
        <span className={`px-2 py-0.5 rounded-full ${approved ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
          {approved ? "Approved" : "Draft"}
        </span>
        <span className={`px-2 py-0.5 rounded-full ${ateVisible ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
          {ateVisible ? "ATE visible" : "Admin only"}
        </span>
        {!attested && (
          <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning inline-flex items-center gap-1">
            <AlertTriangle className="size-3" /> Needs attestation
          </span>
        )}
        <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {askCount} Ask topic{askCount === 1 ? "" : "s"}
        </span>
      </div>
      {!ateVisible && (
        <div className="text-[11px] text-muted-foreground mt-2">
          Won't appear to ATE users until approved, ATE-visible, and both attestations confirmed.
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-foreground/80 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
