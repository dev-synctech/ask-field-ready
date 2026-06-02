import { createFileRoute, Link } from "@tanstack/react-router";
import { ListChecks, PlayCircle } from "lucide-react";
import { itemsByType } from "@/lib/demo-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/scenarios")({
  head: () => ({ meta: [{ title: "Scenarios — Mizly" }] }),
  component: ScenariosPage,
});

function ScenariosPage() {
  const scenarios = itemsByType("scenario");
  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Scenarios" subtitle="Real moments, replayed without names or PHI. Practice the next 90 seconds." />
      <div className="mt-6 space-y-3">
        {scenarios.map(s => (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <ListChecks className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Scenario · {s.difficulty}</span>
                </div>
                <div className="mt-1 font-display font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
              </div>
              <Link
                to="/scenarios/$id"
                params={{ id: s.id }}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs h-9 px-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                <PlayCircle className="size-3.5" /> Start
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
