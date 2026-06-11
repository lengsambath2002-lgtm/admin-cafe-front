# Deploy Runbook — Brewmaster

DevOps authors; Dev reads. Secrets in provider settings only.

## Current state
- **Frontend** (`brewmaster-admin`, Next.js) -> Render.
- **Backend** (`D:/admin-cafe`, Spring Boot) -> Render (`admin-cafe-back-1.onrender.com`).
- **Storage:** Supabase (bucket `cafe`); backend uploads with the service-role key.
- Free tier -> cold starts (~30-50s); disk is ephemeral (don't store uploads on it).

## Target promotion model (framework)
| Env  | Trigger     | Audience        | Promotes from |
| ---- | ----------- | --------------- | ------------- |
| DEV  | push        | devs            | -             |
| SIT  | merge       | QA              | DEV           |
| UAT  | manual      | PO/stakeholders | SIT           |
| PROD | manual job  | everyone        | UAT           |

## Backend env vars (set in provider, not repo)
- `SUPABASE_*` (storage), `KHQR_BAKONG_API_TOKEN`, `KHQR_BAKONG_ACCOUNT_ID`,
  `KHQR_BAKONG_API_BASE_URL` (prod vs SIT), DB connection.

## Per-env: trigger - smoke - rollback
- Smoke: load `/`, login, place an order, generate a KHQR.
- Rollback: redeploy previous image / revert the release commit.

## Mobile release (separate)
App Store / Play (or internal distribution); signing keys live OUTSIDE the repo.
