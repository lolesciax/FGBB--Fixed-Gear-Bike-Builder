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
| 2 · Database and security | Atlas database, indexes, backend sessions, CSRF, account recovery/verification logic, transaction-backed business quotas, Redis adapter; two-client Redis race verified in CI | SMTP delivery; complete security review; production Redis configuration remains deferred |
| 3 · Catalog and administration | API-backed demo catalog, unique variants, draft manufacturer reference, admin record editing, archival snapshots | Brand/source/media management, per-field provenance, permission review, verified manufacturer variants |
| 4 · 2D builder | Shared configuration, original layered SVG, selections, finish changes, view controls, undo/redo | Broader component slots, responsive interaction polish, guest draft transitions |
| 5 · Compatibility | Compatible/incompatible/unverified results, affected slots and missing data, illustrative calculations | Additional real component interfaces and verified measurements |
| 6 · 3D builder | Eleven original registered schematic GLBs, lazy viewer, orbit controls, shared configuration, preview authorization | Licensed authentic assets; more camera presets; loading/performance checks |
| 7 · Garage | Private ownership, create/update/delete/duplicate, active/history limits, editor leases, publishing limits, JSON exports | Screenshot export; additional conflict and browser coverage |
| 8 · Pricing | Provider interface, exact-match/staleness guard, disabled feature | Authorized source and tested adapter required before enabling |
| 9 · PWA and responsive behavior | Manifest/icons, tested online/offline navigation, API cache exclusion, deferred 3D downloads, adaptive layouts | Update notification UX, device installation checks, mobile selection sheet |
| 10 · Release | Local checks, browser workflows, preparatory hosting manifests | Full release audit and monitoring; deployment explicitly deferred by the user |

## Verified baseline

On 27 October 2026: Atlas connectivity and transactions passed. A temporary account, saved build, session and creation quota survived a complete API/database reconnection; the fixture was removed afterward. TypeScript and lint passed. The local baseline Vitest run passed 34 tests and skipped the live Redis test because no test Redis server was configured. The initial GitHub CI run passed all 35 tests, including the two-client atomic Redis quota race, and all four browser workflows: [baseline CI evidence](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40503274845).

## Task · Browser-test isolation

- Implemented an isolated API on port 4010, frontend on port 5190, temporary MongoDB replica set, and independent test session secret. Inherited Atlas, Redis, SMTP and frontend API credentials are replaced before child processes start.
- The launcher waits for the test API and checks its ephemeral mode before starting the frontend. Playwright refuses to reuse an existing development server. The Atlas-backed app remains on ports 4000/5180.
- Local verification: all four Chromium workflows passed against the new isolated launcher. TypeScript and lint passed. A regression test covers removal of inherited external service credentials.
- Remaining dependencies: browser performance/offline checks and additional guest-transition coverage. No deployment was performed.

## Next tasks

1. Isolate browser test servers and credentials from the local Atlas environment — implemented and verified.
2. Fix and verify service-worker navigation and initial 3D loading — implemented and verified.
3. Improve guest draft/allowance transitions and their regression coverage.
4. Extend catalog provenance and review tooling before publishing manufacturer records.

## Task · PWA navigation and deferred 3D loading

- Replaced the unconditional offline navigation fallback with online network navigation and an offline fallback only when navigation fails. API routes are excluded, and no API/account responses are stored in Cache Storage.
- Restricted precaching to offline support assets and icons. The generated precache fell from about 2.3 MB to 17.61 KiB. The 3D bundle and GLBs remain on demand.
- Added an isolated production-preview test configuration. Both browser checks passed: online deep-link reload plus offline/reconnect behavior; and no initial 3D download or API response caching. TypeScript and lint passed.
- Added these production-build browser checks to CI after the normal browser workflows. This runs on loopback and does not deploy anything.
- Remaining dependencies: browser/device installability checks, update notification UX, and responsive selection-sheet work.
