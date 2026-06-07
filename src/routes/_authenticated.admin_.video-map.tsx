import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ShieldAlert, Video, Search, Eye, EyeOff } from "lucide-react";
import { Header } from "./_authenticated.learn";
import videoMap from "@/data/video-reference-map.json";
import chapterMap from "@/data/video-chapter-map.json";
import clipBacklog from "@/data/video-clip-backlog.json";

export const Route = createFileRoute("/_authenticated/admin_/video-map")({
  head: () => ({ meta: [{ title: "Video Reference Map — Mizly Admin" }] }),
  component: VideoMapPage,
});

type RightsStatus = "unknown" | "internal-reference-only" | "cleared-for-training" | "Mizly-created";
type TranscriptStatus = "not started" | "transcribed" | "reviewed" | "approved";
type LearnerVideoStatus = "not available" | "script drafted" | "Mizly clip created" | "approved" | "live";
type QAStatus = "not_tested" | "pass" | "needs_fix";

type VideoRow = {
  video_ref_id: string;
  source_title: string;
  source_url_or_offline_note: string;
  source_type: string;
  rights_status: RightsStatus;
  transcript_status: TranscriptStatus;
  transcript_location: string;
  duration: string;
  workflow_topics: string[];
  related_ask_entry_ids: string[];
  suggested_ask_triggers: string[];
  timestamp_start: string | null;
  timestamp_end: string | null;
  clip_title: string | null;
  clip_summary: string | null;
  learner_video_status: LearnerVideoStatus;
  learner_video_url: string | null;
  learner_visible: boolean;
  qa_status: QAStatus;
  notes: string;
};

type ClipType = "answer-support" | "training" | "both";
type LearnerClipStatus = "not_started" | "script_drafted" | "created" | "approved" | "live";

type Chapter = {
  chapter_id: string;
  title: string;
  timestamp_start: string | null;
  timestamp_end: string | null;
  workflow_topic: string;
  related_ask_entry_ids: string[];
  suggested_ask_triggers: string[];
  clip_type: ClipType;
  learner_clip_status: LearnerClipStatus;
  learner_video_url: string | null;
  notes: string;
};

type ChapterDoc = {
  video_ref_id: string;
  source_title: string;
  source_type: string;
  rights_status: RightsStatus;
  transcript_status: TranscriptStatus;
  transcript_summary: string;
  chapters: Chapter[];
};

const ROWS = videoMap as VideoRow[];
const CHAPTERS = chapterMap as ChapterDoc[];
const CHAPTER_BY_VIDEO: Record<string, ChapterDoc | undefined> = Object.fromEntries(
  CHAPTERS.map(c => [c.video_ref_id, c])
);

type ChapterFilter = "all" | "transcript_not_started" | "needs_transcript" | "chapters_drafted" | "needs_clip" | "learner_live";

function matchesChapterFilter(row: VideoRow, filter: ChapterFilter): boolean {
  const doc = CHAPTER_BY_VIDEO[row.video_ref_id];
  switch (filter) {
    case "all": return true;
    case "transcript_not_started": return (doc?.transcript_status ?? row.transcript_status) === "not started";
    case "needs_transcript": return (doc?.transcript_status ?? row.transcript_status) !== "approved";
    case "chapters_drafted": return !!doc && doc.chapters.length > 0;
    case "needs_clip": return !!doc && doc.chapters.some(ch => ch.learner_clip_status === "not_started" || ch.learner_clip_status === "script_drafted");
    case "learner_live": return !!doc && doc.chapters.some(ch => ch.learner_clip_status === "live" && !!ch.learner_video_url);
  }
}

function VideoMapPage() {
  const [q, setQ] = useState("");
  const [rights, setRights] = useState<string>("all");
  const [chapterFilter, setChapterFilter] = useState<ChapterFilter>("all");
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return ROWS.filter(r => {
      if (rights !== "all" && r.rights_status !== rights) return false;
      if (!matchesChapterFilter(r, chapterFilter)) return false;
      if (!n) return true;
      return (
        r.source_title.toLowerCase().includes(n) ||
        r.video_ref_id.toLowerCase().includes(n) ||
        r.workflow_topics.join(" ").toLowerCase().includes(n) ||
        r.suggested_ask_triggers.join(" ").toLowerCase().includes(n)
      );
    });
  }, [q, rights, chapterFilter]);

  const learnerVisibleCount = ROWS.filter(r => r.learner_visible).length;
  const detail = ROWS.find(r => r.video_ref_id === active) ?? null;
  const detailChapters = detail ? CHAPTER_BY_VIDEO[detail.video_ref_id] : undefined;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/admin" className="size-9 rounded-xl border border-border inline-flex items-center justify-center hover:bg-secondary">
          <ArrowLeft className="size-4" />
        </Link>
        <Header title="Video Reference Map" subtitle="Admin-only. Source recordings, transcript status, and learner-video pipeline." />
      </div>

      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm flex gap-3">
        <ShieldAlert className="size-5 text-warning shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-medium text-foreground">Raw source videos are internal reference only.</div>
          <div className="text-foreground/80">
            Source URLs on this page are not exposed in Ask, Learn, or the public Videos page. Learners only see videos when
            <code className="mx-1 font-mono">rights_status = cleared-for-training</code> or <code className="mx-1 font-mono">Mizly-created</code> AND
            <code className="mx-1 font-mono">learner_visible = yes</code>. Transcripts stay admin-only unless rewritten into Mizly training copy.
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Stat label="Source videos" value={ROWS.length} />
        <Stat label="Rights unknown" value={ROWS.filter(r => r.rights_status === "unknown").length} />
        <Stat label="Cleared for training" value={ROWS.filter(r => r.rights_status === "cleared-for-training" || r.rights_status === "Mizly-created").length} />
        <Stat label="Learner-visible" value={learnerVisibleCount} />
      </div>

      <div className="mt-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search source, topic, ask trigger…"
            className="w-full pl-9 pr-3 h-10 rounded-xl border border-border bg-card text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          {(["all", "unknown", "internal-reference-only", "cleared-for-training", "Mizly-created"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRights(r)}
              className={`px-3 py-1.5 rounded-lg border ${rights === r ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-secondary"}`}
            >{r}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          {([
            ["all", "All chapters"],
            ["transcript_not_started", "Transcript not started"],
            ["needs_transcript", "Needs transcript"],
            ["chapters_drafted", "Chapters drafted"],
            ["needs_clip", "Needs clip"],
            ["learner_live", "Learner live"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setChapterFilter(key)}
              className={`px-3 py-1.5 rounded-lg border ${chapterFilter === key ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-secondary"}`}
            >{label}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card divide-y">
        {filtered.map(r => {
          const doc = CHAPTER_BY_VIDEO[r.video_ref_id];
          return (
          <button
            key={r.video_ref_id}
            onClick={() => setActive(r.video_ref_id)}
            className="w-full text-left p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Video className="size-4 text-primary" />
              <span className="font-medium">{r.source_title}</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{r.source_type}</span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${rightsTone(r.rights_status)}`}>{r.rights_status}</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">transcript: {r.transcript_status}</span>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${r.learner_visible ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                {r.learner_visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                learner: {r.learner_video_status}
              </span>
            </div>
            <div className="mt-1 text-xs font-mono text-muted-foreground">{r.video_ref_id}</div>
            <div className="mt-2 text-xs text-foreground/80">
              <span className="text-muted-foreground">Topics:</span> {r.workflow_topics.join(", ")}
            </div>
            {doc && (
              <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                <span className="uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{doc.chapters.length} chapters</span>
                <span className="uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">live clips: {doc.chapters.filter(ch => ch.learner_clip_status === "live" && !!ch.learner_video_url).length}</span>
              </div>
            )}
          </button>
          );
        })}
        {filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No matching videos.</div>}
      </div>

      {detail && <Drawer row={detail} chapterDoc={detailChapters} onClose={() => setActive(null)} />}
    </div>
  );
}

function rightsTone(s: RightsStatus) {
  switch (s) {
    case "cleared-for-training":
    case "Mizly-created":
      return "bg-success/15 text-success";
    case "internal-reference-only":
      return "bg-warning/15 text-warning";
    default:
      return "bg-destructive/15 text-destructive";
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Drawer({ row, chapterDoc, onClose }: { row: VideoRow; chapterDoc: ChapterDoc | undefined; onClose: () => void }) {
  const showRawLink = row.rights_status === "cleared-for-training" || row.rights_status === "Mizly-created";
  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-card md:rounded-3xl rounded-t-3xl border border-border shadow-elevated w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.video_ref_id}</div>
          <div className="font-display font-semibold text-lg mt-0.5">{row.source_title}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
            <span className={`uppercase tracking-wider px-2 py-0.5 rounded-full ${rightsTone(row.rights_status)}`}>{row.rights_status}</span>
            <span className="uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{row.source_type}</span>
            <span className="uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">transcript: {row.transcript_status}</span>
          </div>
        </div>
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          <Field label="Source location (admin only)">
            {showRawLink ? (
              <a href={row.source_url_or_offline_note} target="_blank" rel="noreferrer" className="text-primary break-all underline">
                {row.source_url_or_offline_note}
              </a>
            ) : (
              <div className="text-foreground/80 break-all">
                <div className="font-mono text-xs">{row.source_url_or_offline_note}</div>
                <div className="text-xs text-muted-foreground mt-1">Reference stored offline. Not clickable until rights cleared.</div>
              </div>
            )}
          </Field>
          <Field label="Duration">{row.duration}</Field>
          <Field label="Transcript location">{row.transcript_location}</Field>
          <Field label="Workflow topics">{row.workflow_topics.join(", ")}</Field>
          <Field label="Related Ask entries">
            {row.related_ask_entry_ids.length
              ? <div className="font-mono text-xs">{row.related_ask_entry_ids.join(", ")}</div>
              : <span className="text-muted-foreground">none yet</span>}
          </Field>
          <Field label="Suggested Ask triggers">{row.suggested_ask_triggers.join(" • ")}</Field>
          <Field label="Clip">
            {row.clip_title
              ? <div>
                  <div className="font-medium">{row.clip_title}</div>
                  <div className="text-xs text-muted-foreground">{row.timestamp_start} – {row.timestamp_end}</div>
                  {row.clip_summary && <div className="text-xs mt-1">{row.clip_summary}</div>}
                </div>
              : <span className="text-muted-foreground">no clip selected</span>}
          </Field>
          <Field label="Learner video">
            <div>status: <span className="font-mono text-xs">{row.learner_video_status}</span></div>
            <div>visible to learners: <span className="font-mono text-xs">{row.learner_visible ? "yes" : "no"}</span></div>
            <div>url: <span className="font-mono text-xs">{row.learner_video_url ?? "—"}</span></div>
          </Field>
          <Field label="QA">{row.qa_status}</Field>
          <Field label="Notes">{row.notes}</Field>
          {chapterDoc && (
            <Field label={`Chapters (${chapterDoc.chapters.length})`}>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Transcript: {chapterDoc.transcript_status} — {chapterDoc.transcript_summary}</div>
                <ul className="space-y-2">
                  {chapterDoc.chapters.map(ch => {
                    const liveClip = ch.learner_clip_status === "live" && !!ch.learner_video_url;
                    return (
                      <li key={ch.chapter_id} className="rounded-xl border border-border bg-background p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">{ch.title}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{ch.timestamp_start ?? "--:--"} – {ch.timestamp_end ?? "--:--"}</span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{ch.clip_type}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${liveClip ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>clip: {ch.learner_clip_status}</span>
                        </div>
                        <div className="mt-1 text-[10px] font-mono text-muted-foreground">{ch.chapter_id}</div>
                        <div className="mt-1 text-xs"><span className="text-muted-foreground">Topic:</span> {ch.workflow_topic}</div>
                        {ch.related_ask_entry_ids.length > 0 && (
                          <div className="mt-1 text-xs"><span className="text-muted-foreground">Ask:</span> <span className="font-mono">{ch.related_ask_entry_ids.join(", ")}</span></div>
                        )}
                        {ch.suggested_ask_triggers.length > 0 && (
                          <div className="mt-1 text-xs"><span className="text-muted-foreground">Triggers:</span> {ch.suggested_ask_triggers.join(" • ")}</div>
                        )}
                        {ch.notes && <div className="mt-1 text-xs text-foreground/80">{ch.notes}</div>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Field>
          )}
        </div>
        <div className="p-4 border-t border-border">
          <button onClick={onClose} className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-foreground">{children}</div>
    </div>
  );
}
