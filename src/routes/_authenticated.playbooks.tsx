import { createFileRoute, Link } from "@tanstack/react-router";
import { NotebookPen, ArrowRight } from "lucide-react";
import { itemsByType } from "@/lib/demo-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/playbooks")({
  head: () => ({ meta: [{ title: "Playbooks — Mizly" }] }),
  component: PlaybooksPage,
});

function PlaybooksPage() {
  const playbooks = itemsByType("playbook");
  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Playbooks" subtitle="Step-by-step references for the moment a unit needs you most." />
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {playbooks.map(p => (
          <Link
            key={p.id}
            to="/playbooks/$id"
            params={{ id: p.id }}
            className="group rounded-2xl border border-border bg-card p-5 shadow-soft hover:border-primary/40 hover:shadow-card transition-all block"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <NotebookPen className="size-3 text-primary" /> Playbook · {p.difficulty}
            </div>
            <div className="mt-2 font-display font-semibold">{p.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{t}</span>
                ))}
              </div>
              <span className="text-muted-foreground inline-flex items-center gap-1">
                {p.estimated_minutes} min <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
