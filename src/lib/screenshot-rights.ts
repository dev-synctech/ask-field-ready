import registry from "@/data/screenshot-rights-registry.json";

export type AssetType =
  | "cleaned_svg"
  | "redrawn_mock"
  | "rights_cleared_screenshot";

export type RightsStatus =
  | "unknown"
  | "internal_only"
  | "needs_legal_review"
  | "cleared_for_public_training";

export type RedactionStatus =
  | "not_needed"
  | "needs_redaction"
  | "redacted"
  | "rejected";

export interface ScreenshotRightsEntry {
  id: string;
  title: string;
  note: string;
  asset_type: AssetType;
  rights_status: RightsStatus;
  clearance_note: string;
  approved_by: string | null;
  approval_date: string | null;
  redaction_status: RedactionStatus;
  learner_visible: boolean;
  image_path: string | null;
  related_ask_ids: string[];
}

export const SCREENSHOT_FOOTER_DISCLAIMER: string =
  (registry as { footer_disclaimer: string }).footer_disclaimer;

export const SCREENSHOT_REGISTRY: ScreenshotRightsEntry[] =
  (registry as { screenshots: ScreenshotRightsEntry[] }).screenshots;

/**
 * Single source of truth for whether a rights-cleared screenshot may be shown
 * to learners. All four conditions must hold; anything else stays admin-only.
 */
export function isLearnerVisible(entry: ScreenshotRightsEntry): boolean {
  return (
    entry.asset_type === "rights_cleared_screenshot" &&
    entry.rights_status === "cleared_for_public_training" &&
    (entry.redaction_status === "not_needed" ||
      entry.redaction_status === "redacted") &&
    entry.learner_visible === true &&
    typeof entry.image_path === "string" &&
    entry.image_path.length > 0
  );
}

export function learnerScreenshotsForAsk(askId: string): ScreenshotRightsEntry[] {
  return SCREENSHOT_REGISTRY.filter(
    (entry) => entry.related_ask_ids.includes(askId) && isLearnerVisible(entry),
  );
}

export function adminScreenshotsForAsk(askId: string): ScreenshotRightsEntry[] {
  return SCREENSHOT_REGISTRY.filter((entry) =>
    entry.related_ask_ids.includes(askId),
  );
}
