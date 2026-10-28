# Development milestones

TrackLab remains local. GitHub pushes save development milestones and run checks; they do not authorize deployment. Atlas uses the dedicated `tracklab_dev` database. Credentials and local runtime data must never be committed.

## Push workflow

1. Implement one coherent phase or important task.
2. Run the checks relevant to that change and document their actual results.
3. Stage source and documentation, then run `npm run check:secrets`.
4. Commit with a concrete description and push to the existing GitHub repository.
5. Inspect CI. Fix failures in a follow-up commit rather than presenting an unverified phase as complete.

The initial commit records the existing working development baseline together. Future work is split into reviewable task commits. A pushed milestone is not a claim that every release criterion for its phase is finished.

## Current phase status after continuation audit

The [consolidated specification](../PROJECT_SPEC.md) adds UI/UX acceptance to every phase. No whole phase is claimed complete merely because its earlier functional milestone passed. Existing CI evidence remains valid for those tested behaviors, not for the new design criteria.

| Phase | Status | Verified/implemented behavior | Missing acceptance and next dependencies |
| --- | --- | --- | --- |
| 1 · Foundation and design system | Partially implemented | Established app/API/domain structure, routes and environment parsing | New graphite/blue tokens, readable controls and responsive shell; continue feature extraction |
| 2 · Authentication, database and security | Implemented but not fully verified | Atlas persistence, sessions, CSRF, account flows, transaction-backed quotas and Redis race tests | New responsive auth/settings presentation; SMTP delivery; complete security review; production Redis remains deferred |
| 3 · Brand/component catalog | Partially implemented | Source-reviewed Cinelli/Dosnoventa size variants, brand filters, independent preview provenance, safe rendering-metadata import, admin variant review, demos, archival snapshots | More real components/interfaces, structured editing beyond JSON, production catalog curation and authentic permitted models |
| 4 · 2D builder | Partially implemented | SVG configuration, finish changes, view controls, undo/redo, guest draft and quota transitions | Further device/accessibility review; independent pedals/brakes/accessories slots |
| 5 · Compatibility engine | Partially implemented | Three result states, affected slots, missing data and illustrative calculations tested | More real interfaces and verified measurements; integrated accessible status presentation |
| 6 · 3D builder | Partially implemented | Four camera presets, 14 independent illustrative frame GLBs, bounds-based fitting, lazy loading/retry, shared state and expiring preview grants tested | Authentic permitted surface models/graphics, selected-part highlighting and more device/performance coverage |
| 7 · My Garage | Partially implemented | Ownership, CRUD/duplicate, active/history limits, leases, visibility, owner SVG/JSON exports and optional existing-build autosave tested | Refined collection details/cards, raster export if required, additional conflict/browser coverage |
| 8 · Optional verified pricing | Blocked (optional integration) | Provider interface and fail-closed visibility guard; pricing disabled | An approved source/access and exact matching are required; continue other phases independently |
| 9 · PWA/mobile optimization | Partially implemented | Offline/reconnect, API cache exclusion and deferred 3D downloads tested | Physical device/keyboard coverage, device installation and update UX |
| 10 · Verification/release | Partially implemented; deployment held | CI runs lint, types, unit/API/Redis, browser, PWA and builds | Full cross-page visual/accessibility matrix, release audit and monitoring; deployment awaits explicit user authorization |

## Task · Brand rendering, studio presentation and bounded access policy — verified milestone, 28 October 2026

This implements the feasible application work in the [brand-authentic upgrade brief](../requirements/brand-authentic-upgrade.md). Authentic manufacturer surfaces and graphics remain unavailable; this milestone does not mark the entire branded experience or a release complete.

- Audit: the prior catalog already loaded sourced size/finish records from MongoDB and changed shared assembly anchors, rather than names alone. Tube/fork surfaces and non-frame components remained schematic, with no per-variant GLB. The previous landing was basic, thumbnails defaulted to a product's first variant, and policy defaults/UI used the earlier restrictive values. These were distinct data, rendering and experience issues.
- Added 14 separate original illustrative frame GLBs, source/anchor/license sidecars and a reproducible exporter. 2D, thumbnails and 3D use the same selected variant and frame-derived geometry. Improved paint treatment and drop/riser/bullhorn representation; added a clearly identified bullhorn demo. Exact tube sections, Rainbow graphics, model years and missing BCN measurements are not invented. Steel remains draft. Admin review shows actual variant previews and fidelity; publication checks require source/provenance/reviewed rendering metadata, while referenced technical variants remain immutable.
- Added front/rear/side/three-quarter camera presets, mesh-bounds camera fitting, on-demand local GLB loading, loading feedback and explicit missing-model retry with preserved configuration. Healthy 3D flows produced no browser page errors; the deliberately blocked GLB test generated its expected loading error and recovered successfully. [3D evidence](../design/frameset-glb-three-quarter.png).
- Reworked the landing into a responsive studio hero with a live illustrative bicycle, source-reviewed frame shelf, paired actions and dynamic account benefits. Added short dismissible frameset guidance. Before/after and mobile evidence are linked in the [design system](../DESIGN_SYSTEM.md).
- The latest brief explicitly supersedes the earlier request for unlimited development use. Guests receive 24 accepted replacements per rolling day and two ten-minute 3D sessions, with one memory-only draft. Reopening an active grant does not spend another session; expired grants return to 2D. Registered users have eight active builds, three daily/fifteen rolling-month creates, four public builds and eight combined SVG/JSON exports daily. Backend ownership, CSRF, compatibility and abuse limits remain enforced. Duplicate guest change requests are charged once through expiring hashed receipts, without storing guest configurations.
- Added bounded, versioned, admin-only policy editing with audit history and server-derived usage across registration, account, garage and builder. Existing over-limit records and usage histories are retained. Optional autosave updates an existing saved build only, reports saving/dirty/error states, pauses on failure and supports manual retry. Owner-authorized image export produces a self-contained 1600×1000 SVG; raster export is not claimed.
- Final local verification: 46 unit/API/asset tests passed; one live Redis test skipped because no local test Redis was configured. All 13 isolated Chromium workflows and both production-preview PWA tests passed. TypeScript, lint, web/API builds passed. SVG exports decoded in-browser at the expected dimensions. Browser tests used only their temporary database and ports 4010/5190. The existing large lazy 3D bundle warning and upstream Three.Clock deprecation remain.
- Non-destructive Atlas import/readback verified only `tracklab_dev`: 18 products and 14 registered frame-asset references, with the intended effective policy. No usage reset, build deletion or other database modification was performed. Credentials and runtime evidence remain ignored. No deployment occurred.
- Remaining dependencies: artist-produced Blender/CAD surfaces, exact permitted finish/decal assets and missing technical measurements; authentic fidelity cannot be asserted yet. Blender was unavailable here, so its documented workflow was not executed. More real component interfaces, structured admin editing, full admin browser coverage, physical-device/performance and assistive-technology review remain open. [Asset workflow](3d-production.md), [policy contract](access-policy.md).

## Verified baseline

On 27 October 2026: Atlas connectivity and transactions passed. A temporary account, saved build, session and creation quota survived a complete API/database reconnection; the fixture was removed afterward. TypeScript and lint passed. The local baseline Vitest run passed 34 tests and skipped the live Redis test because no test Redis server was configured. The initial GitHub CI run passed all 35 tests, including the two-client atomic Redis quota race, and all four browser workflows: [baseline CI evidence](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40503274845).

## Task · Browser-test isolation

- Implemented an isolated API on port 4010, frontend on port 5190, temporary MongoDB replica set, and independent test session secret. Inherited Atlas, Redis, SMTP and frontend API credentials are replaced before child processes start.
- The launcher waits for the test API and checks its ephemeral mode before starting the frontend. Playwright refuses to reuse an existing development server. The Atlas-backed app remains on ports 4000/5180.
- Local verification: all four Chromium workflows passed against the new isolated launcher. TypeScript and lint passed. A regression test covers removal of inherited external service credentials.
- Remaining dependencies: browser performance/offline checks and additional guest-transition coverage. No deployment was performed.

## Task · Development startup readiness and diagnostics — completed and verified, 28 October 2026

- Investigated reported 502 responses followed by lost Vite connection and refused catalog/workspace requests. Neither development port was listening when inspected. A clean start reached Atlas successfully. The original process-exit cause is unconfirmed without the preceding terminal output; it is not attributed to authentication or catalog data.
- Replaced simultaneous `concurrently` startup with a local launcher that checks port availability, starts the API watcher, waits for healthy database/catalog initialization, and then starts Vite. This removes the interval in which the frontend could issue API calls before the API listened.
- The launcher binds/displays the configured loopback hostname, validates its port against Vite, retains startup diagnostics, explains that the terminal must stay open, and stops its own child process trees on exit/Ctrl+C. It never kills an existing unrelated app to free a port. Production startup and isolated browser-test orchestration are unchanged.
- Verified actual `npm run dev` startup against `tracklab_dev`; localhost session, catalog and signed workspace requests returned 200. A second command failed clearly with port-in-use diagnostics, leaving the running app intact. Ctrl+C released ports 4000/5180. TypeScript, lint and two focused readiness/occupied-port/cancellation tests passed. No component-change quota, saved build, production service or deployment was modified.

## Next feature tasks

1. Complete page-specific graphite/blue composition and interaction reviews for landing, catalog, garage, account and admin; the shared foundation and builder are verified below.
2. Extend mobile keyboard/device and assistive-technology coverage beyond the browser viewport checks.
3. Extend catalog provenance/review tooling, search/filter presentation and structured administration before publishing manufacturer records.
4. Extend actual supported component slots, compatibility interfaces and permitted rendering assets without breaking saved builds.
5. Continue garage, account, camera/PWA and accessibility improvements alongside functional work. Keep deployment held.

## Task · Compact builder and source-reviewed frameset selection — completed and verified, 28 October 2026

Implementation and verification are complete for the compact workspace, independent procedural renderer and the four published frameset records. This does not mark the whole application release complete.

- Replaced permanently expanded selected-parts/ratio/check panels with a 68px desktop summary. Full component names, gear inches, known-weight completeness and compatibility results remain in a modal; opening it does not resize the preview. The toolbar now includes the current frame, editable build name, compact guest disclosure and an explicit Create account to save action for guests.
- Recovered preview space, removed the dense grid and refined the neutral bicycle's frame connections, fork, rims, spokes, hubs, saddle, bars, chain and crank. SVG fits the complete assembly bounds uniformly. Three.js uses the same frame-derived anchors and fits its actual Box3 against viewport aspect/FOV on frame changes and resize. Fit/reset, 2D/3D, zoom/pan, full-screen and component selection remain available.
- Added MongoDB brand records, 14 distinct reviewed size/finish variants across Cinelli Vigorelli and Dosnoventa LA/DET/BCN, source URLs, provenance, reviewed original procedural assets and explicit limits. Brand/model/size selections update actual backend variant IDs, assembly anchors and compatibility. Missing interfaces stay unresolved. No manufacturer photos, logos, proprietary models or guessed prices are used.
- The actual catalog blocker was a draft-only Cinelli reference, no Dosnoventa records, demo-only renderer mapping and a 3D authorization guard restricted to demo products. Replaced those limitations with an idempotent reviewed-data import and an explicit reviewed schematic asset check. Unknown/unregistered representations still fail closed. Imports retain edited/archived data and only upgrade the known seed placeholder; existing saved variant IDs and history are retained.
- Component browsing separates source-reviewed records from independent demos, includes brand search/filtering and a demo visibility control, and keeps specifications collapsed. Tablets retain the drawer and phones retain the scrolling parts sheet.
- Authentic manufacturer geometry/graphics remain unavailable. Vigorelli Steel remains draft because its 31.6 mm seatpost lacks a supported seating assembly; further per-size geometry review is required. Other component categories still use labeled demos. Production catalog curation and physical-device/accessibility review remain unfinished. See [source review](frameset-sources.md).
- Visual evidence: [before](../design/builder-before-compact.png), [after desktop](../design/builder-after-compact.png), [after mobile](../design/builder-after-mobile.png), [composition reference](../design/builder-compact-reference.png). The generated bicycle/brand images were not used as composable assets. Actual browser verification uses isolated Chromium because no built-in browser-control tool is available.
- Final local checks: 40 unit/API tests passed; the one live Redis test was skipped locally and remains configured in CI. All 10 Chromium workflows and both production-preview PWA checks passed. TypeScript, lint and both builds passed. The existing lazy 3D large-chunk warning remains.
- The browser matrix checks 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 375×812 and 320×568 in both themes, in addition to the earlier width/landscape coverage. It measures complete bicycle containment and relative size, summary height, unchanged preview bounds when details open, overflow, real variant/geometry changes, unsupported-asset disclosure, full-screen and preserved 2D/3D selection.
- Atlas import/readback verified only `tracklab_dev`: three brand records, four published manufacturer framesets with 14 size/finish variants, and one Steel research draft. Existing edited/archived records and saved builds were retained. No deployment occurred.

## Task · Graphite/blue foundation and adaptive builder — completed and verified

- Integrated the continuation into the consolidated specification and existing phase plan; preserved the original functional requirements. Archived both source briefs and generated desktop/mobile design references.
- Centralized light/dark CSS and Tailwind semantic tokens. Added locally served Inter, readable metadata, consistent controls, focus treatment, neutral surfaces and blue selection states. Updated app/PWA/offline branding; the new default demo finish is the existing Graphite variant. Saved configurations and all five actual paint choices remain supported.
- Reworked the desktop rail/canvas/inspector and summary. Extracted the real API-backed selector with search, brand filtering, variants, finishes and specifications. Tablets use a drawer; phones use a native modal bottom sheet with category selection, internal scrolling, explicit close/Done, Escape and focus restoration. Preview/configuration, auth, quotas and save behavior remain shared and functional.
- Verification: TypeScript, lint, both builds, 37 local unit/API tests, all eight isolated Chromium workflows and both production-preview PWA tests passed. The live Redis integration test was skipped locally without a test Redis service; CI runs it against its own Redis service.
- Responsive checks cover all eight requested widths in both themes, plus 844x390 landscape, overflow, modal containment, category changes, Escape and focus restoration. Main semantic text/button color pairs exceed 4.5:1; theme preferences survive reload. Existing browser flows cover actual component changes, compatibility rejection, 2D/3D state, registration, saving, garage operations and guest limit behavior.
- Visual review used Playwright Chromium because no built-in browser-control tool is available. Both generated concepts and current desktop/mobile screenshots were inspected with `view_image`. The functional schematic renderers, actual selected components and honest development/catalog disclosures take precedence over generated photographic imagery and invented data. The summary was expanded after review to show all six selections.
- Remaining: phase statuses are still partial. More complete page layouts, additional supported slots, manufacturer provenance/admin tooling, camera presets, authentic permitted assets, physical device/keyboard checks and full accessibility review are required. The existing large lazy 3D bundle warning remains. No deployment or database configuration change was made in this milestone.

## Task · Guest quota identity survives session rotation

- Introduced a separately signed HttpOnly guest-identity cookie. Login/logout, password/session rotation, and authentication-cookie resets retain the same guest usage subject. Legacy guest sessions retain their existing identity during migration.
- Added signed cookie purposes and payload checks, while retaining compatible existing authentication cookies. The usage cookie has its own expiry and uses Secure `__Host-` naming in production.
- Regression coverage verifies that component changes and 3D grants persist across guest logout/session-cookie reset, and that signing into an account then signing out restores the original guest allowance.
- Local verification: 37 isolated tests and all four Chromium workflows passed; TypeScript and lint passed. The live Redis test remained skipped locally and is exercised by CI. Existing transaction-race and account-isolation checks still pass.
- Remaining limitation: a public client can still clear all cookies or change client identity. This is not represented as tamper-proof abuse prevention; IP-based secondary thresholds and server authorization remain in place.

## Task · PWA navigation and deferred 3D loading

- Replaced the unconditional offline navigation fallback with online network navigation and an offline fallback only when navigation fails. API routes are excluded, and no API/account responses are stored in Cache Storage.
- Restricted precaching to offline support assets and icons. The generated precache fell from about 2.3 MB to 17.61 KiB. The 3D bundle and GLBs remain on demand.
- Added an isolated production-preview test configuration. Both browser checks passed: online deep-link reload plus offline/reconnect behavior; and no initial 3D download or API response caching. TypeScript and lint passed.
- Added these production-build browser checks to CI after the normal browser workflows. This runs on loopback and does not deploy anything.
- Remaining dependencies: browser/device installability checks, update notification UX, and responsive selection-sheet work.

## Task · Preserve guest drafts and explain exhausted allowances

- A server-issued workspace scope keeps in-memory drafts bound to the current identity. Internal catalog navigation preserves selections, the draft name and undo/redo history without another bootstrap or component-change request. Registration transfers the current draft and its name into the authenticated workspace.
- Active 3D grants stay in memory through internal browsing, so returning to the viewer does not consume another grant. Refresh/close behavior remains temporary and is explained in the workspace.
- At the component-change limit, selections and undo/redo are disabled. The current bicycle, view controls, component browsing, compatibility details, reset timestamp and registration action remain available. Usage is refreshed at its reset time.
- Navigation away from a saved build with unsaved changes prompts before discarding them. New unsaved drafts remain in memory during internal browsing.
- Verification: all six isolated Chromium workflows passed, including registration/name transfer, resumed 3D without another grant, catalog round trips, limit locking, retained view/spec controls, and a 390px viewport with no horizontal overflow. TypeScript, lint, both builds and both production-preview PWA checks passed.
- Visual check: Playwright Chromium was used because no built-in browser-control tool is available. The mobile limit state was inspected with `view_image`; the bicycle remains above the notice and the controls stay within the viewport. Existing layout, typography, palette, component spacing and disclosure treatment were retained. The limit notice is an intentional new state required by the brief.
- Remaining dependencies: manufacturer catalog provenance/review tooling is the next catalog milestone. No deployment was performed.
