import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, NotebookPen, AlertTriangle, ArrowUpRight } from "lucide-react";
import { itemById, PLAYBOOK_DETAIL } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/playbooks_/$id")({
  head: () => ({ meta: [{ title: "Playbook — At the Elbow Academy" }] }),
  component: PlaybookDetailPage,
});

function PlaybookDetailPage() {
  const { id } = useParams({ from: "/_authenticated/playbooks_/$id" });
  const item = itemById(id);
  const detail = PLAYBOOK_DETAIL[id];

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link to="/playbooks" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Playbooks
        </Link>
        <h1 className="mt-4 text-2xl font-display font-semibold">Playbook not found</h1>
      </div>
    );
  }

  const steps = detail?.steps ?? [{ title: "Read summary", body: item.summary }];
  const pitfalls = detail?.pitfalls ?? [];

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <Link to="/playbooks" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Playbooks
      </Link>

      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <NotebookPen className="size-3 text-primary" /> Playbook · {item.difficulty} · {item.estimated_minutes} min
      </div>
      <h1 className="mt-1 text-2xl md:text-3xl font-display font-semibold tracking-tight">{item.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>

      {detail?.whenToUse && (
        <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">When to use</div>
          <p className="text-sm">{detail.whenToUse}</p>
        </div>
      )}

      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Steps</div>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="rounded-2xl border border-border bg-card p-4 shadow-soft flex gap-4">
              <div className="size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </div>
              <div>
                <div className="font-display font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-foreground/85">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {pitfalls.length > 0 && (
        <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-5">
          <div className="font-display font-semibold flex items-center gap-2 mb-2">
            <AlertTriangle className="size-4 text-warning" /> Common pitfalls
          </div>
          <ul className="space-y-1.5 text-sm">
            {pitfalls.map((p, i) => <li key={i}>• {p}</li>)}
          </ul>
        </div>
      )}

      {detail?.escalation && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="font-display font-semibold flex items-center gap-2 mb-2 text-destructive">
            <ArrowUpRight className="size-4" /> When to escalate
          </div>
          <p className="text-sm">{detail.escalation}</p>
        </div>
      )}
    </div>
  );
}
