# Known issues and unfinished requirements

This is a development application, not a completed public release. This list distinguishes observed implementation gaps from external dependencies.

## Visual and responsive gaps

- The v3 structural milestone passes the current local regression gates; [evidence](development/modeling-refinement.md). The new [advanced geometry continuation](development/advanced-geometry.md) still requires source-associated tube/post/fork/dropout profiles and 20/24, 32/32, 36/36 demo variants within each retained rim design. Existing round main tubes are approximate and must not be described as exact proprietary morphology.

- Graphite/blue tokens, shared controls, the adaptive builder and studio landing page are implemented. The landing and builder have browser viewport checks; garage/account/admin need broader page-specific visual and accessibility review.
- The builder passed 320/375/430/768/1024/1280/1440/1920px checks in both themes, plus 844x390 landscape. Other routes still need the complete matrix. Semantic text/button token pairs pass AA contrast; this is not a complete accessibility audit.
- Mobile uses a native modal parts sheet; tablets use a drawer. Escape, explicit close, focus restoration, internal scrolling and viewport bounds are browser-tested. Physical phone keyboard, assistive technology and device coverage remain.
- Pedals, brakes and accessories are not independent selectable slots yet. Seating currently uses the internal `saddle` slot. Preserve saved configuration compatibility when extending these.
- Side/front/rear/three-quarter camera presets are implemented and browser-tested. Explicit 3D selected-component highlighting and further device/performance review remain.
- Catalog brand filtering, per-variant previews, rendering provenance review, an audited bounded policy form, actual account quota displays, optional existing-build autosave and owned SVG image export are implemented. A full structured product editor, raster screenshot export and wider admin-browser testing remain.

## Catalog and external dependencies

- Source-reviewed Cinelli Vigorelli and Dosnoventa LA/DET/BCN size variants are now selectable through MongoDB/API records. Previews use independent measurement-based geometry, not authentic manufacturer models. See [sources and exact limitations](development/frameset-sources.md). Vigorelli Steel remains draft pending geometry and compatible seating support.
- Authentic manufacturer assets/paint graphics remain unavailable. Thirty-nine independently generated illustrative GLBs now have per-variant anchors, bounds and provenance; these are not authentic brand replicas. Blender/CAD surface refinement was not executed because Blender was not available on PATH. Exact profiles, product revision/year evidence and further real components remain dependencies. See [3D production](development/3d-production.md). Production catalog curation is incomplete; development demos are retained and labeled.
- Five additional framesets have reviewed selectable size geometry: Skream Magnum/Ranger, State Black Label v3, Wabi Prism and 8bar KRZBERG V8. Tsunami SNM100, Engine11 Crit-D and Leader 735 have technical drafts but incomplete anchor data. Other targets remain research records. The public support directory separates catalog review from rendering; no model is labeled Fully Supported. See [specific blockers](brands/source-review.md).
- Administrators can maintain brand/model records, archive individual variants and submit permitted files to a private local review inbox. Uploads are pending references, not automatically published rendering assets. Full product editing still uses validated JSON; durable production upload storage and higher-fidelity asset review remain unfinished. Existing guest/account quotas are unchanged.
- Pricing has no approved provider and remains disabled. This is optional and does not block the builder.
- SMTP delivery and live production infrastructure are not configured. Development account links are written to ignored local mail files.
- Development short-term request counters are explicitly in process memory. MongoDB business quotas persist; the Redis adapter's two-client atomic behavior is verified in CI, but a production Redis service is not provisioned.

## Verification and release

- Latest v3 local verification: 100 unit/API tests passing with one live Redis skip, 31 normal browser workflows, one development workflow and two production-preview PWA workflows, lint, TypeScript and both builds. CI verifies Redis; the latest saved-build fixture correction is tracked separately. These gates do not establish manufacturer-exact assets or completion of the new morphology continuation.
- PWA online/offline navigation and API cache exclusion are verified. Device installation coverage and update notification UX remain incomplete.
- The 3D bundle is deferred from initial loading, but still generates a large-chunk build warning. More performance/device coverage is required.
- No production deployment has been made. The user explicitly deferred deployment; source pushes do not change that instruction.

Update this file as each gap is actually fixed and verified. Do not convert missing source/permission evidence into fabricated catalog content.
