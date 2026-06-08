# Mizly for Organizations — Architecture Spec

Status: Draft v1 (spec only, no code or schema changes yet)
Scope: Architecture for org-owned content → approved, real-time ATE support.
Guardrails:
- Do not expose uploaded raw files learner-facing unless approved.
- Do not allow cross-organization retrieval.
- Learners only see approved published content.
- No changes to payments/auth in this phase.
- Do not touch existing public Mizly demo content.

---

## 1. Product summary

Mizly for Organizations lets a healthcare organization (hospital, health
system, consulting firm) bring its own go-live materials into Mizly:

- documents (tip sheets, SOPs, downtime guides, escalation matrices)
- screenshots (workflow captures)
- short videos and transcripts
- structured Ask answers

Mizly ingests, scans, redacts, reviews, and publishes that content as
ATE-ready answers scoped to the organization. Learners inside the
organization see only approved, published answers from their own org plus
(optionally) the shared Mizly public library.

---

## 2. Tenancy model

### 2.1 Entities

- `organization` — top-level tenant (e.g. "Northstar Health").
- `workspace` — an org can have multiple workspaces (e.g. per go-live,
  per hospital, per service line). All content and access live under a
  workspace.
- `membership` — links a user to a workspace with a role.
- `org_invite` — pending invitations (email + role + workspace).

### 2.2 Roles (workspace-scoped)

| Role               | Can upload | Can review | Can approve | Can publish | Can view approved | Can see raw uploads |
| ------------------ | ---------- | ---------- | ----------- | ----------- | ----------------- | ------------------- |
| `org_owner`        | ✓          | ✓          | ✓           | ✓           | ✓                 | ✓                   |
| `org_admin`        | ✓          | ✓          | ✓           | ✓           | ✓                 | ✓                   |
| `content_lead`     | ✓          | ✓          | ✓           | —           | ✓                 | ✓                   |
| `reviewer`         | —          | ✓          | —           | —           | ✓                 | ✓ (review only)     |
| `ate_consultant`   | —          | —          | —           | —           | ✓                 | —                   |
| `learner`          | —          | —          | —           | —           | ✓                 | —                   |

Cross-organization access is impossible by construction: every row in every
org table carries `workspace_id`, and every read is scoped via RLS to
workspaces the caller has membership in.

---

## 3. Content lifecycle

```text
upload  →  ingest  →  scan (PHI/risk)  →  redact/normalize  →  review queue
       →  approve  →  publish  →  retrievable as Ask answer (ATE Mode)
                                  │
                                  └─ visible to learners (approved only)
```

Every artifact carries:
- `workspace_id`
- `content_status`: `uploaded | ingesting | scanned | needs_review | approved | published | rejected | archived`
- `risk_status`: `unknown | clean | needs_redaction | redacted | blocked`
- `visibility`: `internal_admin_only | reviewer_only | learner_published`
- audit fields: `uploaded_by`, `reviewed_by`, `approved_by`, `published_by`, timestamps, version.

Raw uploads stay in a private storage bucket. They become learner-visible
ONLY when an approver publishes a derived, sanitized artifact (Ask answer,
tip sheet, visual guide, or video chapter).

---

## 4. Data model (proposed; no SQL in this phase)

All tables live in `public.` with RLS on, GRANTs to `authenticated` and
`service_role`, and a `workspace_id` scope.

### 4.1 Tenancy
- `organizations` — name, slug, plan_tier, created_by.
- `workspaces` — organization_id, name, slug, go_live_date, brand_settings (logo, color tokens).
- `memberships` — workspace_id, user_id, role, status (`active|invited|suspended`).
- `org_invites` — workspace_id, email, role, token, expires_at.

### 4.2 Uploads & ingestion
- `org_documents` — workspace_id, title, source_type (`tip_sheet|sop|downtime|escalation|other`), storage_path, original_filename, mime, content_status, risk_status, version.
- `org_screenshots` — workspace_id, document_id (nullable), storage_path, caption, asset_type (`raw_screenshot|cleaned_svg|redrawn_mock|rights_cleared_screenshot`), rights_status, redaction_status, learner_visible.
- `org_videos` — workspace_id, storage_path, duration_sec, ingestion_status, transcript_status.
- `org_video_chapters` — video_id, start_sec, end_sec, chapter_title, summary, learner_clip_url (nullable), qa_status.

### 4.3 Risk & review
- `risk_scans` — artifact_ref (table + id), scan_version, findings (jsonb of detected PHI/PII categories, locations, confidence), overall_status, scanner_notes.
- `review_tasks` — workspace_id, artifact_ref, assigned_to, state (`open|in_review|approved|rejected|changes_requested`), reviewer_notes, sla_due_at.
- `audit_log` — workspace_id, actor, action, artifact_ref, before/after snapshot, ip, user_agent.

### 4.4 Published learner-facing content
- `org_ask_answers` — workspace_id, ask_id (slugged), title, short_answer, live_guide (jsonb: do_first, where_to_look, what_to_click, what_should_happen, if_you_dont_see_it, what_to_say, check_this, escalate_when), source_refs (document_id / chapter_id / screenshot_id), publish_status, version, published_at.
- `org_tip_sheets` — workspace_id, ask_id, layout_template, brand_settings_snapshot, pdf_path, published_at.
- `org_visual_guides` — workspace_id, ask_id, visual_mode (`internal_reference|public_realistic_visual`), public_visual_status, realistic_visual_key, callouts (jsonb).
- `org_video_clips` — workspace_id, ask_id, chapter_id, learner_clip_url, footer_disclaimer_locked, qa_status.

### 4.5 Analytics
- `org_ask_events` — workspace_id, user_id, query_text_hash, matched_ask_id, mode (`answer|say|escalate`), outcome (`helpful|not_helpful|escalated|no_match`), timestamp. Query text is hashed; raw text retained only with consent.
- `org_content_coverage` — workspace_id, ask_id, has_answer, has_visual, has_video, last_reviewed_at.

---

## 5. Storage layout (private buckets)

Two new private buckets (alongside existing `videos`, `documents`):

- `org-uploads/{workspace_id}/documents/{doc_id}/{filename}`
- `org-uploads/{workspace_id}/screenshots/{shot_id}.{ext}`
- `org-uploads/{workspace_id}/videos/{video_id}.{ext}`
- `org-published/{workspace_id}/tip-sheets/{ask_id}-v{n}.pdf`
- `org-published/{workspace_id}/clips/{ask_id}-v{n}.mp4`
- `org-published/{workspace_id}/visuals/{ask_id}-v{n}.svg`

Storage RLS: object path must start with `{workspace_id}/` and the caller
must have an active membership in that workspace. Service role used only
inside server fns / verified webhooks.

---

## 6. Ingestion pipeline

All ingestion runs in `createServerFn` handlers (app-internal) and a
small number of `/api/public/*` webhook routes for long-running jobs.

1. **Upload** — signed upload to `org-uploads/...` via server fn that
   verifies workspace membership + upload role.
2. **Extract** — PDF/Doc → text + page screenshots. Video → audio →
   transcript + chapter candidates. Screenshot → OCR text + UI region map.
3. **Normalize** — strip vendor chrome, neutralize branding tokens,
   convert to internal "workflow fragment" shape.
4. **PHI / risk scan** — see §7. Writes `risk_scans` row.
5. **Auto-tag** — propose `ask_id`s and topic tags from the existing
   Mizly taxonomy; reviewer can edit.
6. **Queue** — create `review_tasks` rows for the workspace's reviewer pool.

Status is exposed in an "Ingestion" admin view: per-artifact progress,
errors, retry button (admin only).

---

## 7. PHI / risk scanner

Goal: never publish PHI, credentials, vendor IP, or private links.

### 7.1 Detectors (layered)
- Regex: MRN-like patterns, SSN, DOB, phone, email, account numbers,
  internal URLs, IPs, passwords/tokens, common vendor product strings.
- Named-entity: person names, org names, addresses (via Lovable AI gateway).
- Visual (screenshots): OCR pass + face/handwriting detection + EHR
  banner detection.
- Heuristics: 18 HIPAA identifiers checklist; "private link" allowlist.

### 7.2 Decision matrix

| Finding                                 | risk_status         | Default action                      |
| --------------------------------------- | ------------------- | ----------------------------------- |
| No findings                             | `clean`             | move to review                      |
| PHI/PII detected, auto-redactable       | `needs_redaction`   | auto-redact draft + flag reviewer   |
| PHI/PII detected, not auto-redactable   | `needs_redaction`   | block until human redaction         |
| Credentials/tokens                      | `blocked`           | hard block; require new upload      |
| Vendor brand/screens (unlicensed)       | `needs_redaction`   | route to "Visual Mode" redraw queue |

### 7.3 Output
- `risk_scans.findings` (jsonb) with category, location (page/region/timestamp), confidence, suggested_action.
- Reviewer UI shows side-by-side: original vs redacted draft.

---

## 8. Review & approval

- Review queue per workspace, filterable by `content_status`, `risk_status`, reviewer.
- Reviewer actions: `request_changes`, `redact_and_approve`, `approve`, `reject`.
- Approval requires `risk_status ∈ {clean, redacted}` and a non-empty
  derived artifact (Ask answer / tip sheet / visual / clip).
- Publish is a separate action (org_admin / org_owner): flips
  `visibility=learner_published` and writes a versioned published row.
- Every state change appends to `audit_log`.

---

## 9. Ask scoping (org-aware retrieval)

Retrieval pipeline (server-fn, RLS-scoped):

1. Resolve caller's `workspace_id` from membership (the user picks an
   active workspace; stored in session).
2. Candidate set = `org_ask_answers` where
   `workspace_id = :caller_ws AND publish_status = 'published'`.
3. Optionally union with the public Mizly demo library when the workspace
   has `include_public_library = true` (default off for paid orgs).
4. Rank by lexical + embedding similarity within the candidate set only.
5. Never fall back to another org's content. If nothing matches, return
   "No approved answer yet — open a content gap" with a button that files
   a `content_gap` task for `content_lead`s.

ATE Mode (Answer / Say this / Escalate) reads the same `live_guide` jsonb
already used by the public demo, just sourced from `org_ask_answers`.

---

## 10. Learner-facing surfaces

- `/ask` — org-scoped Ask. Returns ATE Mode answer card with the three
  tabs. Visual aids and clips are pulled only from
  `learner_published`-visibility rows in the same workspace.
- `/videos` — learner-published `org_video_clips` for the workspace.
- `/tip-sheets` — published org tip sheets (PDF + inline render),
  branded with workspace logo/colors.
- Raw uploads are NEVER linked from learner routes. Storage URLs are
  signed and short-lived, generated only inside admin server fns.

---

## 11. Admin surfaces (new routes, all under `_authenticated/admin/org/`)

- `/admin/org/workspaces` — list/create workspaces, brand settings, invites.
- `/admin/org/members` — role management, invite acceptance.
- `/admin/org/uploads` — upload + ingestion status.
- `/admin/org/review-queue` — review tasks with PHI scan side-by-side.
- `/admin/org/answers` — approved Ask answers, versions, publish controls.
- `/admin/org/visuals` — Visual Mode pipeline (internal reference vs public realistic visual), reuses existing visual-mode registry shape.
- `/admin/org/videos` — clip pipeline, QA status, footer disclaimer lock.
- `/admin/org/tip-sheets` — branded PDF generator.
- `/admin/org/analytics` — see §13.
- `/admin/org/audit` — audit_log viewer.

All gated by workspace role (see §2.2). No route exposes data from
another workspace, even to org_owner.

---

## 12. ATE Mode (org)

Reuses the existing Ask `ATE Mode` tab system (Answer / Say this /
Escalate). Source of truth per answer is `org_ask_answers.live_guide`.

- **Answer**: compact First 90 seconds + What should happen / If you don't see it.
- **Say this**: pulls `live_guide.what_to_say`, plus additional phrasing
  from the answer body when present.
- **Escalate**: pulls `live_guide.escalate_when`, plus workspace
  escalation matrix (from `org_documents` of type `escalation`) so the
  named owner (e.g. "Command Center x4321") is org-specific.

---

## 13. Analytics (admin only, workspace-scoped)

KPIs:
- Asks per day, per role, per shift
- Match rate (answer found vs no-match)
- Mode mix (Answer / Say this / Escalate)
- Top escalations (who, why, how often)
- Content coverage gaps (asks with no published answer)
- Time-to-publish (upload → published)
- Reviewer throughput and SLA

Privacy:
- Query text stored as salted hash by default.
- Raw text retained only when workspace toggles "Retain query text for QA"
  (off by default) and a banner tells learners.
- No cross-org aggregation in the product UI.

---

## 14. Security model

- Every org table: RLS on; policies use a `has_workspace_role(_user_id, _workspace_id, _role[])` SECURITY DEFINER helper (mirrors the existing `has_role` pattern).
- Storage RLS on `storage.objects` keyed off the `{workspace_id}/` path prefix + membership.
- Service role used only inside `createServerFn` handlers and verified `/api/public/*` webhooks; never imported into client-reachable modules at module scope.
- No cross-org joins anywhere — enforced by always selecting through the helper.
- Audit log is append-only (no UPDATE/DELETE policies; service role only).
- PHI scanner is mandatory before approval; approval action checks
  `risk_status` server-side (not just client UI).
- Rate-limits on upload + retrieval per workspace.

---

## 15. Build phases

Phase 0 — Spec (this document).

Phase 1 — Tenancy foundation
- organizations, workspaces, memberships, org_invites
- `has_workspace_role` helper + RLS pattern
- workspace switcher in app shell (admin only at first)

Phase 2 — Upload + ingestion
- org-uploads bucket + storage RLS
- org_documents / org_screenshots / org_videos upload server fns
- ingestion status UI

Phase 3 — Risk scanner + review queue
- risk_scans, review_tasks, audit_log
- reviewer UI with side-by-side redaction

Phase 4 — Approved learner content
- org_ask_answers, org_tip_sheets, org_visual_guides, org_video_clips
- publish workflow

Phase 5 — Org-scoped Ask + ATE Mode
- retrieval server fn restricted to workspace
- ATE Mode tabs sourced from org_ask_answers + escalation docs

Phase 6 — Analytics + content gap loop
- org_ask_events, org_content_coverage
- admin dashboards
- "No approved answer yet" → content_gap task

Phase 7 — Hardening
- penetration test against cross-org leakage
- load test ingestion pipeline
- legal review of footer disclaimers per workspace brand

---

## 16. Out of scope (this phase)

- Payments / billing for orgs (existing payments untouched).
- Auth provider changes.
- Public Mizly demo content (untouched).
- SSO / SAML (deferred; Lovable Cloud supports it when needed).
- Native mobile apps.

---

## 17. Open questions

1. Default for `include_public_library` per paid workspace — opt-in or
   opt-out?
2. Who owns final publish authority — `org_admin` only, or also
   `content_lead` after dual reviewer sign-off?
3. Retention policy for raw uploads after a derived artifact is published
   (delete vs cold-store)?
4. Per-workspace branding scope — logo + color tokens only, or full
   theme override?
5. How aggressive should auto-redaction be vs always-human-in-the-loop?
