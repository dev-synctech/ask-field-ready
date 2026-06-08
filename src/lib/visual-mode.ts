import registry from "@/data/visual-mode-registry.json";

export type VisualMode = "internal_reference" | "public_mizly_visual";
export type PublicVisualStatus =
  | "not_started"
  | "redrawn"
  | "needs_review"
  | "approved"
  | "live";

export interface VisualModeWorkflow {
  id: string;
  askIds: string[];
  workflow_title: string;
  visual_mode: VisualMode;
  source_reference_available: "yes" | "no";
  public_visual_status: PublicVisualStatus;
  /** Key into the realistic-visual catalog. Null for internal-only entries. */
  realistic_visual_key: string | null;
  screenshot_review_notes: string;
  transcript_explanation: string;
  what_user_is_trying_to_do: string;
  where_to_click: string;
  what_to_check: string;
  what_to_say: string;
  escalation_note: string;
}

export const INTERNAL_REFERENCE_LABEL: string =
  (registry as { internal_reference_label: string }).internal_reference_label;

export const VISUAL_MODE_WORKFLOWS: VisualModeWorkflow[] =
  (registry as { workflows: VisualModeWorkflow[] }).workflows;

/** Learner-safe predicate: public mode AND status = live AND has a realistic-visual key. */
export function isPublicLive(w: VisualModeWorkflow): boolean {
  return (
    w.visual_mode === "public_mizly_visual" &&
    w.public_visual_status === "live" &&
    typeof w.realistic_visual_key === "string" &&
    w.realistic_visual_key.length > 0
  );
}

export function learnerWorkflowsForAsk(askId: string): VisualModeWorkflow[] {
  return VISUAL_MODE_WORKFLOWS.filter(
    (w) => w.askIds.includes(askId) && isPublicLive(w),
  );
}

export function allWorkflowsForAsk(askId: string): VisualModeWorkflow[] {
  return VISUAL_MODE_WORKFLOWS.filter((w) => w.askIds.includes(askId));
}
