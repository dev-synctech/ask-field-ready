import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header, EmptyState } from "./_authenticated.learn";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/checklists")({
  head: () => ({ meta: [{ title: "Checklists — At the Elbow Academy" }] }),
  component: ChecklistsPage,
});

function ChecklistsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['content', 'checklist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items').select('*')
        .eq('content_type', 'checklist')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Checklists" subtitle="Carry-the-pager-ready references." />
      <div className="mt-6 space-y-3">
        {(data ?? []).map((it: any) => (
          <div key={it.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
                <ClipboardCheck className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold">{it.title}</div>
                {it.summary && <div className="mt-0.5 text-sm text-muted-foreground">{it.summary}</div>}
                {it.body_md && (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {it.body_md.split('\n').filter(Boolean).slice(0, 8).map((line: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-muted-foreground">□</span><span>{line.replace(/^[-*]\s*/, '')}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <EmptyState title="No checklists yet" desc="Admins can publish checklists from the admin dashboard." />
        )}
      </div>
    </div>
  );
}
