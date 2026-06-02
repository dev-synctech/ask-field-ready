import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ListChecks, RotateCcw, CheckCircle2 } from "lucide-react";
import { itemById, SCENARIO_DETAIL, type ScenarioDetail } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/scenarios/$id")({
  head: () => ({ meta: [{ title: "Scenario — At the Elbow Academy" }] }),
  component: ScenarioDetailPage,
});

type StepKey = "situation" | "first90" | "whatToSay" | "whatToCheck" | "escalation" | "debrief";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "situation", label: "Situation" },
  { key: "first90", label: "First 90 seconds" },
  { key: "whatToSay", label: "What to say" },
  { key: "whatToCheck", label: "What to check" },
  { key: "escalation", label: "Escalation decision" },
  { key: "debrief", label: "Debrief" },
];

function ScenarioDetailPage() {
  const { id } = useParams({ from: "/_authenticated/scenarios/$id" });
  const item = itemById(id);
  const detail: ScenarioDetail | undefined = SCENARIO_DETAIL[id];
  const [step, setStep] = useState(0);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link to="/scenarios" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Scenarios
        </Link>
        <h1 className="mt-4 text-2xl font-display font-semibold">Scenario not found</h1>
      </div>
    );
  }

  const d: ScenarioDetail = detail ?? {
    situation: item.summary,
    first90: ["Walk to the workstation.", "Listen first.", "Acknowledge the user."],
    whatToSay: ["I'll stay with you on this.", "Let's try one thing together.", "I'll get help if we need it."],
    whatToCheck: ["Scope: how many users?", "Severity: any patient impact?", "Workaround: is one available?"],
    escalation: "Escalate to command center if scope is unit-wide or any patient workflow is time-sensitive.",
    debrief: "Capture what happened, what worked, and what you'll do differently next shift.",
  };

  const current = STEPS[step];
  const value = d[current.key];
  const isList = Array.isArray(value);
  const total = STEPS.length;
  const pct = ((step + 1) / total) * 100;
  const last = step === total - 1;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <Link to="/scenarios" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Scenarios
      </Link>

      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <ListChecks className="size-3 text-primary" /> Scenario · {item.difficulty} · {item.estimated_minutes} min
      </div>
      <h1 className="mt-1 text-2xl md:text-3xl font-display font-semibold tracking-tight">{item.title}</h1>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step + 1} of {total}</span>
          <span>{current.label}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-soft min-h-[220px]">
        <div className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2">{current.label}</div>
        {isList ? (
          <ol className="space-y-3">
            {(value as string[]).map((v, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="size-6 shrink-0 rounded-full bg-primary-soft text-primary text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                <span className="pt-0.5">{v}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-base leading-relaxed">{value as string}</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="h-11 px-4 rounded-xl border border-border bg-card text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-40"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(i)}
              aria-label={`Go to ${s.label}`}
              className={`size-2.5 rounded-full ${i === step ? "bg-primary" : i < step ? "bg-primary/40" : "bg-border"}`}
            />
          ))}
        </div>

        {last ? (
          <button
            onClick={() => setStep(0)}
            className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5"
          >
            <RotateCcw className="size-4" /> Replay
          </button>
        ) : (
          <button
            onClick={() => setStep(s => Math.min(total - 1, s + 1))}
            className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5"
          >
            Next <ArrowRight className="size-4" />
          </button>
        )}
      </div>

      {last && (
        <div className="mt-5 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm flex items-start gap-2">
          <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
          <div>You've walked the scenario. Replay it or pick another from the list.</div>
        </div>
      )}
    </div>
  );
}
