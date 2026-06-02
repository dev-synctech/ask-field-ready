import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { itemById, LESSON_DETAIL, nextLesson, relatedFor, linkFor } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/lessons_/$id")({
  head: () => ({ meta: [{ title: "Lesson — At the Elbow Academy" }] }),
  component: LessonDetailPage,
});

const COMPLETE_KEY = "ate.lessons.complete";

function readComplete(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(COMPLETE_KEY) ?? "[]"); } catch { return []; }
}

function LessonDetailPage() {
  const { id } = useParams({ from: "/_authenticated/lessons_/$id" });
  const item = itemById(id);
  const detail = LESSON_DETAIL[id];
  const next = nextLesson(id);
  const related = relatedFor(id, ["playbook", "video", "checklist"]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => { setCompleted(readComplete()); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? Math.min(100, Math.max(0, (h.scrollTop / total) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [id]);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link to="/learn" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Learn
        </Link>
        <h1 className="mt-4 text-2xl font-display font-semibold">Lesson not found</h1>
      </div>
    );
  }

  const isComplete = completed.includes(id);
  const toggleComplete = () => {
    const next = isComplete ? completed.filter(x => x !== id) : [...completed, id];
    setCompleted(next);
    if (typeof window !== "undefined") localStorage.setItem(COMPLETE_KEY, JSON.stringify(next));
    toast.success(isComplete ? "Marked incomplete" : "Lesson marked complete");
  };

  const sections = detail?.sections ?? [
    { heading: "Overview", body: item.summary },
    { heading: "Body", body: item.body_md ?? "Detailed content coming soon. This lesson is a stub in the demo build." },
  ];
  const takeaways = detail?.takeaways ?? ["Read it twice.", "Apply on the next shift.", "Bring questions to your floor lead."];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-0.5 z-30 bg-transparent">
        <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 pb-24">
        <Link to="/learn" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to Learn
        </Link>

        {/* Polished header */}
        <div className="mt-4 rounded-3xl border border-border bg-gradient-to-br from-primary-soft via-card to-card p-6 md:p-7 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground"><BookOpen className="size-3" /> Lesson</span>
            <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="size-3" /> {item.estimated_minutes} min</span>
            <span className="text-muted-foreground">· {item.difficulty}</span>
            {isComplete && <span className="ml-auto inline-flex items-center gap-1 text-success text-[11px] normal-case"><CheckCircle2 className="size-3.5" /> Completed</span>}
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-display font-semibold tracking-tight">{item.title}</h1>
          <p className="mt-2 text-sm text-foreground/75">{item.summary}</p>
        </div>

        <div className="mt-6 space-y-4">
          {sections.map((s, i) => (
            <section key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Section {i + 1}</div>
              <h2 className="font-display font-semibold text-lg">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-primary-soft p-5">
          <div className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="size-3" /> Takeaways
          </div>
          <ul className="space-y-1.5 text-sm">
            {takeaways.map((t, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {item.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {item.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{t}</span>
            ))}
          </div>
        )}

        {/* Related items */}
        {related.length > 0 && (
          <div className="mt-8">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Keep going</div>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map(it => {
                const lk = linkFor(it);
                return (
                  <Link key={it.id} to={lk.to as any} params={lk.params as any}
                    className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-soft transition-all">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.content_type} · {it.estimated_minutes} min</div>
                    <div className="mt-1 text-sm font-medium group-hover:text-primary transition-colors">{it.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.summary}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-2">
          <button
            onClick={toggleComplete}
            className={`flex-1 h-12 rounded-xl font-medium inline-flex items-center justify-center gap-2 transition-colors ${
              isComplete
                ? "bg-success/15 text-success border border-success/30"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            <CheckCircle2 className="size-4" /> {isComplete ? "Completed" : "Mark complete"}
          </button>
          {next && (
            <Link
              to="/lessons/$id" params={{ id: next.id }}
              className="flex-1 h-12 rounded-xl border border-border bg-card font-medium inline-flex items-center justify-center gap-2 hover:bg-secondary"
            >
              Next lesson <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
