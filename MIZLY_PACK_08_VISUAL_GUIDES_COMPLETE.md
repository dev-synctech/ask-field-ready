# Mizly Pack 08 Complete - Visual Guide Layer

Date: 2026-06-05

## What Shipped

Pack 08 adds Mizly-original visual guides to six high-frequency Ask workflows. These are not real EHR screenshots. They are generic, brand-safe mock screens designed to help consultants orient quickly without exposing PHI, facility names, credentials, or proprietary source screens.

## Learner-Facing Visuals

Six Ask answers now render a visual guide above the compact answer card when the matched library item has `visual_url`:

1. `ll_schedule_appointment_not_visible`
   - Asset: `/visual-guides/schedule-appointment-missing.svg`
   - Use case: appointment not visible on schedule

2. `ll_document_scanned_to_wrong_encounter`
   - Asset: `/visual-guides/document-wrong-encounter.svg`
   - Use case: document scanned or attached to the wrong encounter

3. `ll_flowsheet_row_hidden_or_time_column_wrong`
   - Asset: `/visual-guides/flowsheet-row-time-column.svg`
   - Use case: flowsheet row hidden or wrong time column

4. `ll_mar_med_not_showing_due_time_filter`
   - Asset: `/visual-guides/mar-medication-filter.svg`
   - Use case: medication missing from MAR due to filters, status, timing, or context

5. `ll_workqueue_item_assigned_to_wrong_owner`
   - Asset: `/visual-guides/workqueue-owner-routing.svg`
   - Use case: workqueue item routed to the wrong owner

6. `ll_escalation_packet_for_command_center`
   - Asset: `/visual-guides/escalation-packet.svg`
   - Use case: command-center escalation packet

Each visual has four numbered callouts. The Ask renderer now reads callouts from either the answer object or the matched source library item.

## Admin Tracking

`/admin/visual-needs` now includes six completed Pack 08 screenshot needs so the visual backlog reflects what is already covered.

The visual-needs factory also marks screenshot gaps as `done` when a library item already has a `visual_url`.

## Files Changed

- `src/lib/launch-library.ts`
- `src/routes/_authenticated.ask.tsx`
- `src/lib/content-factory.ts`
- `public/visual-guides/schedule-appointment-missing.svg`
- `public/visual-guides/document-wrong-encounter.svg`
- `public/visual-guides/flowsheet-row-time-column.svg`
- `public/visual-guides/mar-medication-filter.svg`
- `public/visual-guides/workqueue-owner-routing.svg`
- `public/visual-guides/escalation-packet.svg`

## Verification

Passed:

- TypeScript: `tsc --noEmit`
- Production build: `vite build`
- Data routing check: all 6 Pack 08 test questions matched the intended library item with the intended visual URL and four callouts.
- Rendered local Ask check: `appointment not showing on provider schedule` rendered `/visual-guides/schedule-appointment-missing.svg` and four callout numbers above the answer card.
- Browser console check: no app-level console errors.
- Safety scan: visual guide assets contain no PHI, organization names, credentials, private links, or real EHR screenshots.

## Guardrails

- No auth, Stripe, Supabase entitlement, payment, or route-protection code was touched.
- No real screenshots were added.
- No PHI was added.
- No source filenames or raw source notes were exposed to learners.
- No vendor logos or proprietary UI were added.
