import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Film, Link2, ShieldCheck, Download, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useOrgAssets, useViewer, recordView, recordDownload,
  isAteVisible, ASSET_KIND_LABEL, WATERMARK_TEXT,
  type OrgAsset,
} from "@/lib/org-library";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/org-library")({
  head: () => ({ meta: [{ title: "Org Library — Mizly" }] }),
  component: OrgLibraryLearner,
});

function OrgLibraryLearner() {
  const assets = useOrgAssets();
  const viewer = useViewer();
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const tk = q.trim().toLowerCase();
    return assets.filter((a) => isAteVisible(a, viewer)).filter((a) => {
      if (!tk) return true;
      return `${a.title} ${a.summary} ${a.workflow_area} ${a.department}`.toLowerCase().includes(tk);
    });
  }, [assets, viewer, q]);

  const grouped = useMemo(() => {
    const m = new Map<string, OrgAsset[]>();
    visible.forEach((a) => {
      const k = a.doc_type;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(a);
    });
    return Array.from(m.entries());
  }, [visible]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header
        title="Organization library"
        subtitle="Approved training material from your organization. Only your team can see these."
      />

      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3 text-[11px] inline-flex items-center gap-2">
        <ShieldCheck className="size-3.5 text-primary" />
        {WATERMARK_TEXT}
      </div>

      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tip sheets, videos, screenshots…"
          className="h-10 w-full rounded-lg border border-input bg-surface-elevated pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No approved org content yet. Ask your org admin to publish materials.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {grouped.map(([type, list]) => (
            <section key={type}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                {type.replace(/_/g, " ")}
              </div>
              <div className="space-y-2">
                {list.map((a) => <LearnerAssetCard key={a.id} asset={a} viewerId={viewer.role} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function LearnerAssetCard({ asset, viewerId }: { asset: OrgAsset; viewerId: string }) {
  const isLink = !!asset.external_url;
  const Icon = isLink ? Link2 : asset.asset_kind === "mp4" || asset.asset_kind === "external_video" ? Film : FileText;

  function open() {
    recordView(asset.id, viewerId);
    if (asset.external_url) {
      window.open(asset.external_url, "_blank", "noopener,noreferrer");
    } else {
      toast(`Opening ${asset.file_name ?? asset.title} in secure viewer (demo)`);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="size-9 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="size-4 text-foreground/70" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{asset.title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {ASSET_KIND_LABEL[asset.asset_kind]} · {asset.department} · {asset.workflow_area}
            {asset.timestamp && <> · Start at {asset.timestamp}</>}
          </div>
          {asset.summary && <div className="text-xs mt-1 text-foreground/80">{asset.summary}</div>}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={open} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-1.5">
            {isLink ? <><ExternalLink className="size-3.5" /> Open</> : <>Open</>}
          </button>
          {!asset.download_disabled && !isLink && (
            <button
              onClick={() => { recordDownload(asset.id, viewerId); toast("Download started (demo)"); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5"
            >
              <Download className="size-3.5" /> Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
