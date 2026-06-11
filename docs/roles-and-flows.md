# Roles & Flows — Brewmaster

Visual guide to who owns what and how work flows. See `CLAUDE.md` for the rules.

## Ownership map

```mermaid
flowchart LR
    PO --> POf["docs/po/<br/>briefs, prototypes (web/mobile)"]
    QA --> QAf["docs/qa/<br/>bugs, test cases"]
    Dev --> Devf["docs/specs/, frontend (repo),<br/>backend (D:/admin-cafe), root configs"]
    Mob["Mobile (iOS + Android)"] --> Mobf["mobile/ios, mobile/android<br/>docs/specs/mobile/"]
    DevOps --> DOf["docs/devops/, infra/, CI"]
    PM --> PMf["docs/pm/<br/>decisions, risks, retros"]
```

## Feature + cross-role asks

Solid = forward flow. Dotted = ask another role (never edit their folder — file
a change-request).

```mermaid
flowchart TB
    PO -->|"1. brief"| Brief["docs/po/..."]
    Brief -->|"2. Dev reads"| Dev
    Dev -->|"3. spec"| Spec["docs/specs/..."]
    Dev -->|"4. implement"| Code["frontend + backend"]
    Code -->|"5. QA tests"| QA
    QA -->|"6a. pass"| DoD{"Definition of Done"}
    QA -->|"6b. fail"| Bug["BUG-AREA-###"]
    Bug -.->|fixes| Dev

    Brief -->|"2m. Mobile reads"| Mob["Mobile"]
    Mob -->|"3m. mobile spec"| MSpec["docs/specs/mobile/..."]
    Mob -->|"4m. implement"| MCode["mobile/ios + mobile/android"]
    Mob -.->|"need API change?"| CRMA["docs/specs/backend/<br/>mobile-api/change-requests.md"]
    CRMA -.->|"backend Dev owns mobile-api"| Dev

    Dev -.->|"brief ambiguous?"| CRPO["docs/po/change-requests.md"]
    Dev -.->|"need infra/CI?"| CRDO["docs/devops/change-requests.md"]
    CRDO -.-> DevOps
    PM ==>|"reads all, tracks DoD"| DoD
```

## Chat ↔ docs boundary

| Use chat for | Use docs for |
| --- | --- |
| "Is it deployed yet?" | the deploy log / a postmortem if it broke |
| "KHQR flaky again?" | if real, a bug (PAYMENT/MOBILE area) |
| "add one field?" quick ask | a CR in `mobile-api/change-requests.md` |
| "Postgres 16 or 17?" | the decision in `docs/pm/decisions.md` |

**Promotion rule:** when a thread reaches a conclusion, write it to the matching
doc before the thread dies. 6-month test: if a new joiner couldn't find it, it
doesn't belong only in chat.

## I need to… → go here

| I need to… | Go to |
| --- | --- |
| write/clarify a feature brief | `docs/po/` (PO) — Dev asks via `docs/po/change-requests.md` |
| write a technical spec | `docs/specs/` (Dev) |
| ask backend for an API change | `docs/specs/backend/mobile-api/change-requests.md` |
| file a bug | `docs/qa/bugs/BUG-<AREA>-<###>.md` |
| record a decision | `docs/pm/decisions.md` |
| request infra/CI/deploy | `docs/devops/change-requests.md` |
