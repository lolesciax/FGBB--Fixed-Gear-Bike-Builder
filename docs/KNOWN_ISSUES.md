# Known issues and unfinished requirements

This is a development application, not a completed public release. This list distinguishes observed implementation gaps from external dependencies.

## Visual and responsive gaps

- Graphite/blue tokens, shared controls, typography and the adaptive builder are implemented. Page-specific composition and interaction reviews remain for landing, catalog, garage, account and admin.
- The builder passed 320/375/430/768/1024/1280/1440/1920px checks in both themes, plus 844x390 landscape. Other routes still need the complete matrix. Semantic text/button token pairs pass AA contrast; this is not a complete accessibility audit.
- Mobile uses a native modal parts sheet; tablets use a drawer. Escape, explicit close, focus restoration, internal scrolling and viewport bounds are browser-tested. Physical phone keyboard, assistive technology and device coverage remain.
- Pedals, brakes and accessories are not independent selectable slots yet. Seating currently uses the internal `saddle` slot. Preserve saved configuration compatibility when extending these.
- Camera presets and explicit selected-component highlighting require further work. Existing orbit/reset/zoom and shared configuration behavior must remain working.
- Catalog brand filtering, richer garage details, account quota/privacy presentation and structured administrative tables/forms need the continuation's page-by-page review.

## Catalog and external dependencies

- Source-reviewed Cinelli Vigorelli and Dosnoventa LA/DET/BCN size variants are now selectable through MongoDB/API records. Previews use independent measurement-based geometry, not authentic manufacturer models. See [sources and exact limitations](development/frameset-sources.md). Vigorelli Steel remains draft pending geometry and compatible seating support.
- Authentic manufacturer assets/paint graphics remain unavailable. The active independent procedural asset has reviewed provenance and explicit schematic status. Additional interfaces, source-specific tube profiles and real components beyond framesets still need work. Production catalog curation is incomplete; development demos are retained and labeled.
- Pricing has no approved provider and remains disabled. This is optional and does not block the builder.
- SMTP delivery and live production infrastructure are not configured. Development account links are written to ignored local mail files.
- Development short-term request counters are explicitly in process memory. MongoDB business quotas persist; the Redis adapter's two-client atomic behavior is verified in CI, but a production Redis service is not provisioned.

## Verification and release

- Latest pre-continuation CI passed 38 unit/API tests, six browser workflows, two production-preview PWA checks, lint, TypeScript and both builds. This does not verify the new design requirements.
- PWA online/offline navigation and API cache exclusion are verified. Device installation coverage and update notification UX remain incomplete.
- The 3D bundle is deferred from initial loading, but still generates a large-chunk build warning. More performance/device coverage is required.
- No production deployment has been made. The user explicitly deferred deployment; source pushes do not change that instruction.

Update this file as each gap is actually fixed and verified. Do not convert missing source/permission evidence into fabricated catalog content.
