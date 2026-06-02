# Phase 1 — Complete

Vendor-neutral, PHI-free demo build of **At the Elbow Academy**. No auth,
no Stripe, no entitlement gates. Every route is openly accessible.

## Route checklist

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ | Landing page, links into the demo |
| `/ask` | ✅ | Recent questions, save/copy actions, source badges, related cards |
| `/learn` | ✅ | Module + lesson grid with filters |
| `/lessons/:id` | ✅ | Scroll progress, mark complete, next lesson, related |
| `/playbooks` | ✅ | Card grid |
| `/playbooks/:id` | ✅ | Full sections + copy-escalation script |
| `/scenarios` | ✅ | Card grid |
| `/scenarios/:id` | ✅ | 6-step workflow, reveal recommended, debrief, replay |
| `/videos` | ✅ | Chapters, transcript search/highlight/copy |
| `/checklists` | ✅ | Interactive checklist UI |
| `/admin` | ✅ | Search, type/publish filters, in-editor builders, labeled inputs |
| `/admin/users` | ✅ | Mock user directory, view/promote/deactivate |
| `/account` | ✅ | Demo profile + "preview build" disclaimer |
| `/checkout` | ✅ | Redirects to `/ask` (no payment code loaded) |
| `/checkout/return` | ✅ | Redirects to `/ask` |
| `/payment-success` | ✅ | Redirects to `/ask` |

## Mobile QA (390×844)

- ✅ Bottom nav bar visible on Ask, Learn, Playbooks, Scenarios, Videos, Checklists
- ✅ "More" sheet opens and links to Admin, Account, Checklists
- ✅ Ask: question input, recent list, related cards stack cleanly
- ✅ Lesson detail: sticky progress bar, mark-complete CTA reachable
- ✅ Playbook detail: copy-escalation button tappable, sections scroll
- ✅ Scenario workflow: step pager + reveal/debrief buttons sized for thumb
- ✅ Video modal: transcript scrolls, chapter chips wrap
- ✅ Admin: search + filters wrap, builders stack vertically
- ✅ Card spacing tightened on mobile breakpoints

## Console notes

After a hard reload on `/ask`, `/admin`, `/videos`, and `/scenarios/s1`,
the only console output is infrastructure-only and unrelated to app code:

- `manifest.webmanifest 401` — preview sandbox auth, not present on
  published builds.
- `postMessage` warnings from `cdn.gpteng.co/lovable.js` — Lovable preview
  SDK only.
- `fdprocessedid` hydration warning — injected by browser form-filler
  extensions; harmless.

**No payment, auth, or entitlement errors.** No "Failed to load module"
errors. No 500s from server functions.

## Repo-hygiene pass

- All dormant Stripe / payment / entitlement / demo-bypass files moved to
  `src/_deferred/payments/` (see that folder's README).
- `tsconfig.json` excludes `src/_deferred/**` so dormant code is not
  type-checked or referenced.
- Active route audit (`rg "stripe|entitlement|payment" src/components src/hooks src/lib src/routes`)
  returns only **copy strings** ("no sign-in, no payment", "Phase 2 adds
  auth…") — no executable payment or entitlement code paths remain.

## Vendor-neutral / PHI-free confirmation

- ✅ All mock content (lessons, playbooks, scenarios, videos, checklists)
  references generic clinical roles and workflows. No vendor product
  names, no PHI, no real patient data.
- ✅ Admin mock users use fictional names and clinical roles.
- ✅ Ask responses are written as educational guidance, not patient-
  specific advice.

## Not started (intentional)

- Phase 2 — Auth (Supabase Auth, role-based gating)
- Phase 3 — Persistent progress / saved answers
- Phase 4 — Paid access (Stripe, entitlements, demo-bypass UX)
