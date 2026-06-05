# Mizly Pack 11 Complete - Provider Workflow Density

Date: 2026-06-05

## What Shipped

Pack 11 adds nine Mizly-original Ask workflow patterns from the provider LearnShare/video source list and screenshots supplied for provider notes/orders, In Basket, SmartSets/SmartTools, procedure documentation/macros, inpatient provider workflows, surgical workflow efficiency, Radiant, ClinDoc, and prescription printing.

The supplied links and screenshots were used only as source context. Learner-facing content was rewritten into Mizly-safe guidance. No raw video links, Zoom links, Google Drive links, source screenshots, filenames, facility details, patient identifiers, credentials, or proprietary screens are exposed.

## New Ask Patterns

1. `ll_provider_inbasket_folder_filter_overload`
   - Provider In Basket is overloaded or filtered wrong
   - Covers folder/pool/proxy view, priority/due filters, and safe triage.

2. `ll_provider_inbasket_result_or_refill_followup`
   - Provider In Basket result or refill follow-up is unclear
   - Covers result/refill/follow-up message action, route/done state, and owner.

3. `ll_smarttools_placeholder_prompt_unresolved`
   - SmartTool prompt or placeholder did not resolve
   - Covers unresolved placeholders, SmartTool prompts, required fields, and sign status.

4. `ll_smartset_section_or_order_not_selected`
   - SmartSet section or expected order is not selected
   - Covers section visibility, selected orders, required fields, and context.

5. `ll_inpatient_clinical_review_data_hidden`
   - Inpatient clinical review data is hidden or incomplete
   - Covers provider lists, clinical review filters, date range, source data, and owner.

6. `ll_provider_note_copy_forward_or_refresh_wrong`
   - Provider note copy-forward or refresh looks wrong
   - Covers copied-forward/stale note data and review-before-sign safety.

7. `ll_surgical_workflow_case_ready_blocked`
   - Surgical workflow is not ready or case status is blocked
   - Covers case status, required docs, orders, consent, pre-op tasks, and periop owner.

8. `ll_radiant_protocol_ready_for_exam_blocked`
   - Radiant protocol or ready-for-exam status is blocked
   - Covers order vs exam readiness, protocol, prep, transport, modality owner.

9. `ll_prescription_printer_routing_wrong`
   - Prescription is printing to the wrong printer
   - Covers prescription print route, approved printer, one controlled reprint, and duplicate-print risk.

## Ask Router Improvements

`/ask` now recognizes Pack 11 phrases as specific workflow signals:

- Provider In Basket overload, filters, pool/proxy/delegate view
- In Basket result/refill/follow-up actions
- SmartTool prompts/placeholders and unresolved SmartLinks
- SmartSet sections, hidden orders, and required fields
- Inpatient clinical review and patient summary gaps
- Provider note copy-forward/refresh issues
- Surgical readiness/case-status blockers
- Radiant protocol/ready-for-exam blockers
- Prescription printer routing

Broad provider questions now get a useful action chooser:

- Orders
- Notes
- In Basket
- Clinical review

## Files Changed

- `src/lib/launch-library.ts`
- `src/routes/_authenticated.ask.tsx`

## Verification

Passed:

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`
- Production build: `node node_modules/vite/bin/vite.js build`
- Matcher check: 9/9 Pack 11 test questions returned the intended library item with `strong` match quality.
- Source safety scan: no raw LearnShare links, Zoom links, Google Drive links, source screenshots, PHI, credentials, or source-specific strings were found in the Pack 11 learner-facing additions.

## Guardrails

- No auth, Stripe, Supabase entitlement, payment, or route-protection code was touched.
- No raw videos, screenshots, or documents were added to learner-facing code.
- No PHI was added.
- No source filenames or raw source notes were exposed to learners.
- Vendor terms are limited to safe workflow/vendor-family context already covered by Mizly's trademark notice.
