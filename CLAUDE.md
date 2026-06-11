# CLAUDE.md — Brewmaster

Café back-office + customer ordering platform with KHQR (Bakong) payments.
Spring Boot + Next.js + (future) native mobile (Swift / Kotlin) + Postgres/Supabase.
The repo is shared across PO, QA, Dev, Mobile, DevOps, and PM. This file is the
cross-cutting policy that keeps roles from stepping on each other.

> New to the project? See docs/roles-and-flows.md for the visual version.

> **Repo layout (this project):** this repo (`brewmaster-admin`) is the **Next.js
> frontend**. The **Spring backend** is a *separate* repo at `D:/admin-cafe`
> (its `mobile-api` ≈ the `/api/khqr/*`, `/api/guest/*` surface). Image storage
> is Supabase; deploy is currently Render (DEV→…→PROD is the target model).

## 1. Role identification first

At the start of every session, identify which role the user holds (PO / QA /
Dev / Mobile / DevOps / PM). One role is primary (sets default voice); others
are secondary (unlock additional write scopes without re-prompting). If
unknown, ask immediately and save the answer to memory.
Tech Lead is a Dev with cross-cutting authority — same write scope as Dev.
If the user is Mobile, ask which platform they own — iOS or Android — since the
role splits by platform and write scope differs (mobile/ios vs mobile/android).
Save the answer to memory.

## 2. Team scopes

| Role   | Owns (write)                                          | Reads    |
| ------ | ----------------------------------------------------- | -------- |
| PO     | docs/po/ (briefs, prototypes — web/ + mobile/)        | all docs |
| QA     | docs/qa/ (bugs, feature test cases)                   | all docs |
| Dev    | docs/specs/, frontend (this repo), backend (D:/admin-cafe), root configs | all docs |
| Mobile | mobile/ (iOS + Android apps), docs/specs/mobile/      | all docs |
| DevOps | docs/devops/, infra/, CI config                       | all docs |
| PM     | docs/pm/ (sprint plans, decisions, risks, retros)     | all docs |

Mobile is one role held by two platform owners (iOS=Swift, Android=Kotlin).
Mobile consumes the backend mobile-api but never writes it (§3).
CI/CD variables and secrets live in the deploy provider's settings, never the
repo (no `.env`, creds, Supabase service-role key, or mobile signing keys).

## 3. Workflow direction

Feature flow: PO writes brief in docs/po/ → Dev translates to a spec under
docs/specs/ → Dev implements. Dev never writes inside docs/po/; if a brief is
wrong or ambiguous, Dev files via docs/po/change-requests.md.

Mobile flow: PO writes brief → Mobile writes the client spec under
docs/specs/mobile/ → Mobile implements in mobile/ios and mobile/android.
Mobile consumes the backend mobile-api but never writes it; new or changed
endpoints, fields, or error contracts are requested via
docs/specs/backend/mobile-api/change-requests.md, which backend Dev owns.

Infra flow: Dev (or PO) requests an infra change → DevOps writes a runbook or
short spec in docs/devops/ → DevOps implements → Dev smoke-verifies. Dev never
edits docs/devops/ directly; requests go to docs/devops/change-requests.md.

PM coordination: PM reads all flows + the bug registry, maintains sprint plans
and the decision log under docs/pm/, and tracks Definition of Done.

## 4. Bug registry

Path: docs/qa/bugs/BUG-<AREA>-<###>.md
Starter areas: AUTH, API, UI, DATA, INTEGRATION, INFRA, MOBILE, PAYMENT.
For MOBILE bugs, note the platform (iOS / Android) in the title.
Frontmatter: id, title, area, severity, status, reporter, assignee, opened,
resolved, spec_ref, platform, environment.
Status lifecycle: open → in-progress → resolved → closed (or wont-fix).
QA normally closes; Dev may close when QA capacity is low, flagging QA after.

## 5. Always check bug status before acting

Before working on or referencing a bug, read its frontmatter. Don't reopen
closed/wont-fix bugs without filing a new ID.

## 6. Communication conventions

- docs/po/change-requests.md — Dev → PO request log
- docs/devops/change-requests.md — Dev → DevOps request log
- docs/specs/backend/<module>/ — backend Dev publishes each module's API
  contract (contract.md + openapi.yaml). For mobile-api, change-requests.md in
  that folder is the Mobile → backend Dev request log.
- docs/pm/decisions.md — decision log (what, when, why, by whom)
- Cross-linking: bug ↔ spec ↔ MR via IDs. PR body refs the spec section and
  any related BUG-* IDs.
- Feature test case pairs: docs/qa/features/FEAT-<area>-<slug>.md

## 7. Definition of Done

A feature is done when: 1) spec is signed off, 2) code is merged, 3) QA test
case passes, 4) no open or in-progress bugs against it. PM (or PO if no PM)
tracks these four per feature and unblocks whichever is missing.

## 8. PR and commit naming

Prefixes: feat, fix, spec, brief, qa, infra, chore, refactor, docs.
Title: <prefix>(<scope>): <summary>
e.g. feat(khqr): poll payment status in the QR modal
PR body references bug IDs (BUG-PAYMENT-014) and spec sections.

## 9. Behavior rules

- Never rename load-bearing dirs without confirming.
- Keep docs short — single-purpose, no fluff.
- If a write would land in another role's folder, file a change-request instead.
- Secrets in deploy-provider settings only. Never commit .env, creds, the
  Supabase service-role key, or mobile signing keys.
