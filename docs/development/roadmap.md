# Development milestones

TrackLab remains local. GitHub pushes save development milestones and run checks; they do not authorize deployment. Atlas uses the dedicated `tracklab_dev` database. Credentials and local runtime data must never be committed.

## Push workflow

1. Implement one coherent phase or important task.
2. Run the checks relevant to that change and document their actual results.
3. Stage source and documentation, then run `npm run check:secrets`.
4. Commit with a concrete description and push to the existing GitHub repository.
5. Inspect CI. Fix failures in a follow-up commit rather than presenting an unverified phase as complete.

The initial commit records the existing working development baseline together. Future work is split into reviewable task commits. A pushed milestone is not a claim that every release criterion for its phase is finished.

## Current phase status

| Phase | Implemented baseline | Outstanding work |
| --- | --- | --- |
| 1 · Foundation | React/Vite and Express/TypeScript structure; shared domain schemas; themes; routes; environment templates | Continue extracting feature modules as features grow |
| 2 · Database and security | Atlas database, indexes, backend sessions, CSRF, account recovery/verification logic, transaction-backed business quotas, Redis adapter | Verify Redis across live clients; SMTP delivery; complete security review |
| 3 · Catalog and administration | API-backed demo catalog, unique variants, draft manufacturer reference, admin record editing, archival snapshots | Brand/source/media management, per-field provenance, permission review, verified manufacturer variants |
| 4 · 2D builder | Shared configuration, original layered SVG, selections, finish changes, view controls, undo/redo | Broader component slots, responsive interaction polish, guest draft transitions |
| 5 · Compatibility | Compatible/incompatible/unverified results, affected slots and missing data, illustrative calculations | Additional real component interfaces and verified measurements |
| 6 · 3D builder | Eleven original registered schematic GLBs, lazy viewer, orbit controls, shared configuration, preview authorization | Licensed authentic assets; more camera presets; loading/performance checks |
| 7 · Garage | Private ownership, create/update/delete/duplicate, active/history limits, editor leases, publishing limits, JSON exports | Screenshot export; additional conflict and browser coverage |
| 8 · Pricing | Provider interface, exact-match/staleness guard, disabled feature | Authorized source and tested adapter required before enabling |
| 9 · PWA and responsive behavior | Manifest/icons, service worker configuration, offline page, adaptive layouts | Verify navigation/offline behavior; exclude 3D assets from initial precache; mobile selection sheet |
| 10 · Release | Local checks, browser workflows, preparatory hosting manifests | Full release audit and monitoring; deployment explicitly deferred by the user |

## Verified baseline

On 27 October 2026: Atlas connectivity and transactions passed. A temporary account, saved build, session and creation quota survived a complete API/database reconnection; the fixture was removed afterward. TypeScript and lint passed. The latest isolated Vitest run passed 34 tests and skipped the live Redis test because no test Redis server was configured. Four existing browser workflows were checked during implementation; local browser tests must be isolated from Atlas before relying on repeatable regression runs.

## Next tasks

1. Isolate browser test servers and credentials from the local Atlas environment.
2. Fix and verify service-worker navigation and initial 3D loading.
3. Improve guest draft/allowance transitions and their regression coverage.
4. Extend catalog provenance and review tooling before publishing manufacturer records.
