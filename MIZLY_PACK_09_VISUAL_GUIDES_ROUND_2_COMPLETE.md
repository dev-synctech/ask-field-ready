# Mizly Pack 09 Complete - Visual Guides Round 2

Date: 2026-06-05

## What Shipped

Pack 09 adds the second round of Mizly-original visual guides to Ask answers. These are generic training mockups, not real EHR screenshots. They are designed to help consultants orient quickly without exposing PHI, facility names, credentials, private links, or proprietary source screens.

## Learner-Facing Visuals

Six more Ask answers now render a visual guide above the compact answer card when the matched library item has `visual_url`:

1. `ll_allergy_or_reaction_blocks_order`
   - Asset: `/visual-guides/allergy-reaction-block.svg`
   - Use case: allergy or reaction alert blocking a medication/order workflow

2. `ll_attestation_cosign`
   - Asset: `/visual-guides/attestation-cosign-routing.svg`
   - Use case: attestation or cosign task routing issue

3. `ll_authorization_or_referral_status_missing`
   - Asset: `/visual-guides/authorization-referral-status.svg`
   - Use case: authorization/referral status missing or not linked

4. `ll_downtime_backload_queue_after_restore`
   - Asset: `/visual-guides/downtime-backload-queue.svg`
   - Use case: downtime backload queue after system restore

5. `ll_ambulation_no_option`
   - Asset: `/visual-guides/ambulation-mobility-option.svg`
   - Use case: ambulation or wheelchair documentation option not obvious

6. `ll_consent_missing_before_procedure`
   - Asset: `/visual-guides/consent-procedure-status.svg`
   - Use case: consent missing before a procedure

Each visual has four numbered callouts.

## Routing Fix

Pack 09 also tightens `liveGuideFor()` so these six IDs use exact-match guidance before broader keyword branches. This prevents a specific visual from rendering with generic wording from an unrelated branch.

## Admin Tracking

`/admin/visual-needs` now includes the six Pack 09 screenshot needs as `done`, so the visual backlog reflects what is already covered.

## Files Changed

- `src/lib/launch-library.ts`
- `src/lib/content-factory.ts`
- `public/visual-guides/allergy-reaction-block.svg`
- `public/visual-guides/attestation-cosign-routing.svg`
- `public/visual-guides/authorization-referral-status.svg`
- `public/visual-guides/downtime-backload-queue.svg`
- `public/visual-guides/ambulation-mobility-option.svg`
- `public/visual-guides/consent-procedure-status.svg`

## Verification

Passed:

- TypeScript: `tsc --noEmit`
- Production build: `vite build`
- Data routing check: all 6 Pack 09 test questions matched the intended library item with the intended visual URL and four callouts.
- Guidance check: exact-ID `liveGuideFor()` branches return the intended first-step wording for all 6 Pack 09 items.
- Rendered local Ask check: `allergy alert is blocking medication order` rendered `/visual-guides/allergy-reaction-block.svg`, the corrected first step, compact answer zones, related help chips, and trademark footer.
- Browser console check: no app-level console errors or warnings during the rendered local Ask check.
- Safety scan: visual guide assets contain no PHI, organization names, credentials, private links, vendor logos, or real EHR screenshots.

Note: the in-app browser screenshot capture timed out during final QA, but DOM, asset, interaction, and console checks passed.

## Guardrails

- No auth, Stripe, Supabase entitlement, payment, or route-protection code was touched.
- No real screenshots were added.
- No PHI was added.
- No source filenames or raw source notes were exposed to learners.
- No vendor logos or proprietary UI were added.
