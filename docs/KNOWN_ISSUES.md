# Known issues and unfinished requirements

This is a development application, not a completed public release. This list distinguishes observed implementation gaps from external dependencies.

## Visual and responsive gaps at continuation intake

- Existing interface uses a green brand palette and several hardcoded green UI colors; the new graphite/blue system is not yet implemented.
- Existing CSS uses small metadata/control text and some cramped intermediate-width layouts. The full new eight-width responsive matrix has not been verified.
- Mobile selection is currently an inline inspector below the preview, rather than the required bottom sheet.
- Pedals, brakes and accessories are not independent selectable slots yet. Seating currently uses the internal `saddle` slot. Preserve saved configuration compatibility when extending these.
- Camera presets and explicit selected-component highlighting require further work. Existing orbit/reset/zoom and shared configuration behavior must remain working.
- Catalog brand filtering, richer garage details, account quota/privacy presentation and structured administrative tables/forms need the continuation's page-by-page review.

## Catalog and external dependencies

- Public selectable products are original demo records. The manufacturer reference remains in draft. Verified manufacturer variants, per-field provenance, brand/source/media review and permitted authentic assets are unfinished.
- Real manufacturer geometry and asset rights must not be inferred from a disclaimer. Licensed/authorized assets or independently justified representations are required before publishing supported models.
- Pricing has no approved provider and remains disabled. This is optional and does not block the builder.
- SMTP delivery and live production infrastructure are not configured. Development account links are written to ignored local mail files.
- Development short-term request counters are explicitly in process memory. MongoDB business quotas persist; the Redis adapter's two-client atomic behavior is verified in CI, but a production Redis service is not provisioned.

## Verification and release

- Latest pre-continuation CI passed 38 unit/API tests, six browser workflows, two production-preview PWA checks, lint, TypeScript and both builds. This does not verify the new design requirements.
- PWA online/offline navigation and API cache exclusion are verified. Device installation coverage and update notification UX remain incomplete.
- The 3D bundle is deferred from initial loading, but still generates a large-chunk build warning. More performance/device coverage is required.
- No production deployment has been made. The user explicitly deferred deployment; source pushes do not change that instruction.

Update this file as each gap is actually fixed and verified. Do not convert missing source/permission evidence into fabricated catalog content.
