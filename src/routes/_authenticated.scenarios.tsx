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
        .eq('content_type', contentType)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export const Route = createFileRoute("/_authenticated/scenarios")({
  head: () => ({ meta: [{ title: "Scenarios — At the Elbow Academy" }] }),
  component: ScenariosPage,
});

function ScenariosPage() {
  const { data, isLoading } = useContent('scenario');
  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Scenarios" subtitle="Floor situations you'll see — and how to handle them." />
      <div className="mt-6 space-y-3">
        {(data ?? []).map((it: any) => (
          <div key={it.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="text-[10px] uppercase tracking-wider text-primary font-medium">Scenario · {it.difficulty}</div>
            <div className="mt-1 font-display font-semibold text-lg">{it.title}</div>
            {it.summary && <p className="mt-2 text-sm text-muted-foreground">{it.summary}</p>}
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <EmptyState title="No scenarios yet" desc="An admin can publish scenarios from the admin dashboard." />
        )}
      </div>
    </div>
  );
}
