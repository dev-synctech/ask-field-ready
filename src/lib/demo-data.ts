// Vendor-neutral mock content for the demo build.
// TODO: REMOVE BEFORE PRODUCTION LAUNCH — replace with Supabase-backed content.

export type Difficulty = "foundational" | "intermediate" | "advanced";
export type ContentType = "lesson" | "playbook" | "video" | "checklist" | "scenario";

export interface Module {
  id: string;
  title: string;
  summary: string;
  sort_order: number;
}

export interface ContentItem {
  id: string;
  module_id: string | null;
  title: string;
  summary: string;
  content_type: ContentType;
  tags: string[];
  difficulty: Difficulty;
  estimated_minutes: number;
  publish_status: "draft" | "published";
  body_md?: string;
  transcript?: string;
}

export const MODULES: Module[] = [
  { id: "m1", title: "Go-Live Readiness", summary: "Prep checklists, role clarity, and a calm first hour.", sort_order: 1 },
  { id: "m2", title: "At-the-Elbow Support Basics", summary: "How to show up, listen, and de-escalate at the bedside.", sort_order: 2 },
  { id: "m3", title: "Command Center Escalation", summary: "What to escalate, when, and the words to use.", sort_order: 3 },
  { id: "m4", title: "Registration Support", summary: "Front-desk flow, identity capture, and downtime fallback.", sort_order: 4 },
  { id: "m5", title: "Clinical Documentation Support", summary: "Notes, orders, and signatures without breaking the workflow.", sort_order: 5 },
  { id: "m6", title: "Downtime Workflow", summary: "Paper-first thinking, recovery, and back-loading.", sort_order: 6 },
  { id: "m7", title: "End-User Communication", summary: "Plain-language updates that calm a unit.", sort_order: 7 },
  { id: "m8", title: "Issue Triage", summary: "Severity, scope, and the right channel — fast.", sort_order: 8 },
  { id: "m9", title: "Floor Support Scenarios", summary: "Real moments, replayed without names or PHI.", sort_order: 9 },
  { id: "m10", title: "Consultant Professionalism", summary: "Badge, posture, and trust at the bedside.", sort_order: 10 },
];

const t = (...xs: string[]) => xs;

export const ITEMS: ContentItem[] = [
  // Lessons
  { id: "l1", module_id: "m1", title: "Your first 60 minutes on the floor", summary: "What to do, what to skip, who to find.", content_type: "lesson", tags: t("go-live","day-one"), difficulty: "foundational", estimated_minutes: 6, publish_status: "published", body_md: "## Land calmly\nFind the charge nurse. Introduce yourself. Sit near, not over." },
  { id: "l2", module_id: "m2", title: "The art of the over-the-shoulder assist", summary: "Stand to the side. Narrate gently. Hand back control.", content_type: "lesson", tags: t("ate","posture"), difficulty: "foundational", estimated_minutes: 4, publish_status: "published" },
  { id: "l3", module_id: "m3", title: "Escalation language that works", summary: "Three sentences that move a ticket.", content_type: "lesson", tags: t("escalation","command-center"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published" },
  { id: "l4", module_id: "m6", title: "Downtime: paper-first thinking", summary: "Capture the minimum. Recover later.", content_type: "lesson", tags: t("downtime","registration"), difficulty: "intermediate", estimated_minutes: 7, publish_status: "published" },
  { id: "l5", module_id: "m10", title: "Badges, posture, and trust", summary: "How you stand changes how they listen.", content_type: "lesson", tags: t("professionalism"), difficulty: "foundational", estimated_minutes: 3, publish_status: "published" },

  // Playbooks
  { id: "p1", module_id: "m6", title: "Registration downtime — first 15 minutes", summary: "Switch to paper, capture identity, log timestamps.", content_type: "playbook", tags: t("downtime","registration"), difficulty: "intermediate", estimated_minutes: 6, publish_status: "published" },
  { id: "p2", module_id: "m3", title: "Escalating a clinical signature failure", summary: "Confirm scope, capture screenshot policy, escalate by severity.", content_type: "playbook", tags: t("escalation","clinical"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published" },
  { id: "p3", module_id: "m1", title: "Floor support — day one priorities", summary: "Who to greet, what to watch, when to step in.", content_type: "playbook", tags: t("go-live","day-one"), difficulty: "foundational", estimated_minutes: 4, publish_status: "published" },
  { id: "p4", module_id: "m7", title: "Unit-wide update in 90 seconds", summary: "Calm, specific, and actionable communication.", content_type: "playbook", tags: t("communication"), difficulty: "foundational", estimated_minutes: 3, publish_status: "published" },

  // Videos
  { id: "v1", module_id: "m2", title: "Floor handoff in 90 seconds", summary: "What to say to the next shift consultant.", content_type: "video", tags: t("handoff","ate"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", transcript: "Hand off three things: open issues, watch-items, and unit mood." },
  { id: "v2", module_id: "m3", title: "Walking a ticket to command center", summary: "Two-minute escalation pattern.", content_type: "video", tags: t("escalation"), difficulty: "intermediate", estimated_minutes: 2, publish_status: "published" },
  { id: "v3", module_id: "m6", title: "Downtime kit: what's in the bag", summary: "Pens, paper forms, identity sheet, watch.", content_type: "video", tags: t("downtime"), difficulty: "foundational", estimated_minutes: 3, publish_status: "published" },
  { id: "v4", module_id: "m10", title: "Posture for the bedside", summary: "Where to stand and how to listen.", content_type: "video", tags: t("professionalism"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published" },

  // Checklists
  { id: "c1", module_id: "m1", title: "Pre-shift readiness", summary: "Badge, device, contact list, downtime kit.", content_type: "checklist", tags: t("pre-shift"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published" },
  { id: "c2", module_id: "m6", title: "Pre-shift downtime kit", summary: "What to have on you before the first hour.", content_type: "checklist", tags: t("downtime"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published" },
  { id: "c3", module_id: "m3", title: "Before you escalate", summary: "Scope, severity, screenshot, requester, callback.", content_type: "checklist", tags: t("escalation"), difficulty: "intermediate", estimated_minutes: 2, publish_status: "published" },
  { id: "c4", module_id: "m4", title: "Front-desk identity capture", summary: "Minimum fields when the system is down.", content_type: "checklist", tags: t("registration","downtime"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published" },

  // Scenarios
  { id: "s1", module_id: "m9", title: "A clinician can't sign an order", summary: "Roleplay: what you do in the next 90 seconds.", content_type: "scenario", tags: t("clinical","escalation"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published" },
  { id: "s2", module_id: "m9", title: "Registration freezes at shift change", summary: "Two units, one device, three workflows.", content_type: "scenario", tags: t("registration","downtime"), difficulty: "intermediate", estimated_minutes: 6, publish_status: "published" },
  { id: "s3", module_id: "m9", title: "A unit is panicking about a rumor", summary: "Calm the room with five sentences.", content_type: "scenario", tags: t("communication"), difficulty: "foundational", estimated_minutes: 4, publish_status: "published" },
];

export const itemsByType = (type: ContentType) => ITEMS.filter(i => i.content_type === type);

export function searchItems(q: string) {
  const tokens = q.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (tokens.length === 0) return [];
  const score = (it: ContentItem) => {
    const hay = `${it.title} ${it.summary} ${it.tags.join(" ")}`.toLowerCase();
    return tokens.reduce((a, tk) => a + (hay.includes(tk) ? 1 : 0), 0);
  };
  return ITEMS.map(it => ({ it, s: score(it) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map(x => x.it);
}

export function answerFor(q: string) {
  const ranked = searchItems(q);
  const top = ranked.slice(0, 8);
  const best = top[0];
  const pick = (type: ContentType) => top.filter(i => i.content_type === type).slice(0, 3);

  const shortAnswer = best
    ? `${best.summary} Use the related playbook and checklist before escalating.`
    : `Try broader words like "downtime", "registration", "escalation", or "handoff" — or pick a starter below.`;

  const steps = best
    ? [
        `Skim the related playbook: "${(pick("playbook")[0] ?? best).title}".`,
        `Confirm the workflow with your floor lead or charge nurse.`,
        `Run the checklist before you escalate.`,
        `If unresolved, walk it to command center with scope + severity.`,
      ]
    : [];

  return {
    shortAnswer,
    steps,
    related: {
      playbooks: pick("playbook"),
      videos: pick("video"),
      checklists: pick("checklist"),
      scenarios: pick("scenario"),
    },
    sources: top.slice(0, 5).map(t => ({ id: t.id, title: t.title, type: t.content_type })),
    lessonId: top.find(t => t.content_type === "lesson")?.id ?? best?.id ?? null,
  };
}
