# Mizly Pack 10 Complete - Revenue Cycle Workflow Density

Date: 2026-06-05

## What Shipped

Pack 10 adds nine Mizly-original Ask workflow patterns mined from the new HB/SBO and billing source bundles. The pack focuses on practical revenue-cycle support questions consultants are likely to hear during go-live.

The source material was used only as context. Learner-facing content was rewritten into Mizly-safe guidance. No raw source notes, filenames, facility details, patient identifiers, credentials, or proprietary screenshots are exposed.

## New Ask Patterns

1. `ll_hb_account_status_dnb_or_billed`
   - Hospital account status is unclear
   - Covers Open/DNB/Billed/Closed-style status questions and owner routing.

2. `ll_dnb_edit_or_stop_bill_owner`
   - DNB edit or stop-bill needs an owner
   - Covers DNB edit category, blocker meaning, owner lane, and safe routing.

3. `ll_claim_edit_workqueue_owner`
   - Claim edit is in the wrong owner lane
   - Covers claim edits across multiple workqueues and "only fix your owned edit" guidance.

4. `ll_clearinghouse_error_refresh_retest`
   - Clearinghouse error needs refresh/retest
   - Covers external status/clearinghouse error correction, refresh, retest, and escalation.

5. `ll_late_charge_or_split_claim`
   - Late charge or split claim is holding billing
   - Covers late charge timing, claim status, split-claim context, and owner routing.

6. `ll_sbo_guarantor_balance_statement_call`
   - Guarantor has a balance or statement question
   - Covers customer-service/SBO balance and statement inquiries without putting identifiers in support notes.

7. `ll_sbo_payment_plan_or_self_pay_followup`
   - Payment plan or self-pay follow-up is unclear
   - Covers payment plan status, self-pay follow-up queues, due dates, and owner policy.

8. `ll_coverage_filing_order_term_delete`
   - Coverage filing order, term, or delete decision
   - Covers coverage effective dates, filing order, term vs delete decision, and owner escalation.

9. `ll_account_activity_communication_needed`
   - Account activity communication needs routing
   - Covers account activity/communication routing, owner group, notes, and follow-up status.

## Ask Router Improvements

`/ask` now recognizes Pack 10 phrases as specific workflow signals:

- HAR/account status
- DNB edit / stop bill
- claim edit / claim error owner
- clearinghouse / external status / rapid retest
- late charge / split claim
- guarantor balance / statement inquiry
- payment plan / self-pay follow-up
- coverage filing order / term / delete
- account activity / billing communication

Broad billing questions now get a useful action chooser instead of falling into a no-match path:

- Account / DNB
- Claim edits
- Charge / late charge
- Guarantor / payment

## Files Changed

- `src/lib/launch-library.ts`
- `src/routes/_authenticated.ask.tsx`

## Verification

Passed:

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`
- Production build: `node node_modules/vite/bin/vite.js build`
- Matcher check: 9/9 Pack 10 test questions returned the intended library item with `strong` match quality.
- Source safety scan: no raw source names, trainer names, organization names, payer examples, source authorship strings, or training-environment details were found in the changed learner-facing files.

Known test limitation:

- The in-app browser automation could load local `/ask` with no console errors, but typed-input automation hit the same virtual clipboard limitation seen during live Pack 09 verification. Matcher and build checks passed.

## Guardrails

- No auth, Stripe, Supabase entitlement, payment, or route-protection code was touched.
- No raw billing documents were added to learner-facing code.
- No PHI was added.
- No real screenshots were added.
- No source filenames or raw source notes were exposed to learners.
- Vendor terms are limited to safe workflow/vendor-family context already covered by Mizly's trademark notice.
