# mobile-api — Contract

Backend Dev publishes the mobile-api contract here (machine spec in
`openapi.yaml`). Mobile consumes it; contract changes are requested via
`change-requests.md` in this folder.

> Source of truth for the live spec: the backend repo `D:/admin-cafe`
> (`/v3/api-docs`). Keep `openapi.yaml` here in sync, or link the exported file.

## Surface (current, high level)
- **Auth:** `POST /api/login`, `POST /api/logout`, `GET /api/me`
- **Guest (no auth):** `GET /api/guest/products`, `GET /api/guest/categories`,
  `POST /api/guest/orders`
- **KHQR:** `POST /api/khqr/orders/{id}`, `POST /api/khqr/check`,
  `POST /api/khqr/verify`, `POST /api/khqr/individual|merchant`,
  `POST /api/khqr/decode|decode-non-khqr`, `POST /api/khqr/deeplink`
- **Orders:** `GET /api/orders`, `/api/orders/guest`, `/api/orders/paid`, …

## Notes
- KHQR `check` payload is `{ orderId, md5 }` → `{ paid, responseCode, message }`.
- Amounts are rounded to 2 decimals server-side before KHQR generation.
