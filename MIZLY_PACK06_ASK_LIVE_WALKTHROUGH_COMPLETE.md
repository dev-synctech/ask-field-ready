# Mizly Pack 06 - Ask Live Walkthrough Complete

Date: 2026-06-05 00:01 EDT

## What Changed

Ask Mizly now generates a live-consultant style answer payload for strong matches.

Instead of only summarizing the workflow, each strong answer now carries:

- `doThisFirst`
- `whereToLook`
- `whatToClick`
- `whatShouldHappen`
- `ifYouDontSeeIt`
- `whatToSay`
- `checkThis`
- `escalateWhen`

The compact Ask answer card still keeps the four-zone learner view, but the content inside it is more operational:

- WHAT IT IS
- FIRST 90 SECONDS
  - Do this first
  - Where to look
  - What to click
  - Check
  - Say this
- IF IT WORKS / IF IT DOESN'T
  - What should happen
  - If you don't see it
  - Escalate to
- MORE HELP

## Workflow Coverage

Added reusable live-walkthrough guidance for:

- Change context / wrong unit-location context
- Order entry / placing an order
- Diagnosis or indication required before signing an order
- Notes / documentation / note template / note signing
- Charge capture and charges not dropping
- In Basket / message pool routing
- Medication barcode mismatch
- Lab label reprint / wrong printer
- Printer and label issues
- Patient list / worklist filters
- Generic nav-trail fallback for future entries

## Files Changed

- `src/lib/launch-library.ts`
  - Added `LiveGuide` type.
  - Added generated `liveGuide` to `AskAnswer`.
  - Added `liveGuideFor()` helper with reusable screen-path guidance.
  - Added note-routing keywords so "where do I write my note" lands on the note/template workflow.

- `src/routes/_authenticated.ask.tsx`
  - Routed more specific prompts directly instead of over-clarifying.
  - Rendered live-guide copy inside the compact Ask card.
  - Updated copy/export text to include Check, What should happen, and If you don't see it.
  - Kept mobile Ask/Copy/Save controls at 44px target size.

## Verification

- Required prompt scorecard: passed.
  - `how do I change context`
  - `I can't place an order`
  - `diagnosis required before signing an order`
  - `where do I write my note`
  - `note will not sign missing required field`
  - `how do I get to charge capture`
  - `charge not dropping after the visit was signed`
  - `in basket message is in the wrong pool`
  - `medication barcode mismatch alert during administration`
  - `lab label reprint went to the wrong printer`

- Pack 04 / Pack 05 routing scorecard: 19/19 passed with strong matches.
- TypeScript check: passed.
- Production build: passed.
- Safety scan of new live-guide block and Ask rendering changes: no PHI, client names, emails, private links, credential terms, or patient identifiers.
- Browser note:
  - In-app Browser loaded `/ask` with no console errors.
  - In-app Browser text-entry interactions were blocked by the known virtual clipboard limitation.
  - External Playwright was not available in this repo/runtime without adding dependencies, so no dependency mutation was performed.
  - Static JSX check confirms mobile Ask button remains `h-11 min-w-[72px]`, Copy/Save remain `h-11 md:h-9`.

## Scope Guard

No changes were made to:

- Auth
- Stripe/payments
- Supabase entitlements/RLS
- Admin routes
- Payment screens
- Route tree structure

