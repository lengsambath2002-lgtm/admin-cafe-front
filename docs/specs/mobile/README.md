# Mobile Client Specs

Mobile-owned. Each feature gets a client spec (screen flow, state, local
storage, offline/error/retry, platform notes, test hooks) that translates a PO
brief into the app's perspective. It *references* the backend contract under
`docs/specs/backend/mobile-api/` — it never restates it. Missing contract bits
are requested via that folder's `change-requests.md` (CR-MA-###).

Naming: `<feature>-mobile-spec.md`. Apps not started yet (`mobile/ios`,
`mobile/android`).
