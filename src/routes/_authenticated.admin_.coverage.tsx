import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, BarChart3, AlertTriangle, CheckCircle2, GitBranch } from "lucide-react";
import { ITEMS, MODULES, type ContentType } from "@/lib/demo-data";
import { useConversions, STATUS_LABEL, RISK_LABEL } from "@/lib/conversions-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/coverage")({
  head: () => ({ meta: [{ title: "Coverage — Mizly Admin" }] }),
  component: CoveragePage,
});

const TYPES: ContentType[] = ["lesson", "playbook", "video", "checklist", "scenario"];
const TARGET_PER_TYPE = 3; // demo target: each module should have at least 3 of each type

function CoveragePage() {
  const conversions = useConversions();
  const sourceReadyGaps = useMemo(
    () => conversions.filter(c => c.status !== "published" && c.converted_items.length === 0),
    [conversions],
  );
  const grid = useMemo(() => {
    return MODULES.map(m => {
      const counts = Object.fromEntries(
        TYPES.map(ty => [ty, ITEMS.filter(i => i.module_id === m.id && i.content_type === ty && i.publish_status === "published").length])
      ) as Record<ContentType, number>;
      const total = TYPES.reduce((a, ty) => a + counts[ty], 0);
      const gaps = TYPES.filter(ty => counts[ty] === 0);
      return { module: m, counts, total, gaps };
    });
  }, []);

  const totals = useMemo(() => {
    const byType = Object.fromEntries(TYPES.map(ty => [ty, ITEMS.filter(i => i.content_type === ty && i.publish_status === "published").length])) as Record<ContentType, number>;
    return { byType, total: ITEMS.filter(i => i.publish_status === "published").length };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to Admin
      </Link>
      <Header title="Coverage" subtitle="Where the Mizly library is strong, thin, or missing." />

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Published total" value={totals.total} tone="primary" />
        {TYPES.map(ty => (
          <KPI key={ty} label={ty} value={totals.byType[ty]} />
        ))}
      </div>

      <div className="mt-8 font-display font-semibold flex items-center gap-2">
        <BarChart3 className="size-4 text-primary" /> Coverage Matrix
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Target: at least {TARGET_PER_TYPE} published items per type per module.
      </p>

      <div className="mt-3 rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Module</th>
              {TYPES.map(ty => <th key={ty} className="px-2 py-2 font-medium capitalize">{ty}</th>)}
              <th className="px-2 py-2 font-medium">Total</th>
              <th className="px-2 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {grid.map(row => (
              <tr key={row.module.id} className="border-t border-border">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{row.module.title}</div>
                  <div className="text-muted-foreground line-clamp-1">{row.module.summary}</div>
                </td>
                {TYPES.map(ty => {
                  const c = row.counts[ty];
                  const cls = c === 0 ? "bg-destructive/10 text-destructive" : c < TARGET_PER_TYPE ? "bg-warning/15 text-warning" : "bg-success/15 text-success";
                  return (
                    <td key={ty} className="px-2 py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-full ${cls}`}>{c}</span>
                    </td>
                  );
                })}
                <td className="px-2 py-2.5 text-center font-medium">{row.total}</td>
                <td className="px-2 py-2.5 text-center">
                  {row.gaps.length === 0 ? (
                    row.total >= 5 ? (
                      <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3.5" /> Strong coverage</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning"><AlertTriangle className="size-3.5" /> Thin area</span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 text-warning"><AlertTriangle className="size-3.5" /> Needs content · {row.gaps.length} gap{row.gaps.length === 1 ? "" : "s"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="font-display font-semibold">Top gaps</div>
        <ul className="mt-3 space-y-2">
          {grid.flatMap(r => r.gaps.map(ty => ({ m: r.module, ty }))).slice(0, 10).map((g, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm">
              <span><span className="font-medium">{g.m.title}</span> <span className="text-muted-foreground">— missing {g.ty}s</span></span>
              <Link to="/admin" className="text-xs text-primary hover:underline">Create →</Link>
            </li>
          ))}
          {grid.every(r => r.gaps.length === 0) && (
            <li className="text-sm text-muted-foreground">No gaps. Every module has at least one of each type.</li>
          )}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-display font-semibold flex items-center gap-2">
            <GitBranch className="size-4 text-primary" /> Source-ready gaps
          </div>
          <Link to="/admin/conversions" className="text-xs text-primary hover:underline">Open conversion queue →</Link>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Sanitized source material in the conversion queue that has not yet shipped as Mizly-original learner-facing content.
        </p>
        <ul className="mt-3 space-y-2">
          {sourceReadyGaps.length === 0 && (
            <li className="text-sm text-muted-foreground">No pending sources — every queued item has shipped a Mizly pack.</li>
          )}
          {sourceReadyGaps.map(c => (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {c.suggested_domain} · {STATUS_LABEL[c.status]} · risk: {RISK_LABEL[c.risk]}
                </div>
              </div>
              <Link to="/admin/conversions/$id" params={{ id: c.id }} className="text-xs text-primary hover:underline shrink-0">Convert →</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone?: "primary" }) {
  const cls = tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground capitalize">{label}</div>
      <div className={`mt-1 font-display font-semibold text-xl ${cls}`}>{value}</div>
    </div>
  );
}
