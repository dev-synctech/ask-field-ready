# Mizly Pack 04 Completion Note

Date: 2026-06-04

## What changed

Pack 04 adds 16 new safe Ask patterns to `src/lib/launch-library.ts`, mined from the reconciled Mizly source corpus and Learnshare transcript set available on disk.

New patterns:

- `ll_diagnosis_needed_for_order` - diagnosis/indication required before order can move
- `ll_order_status_unsigned_initiated` - order is initiated, pending, or unsigned
- `ll_discontinue_cancel_order_safely` - discontinue/cancel/remove order safely
- `ll_home_med_rec_not_complete` - home medication reconciliation incomplete
- `ll_allergy_or_reaction_blocks_order` - allergy/reaction alert blocks med workflow
- `ll_result_not_visible_or_acknowledge_blocked` - result missing or acknowledgement blocked
- `ll_inbasket_message_wrong_pool` - message in wrong pool or owner queue
- `ll_note_unsigned_missing_required_field` - note cannot save/sign due missing field
- `ll_signed_note_addendum_correction` - signed note needs addendum/correction
- `ll_order_favorites_or_personal_list_missing` - favorite order or personal list missing
- `ll_patient_list_filter_or_relationship` - patient hidden by filter/relationship/view
- `ll_provider_handoff_or_signout_missing` - provider handoff/signout missing or stale
- `ll_periop_case_status_not_advancing` - periop case status blocked
- `ll_procedure_macro_not_applying` - procedure macro/template not applying
- `ll_discharge_or_departure_blocked` - discharge/departure workflow blocked
- `ll_transfer_transport_task_stuck` - transfer/transport/patient movement task stuck

`src/routes/_authenticated.ask.tsx` was updated with routing keywords so these specific questions go direct instead of getting stuck behind broad vendor/action clarifiers.

## Safety posture

- No PHI added.
- No organization names, staff names, emails, project pipeline details, private links, credentials, or screenshots added.
- Vendor names remain only where workflow context makes them useful.
- Learner-facing copy stays Mizly-original and operational: verify context, identify owner, use approved workflow path, escalate blocked safety/throughput issues.
- No Stripe, auth, Supabase, entitlement, or admin route behavior was touched.

## Verification

Build:

- `vite build` passes.
- Existing warnings remain only: CSS import order, chunk size, and upstream unused TanStack imports.

Matcher scorecard:

- 16/16 Pack 04 test queries resolved to strong, exact cards.
- Regression checks still hold for broad `orders`, `Epic orders`, `Epic Lispro drip row`, `scan a consent into chart`, and `glucometer calibration`.

Browser smoke:

- Desktop `/ask` loaded at `http://127.0.0.1:5175/ask`.
- Pack 04 query `diagnosis required before signing an order` rendered the compact 4-zone learner card.
- Pack 04 query `in basket message is in the wrong pool` rendered the specific wrong-pool card.
- No-match query `glucometer calibration` rendered the stable "Closest materials we have" fallback.
- Mobile 390x844 query `note will not sign missing required field` rendered the specific Pack 04 card with no horizontal overflow.
- Browser console errors: none during smoke checks.

## Corpus baseline used

- Full master docs: 312 scrubbed docs
- Master inventory: 317 rows
- Transcripts visible locally: 5 scrubbed long transcripts + 9 Learnshare transcript text files
- Supplemental six Pack 04 transcript pairs are packaged in `MIZLY_TRANSCRIPT_SUPPLEMENT_2026-06-04_0005EDT.zip` and were already included in the full corpus handoff.
