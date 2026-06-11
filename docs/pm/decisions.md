# Decision Log — Brewmaster

PM-owned. Append-only: don't edit past decisions — supersede with a new entry.

Format:

    ### DEC-### — <title>
    - Date / decided by:
    - Context: <the situation forcing a choice>
    - Decision: <what was decided>
    - Alternatives considered:
    - Consequences:
    - Supersedes: <DEC-### or —>

## Decisions

### DEC-001 — Image storage on Supabase (not backend local disk)
- Date / decided by: (recorded retroactively) / Dev
- Context: Render's ephemeral disk wiped uploaded images on redeploy → broken images.
- Decision: Store uploads in Supabase Storage; backend uploads with the
  service-role key and returns the public URL.
- Alternatives considered: Render persistent disk; S3/R2/Cloudinary.
- Consequences: images persist across deploys; service-role key kept server-side only.
- Supersedes: —

### DEC-002 — KHQR generation lives in the backend
- Date / decided by: (recorded retroactively) / Dev
- Context: Frontend `bakong-khqr` worked but the backend owns merchant config + order totals.
- Decision: Backend `/api/khqr/*` is the source of truth; frontend calls it.
  Guest checkout falls back to client-side generation (no backend auth).
- Alternatives considered: frontend-only generation.
- Consequences: consistent merchant config; payment auto-detect via `/api/khqr/check`.
- Supersedes: —
