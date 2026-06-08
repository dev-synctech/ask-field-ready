import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { MODULES, ITEMS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({ meta: [{ title: "Learn — Mizly" }] }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Learn" subtitle="Short lessons organized by role, domain, and go-live phase." />

      <Link
        to="/org-library"
        className="mt-6 block rounded-2xl border border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
      >
        <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">Your organization</div>
        <div className="mt-1 font-display font-semibold">Org content library</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Tip sheets, screenshots, training videos, and LearnShare links your org admin has approved for ATE use.
        </div>
      </Link>

      <div className="mt-6 space-y-4">
        {MODULES.map(m => {
          const lessons = ITEMS.filter(i => i.module_id === m.id);
          return (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <BookOpen className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold">{m.title}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{m.summary}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{lessons.length} items</div>
              </div>
              {lessons.length > 0 && (
                <ul className="mt-4 divide-y divide-border">
                  {lessons.map(l => {
                    const to =
                      l.content_type === "lesson" ? "/lessons/$id"
                      : l.content_type === "playbook" ? "/playbooks/$id"
                      : l.content_type === "scenario" ? "/scenarios/$id"
                      : l.content_type === "video" ? "/videos"
                      : "/checklists";
                    const params = ["/lessons/$id", "/playbooks/$id", "/scenarios/$id"].includes(to as string) ? { id: l.id } : undefined;
                    return (
                      <li key={l.id}>
                        <Link
                          to={to as any}
                          params={params as any}
                          className="py-3 flex items-center justify-between gap-3 group hover:text-primary transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate group-hover:text-primary">{l.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{l.summary}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">{l.content_type}</span>
                            <span className="text-[11px] text-muted-foreground">{l.estimated_minutes} min</span>
                            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-w-0">
      <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight break-words">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground break-words">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface">
      <div className="font-display font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
    </div>
  );
}
