import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Film, PlayCircle, FileText } from "lucide-react";
import { itemsByType } from "@/lib/demo-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({ meta: [{ title: "Videos — At the Elbow Academy" }] }),
  component: VideosPage,
});

function VideosPage() {
  const videos = itemsByType("video");
  const [activeId, setActive] = useState<string | null>(null);
  const active = videos.find(v => v.id === activeId);

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Videos" subtitle="Under three minutes. Transcripts included. No filler." />
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {videos.map(v => (
          <button key={v.id} onClick={() => setActive(v.id)}
            className="text-left group rounded-2xl border border-border bg-card overflow-hidden shadow-soft hover:border-primary/40 transition-colors">
            <div className="aspect-video relative bg-gradient-to-br from-primary-soft via-accent to-surface-elevated flex items-center justify-center">
              <div className="size-14 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-elevated group-hover:scale-105 transition-transform">
                <PlayCircle className="size-7 text-primary" />
              </div>
              <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-foreground/80 text-background">
                {v.estimated_minutes} min
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Film className="size-3 text-primary" /> Video
              </div>
              <div className="mt-1 font-display font-semibold">{v.title}</div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{v.summary}</p>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="bg-card rounded-3xl border border-border shadow-elevated w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="aspect-video bg-gradient-to-br from-primary-soft via-accent to-surface-elevated flex items-center justify-center">
              <PlayCircle className="size-16 text-primary/70" />
            </div>
            <div className="p-5">
              <div className="font-display font-semibold">{active.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{active.summary}</p>
              {active.transcript && (
                <div className="mt-4 rounded-xl bg-secondary/60 p-4 text-sm">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    <FileText className="size-3" /> Transcript
                  </div>
                  {active.transcript}
                </div>
              )}
              <button onClick={() => setActive(null)} className="mt-4 w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
