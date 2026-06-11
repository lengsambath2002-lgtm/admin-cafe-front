# Risk Register — Brewmaster

PM-owned.

Format:

    ### RISK-### — <title>
    - Area / owner:
    - Likelihood / impact: <low|med|high> / <low|med|high>
    - Mitigation:
    - Status: open | mitigated | accepted | closed
    - Opened:

## Risks

### RISK-001 — KHQR auto-detect needs a Bakong API token
- Area / owner: payment / Dev+DevOps
- Likelihood / impact: high / med
- Mitigation: set KHQR_BAKONG_API_TOKEN (+ real KHQR_BAKONG_ACCOUNT_ID) on the
  backend; until then `/api/khqr/check` errors and the QR modal shows "waiting".
- Status: open
- Opened: (recorded retroactively)

### RISK-002 — Guest payment can't auto-confirm
- Area / owner: payment / Dev
- Likelihood / impact: med / med
- Mitigation: guest QR is client-generated (no backend md5 record), so `check`
  404s. Needs a guest KHQR-generate endpoint that persists md5 if guest
  auto-confirm is required.
- Status: open
- Opened: (recorded retroactively)
