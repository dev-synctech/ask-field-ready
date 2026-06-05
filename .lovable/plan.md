## Goal

Bring every Pack 10 and Pack 11 Ask answer up to the new Plain-Language Standard so the renderer's existing 5-section layout actually reads like a calm consultant — not a glossary of system jargon. No new workflows yet; Pack 12 comes after this passes.

## What changes

The Ask page already renders the 5 sections (`WHAT IT IS`, nav trail, `FIRST 90 SECONDS` + `Say this`, `IF IT WORKS / IF IT DOESN'T`, `MORE HELP`). The fix is **content**, not layout — every Pack 10/11 entry currently has the right shape but jargon-heavy wording and uneven plain-language coverage.

### Entries to rewrite (21 total)

Pack 10 (revenue cycle, 12):
`ll_smarttool_missing`, `ll_smartset_order_set_missing`, `ll_claim_attachment_missing`, `ll_claim_refresh_vs_resubmit`, `ll_hb_account_status_dnb_or_billed`, `ll_claim_edit_workqueue_owner`, `ll_coverage_filing_order_term_delete`, `ll_account_activity_communication_needed`, `ll_charge_not_dropping_after_visit`, `ll_coverage_insurance_scan_or_card_missing`, plus the 2 DNB / clearinghouse helpers.

Pack 11 (provider, 9):
`ll_provider_inbasket_folder_filter_overload`, `ll_provider_inbasket_result_or_refill_followup`, `ll_smarttools_placeholder_prompt_unresolved`, `ll_smartset_section_or_order_not_selected`, `ll_inpatient_clinical_review_data_hidden`, `ll_provider_note_copy_forward_or_refresh_wrong`, `ll_surgical_workflow_case_ready_blocked`, `ll_radiant_protocol_ready_for_exam_blocked`, `ll_prescription_printer_routing_wrong`.

### Per-entry rewrite (all 5 sections)

For each entry, rewrite the source strings used by the renderer:

1. **What it is** — `summary` becomes ONE plain sentence describing the situation in non-system words. Example: instead of "In Basket overload starts with folder, pool/proxy view, priority, due date, and owner before anyone bulk-resolves messages," → "Your inbox is full and the filters are hiding the messages that actually need a reply."

2. **Navigation trail** — `nav_trail` uses generic screen names (no vendor terms beyond the existing trademark line), arrow-separated, with what the user clicks. Add it to any Pack 10/11 entry that's missing one.

3. **First 90 seconds** — the per-entry `liveGuide` block in `launch-library.ts` (`doThisFirst`, `whereToLook`, `whatToClick`, plus a short `whatToSay`) rewritten in short, concrete sentences a new hire can follow. One "Say this" line, ≤24 words, in everyday speech.

4. **If it works / if it does not** — `whatShouldHappen` becomes a one-line success cue ("The message moves out of your inbox and the next owner sees it."). `ifYouDontSeeIt` becomes a one-line blocker + concrete next step. `whenToEscalate` becomes a single sentence naming the role/team (not a vendor product) and what to capture.

5. **More help** — verify `related_ids` point at Mizly playbooks/checklists/videos that actually exist; remove dead refs.

### Quality bar (applied to every entry)

- Reading level: short sentences, no acronyms without a plain gloss the first time. "DNB" → "not yet billed", "pool/proxy view" → "the inbox you're looking at (yours, a shared queue, or someone you cover)".
- No location/site/vendor product names beyond what the trademark line already permits.
- No PHI, no source filenames, no copied tip-sheet language.
- Every "If it does not" ends with a role/team owner (e.g. "billing owner", "clinical informatics", "device support").

## Files touched

- `src/lib/launch-library.ts` — rewrite `summary`, `nav_trail`, `first90`, `whatToSay`, `whatToCheck`, `whenToEscalate` on the 21 entries; rewrite their matching `liveGuide` blocks (`doThisFirst`, `whereToLook`, `whatToClick`, `whatShouldHappen`, `ifYouDontSeeIt`, `whatToSay`).
- No changes to: `_authenticated.ask.tsx` renderer, routing, auth, Supabase, Stripe, payments, visual SVGs, or any non-Pack-10/11 entry.

## Verification

- Build passes.
- Spot-check the user's 8 reported phrases ("provider in basket overflowing", "smarttool placeholder", "smartset hidden order", "inpatient clinical review labs", "note copy forward old assessment", "surgical preop blocked", "radiant ready for exam blocked", "print prescriptions wrong printer") in `/ask` and confirm: matched entry is the intended Pack 11 one, all 5 sections render, and each section reads in plain words.
- Source-safety scan: no new vendor product names, no source filenames, no PHI in the rewritten strings.

## Out of scope (intentionally)

- Pack 12 new workflows from the Source Intelligence bundle.
- Visual SVG mocks.
- `/ask` UI layout changes.
- Anything in `_deferred/payments`, auth, or routing.

After you approve, I'll do the rewrites in a small number of batched edits and report back with the verification spot-checks.