import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header, EmptyState } from "./_authenticated.learn";

function useContent(contentType: string) {
  return useQuery({
    queryKey: ['content', contentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items').select('*')
        .eq('content_type', contentType as any)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function ContentList({ type, title, subtitle }: { type: string; title: string; subtitle: string }) {
  const { data, isLoading } = useContent(type);
  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title={title} subtitle={subtitle} />
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {(data ?? []).map((it: any) => (
          <div key={it.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft hover:border-primary/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{it.difficulty}</span>
              <span>·</span>
              <span>{it.estimated_minutes ?? 5} min</span>
            </div>
            <div className="mt-2 font-display font-semibold">{it.title}</div>
            {it.summary && <div className="mt-1 text-sm text-muted-foreground line-clamp-3">{it.summary}</div>}
            {(it.tags ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {it.tags.slice(0, 4).map((t: string) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState title={`No ${title.toLowerCase()} yet`} desc="An admin can publish the first ones from the admin dashboard." />
          </div>
        )}
      </div>
    </div>
  );
}

export const PlaybooksRoute = createFileRoute("/_authenticated/playbooks")({
  head: () => ({ meta: [{ title: "Playbooks — At the Elbow Academy" }] }),
  component: () => <ContentList type="playbook" title="Playbooks" subtitle="Repeatable plays for the moments that matter." />,
});

export { PlaybooksRoute as Route };
