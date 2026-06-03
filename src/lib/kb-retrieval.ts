import type { ContentItem, ContentType } from "./demo-data";
import type { LaunchEntry, MatchQuality, VisualAid, VisualAidKind } from "./launch-library";

export type KbAssetKind = ContentType | VisualAidKind | "answer";

export interface KbMatch {
  id: string;
  title: string;
  kind: KbAssetKind;
  reason: string;
  href?: string;
}

export interface KbGap {
  id: string;
  kind: VisualAidKind;
  label: string;
  prompt: string;
  priority: "high" | "medium" | "low";
}

export interface KbSupport {
  matchedFrom: "mizly_sanitized_library";
  confidence: MatchQuality;
  matches: KbMatch[];
  visualAids: VisualAid[];
  gaps: KbGap[];
  retrievalNote: string;
}

type VisualAsset = VisualAid & {
  id: string;
  entryIds: string[];
  contentIds: string[];
  keywords: string[];
};

const VISUAL_ASSETS: VisualAsset[] = [
  {
    id: "visual_schedule_columns_screenshot",
    kind: "screenshot",
    title: "Annotated Mizly screenshot: column picker path",
    note: "Sanitized mock screen with numbered circles. No vendor UI, logos, patient data, private URLs, or organization names.",
    callouts: [
      "1 - Confirm the right schedule view.",
      "2 - Open View / Options / Columns.",
      "3 - Check the column and Apply.",
      "4 - Save only if local policy allows.",
    ],
    entryIds: ["ll_schedule_columns"],
    contentIds: ["p18", "c12", "v14"],
    keywords: ["schedule", "scheduling", "column", "columns", "view", "personalize", "schedule line"],
  },
  {
    id: "visual_schedule_columns_tasklet",
    kind: "tasklet",
    title: "Tap path",
    note: "Schedule view -> View/Options -> Columns/Display -> Apply -> Verify schedule line.",
    callouts: [
      "Use the user's actual schedule view.",
      "Stop and escalate if the view is locked or the column is missing.",
    ],
    entryIds: ["ll_schedule_columns"],
    contentIds: ["p18", "c12", "v14"],
    keywords: ["schedule", "columns", "tap path", "click path", "view options"],
  },
  {
    id: "visual_schedule_columns_video",
    kind: "video",
    title: "Changing schedule columns in 60 seconds",
    note: "Short Mizly training clip that follows the same schedule-view steps.",
    href: "/videos",
    entryIds: ["ll_schedule_columns"],
    contentIds: ["v14"],
    keywords: ["schedule", "columns", "video", "training clip"],
  },
  {
    id: "visual_billing_lane_screenshot",
    kind: "screenshot",
    title: "Annotated Mizly screenshot: billing lane decision tree",
    note: "Sanitized mock visual showing only charge capture, coding/status, and account/coverage lanes.",
    callouts: [
      "1 - Charge capture: missing or wrong charge.",
      "2 - Coding/status: review or completion status.",
      "3 - Account/coverage: ownership and routing.",
    ],
    entryIds: ["ll_billing_triage"],
    contentIds: ["p2", "c3", "v2"],
    keywords: ["billing", "charge", "coding", "coverage", "account", "lane"],
  },
  {
    id: "visual_billing_lane_tasklet",
    kind: "tasklet",
    title: "Two-minute lane check",
    note: "Pick the lane, capture scope, capture exact status/field, route to the owner.",
    callouts: [
      "One user = check role or permission first.",
      "Multiple users = treat as workflow/build/routing until confirmed.",
    ],
    entryIds: ["ll_billing_triage"],
    contentIds: ["p2", "c3", "v2"],
    keywords: ["billing", "charge", "coding", "coverage", "click path"],
  },
  {
    id: "visual_billing_lane_video",
    kind: "video",
    title: "Walking a billing issue to the right owner",
    note: "Short Mizly clip showing how to explain the lane and close the loop.",
    href: "/videos",
    entryIds: ["ll_billing_triage"],
    contentIds: ["v2"],
    keywords: ["billing", "charge", "coding", "coverage", "video"],
  },
  {
    id: "visual_bed_control_tasklet",
    kind: "tasklet",
    title: "Bed placement handoff path",
    note: "Request -> current location -> destination -> status/order -> next owner -> callback time.",
    callouts: [
      "Keep the handoff PHI-free.",
      "Name who owns the next step before escalating.",
    ],
    entryIds: ["ll_bed_control"],
    contentIds: ["p17", "c11", "l16", "s10", "v13"],
    keywords: ["bed", "bed control", "placement", "handoff", "transfer", "next owner"],
  },
  {
    id: "visual_bed_control_video",
    kind: "video",
    title: "Bed control handoff in 90 seconds",
    note: "Short Mizly training clip for a PHI-free placement handoff.",
    href: "/videos",
    entryIds: ["ll_bed_control"],
    contentIds: ["v13"],
    keywords: ["bed", "bed control", "placement", "handoff", "video"],
  },
];

const GAP_COPY: Record<VisualAidKind, { label: string; prompt: string; priority: "high" | "medium" | "low" }> = {
  screenshot: {
    label: "No sanitized screenshot yet",
    prompt: "Create a Mizly-original mock screenshot with numbered callouts. Do not use vendor UI, logos, patient data, private URLs, or organization names.",
    priority: "high",
  },
  video: {
    label: "No training video yet",
    prompt: "Record or generate a short Mizly training clip that follows the exact walkthrough and uses sanitized demo screens.",
    priority: "medium",
  },
  tasklet: {
    label: "No click path yet",
    prompt: "Add a short text-only click path using generic screen names and local-policy language.",
    priority: "medium",
  },
};

function hrefForContent(item: ContentItem): string | undefined {
  switch (item.content_type) {
    case "lesson": return `/lessons/${item.id}`;
    case "playbook": return `/playbooks/${item.id}`;
    case "scenario": return `/scenarios/${item.id}`;
    case "video": return "/videos";
    case "checklist": return "/checklists";
  }
}

function queryMatches(asset: VisualAsset, query: string, entry: LaunchEntry, relatedItems: ContentItem[]): boolean {
  const text = query.toLowerCase();
  const relatedIds = new Set(relatedItems.map(item => item.id));
  return (
    asset.entryIds.includes(entry.id) ||
    asset.contentIds.some(id => relatedIds.has(id)) ||
    asset.keywords.some(keyword => text.includes(keyword.toLowerCase()))
  );
}

function dedupeVisualAids(aids: VisualAid[]): VisualAid[] {
  const seen = new Set<string>();
  return aids.filter(aid => {
    const key = `${aid.kind}:${aid.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function gapsFor(visualAids: VisualAid[], relatedItems: ContentItem[]): KbGap[] {
  const has = (kind: VisualAidKind) => visualAids.some(aid => aid.kind === kind);
  const hasRelatedVideo = relatedItems.some(item => item.content_type === "video");
  const gaps: KbGap[] = [];

  (["screenshot", "tasklet", "video"] as VisualAidKind[]).forEach(kind => {
    if (kind === "video" && hasRelatedVideo) return;
    if (has(kind)) return;
    gaps.push({
      id: `gap_${kind}`,
      kind,
      ...GAP_COPY[kind],
    });
  });

  return gaps;
}

export function retrieveKbSupport(
  query: string,
  entry: LaunchEntry,
  relatedItems: ContentItem[],
  confidence: MatchQuality,
): KbSupport {
  const visualAids = dedupeVisualAids(
    VISUAL_ASSETS
      .filter(asset => queryMatches(asset, query, entry, relatedItems))
      .map(({ id: _id, entryIds: _entryIds, contentIds: _contentIds, keywords: _keywords, ...aid }) => aid),
  );

  const matches: KbMatch[] = [
    {
      id: entry.id,
      title: entry.title,
      kind: "answer",
      reason: "Primary Ask pattern",
    },
    ...relatedItems.slice(0, 5).map(item => ({
      id: item.id,
      title: item.title,
      kind: item.content_type,
      reason: item.content_type === "video" ? "Training clip" : "Sanitized library match",
      href: hrefForContent(item),
    })),
    ...visualAids.map((aid, index) => ({
      id: `visual_${aid.kind}_${index}`,
      title: aid.title,
      kind: aid.kind,
      reason: aid.kind === "video" ? "Visual training support" : "Navigation aid",
      href: aid.href,
    })),
  ];

  return {
    matchedFrom: "mizly_sanitized_library",
    confidence,
    matches,
    visualAids,
    gaps: gapsFor(visualAids, relatedItems),
    retrievalNote: "Matched from the sanitized Mizly library. Raw source files, vendor references, and PHI stay admin-only.",
  };
}
