import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({ meta: [{ title: "Learn — At the Elbow Academy" }] }),
  component: LearnPage,
});

function LearnPage() {
  const { data: modules } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules').select('*').order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: items } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items').select('*')
        .eq('content_type', 'lesson')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Learn" subtitle="Modules and lessons, organized for the floor." />
      <div className="mt-6 space-y-6">
        {(modules ?? []).map(m => {
          const lessons = (items ?? []).filter((i: any) => i.module_id === m.id);
          return (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <BookOpen className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold">{m.title}</div>
                  {m.summary && <div className="text-sm text-muted-foreground mt-0.5">{m.summary}</div>}
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{lessons.length} lessons</div>
              </div>
              {lessons.length > 0 && (
                <ul className="mt-4 divide-y divide-border">
                  {lessons.map((l: any) => (
                    <li key={l.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{l.title}</div>
                        {l.summary && <div className="text-xs text-muted-foreground truncate">{l.summary}</div>}
                      </div>
                      <div className="text-[11px] text-muted-foreground shrink-0">{l.estimated_minutes ?? 5} min</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {(modules ?? []).length === 0 && (
          <EmptyState title="No modules yet" desc="An admin can add the first modules from the admin dashboard." />
        )}
      </div>
    </div>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
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
