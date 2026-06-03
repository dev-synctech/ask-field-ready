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
  // Taxonomy metadata (Phase 2). All optional.
  role_id?: string;
  domain_id?: string;
  phase_id?: string;
  urgency_id?: string;
  escalation_id?: string;
  frequency_id?: string;
  sanitized_approved?: boolean;
}

export const MODULES: Module[] = [
  { id: "m1", title: "Go-Live Readiness", summary: "Prep checklists, role clarity, and a calm first hour.", sort_order: 1 },
  { id: "m2", title: "Bedside Support Basics", summary: "How to show up, listen, and de-escalate at the bedside.", sort_order: 2 },
  { id: "m3", title: "Command Center Escalation", summary: "What to escalate, when, and the words to use.", sort_order: 3 },
  { id: "m4", title: "Registration Support", summary: "Front-desk flow, identity capture, and downtime fallback.", sort_order: 4 },
  { id: "m5", title: "Clinical Documentation Support", summary: "Notes, orders, and signatures without breaking the workflow.", sort_order: 5 },
  { id: "m6", title: "Downtime Workflow", summary: "Paper-first thinking, recovery, and back-loading.", sort_order: 6 },
  { id: "m7", title: "End-User Communication", summary: "Plain-language updates that calm a unit.", sort_order: 7 },
  { id: "m8", title: "Issue Triage", summary: "Severity, scope, and the right channel — fast.", sort_order: 8 },
  { id: "m9", title: "Floor Support Scenarios", summary: "Real moments, replayed without names or PHI.", sort_order: 9 },
  { id: "m10", title: "Consultant Professionalism", summary: "Badge, posture, and trust at the bedside.", sort_order: 10 },
  { id: "m11", title: "Patient Placement & Bed Control", summary: "Bed assignment requests, transfer flow, and shift-change handoffs.", sort_order: 11 },
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

  // ---------- Expansion Pack 02: 42 published items ----------
  // Lessons (10)
  { id: "l6", module_id: "m1", title: "How to read a unit in 5 minutes", summary: "Pace, posture, and pager noise tell you what to do first.", content_type: "lesson", tags: t("go-live","floor-read"), difficulty: "foundational", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "l7", module_id: "m2", title: "Why you should never touch the mouse", summary: "Muscle memory transfers when hands stay on the keyboard.", content_type: "lesson", tags: t("ate","posture"), difficulty: "foundational", estimated_minutes: 3, publish_status: "published", sanitized_approved: true },
  { id: "l8", module_id: "m5", title: "Note vs order vs result — the 30-second map", summary: "Knowing which doc-type a clinician means cuts triage in half.", content_type: "lesson", tags: t("clinical","triage"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "l9", module_id: "m7", title: "Three words that defuse a frustrated clinician", summary: "'You're not wrong.' Then listen.", content_type: "lesson", tags: t("communication","de-escalation"), difficulty: "foundational", estimated_minutes: 3, publish_status: "published", sanitized_approved: true },
  { id: "l10", module_id: "m8", title: "Severity in one sentence", summary: "Patient-impact, scope, time-window. Done.", content_type: "lesson", tags: t("triage","escalation"), difficulty: "intermediate", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "l11", module_id: "m4", title: "The identity capture priority list", summary: "Name, DOB, arrival, reason. Stop there until the system is back.", content_type: "lesson", tags: t("registration","downtime"), difficulty: "foundational", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "l12", module_id: "m6", title: "Back-loading without burning your shift", summary: "Batch in 15-minute windows. Verify timestamps first.", content_type: "lesson", tags: t("downtime","recovery"), difficulty: "intermediate", estimated_minutes: 6, publish_status: "published", sanitized_approved: true },
  { id: "l13", module_id: "m10", title: "When to leave the unit", summary: "Coverage check, charge nurse handshake, no silent exits.", content_type: "lesson", tags: t("professionalism","handoff"), difficulty: "foundational", estimated_minutes: 3, publish_status: "published", sanitized_approved: true },
  { id: "l14", module_id: "m3", title: "What command center actually needs", summary: "Five fields. No story. Add the story only if they ask.", content_type: "lesson", tags: t("escalation","command-center"), difficulty: "intermediate", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "l15", module_id: "m9", title: "Reading a workflow you've never seen", summary: "Find the loop. Find the gate. Then ask.", content_type: "lesson", tags: t("clinical","floor-read"), difficulty: "advanced", estimated_minutes: 6, publish_status: "published", sanitized_approved: true },

  // Playbooks (12)
  { id: "p5", module_id: "m8", title: "First 60 seconds when a user says 'it's broken'", summary: "Repro before you escalate. One workstation, one workflow, one user.", content_type: "playbook", tags: t("triage","de-escalation"), difficulty: "foundational", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "p6", module_id: "m4", title: "Front-desk shift change during downtime", summary: "Hand off paper queue, named back-loader, single device priority.", content_type: "playbook", tags: t("registration","downtime","handoff"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "p7", module_id: "m5", title: "Missing option in a clinical workflow", summary: "Is it a build issue, a permission issue, or a training drift?", content_type: "playbook", tags: t("clinical","triage"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "p8", module_id: "m7", title: "Conflicting guidance on the floor", summary: "Confirm with one source. Speak once. Then close the loop.", content_type: "playbook", tags: t("communication","escalation"), difficulty: "intermediate", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "p9", module_id: "m3", title: "Paging on-call clinical informatics", summary: "When, what to include, what never to include.", content_type: "playbook", tags: t("escalation","command-center"), difficulty: "intermediate", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "p10", module_id: "m2", title: "Bedside assist with a hesitant clinician", summary: "Ask permission. Stand side. Narrate. Step back.", content_type: "playbook", tags: t("ate","bedside"), difficulty: "foundational", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "p11", module_id: "m6", title: "Recovery after system restoration", summary: "Verify timestamps, batch-enter, validate critical orders first.", content_type: "playbook", tags: t("downtime","recovery"), difficulty: "intermediate", estimated_minutes: 6, publish_status: "published", sanitized_approved: true },
  { id: "p12", module_id: "m1", title: "Pre-go-live walk-through", summary: "Map workstations, printers, escalation paths before users arrive.", content_type: "playbook", tags: t("go-live","prep"), difficulty: "foundational", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "p13", module_id: "m9", title: "A provider says the system is unsafe", summary: "Take it seriously. Capture wording. Escalation path is fixed.", content_type: "playbook", tags: t("escalation","clinical","safety"), difficulty: "advanced", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "p14", module_id: "m7", title: "End-of-shift unit debrief", summary: "Three sentences to the charge nurse before you leave.", content_type: "playbook", tags: t("communication","handoff"), difficulty: "foundational", estimated_minutes: 3, publish_status: "published", sanitized_approved: true },
  { id: "p15", module_id: "m4", title: "Patient identification mismatch at registration", summary: "Stop the workflow. Verify with two identifiers. Document.", content_type: "playbook", tags: t("registration","safety"), difficulty: "intermediate", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "p16", module_id: "m8", title: "Triage when three users approach at once", summary: "Severity sort in 20 seconds. Park two. Solve one.", content_type: "playbook", tags: t("triage","floor-management"), difficulty: "advanced", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },

  // Videos (8)
  { id: "v5", module_id: "m1", title: "What to carry on your first shift", summary: "Bag contents and why each item earns its place.", content_type: "video", tags: t("go-live","prep"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "v6", module_id: "m7", title: "How to deliver bad news to a unit", summary: "Calm tone, one fact, one action.", content_type: "video", tags: t("communication"), difficulty: "intermediate", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "v7", module_id: "m8", title: "Severity in 30 seconds", summary: "Patient impact, scope, time.", content_type: "video", tags: t("triage","escalation"), difficulty: "intermediate", estimated_minutes: 1, publish_status: "published", sanitized_approved: true },
  { id: "v8", module_id: "m2", title: "Three postures that build trust", summary: "Side, eye level, hands visible.", content_type: "video", tags: t("ate","bedside"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "v9", module_id: "m4", title: "Paper registration in 90 seconds", summary: "Walk-through of the minimum-viable form.", content_type: "video", tags: t("registration","downtime"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "v10", module_id: "m5", title: "How clinicians read a screen", summary: "Eye-path patterns and where to point — not click.", content_type: "video", tags: t("clinical","ate"), difficulty: "intermediate", estimated_minutes: 3, publish_status: "published", sanitized_approved: true },
  { id: "v11", module_id: "m3", title: "Walking a ticket the second time", summary: "What changes when you're back at command center within an hour.", content_type: "video", tags: t("escalation"), difficulty: "intermediate", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "v12", module_id: "m10", title: "Badge, voice, hands", summary: "The 10-second trust signal at the bedside.", content_type: "video", tags: t("professionalism"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },

  // Checklists (6)
  { id: "c5", module_id: "m1", title: "Pre-go-live floor walk", summary: "What to verify before users arrive.", content_type: "checklist", tags: t("go-live","prep"), difficulty: "foundational", estimated_minutes: 3, publish_status: "published", sanitized_approved: true },
  { id: "c6", module_id: "m6", title: "System restoration verification", summary: "What to confirm before declaring 'back up'.", content_type: "checklist", tags: t("downtime","recovery"), difficulty: "intermediate", estimated_minutes: 3, publish_status: "published", sanitized_approved: true },
  { id: "c7", module_id: "m7", title: "Handoff to next-shift consultant", summary: "Three pieces of context that save them 20 minutes.", content_type: "checklist", tags: t("handoff"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "c8", module_id: "m4", title: "Identity verification fallback", summary: "Two-identifier rule when the system is down.", content_type: "checklist", tags: t("registration","safety"), difficulty: "intermediate", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "c9", module_id: "m9", title: "Before you say 'unit-wide'", summary: "Confirm scope before raising the temperature.", content_type: "checklist", tags: t("triage","escalation"), difficulty: "intermediate", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "c10", module_id: "m10", title: "End-of-shift exit", summary: "Coverage handed off, badge stowed, follow-ups noted.", content_type: "checklist", tags: t("professionalism","handoff"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },

  // Scenarios (6)
  { id: "s4", module_id: "m9", title: "A printer dies mid-admission", summary: "One device, one queue, one minute.", content_type: "scenario", tags: t("registration","downtime"), difficulty: "foundational", estimated_minutes: 4, publish_status: "published", sanitized_approved: true },
  { id: "s5", module_id: "m9", title: "A nurse insists a feature is missing", summary: "Triage: build, permission, or training drift?", content_type: "scenario", tags: t("clinical","triage"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "s6", module_id: "m9", title: "Two consultants give a unit different answers", summary: "How you align without throwing anyone under the bus.", content_type: "scenario", tags: t("communication","professionalism"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "s7", module_id: "m9", title: "A provider walks out mid-shift", summary: "What to escalate and what to leave alone.", content_type: "scenario", tags: t("escalation","communication"), difficulty: "advanced", estimated_minutes: 6, publish_status: "published", sanitized_approved: true },
  { id: "s8", module_id: "m9", title: "A new consultant freezes at the bedside", summary: "Coach in real time without taking over.", content_type: "scenario", tags: t("ate","professionalism"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "s9", module_id: "m9", title: "A unit blames the system for a workflow they skipped", summary: "Defend the system without losing the unit.", content_type: "scenario", tags: t("communication","de-escalation"), difficulty: "advanced", estimated_minutes: 6, publish_status: "published", sanitized_approved: true },

  // ---------- Converted Pack 01: Bed control / patient placement ----------
  { id: "l16", module_id: "m11", title: "Bed control basics for go-live support", summary: "How patient placement questions usually move from request to assignment to handoff.", content_type: "lesson", tags: t("bed-control","placement","handoff"), difficulty: "foundational", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "p17", module_id: "m11", title: "Patient placement question — first 90 seconds", summary: "Confirm the request, location, order/status, and who owns the next step before escalating.", content_type: "playbook", tags: t("bed-control","placement","escalation"), difficulty: "intermediate", estimated_minutes: 5, publish_status: "published", sanitized_approved: true },
  { id: "c11", module_id: "m11", title: "Before escalating a bed assignment issue", summary: "Scope, location, status, requester, and next owner.", content_type: "checklist", tags: t("bed-control","placement","escalation"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", sanitized_approved: true },
  { id: "s10", module_id: "m11", title: "Bed assignment stalls during shift change", summary: "A unit says a patient cannot move because the bed assignment is unclear.", content_type: "scenario", tags: t("bed-control","placement","handoff"), difficulty: "intermediate", estimated_minutes: 6, publish_status: "published", sanitized_approved: true },
  { id: "v13", module_id: "m11", title: "Bed control handoff in 90 seconds", summary: "How to summarize a placement issue without adding PHI.", content_type: "video", tags: t("bed-control","handoff","communication"), difficulty: "foundational", estimated_minutes: 2, publish_status: "published", sanitized_approved: true, transcript: "Three pieces in ninety seconds. One: name the issue without PHI — 'one bed assignment is unclear on a med-surg unit.' Two: confirm scope — one patient or several, and which unit is waiting. Three: state the handoff — who owns the next step, what you need from command, and when you'll check back. Close the loop with the requester within five minutes so the floor knows it landed." },
];

export const itemsByType = (type: ContentType) => ITEMS.filter(i => i.content_type === type);
export const itemById = (id: string) => ITEMS.find(i => i.id === id);

// ---------- Detail content (vendor-neutral mock) ----------

export interface LessonDetail {
  sections: { heading: string; body: string }[];
  takeaways: string[];
}

export const LESSON_DETAIL: Record<string, LessonDetail> = {
  l1: {
    sections: [
      { heading: "Land calmly", body: "Walk in slowly. Find the charge nurse, introduce yourself by first name and role. Ask which workflow is the most stressful right now." },
      { heading: "Watch before you touch", body: "Stand to the side of a workstation. Observe two full workflows before offering input. Most issues are muscle-memory drift, not system failure." },
      { heading: "Set the first signal", body: "Tell the unit how to reach you: a single short sentence. 'I'll be at this nurses' station for the next hour — wave me over.'" },
    ],
    takeaways: ["Posture beats expertise in the first hour.", "Find the charge nurse first.", "Watch twice before you speak."],
  },
  l2: {
    sections: [
      { heading: "Stand to the side", body: "Never reach across someone's keyboard. Side-by-side puts you on the same team and keeps the user in control." },
      { heading: "Narrate, don't drive", body: "Say what you're seeing, not what to click. 'Looks like the order form opened in a new tab — try the one behind it.'" },
      { heading: "Hand back control", body: "End every assist by stepping back half a pace. The user must finish the workflow themselves to retain it." },
    ],
    takeaways: ["Side, not over.", "Words, not hands.", "Always hand it back."],
  },
  l3: {
    sections: [
      { heading: "Sentence 1: what broke", body: "One factual sentence. 'Order signature is failing for three providers on Unit 4 since 8:12.'" },
      { heading: "Sentence 2: scope and severity", body: "Quantify. 'Roughly 12 pending orders. No patient harm yet. Workaround possible for 10.'" },
      { heading: "Sentence 3: what you need", body: "Specific ask, with a callback. 'Need a clinical engineer on the floor within 15 minutes. Callback: ext. 4421.'" },
    ],
    takeaways: ["Three sentences. No filler.", "Quantify scope.", "Always offer a callback."],
  },
  l4: {
    sections: [
      { heading: "Switch fast", body: "If the system isn't back in 3 minutes, switch to paper. Don't wait for confirmation." },
      { heading: "Capture the minimum", body: "Name, DOB, arrival time, presenting reason. Everything else can be back-loaded." },
      { heading: "Timestamp everything", body: "Wall clock, not memory. The recovery team will thank you in hour two." },
    ],
    takeaways: ["3-minute switch rule.", "Minimum viable capture.", "Timestamps over guesses."],
  },
  l5: {
    sections: [
      { heading: "Badge forward", body: "Clinicians scan for trust in under a second. Visible badge, lanyard untucked, name readable." },
      { heading: "Open posture", body: "Hands visible, shoulders down, voice low. You are a guest on their unit." },
      { heading: "First-name introductions", body: "Use first names. Skip the company. 'Hi, I'm Sam, I'm here to help with the system today.'" },
    ],
    takeaways: ["Visible badge, open hands.", "First names only.", "You are a guest."],
  },
  l16: {
    sections: [
      { heading: "Where placement starts", body: "Most placement questions begin with a request: a unit needs a bed, or a patient needs to move. The request lands somewhere — bed control, a charge nurse, or a coordinator — and waits on a status check before anyone moves." },
      { heading: "The three things to confirm", body: "Confirm the current location of the patient, the destination unit or service, and whether a placement order or status already exists. Without all three, no one can act." },
      { heading: "Who owns the next step", body: "Placement issues stall when ownership is unclear. Name the next owner out loud: 'Bed control owns the assignment; the sending unit owns transport.' Hand off with a callback time." },
    ],
    takeaways: ["Request → status → owner. In that order.", "Location and destination before anything else.", "Name the next owner out loud."],
  },
};

export interface PlaybookDetail {
  whenToUse: string;
  steps: { title: string; body: string }[];
  pitfalls: string[];
  escalation: string;
}

export const PLAYBOOK_DETAIL: Record<string, PlaybookDetail> = {
  p1: {
    whenToUse: "Registration system is unresponsive for more than 3 minutes during open hours.",
    steps: [
      { title: "Switch to paper", body: "Pull the downtime registration form. Start a new patient line with arrival time." },
      { title: "Capture identity", body: "Name, DOB, presenting reason. Photo of insurance card if available. Nothing else." },
      { title: "Timestamp + queue", body: "Write arrival time at top of each form. Stack in arrival order at the front desk." },
      { title: "Notify clinical", body: "Tell triage nurse the system is down and to expect paper handoffs." },
      { title: "Log to command center", body: "One short message: scope, start time, headcount, contact." },
    ],
    pitfalls: ["Waiting too long to switch.", "Capturing too many fields on paper.", "Forgetting to timestamp."],
    escalation: "If downtime exceeds 15 minutes, escalate to command center with patient headcount.",
  },
  p2: {
    whenToUse: "A clinician reports their order or note signature is failing.",
    steps: [
      { title: "Confirm scope", body: "Same workstation only, or unit-wide? Ask the clinician to try a different machine if safe." },
      { title: "Check policy", body: "Confirm screenshot policy. If allowed, capture the error with no patient info visible." },
      { title: "Workaround first", body: "If a verbal-order workaround exists for this org, offer it before escalating." },
      { title: "Escalate by severity", body: "Patient-impact: page on-call immediately. No impact: ticket with screenshot." },
    ],
    pitfalls: ["Screenshotting PHI.", "Skipping the workaround.", "Vague severity wording."],
    escalation: "Page on-call clinical informatics if any pending order touches a time-sensitive workflow.",
  },
  p3: {
    whenToUse: "First shift of a go-live on a new unit.",
    steps: [
      { title: "Greet the charge", body: "Introduce yourself within five minutes of arrival. Ask for the day's anxieties, not the night's." },
      { title: "Map the floor", body: "Walk the unit once. Note workstation locations, printer status, and the busiest two roles." },
      { title: "Watch two workflows", body: "Stand near, don't intervene. Note where users hesitate." },
      { title: "Step in once", body: "Offer one small assist early. Sets the tone that you're approachable." },
    ],
    pitfalls: ["Talking too much in the first hour.", "Standing behind a clinician.", "Skipping the charge handshake."],
    escalation: "If a workflow stalls more than two clinicians in 15 minutes, escalate to the unit lead.",
  },
  p4: {
    whenToUse: "You need to brief an entire unit on a change or status in under two minutes.",
    steps: [
      { title: "Pick the spot", body: "Stand where the most workstations can hear you. Don't shout from the door." },
      { title: "One sentence: what", body: "'The signature tool is back up as of right now.'" },
      { title: "One sentence: action", body: "'Please retry any pending orders from the last hour.'" },
      { title: "One sentence: support", body: "'I'll be at the central station — wave me over if it fails again.'" },
    ],
    pitfalls: ["Apologizing too much.", "Explaining cause instead of action.", "Forgetting to say where you'll be."],
    escalation: "If a clinician shows distress or anger, pull them aside — never debate publicly.",
  },
  p17: {
    whenToUse: "A unit, nurse, or coordinator is asking about a stalled bed assignment or transfer.",
    steps: [
      { title: "First 90 seconds", body: "Restate what they asked in one sentence, without PHI. Confirm which unit is waiting and where the patient is now." },
      { title: "What to say", body: "'Let me confirm the request, the status, and who owns the next step before we escalate.'" },
      { title: "What to check", body: "Is there an active placement order or status? Is bed control aware? Is this one patient or several?" },
      { title: "When to escalate", body: "If the placement is unclear after the request + status + owner check, or any time-critical workflow is waiting, escalate to command center with scope and severity." },
      { title: "Command center handoff", body: "Three sentences: what is stalled, scope and severity, what you need with a callback. Close the loop with the requester within 5 minutes." },
    ],
    pitfalls: ["Escalating before confirming ownership.", "Sharing patient identifiers on the floor.", "Repeating a request without timestamping it."],
    escalation: "Time-critical placement (ED holding, ICU transfer, post-op recovery) waiting > 15 minutes: page command center with scope, severity, callback.",
  },
};

export interface ScenarioDetail {
  situation: string;
  first90: string[];
  whatToSay: string[];
  whatToCheck: string[];
  escalation: string;
  debrief: string;
}

export const SCENARIO_DETAIL: Record<string, ScenarioDetail> = {
  s1: {
    situation: "A clinician at a busy workstation says they can't sign an order. Two more orders are queued behind it. The unit is at full census.",
    first90: [
      "Walk to the workstation. Stand to the side. Make eye contact with the clinician first.",
      "Ask one question: 'Is this signature failing for just you, or are others seeing it too?'",
      "If others: this is unit-wide — start the escalation timer immediately.",
    ],
    whatToSay: [
      "'I'll stay right here with you while we figure this out.'",
      "'Try one more order on a different workstation — I'll watch.'",
      "'If this is happening unit-wide I'll page clinical informatics now.'",
    ],
    whatToCheck: [
      "Is the user signed in with their own credentials?",
      "Is the workstation locked or in a stale session?",
      "Are pending orders time-sensitive (meds, blood, imaging prep)?",
    ],
    escalation: "If unit-wide AND any pending order is time-sensitive: page on-call clinical informatics within 5 minutes. Provide scope, headcount, severity, and a callback number.",
    debrief: "Capture: when did it start, how many clinicians, how many orders impacted, what unblocked it. Share with the next shift in handoff.",
  },
  s2: {
    situation: "Registration freezes during a shift change. Two waiting-room units share one functional workstation. Three different workflows need it.",
    first90: [
      "Switch to paper for new arrivals immediately. Don't wait for IT confirmation.",
      "Designate the working device for the highest-acuity workflow only.",
      "Tell both desks out loud what you decided and why.",
    ],
    whatToSay: [
      "'Paper for new arrivals starting now. I'll take the front of the line.'",
      "'This workstation is for triage only until the system is back.'",
      "'We'll back-load everything when we're up — keep your timestamps.'",
    ],
    whatToCheck: [
      "Are downtime forms stocked at both desks?",
      "Is the clock visible to the team capturing times?",
      "Is there a designated person to back-load when the system returns?",
    ],
    escalation: "If downtime exceeds 15 minutes during shift change, escalate to command center and request additional registration support.",
    debrief: "Note total downtime, number of paper registrations, and back-load completion time. Identify whether the right workstation was prioritized.",
  },
  s3: {
    situation: "A rumor spreads on the unit that patient data was lost. Three clinicians are visibly anxious. Nothing has actually been lost.",
    first90: [
      "Move to the most visible spot on the unit.",
      "Use a calm, low voice — your tone will reset the room.",
      "Speak before any clinician asks — get ahead of the question.",
    ],
    whatToSay: [
      "'I just checked with command — no data has been lost.'",
      "'What you're seeing is a display issue, not a save issue.'",
      "'I'll stand here for the next ten minutes — any questions, find me.'",
    ],
    whatToCheck: [
      "Are you sure the data isn't actually lost? Confirm with command first.",
      "Is the charge nurse aligned on the message?",
      "Are there clinicians who need a 1:1 reassurance after?",
    ],
    escalation: "If a clinician escalates publicly, ask them to step aside with you. Never debate in front of the unit.",
    debrief: "Note who started the rumor source, how it traveled, and how long it took to settle. Recommend a unit-wide message template for next time.",
  },
  s10: {
    situation: "A unit says a patient cannot move because the bed assignment is unclear. Shift change is mid-handoff. Bed control is on a call.",
    first90: [
      "Restate the request without PHI: 'One placement is unclear on this unit.'",
      "Confirm the patient's current location and the destination unit.",
      "Check whether a placement order or status exists — and who entered it.",
    ],
    whatToSay: [
      "'Before we escalate, let's confirm the request, the status, and the next owner.'",
      "'I'll hold here with you until we know who owns the next step.'",
      "'I'll close the loop with the requester in five minutes either way.'",
    ],
    whatToCheck: [
      "Is the placement request active, on hold, or missing?",
      "Is this one patient or several waiting on the same bed?",
      "Did the request come from the right role on the right unit?",
    ],
    escalation: "If placement is unclear after the request + status + owner check, OR a time-critical workflow is waiting, escalate to command center with scope, severity, and callback.",
    debrief: "Note the time the request was made, the time it stalled, where ownership broke down, and what the next-shift consultant should watch for.",
  },
};

export interface ScenarioRecommend {
  first90: string;
  whatToSay: string;
  whatToCheck: string;
  escalation: string;
  debrief: string;
}

export const SCENARIO_RECOMMEND: Record<string, ScenarioRecommend> = {
  s1: {
    first90: "Make eye contact, take one breath, ask 'just you or others?' before touching anything.",
    whatToSay: "Speak low and slow. The clinician's stress mirrors yours — drop yours first.",
    whatToCheck: "Scope before severity. Then severity before escalation.",
    escalation: "Unit-wide + time-sensitive = page within 5 minutes. Don't wait for permission.",
    debrief: "Write it down inside 10 minutes. Memory rots after handoff.",
  },
  s2: {
    first90: "Move to paper before IT confirms. The clock matters more than the confirmation.",
    whatToSay: "Name the priority out loud so both desks heard the same plan.",
    whatToCheck: "Stocked forms + visible clock + named back-loader — those three or you'll bleed time.",
    escalation: "15 minutes during shift change is your trigger. Don't negotiate with yourself.",
    debrief: "The back-load completion time is the real KPI here, not the downtime length.",
  },
  s3: {
    first90: "Confirm with command FIRST — never reassure a unit with a guess.",
    whatToSay: "Lead with the fact, follow with what they're seeing, end with where you'll be.",
    whatToCheck: "Charge nurse alignment matters more than the message itself.",
    escalation: "Pull anyone visibly upset aside. Public debate never ends well.",
    debrief: "Capture the rumor's source and travel path. That's the real lesson.",
  },
  s10: {
    first90: "Strip the PHI from the request before you repeat it. 'One placement is unclear' is enough.",
    whatToSay: "Name the three things you're confirming out loud — request, status, owner. Then move.",
    whatToCheck: "Status field tells you whether to escalate or wait. Don't escalate a missing field as a system problem.",
    escalation: "If the next owner is unclear after the three checks, that's your escalation trigger.",
    debrief: "Note where ownership broke down. The fix is almost always in the handoff, not the assignment.",
  },
};

export interface VideoChapter { t: string; title: string; body: string; }
export interface VideoDetail { chapters: VideoChapter[]; transcript: string; }

export const VIDEO_DETAIL: Record<string, VideoDetail> = {
  v1: {
    chapters: [
      { t: "0:00", title: "Why handoff in 90 seconds", body: "The next shift inherits your unit. Three pieces of context save them 20 minutes." },
      { t: "0:25", title: "Open issues", body: "Name the issue, the impacted role, and the last action you took." },
      { t: "0:55", title: "Watch-items", body: "Workflows that haven't broken yet but are wobbling. One sentence each." },
      { t: "1:20", title: "Unit mood", body: "Tell them what they'll walk into. A tense room needs a calm entry." },
    ],
    transcript: "Hand off three things: open issues, watch-items, and unit mood. Open issues are what broke and what you tried. Watch-items are workflows that haven't broken yet but are wobbling. Unit mood is the room they're about to walk into — calm, busy, or tense. Three pieces. Ninety seconds. Done.",
  },
  v2: {
    chapters: [
      { t: "0:00", title: "Why walk it", body: "Tickets get triaged. Walking it gets context." },
      { t: "0:20", title: "What to bring", body: "Scope, severity, screenshot policy followed, callback." },
      { t: "0:50", title: "How to ask", body: "One sentence. Specific ask. Time-bound." },
      { t: "1:30", title: "How to close the loop", body: "Tell the original requester within 5 minutes." },
    ],
    transcript: "Walking a ticket is a two-minute pattern. Confirm scope on the floor. Capture severity in one phrase. Walk to command center with screenshot in hand. Make a specific time-bound ask. Then close the loop with the requester within five minutes so the floor knows it landed.",
  },
  v3: {
    chapters: [
      { t: "0:00", title: "Open the bag", body: "Everything fits in a small zip bag. Carry it always." },
      { t: "0:30", title: "Pens + paper forms", body: "Three pens of two colors. Pre-stocked downtime forms." },
      { t: "1:10", title: "Identity sheet", body: "Templated identity capture. Minimum viable fields only." },
      { t: "1:45", title: "Wristwatch", body: "Wall clock fails too. Wear a watch." },
    ],
    transcript: "The downtime bag has four things: pens in two colors, pre-stocked downtime forms, a templated identity sheet with the minimum viable fields, and a wristwatch. The watch matters most — the wall clock can fail when the system does. Carry the bag every shift.",
  },
  v4: {
    chapters: [
      { t: "0:00", title: "Stand to the side", body: "Never behind. Side puts you on the same team." },
      { t: "0:30", title: "Eye level", body: "Match seated height when the user is seated." },
      { t: "1:00", title: "Listen first", body: "Ten seconds of silence beats ten seconds of advice." },
    ],
    transcript: "Posture is the first message. Stand to the side, never behind. Match eye level — if they're sitting, you sit. Then listen for ten seconds before saying anything. Those ten seconds change the entire interaction.",
  },
};

// ---------- Checklist items ----------

export interface ChecklistItem { id: string; text: string; }

export const CHECKLIST_ITEMS: Record<string, ChecklistItem[]> = {
  c1: [
    { id: "a", text: "Badge visible, lanyard untucked" },
    { id: "b", text: "Device charged > 80%" },
    { id: "c", text: "Floor lead contact saved" },
    { id: "d", text: "Downtime bag in possession" },
    { id: "e", text: "Wristwatch on" },
  ],
  c2: [
    { id: "a", text: "Downtime forms pre-stocked" },
    { id: "b", text: "Two pens, two colors" },
    { id: "c", text: "Identity capture sheet" },
    { id: "d", text: "Printed contact list" },
  ],
  c3: [
    { id: "a", text: "Scope: how many users affected" },
    { id: "b", text: "Severity: any patient impact" },
    { id: "c", text: "Screenshot per org policy" },
    { id: "d", text: "Requester name + role" },
    { id: "e", text: "Callback number" },
  ],
  c4: [
    { id: "a", text: "Patient name" },
    { id: "b", text: "Date of birth" },
    { id: "c", text: "Arrival time" },
    { id: "d", text: "Presenting reason" },
    { id: "e", text: "Photo of insurance card if available" },
  ],
};

// ---------- Relationship helpers ----------

export function relatedFor(id: string, types?: ContentType[], limit = 4): ContentItem[] {
  const it = itemById(id);
  if (!it) return [];
  const pool = ITEMS.filter(o => o.id !== id && (!types || types.includes(o.content_type)));
  return pool
    .map(o => {
      let s = 0;
      if (o.module_id && o.module_id === it.module_id) s += 2;
      s += o.tags.filter(t => it.tags.includes(t)).length;
      return { o, s };
    })
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map(x => x.o)
    .slice(0, limit);
}

export function nextLesson(id: string): ContentItem | null {
  const lessons = ITEMS.filter(i => i.content_type === "lesson");
  const idx = lessons.findIndex(l => l.id === id);
  return idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;
}

export function linkFor(item: { id: string; content_type: ContentType }): { to: string; params?: Record<string, string> } {
  switch (item.content_type) {
    case "lesson": return { to: "/lessons/$id", params: { id: item.id } };
    case "playbook": return { to: "/playbooks/$id", params: { id: item.id } };
    case "scenario": return { to: "/scenarios/$id", params: { id: item.id } };
    case "video": return { to: "/videos" };
    case "checklist": return { to: "/checklists" };
  }
}

// ---------- Search / Ask engine ----------

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

// ---------- Mock users (admin) ----------

export interface DemoUser {
  id: string;
  display_name: string;
  email: string;
  role: "admin" | "member";
  access: "active" | "inactive";
  joined_at: string; // ISO date
  last_active: string; // ISO date
}

export const DEMO_USERS: DemoUser[] = [
  { id: "u1", display_name: "Demo Consultant", email: "demo@mizly.test", role: "admin", access: "active", joined_at: "2025-09-01", last_active: "2026-06-02" },
  { id: "u2", display_name: "Alex Reyes", email: "alex@example.test", role: "member", access: "active", joined_at: "2025-10-14", last_active: "2026-06-01" },
  { id: "u3", display_name: "Jordan Kim", email: "jordan@example.test", role: "member", access: "active", joined_at: "2025-11-02", last_active: "2026-05-30" },
  { id: "u4", display_name: "Priya Singh", email: "priya@example.test", role: "member", access: "inactive", joined_at: "2025-12-08", last_active: "2026-04-18" },
  { id: "u5", display_name: "Sam Okafor", email: "sam@example.test", role: "member", access: "active", joined_at: "2026-01-22", last_active: "2026-06-02" },
  { id: "u6", display_name: "Riya Patel", email: "riya@example.test", role: "admin", access: "active", joined_at: "2025-08-10", last_active: "2026-05-29" },
  { id: "u7", display_name: "Marcus Lee", email: "marcus@example.test", role: "member", access: "inactive", joined_at: "2026-02-05", last_active: "2026-03-11" },
];
