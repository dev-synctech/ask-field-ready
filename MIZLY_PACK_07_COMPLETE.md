# Mizly Pack 07 - Real-Question Workflow Density Complete

Completed: 2026-06-05 10:48 EDT

## What Pack 07 Adds

Pack 07 adds 15 new learner-safe Ask patterns focused on short, real consultant questions where the user expects Mizly to walk them through the screen, not give generic triage.

## New Ask Pattern IDs

1. `ll_schedule_appointment_not_visible`
2. `ll_schedule_template_slot_unavailable`
3. `ll_order_missing_due_to_encounter_context`
4. `ll_order_locked_after_sign`
5. `ll_note_sidebar_or_note_type_missing`
6. `ll_flowsheet_row_hidden_or_time_column_wrong`
7. `ll_mar_med_not_showing_due_time_filter`
8. `ll_document_scanned_to_wrong_encounter`
9. `ll_consent_missing_before_procedure`
10. `ll_referral_order_not_ready_for_scheduling`
11. `ll_result_routing_or_ack_owner_unclear`
12. `ll_workqueue_item_assigned_to_wrong_owner`
13. `ll_scanner_or_badge_reader_not_working`
14. `ll_downtime_backload_queue_after_restore`
15. `ll_escalation_packet_for_command_center`

## Ask Improvements

- Added Pack 07 entries to `LAUNCH_LIBRARY`.
- Added exact-workflow scoring boosts for:
  - barcode medication mismatch
  - charge-capture navigation
  - note-area/sidebar lookup
  - wrong-encounter document scan correction
- Extended `liveGuideFor()` with dedicated screen-walkthrough behavior for:
  - scheduling and referrals
  - flowsheets and time columns
  - scanning, consent, and wrong-encounter document risk
  - results and acknowledgement/routing
  - workqueues and reports
  - scanners and badge readers
  - downtime backloading
  - command-center escalation packets
- Updated Ask router signals so short phrases route directly instead of over-clarifying.

## Verification

### Static Matcher

Pack 07 matcher scorecard: 15/15 passed.

Regression scorecard against Pack 04/05/06 sample questions: 19/19 passed.

### Type / Build

- `tsc --noEmit` passed.
- `vite build` passed.
- Build warning remains pre-existing: CSS `@import` order and large bundle chunk warning. Pack 07 did not introduce either.

### Rendered Smoke

Local `/ask` rendered at `http://127.0.0.1:5177/ask`.

Question tested:

`appointment not showing on provider schedule`

Rendered answer included:

- WHAT IT IS
- FIRST 90 SECONDS
- Do this first
- Where to look
- What to click
- Say this
- Check
- IF IT WORKS / IF IT DOESN'T
- MORE HELP
- Trademark/legal notice

Console: no app errors or warnings during the rendered smoke.

## Safety

- No raw vendor screenshots, logos, patient identifiers, organization names, credentials, or private links were added.
- Vendor names are used only as system-family routing terms where appropriate.
- Learner-facing language remains Mizly-original and operational.

## Files Changed

- `src/lib/launch-library.ts`
- `src/routes/_authenticated.ask.tsx`

## Do Not Touch

Pack 07 did not touch:

- auth
- Stripe
- Supabase entitlement checks
- admin routes
- payment routes
