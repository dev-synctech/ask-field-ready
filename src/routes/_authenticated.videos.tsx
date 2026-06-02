import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header, EmptyState } from "./_authenticated.learn";
import { Film } from "lucide-react";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({ meta: [{ title: "Videos — At the Elbow Academy" }] }),
  component: VideosPage,
});

function VideosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['content', 'video'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items').select('*')
        .eq('content_type', 'video')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Videos" subtitle="Short, sharp. Transcripts included." />
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {(data ?? []).map((it: any) => (
          <div key={it.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
            <div className="aspect-video bg-gradient-to-br from-primary-soft to-secondary flex items-center justify-center">
              <Film className="size-8 text-primary/60" />
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.estimated_minutes ?? 3} min · {it.difficulty}</div>
              <div className="mt-1 font-display font-semibold">{it.title}</div>
              {it.summary && <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{it.summary}</div>}
            </div>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState title="No videos yet" desc="Admins can upload videos to the private library." />
          </div>
        )}
      </div>
    </div>
  );
}
