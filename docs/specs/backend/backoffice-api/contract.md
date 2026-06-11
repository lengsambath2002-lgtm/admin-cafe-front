# backoffice-api — Contract

Admin/back-office API contract (products, categories, orders mgmt, reports,
transactions, uploads). Machine spec in `openapi.yaml`. Source of truth: the
backend repo `D:/admin-cafe` (`/v3/api-docs`).

## Surface (high level)
- Products / Categories CRUD + lock/unlock
- Orders: list, update status, update, cancel
- Reports: summary, revenue-series, top-products, kpis, export
- Transactions + refund
- Upload (image → Supabase)
