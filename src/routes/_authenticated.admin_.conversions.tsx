import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FolderInput, ArrowRight } from "lucide-react";
import { useConversions, TYPE_LABEL, RISK_LABEL, RISK_CLS, STATUS_LABEL, STATUS_CLS } from "@/lib/conversions-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/admin_/conversions")({
  head: () => ({ meta: [{ title: "Source Conversion Queue — Mizly Admin" }] }),
  component: ConversionsPage,
});

function ConversionsPage() {
  const items = useConversions();
  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="size-3.5" /> Back to Admin
      </Link>
      <Header title="Source Conversion Queue" subtitle="Turn raw source material into Mizly-original lessons, playbooks, scenarios, and checklists." />

      <div className="mt-6 space-y-3">
        {items.map(c => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground inline-flex items-center gap-1">
                    <FolderInput className="size-3" /> {TYPE_LABEL[c.type]}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${RISK_CLS[c.risk]}`}>
                    {RISK_LABEL[c.risk]} risk
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_CLS[c.status]}`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <div className="mt-2 font-display font-semibold">{c.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Domain: {c.suggested_domain} · Role: {c.suggested_role} · Phase: {c.suggested_phase}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Converted items: <span className="font-medium text-foreground">{c.converted_items.length}</span> · Last updated: {c.last_updated}
                </div>
              </div>
              <Link
                to="/admin/conversions/$id"
                params={{ id: c.id }}
                className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5 shrink-0"
              >
                Open conversion <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
