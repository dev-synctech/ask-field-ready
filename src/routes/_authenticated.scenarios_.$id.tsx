import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, ArrowRight, ListChecks, RotateCcw, CheckCircle2, Eye, Clock,
} from "lucide-react";
import {
  itemById, SCENARIO_DETAIL, SCENARIO_RECOMMEND, type ScenarioDetail, type ScenarioRecommend,
} from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/scenarios_/$id")({
  head: () => ({ meta: [{ title: "Scenario — Mizly" }] }),
  component: ScenarioDetailPage,
});

type StepKey = "situation" | "first90" | "whatToSay" | "whatToCheck" | "escalation" | "debrief";

const STEPS: { key: StepKey; label: string; prompt: string }[] = [
  { key: "situation",   label: "Situation",           prompt: "What's the first thing you'd notice walking up?" },
  { key: "first90",     label: "First 90 seconds",    prompt: "What would you do in the next 90 seconds?" },
  { key: "whatToSay",   label: "What to say",         prompt: "What exact words would you use?" },
  { key: "whatToCheck", label: "What to check",       prompt: "What would you confirm before acting?" },
  { key: "escalation",  label: "Escalation decision", prompt: "Would you escalate? Why or why not?" },
  { key: "debrief",     label: "Debrief",             prompt: "What would you capture for the next shift?" },
];

function ScenarioDetailPage() {
  const { id } = useParams({ from: "/_authenticated/scenarios_/$id" });
  const item = itemById(id);
  const detail: ScenarioDetail | undefined = SCENARIO_DETAIL[id];
  const recommend: ScenarioRecommend | undefined = SCENARIO_RECOMMEND[id];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<StepKey, string>>({} as any);
  const [revealed, setRevealed] = useState<Record<StepKey, boolean>>({} as any);

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
    whatToSay: ["I'll stay with you.", "Let's try one thing together.", "I'll get help if we need it."],
    whatToCheck: ["Scope.", "Severity.", "Workaround available?"],
    escalation: "Escalate to command center if unit-wide or any patient workflow is time-sensitive.",
    debrief: "Capture what happened, what worked, and what you'll do differently.",
  };

  const reset = () => { setStep(0); setAnswers({} as any); setRevealed({} as any); };

  const current = STEPS[step];
  const value = d[current.key];
  const isList = Array.isArray(value);
  const total = STEPS.length;
  const pct = ((step + 1) / total) * 100;
  const last = step === total - 1;
  const showPrompt = current.key !== "situation";

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 pb-16">
      <Link to="/scenarios" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Scenarios
      </Link>

      <div className="mt-4 rounded-3xl border border-border bg-gradient-to-br from-secondary/60 via-card to-card p-6 shadow-soft">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground text-background"><ListChecks className="size-3" /> Scenario</span>
          <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="size-3" /> {item.estimated_minutes} min</span>
          <span className="text-muted-foreground">· {item.difficulty}</span>
        </div>
        <h1 className="mt-3 text-2xl md:text-3xl font-display font-semibold tracking-tight">{item.title}</h1>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step + 1} of {total}</span>
          <span>{current.label}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-soft min-h-[220px] animate-in fade-in duration-200" key={step}>
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

        {showPrompt && (
          <div className="mt-5 pt-5 border-t border-border">
            <label className="block text-[11px] font-medium text-foreground/80 mb-1.5">
              What would you do?
            </label>
            <textarea
              value={answers[current.key] ?? ""}
              onChange={e => setAnswers(a => ({ ...a, [current.key]: e.target.value }))}
              rows={3}
              placeholder={current.prompt}
              className="w-full p-3 rounded-xl border border-input bg-surface-elevated text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {recommend && (
              <div className="mt-3">
                {!revealed[current.key] ? (
                  <button
                    onClick={() => setRevealed(r => ({ ...r, [current.key]: true }))}
                    className="text-xs h-9 px-3 rounded-lg border border-border bg-card hover:bg-secondary inline-flex items-center gap-1.5"
                  >
                    <Eye className="size-3.5" /> Reveal recommended response
                  </button>
                ) : (
                  <div className="rounded-xl bg-primary-soft border border-primary/20 p-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="text-[10px] uppercase tracking-wider text-primary font-medium mb-1">Recommended</div>
                    {recommend[current.key as keyof ScenarioRecommend]}
                  </div>
                )}
              </div>
            )}
          </div>
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
              className={`size-2.5 rounded-full transition-colors ${i === step ? "bg-primary scale-125" : i < step ? "bg-primary/50" : "bg-border"}`}
            />
          ))}
        </div>

        {last ? (
          <button
            onClick={reset}
            className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5"
          >
            <RotateCcw className="size-4" /> Replay scenario
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
        <div className="mt-6 rounded-2xl border border-success/40 bg-success/10 p-5 animate-in fade-in duration-300">
          <div className="font-display font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" /> Debrief summary
          </div>
          <p className="mt-2 text-sm text-foreground/85">
            You walked through {item.title.toLowerCase()}. Review your notes below, then replay or pick another scenario.
          </p>
          {Object.keys(answers).length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {STEPS.filter(s => answers[s.key]?.trim()).map(s => (
                <li key={s.key} className="rounded-xl bg-card border border-border p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{s.label}</div>
                  <div className="whitespace-pre-wrap">{answers[s.key]}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
