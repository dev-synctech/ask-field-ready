// Shared legal/guardrail copy used across public + admin surfaces.
// Vendor-neutral by design. Text-only labels — no logos, no screenshots.

export const TRADEMARK_NOTICE =
  "Mizly is an independent training and field-support product. Epic and EpicCare are trademarks or registered trademarks of Epic Systems Corporation. Oracle Health and Cerner are trademarks or registered trademarks of Oracle and/or its affiliates. MEDITECH is a trademark or registered trademark of Medical Information Technology, Inc. Other product names are trademarks of their respective owners. Mizly is not affiliated with, endorsed by, sponsored by, or certified by these companies.";

export const ASK_SAFETY_LINE =
  "Workflow names and screens may vary by organization. Confirm local policy before acting.";

// Text-only chips for the "Applies to" metadata field.
export const APPLIES_TO_OPTIONS = [
  "Vendor-neutral",
  "Epic-style workflows",
  "Oracle Health/Cerner-style workflows",
  "MEDITECH-style workflows",
  "Other",
] as const;
export type AppliesTo = (typeof APPLIES_TO_OPTIONS)[number];

// Guardrail bullets shown on Source Library, Question Bank, and Rewrite Workspace.
export const GUARDRAIL_BULLETS = [
  "Do not publish vendor screenshots, logos, copied manuals, copied tip sheets, customer or organization names, patient data, credentials, or proprietary training text.",
  "Use sources only to understand the workflow problem.",
  "Rewrite into Mizly-original guidance before publishing.",
];

// Items shown in the publish approval checklist.
export const PUBLISH_CHECKLIST = [
  "No PHI",
  "No organization names",
  "No vendor screenshots/logos",
  "No copied vendor training text",
  "No credentials or links to private systems",
  "Vendor names used only descriptively when necessary",
  "Content rewritten as Mizly-original workflow guidance",
] as const;
