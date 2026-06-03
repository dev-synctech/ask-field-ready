import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Film, PlayCircle, FileText, Search, Copy, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { itemsByType, VIDEO_DETAIL, relatedFor, linkFor } from "@/lib/demo-data";
import { Header } from "./_authenticated.learn";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({ meta: [{ title: "Videos — Mizly" }] }),
  component: VideosPage,
});

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark> : <span key={i}>{part}</span>
  );
}

function VideosPage() {
  const videos = itemsByType("video");
  const [activeId, setActive] = useState<string | null>(null);
  const [tSearch, setTSearch] = useState("");
  const active = videos.find(v => v.id === activeId);
  const detail = active ? VIDEO_DETAIL[active.id] : undefined;
  const transcript = detail?.transcript ?? active?.transcript ?? "";
  const chapters = detail?.chapters ?? [];
  const related = useMemo(() => active ? relatedFor(active.id, ["lesson", "playbook"], 4) : [], [active]);

  const close = () => { setActive(null); setTSearch(""); };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Header title="Videos" subtitle="Short walkthroughs for high-pressure support moments." />
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {videos.map(v => (
          <button key={v.id} onClick={() => setActive(v.id)}
            className="text-left group rounded-2xl border border-border bg-card overflow-hidden shadow-soft hover:border-primary/40 hover:-translate-y-0.5 transition-all">
            <div className="aspect-video relative bg-secondary flex items-center justify-center">
              <div className="size-14 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-elevated group-hover:scale-105 transition-transform">
                <PlayCircle className="size-7 text-primary" />
              </div>
              <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-foreground/80 text-background inline-flex items-center gap-1">
                <Clock className="size-3" /> {v.estimated_minutes} min
              </span>
              {VIDEO_DETAIL[v.id]?.chapters.length ? (
                <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-background/90 text-foreground">
                  {VIDEO_DETAIL[v.id].chapters.length} chapters
                </span>
              ) : null}
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
        <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={close}>
          <div className="bg-card md:rounded-3xl rounded-t-3xl border border-border shadow-elevated w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-video bg-secondary flex items-center justify-center shrink-0">
              <PlayCircle className="size-16 text-primary/70" />
              <button onClick={close} aria-label="Close" className="absolute top-3 right-3 size-9 rounded-full bg-background/90 inline-flex items-center justify-center hover:bg-background">
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <div className="font-display font-semibold text-lg">{active.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{active.summary}</p>

              {chapters.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Chapters</div>
                  <ul className="space-y-1.5">
                    {chapters.map((c, i) => (
                      <li key={i} className="flex gap-3 rounded-xl border border-border bg-surface-elevated px-3 py-2 hover:border-primary/40 transition-colors">
                        <span className="text-xs font-mono text-primary shrink-0 pt-0.5">{c.t}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{c.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{c.body}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {transcript && (
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center gap-1.5">
                      <FileText className="size-3" /> Transcript
                    </div>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(transcript); toast.success("Transcript copied"); }}
                      className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1.5"
                    >
                      <Copy className="size-3" /> Copy transcript note
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input
                      value={tSearch} onChange={e => setTSearch(e.target.value)}
                      placeholder="Search within transcript…"
                      className="w-full h-9 pl-8 pr-3 rounded-lg border border-input bg-surface-elevated text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="mt-2 rounded-xl bg-secondary/60 p-4 text-sm leading-relaxed max-h-48 overflow-y-auto">
                    {highlight(transcript, tSearch)}
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div className="mt-5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Related</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {related.map(it => {
                      const lk = linkFor(it);
                      return (
                        <Link key={it.id} to={lk.to as any} params={lk.params as any} onClick={close}
                          className="rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors block">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.content_type}</div>
                          <div className="text-sm font-medium mt-0.5">{it.title}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              <button onClick={close} className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
