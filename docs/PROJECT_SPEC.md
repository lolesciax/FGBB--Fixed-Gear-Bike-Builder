# TrackLab consolidated implementation requirements

The original functional specification remains in force. The continuation brief changes the visual direction and makes UI/UX quality a requirement of every phase. It does not restart the project or remove working behavior.

## Authoritative source briefs

- [Original full implementation specification](requirements/original-implementation.md).
- [Continuation: integrated UI/UX and distinct identity](requirements/continuation-ui-ux.md).
- [Builder refinement: compact workspace, visualization and branded framesets](requirements/builder-visual-improvements.md). This supersedes the earlier permanently expanded summary and oversized heading composition.
- [Brand-specific visualization and revised user experience](requirements/brand-authentic-upgrade.md) supersedes older numeric quotas. Implementation detail: [access policy](development/access-policy.md) and [3D production](development/3d-production.md).
- [Fixed-gear brand expansion and repository organization](requirements/brand-expansion.md) adds dynamic manufacturer/model maintenance and separate catalog/rendering support statuses. Quotas remain unchanged. Source review: [brand research](brands/source-review.md). Existing `apps/api`, `apps/web` and shared packages remain the canonical layout; no duplicate frontend/backend trees are required.
- Current phase plan, evidence and status: [development roadmap](development/roadmap.md). This remains the canonical plan/status document; do not create competing status files.
- Design requirements and implementation tokens: [design system](DESIGN_SYSTEM.md).
- Unfinished work and verification gaps: [known issues](KNOWN_ISSUES.md).

New explicit user instructions take precedence over these documents. The existing instruction to keep development local remains active: pushes are authorized after verified milestones; deployment is not authorized.

## Product and architecture

Deliver a functional responsive hybrid 2D/3D fixed-gear configurator and private garage using the established React/TypeScript/Vite frontend, Express/TypeScript API, MongoDB Atlas, shared domain model, SVG renderer and lazy Three.js viewer. Keep one canonical selected configuration and backend-owned catalog/compatibility/quota logic.

Preserve accounts, session rotation, CSRF, ownership checks, API validation, distributed limiter support, transaction-backed quota races, saved build history, editor conflicts, public sharing and permitted exports. No frontend mock may replace a working backend flow.

## Access and quotas

The user's later development instruction enables a temporary local business-quota bypass using `DEVELOPMENT_DISABLE_QUOTAS=true`. Production rejects it. The defaults below remain the retained normal policy, and usage history is preserved for re-enabling limits. Authentication, ownership, compatibility, asset review and request-abuse protections remain active. See [the switch and restoration behavior](development/access-policy.md).

Guests may browse publicly, keep one memory-only draft, make 24 accepted component changes and receive two 3D sessions of up to ten minutes each per rolling 24 hours. Valid grants are reused across modes without additional charging. They may not save, publish, export or access a private garage. Browsing, duplicate operations, repeated selections and rejected incompatible changes do not consume change allowance. Usage identity survives normal session rotation; the app must not claim that all public-client circumvention is preventable.

Registered accounts default to eight active builds, three creations per rolling day, fifteen per rolling thirty days, four published builds and eight combined SVG-image/JSON-information exports per rolling day. Save writes have bounded fair-use throttling (120/hour by default). Duplication consumes creation allowance. Editing consumes no new slot. Deletion frees a slot without refunding historical creation allowance. Keep these rules atomic on the server and show actual API usage in the interface. Administrators may change supported policy values within validated bounds with version checks and audit history; existing builds are never deleted when caps change.

## New visual and interaction requirements

- Replace the green brand identity with graphite, titanium, off-white and electric blue across the application. Green is reserved for semantic success/verified compatibility. Existing green bicycle finish options are component choices, not the brand palette; default illustrative presentation must be neutral.
- Use centralized CSS variables and Tailwind semantic tokens, readable typography, consistent controls and complete light/dark modes. Preserve saved theme preferences and verify WCAG 2.2 AA text contrast.
- Prioritize the builder: compact component navigation, largest region for the bicycle, compact readable selector, specifications/compatibility feedback, persistent view/save controls and synchronized viewer state.
- Target functional navigation for frameset, wheels, tires, cockpit, drivetrain, seating, pedals, brakes and accessories as catalog/domain/rendering support is implemented. Do not advertise unsupported slots as complete or add inert controls to imply support.
- On tablets, collapse/adapt panels rather than cramming three columns. On phones, use a reliable accessible component-selection bottom sheet with a visible trigger/handle, internal scrolling, keyboard-safe layout and safe-area spacing. Keep the bicycle and essential actions prominent.
- Apply the same design system to the landing page, catalog, garage, authentication, settings, administration, errors, loading and empty states. Improve hierarchy/layout; a palette swap alone does not satisfy this requirement.

## Data, brand and pricing integrity

Publish genuine manufacturer models only with verified variant specifications, provenance and permitted asset use. Keep unverified records in draft, preserve archived build references, distinguish illustrative assets, and retain brand/trademark and technical disclosures. Compatibility must distinguish compatible, incompatible and needs verification.

Do not invent product specifications, prices, affiliations or asset rights. Pricing stays disabled until an approved source and exact variant matching are established. It is not a dependency of the core builder.

## Verification and milestone acceptance

Each phase must have an explicit status: completed and verified; implemented but not fully verified; partially implemented; not started; or blocked. File existence alone is not completion evidence.

For each coherent task: inspect, implement, run relevant static/unit/API/browser/build checks, fix regressions, update the roadmap/known issues, scan staged source for credentials, commit, push and inspect CI. Preserve existing verified behavior.

Use the responsive matrix 320, 375, 430, 768, 1024, 1280, 1440 and 1920px, including mobile portrait and landscape. Check overflow, clipping, focus/keyboard access, modal/sheet containment, navigation visibility, theme consistency, readable labels, card alignment, action feedback, layout jumps and 2D/3D state retention. Record tested configurations rather than claiming unexecuted checks.

Continue independent feasible work when external assets, credentials or product verification block another task. Record precisely what is missing. Public release and deployment require the original acceptance criteria plus the new UI/UX criteria; deployment remains on hold until separately authorized.
