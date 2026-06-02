import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { itemById, LESSON_DETAIL } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/lessons/$id")({
  head: () => ({ meta: [{ title: "Lesson — At the Elbow Academy" }] }),
  component: LessonDetailPage,
});

function LessonDetailPage() {
  const { id } = useParams({ from: "/_authenticated/lessons/$id" });
  const item = itemById(id);
  const detail = LESSON_DETAIL[id];

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

  const sections = detail?.sections ?? [
    { heading: "Overview", body: item.summary },
    { heading: "Body", body: item.body_md ?? "Detailed content coming soon. This lesson is a stub in the demo build." },
  ];
  const takeaways = detail?.takeaways ?? ["Read it twice.", "Apply on the next shift.", "Bring questions to your floor lead."];

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <Link to="/learn" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to Learn
      </Link>

      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <BookOpen className="size-3 text-primary" /> Lesson · {item.difficulty} · {item.estimated_minutes} min
      </div>
      <h1 className="mt-1 text-2xl md:text-3xl font-display font-semibold tracking-tight">{item.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>

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
        <div className="text-[10px] uppercase tracking-wider text-primary font-medium mb-2">Takeaways</div>
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
    </div>
  );
}
