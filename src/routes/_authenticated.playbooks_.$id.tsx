import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft, NotebookPen, AlertTriangle, ArrowUpRight, MessageSquareQuote,
  ClipboardList, Copy, Clock, ClipboardCheck, ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { itemById, PLAYBOOK_DETAIL, relatedFor, linkFor } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/playbooks_/$id")({
  head: () => ({ meta: [{ title: "Playbook — At the Elbow Academy" }] }),
  component: PlaybookDetailPage,
});

// Vendor-neutral mock content for the new sections
const WHAT_TO_SAY: Record<string, string[]> = {
  p1: [
    "'Paper starts now — I'll grab the form.'",
    "'Names and arrival times only — nothing else.'",
    "'I'll write the timestamp on every form.'",
  ],
  p2: [
    "'Let's try one order on another workstation while I watch.'",
    "'No screenshots that show patient info.'",
    "'I'll page on-call if any order is time-sensitive.'",
  ],
  p3: [
    "'Hi, I'm here to help. What's the most stressful thing right now?'",
    "'I'll stay near this station for the next hour — wave me over.'",
    "'I'll watch a couple of workflows first before suggesting anything.'",
  ],
  p4: [
    "'Quick update — the signature tool is back up.'",
    "'Please retry any pending orders from the last hour.'",
    "'I'll be at the central station if it fails again.'",
  ],
};

const WHAT_TO_CAPTURE: Record<string, string[]> = {
  p1: ["Arrival time per patient", "Headcount during downtime", "Time the system returned"],
  p2: ["Number of clinicians affected", "Time first failure was reported", "Workaround used (if any)"],
  p3: ["Charge nurse name + contact", "Two busiest roles on the unit", "Workflows where users hesitated"],
  p4: ["What you announced and when", "Number of clinicians who retried", "Any follow-up questions raised"],
};

function PlaybookDetailPage() {
  const { id } = useParams({ from: "/_authenticated/playbooks_/$id" });
  const item = itemById(id);
  const detail = PLAYBOOK_DETAIL[id];
  const relChecklist = relatedFor(id, ["checklist"], 2);
  const relScenario = relatedFor(id, ["scenario"], 2);

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
  const whatToSay = WHAT_TO_SAY[id] ?? ["Speak calmly.", "Be specific.", "End with where you'll be."];
  const whatToCapture = WHAT_TO_CAPTURE[id] ?? ["What happened.", "When it happened.", "Who was affected."];

  const copyEscalation = () => {
    const text = [
      `Playbook: ${item.title}`,
      `When to escalate: ${detail?.escalation ?? "Escalate when scope expands or any patient workflow is time-sensitive."}`,
      "Include: scope (how many users), severity (any patient impact), workaround (yes/no), callback.",
    ].join("\n");
    navigator.clipboard?.writeText(text);
    toast.success("Escalation note copied");
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 pb-16">
      <Link to="/playbooks" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Playbooks
      </Link>

      {/* Polished header */}
      <div className="mt-4 rounded-3xl border border-border bg-gradient-to-br from-warning/10 via-card to-card p-6 md:p-7 shadow-soft">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning text-warning-foreground"><NotebookPen className="size-3" /> Playbook</span>
          <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="size-3" /> {item.estimated_minutes} min</span>
          <span className="text-muted-foreground">· {item.difficulty}</span>
        </div>
        <h1 className="mt-3 text-2xl md:text-3xl font-display font-semibold tracking-tight">{item.title}</h1>
        <p className="mt-2 text-sm text-foreground/75">{item.summary}</p>
      </div>

      {detail?.whenToUse && (
        <Card title="When to use">
          <p className="text-sm">{detail.whenToUse}</p>
        </Card>
      )}

      <div className="mt-5">
        <SectionLabel>Steps</SectionLabel>
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

      <Card title="What to say" icon={MessageSquareQuote}>
        <ul className="space-y-2 text-sm">
          {whatToSay.map((s, i) => (
            <li key={i} className="rounded-xl bg-secondary/60 px-3 py-2 italic text-foreground/90">{s}</li>
          ))}
        </ul>
      </Card>

      <Card title="What to capture" icon={ClipboardList}>
        <ul className="space-y-1.5 text-sm">
          {whatToCapture.map((c, i) => (
            <li key={i} className="flex gap-2">
              <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" /> {c}
            </li>
          ))}
        </ul>
      </Card>

      {pitfalls.length > 0 && (
        <div className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-5">
          <div className="font-display font-semibold flex items-center gap-2 mb-2">
            <AlertTriangle className="size-4 text-warning" /> Common mistakes
          </div>
          <ul className="space-y-1.5 text-sm">
            {pitfalls.map((p, i) => <li key={i}>• {p}</li>)}
          </ul>
        </div>
      )}

      {detail?.escalation && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="font-display font-semibold flex items-center gap-2 text-destructive">
              <ArrowUpRight className="size-4" /> When to escalate
            </div>
            <button onClick={copyEscalation} className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 inline-flex items-center gap-1.5">
              <Copy className="size-3.5" /> Copy escalation note
            </button>
          </div>
          <p className="mt-2 text-sm">{detail.escalation}</p>
        </div>
      )}

      {(relChecklist.length > 0 || relScenario.length > 0) && (
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {relChecklist[0] && (
            <RelatedTile to="/checklists" label="Related checklist" icon={ClipboardCheck} title={relChecklist[0].title} summary={relChecklist[0].summary} />
          )}
          {relScenario[0] && (
            <RelatedTile to="/scenarios/$id" params={{ id: relScenario[0].id }} label="Related scenario" icon={ListChecks} title={relScenario[0].title} summary={relScenario[0].summary} />
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">{children}</div>;
}

function Card({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 inline-flex items-center gap-1.5">
        {Icon && <Icon className="size-3 text-primary" />} {title}
      </div>
      {children}
    </div>
  );
}

function RelatedTile({ to, params, label, icon: Icon, title, summary }: any) {
  return (
    <Link to={to} params={params}
      className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-soft transition-all">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        <Icon className="size-3 text-primary" /> {label}
      </div>
      <div className="mt-1 font-display font-semibold group-hover:text-primary transition-colors">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{summary}</p>
    </Link>
  );
}
