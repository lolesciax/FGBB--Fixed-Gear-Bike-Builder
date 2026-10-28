# Access policy · revised 28 October 2026

The brand-authentic continuation replaces the earlier 12-change/five-build rules and the intervening request for unlimited development use. The latest brief explicitly retains bounded permanent storage and backend fair-use protection. No unlimited mode or authorization bypass was introduced.

| Rule | Default |
| --- | --- |
| Guest temporary builds | One, memory only |
| Guest accepted substitutions | 24 per rolling 24 hours |
| Guest 3D sessions | Two per rolling 24 hours, up to 10 minutes each |
| Registered/admin active saved builds | Eight |
| New saved builds, including duplicates | Three per rolling day; 15 per rolling 30 days |
| Published builds | Four, included in saved slots |
| Combined SVG image / JSON information exports | Eight per rolling day |
| Existing-build save writes | 120 per rolling hour by default; no new slot consumed |

`packages/domain/src/policy.ts` defines validated defaults/bounds. Server environment settings establish the initial policy; an administrator can explicitly save bounded overrides through `/api/admin/policy`. Session responses expose the actual policy and account usage. Guest, registered and administrator access are distinct; administrator storage is bounded too. There is no paid tier.

Admin policy writes require an authenticated administrator and CSRF, use version checks and a transaction, and record before/after values in the audit log. Lowering a cap never deletes or hides existing builds. It blocks additional creation/publication as appropriate while preserving editing and ownership.

Only accepted variant replacements consume guest allowance. No-ops, rejected compatibility, search, categories, specifications, camera actions and ordinary navigation do not. Duplicate operations derived from the same signed workspace/token/slot/variant are idempotent: a transaction stores only a private receipt hash and expiry and charges once. It does not persist the guest's configuration as a saved build. Distinct concurrent operations cannot exceed the allowance.

An active 3D grant is stored by subject and reused without another charge, including switching between modes or reopening the same current session. Creating a new grant after expiry consumes the next available session. Backend validation checks identity, grant ID and expiry; the frontend ends its active view at expiry and validates while viewing/resuming. Downloaded public assets are not claimed to be tamper-proof.

Saving a new build remains explicit. Optional debounced autosave updates only an existing authenticated build under its editor lease/revision. Errors pause autosave, retain unsaved state and leave manual retry available. Exporting an illustrative SVG is an owner-only server-rendered operation sharing the same allowance as JSON export. No raster/photorealistic export is promised.

Existing guest history, accounts, builds, published links and creation/export histories are retained. New defaults apply without deleting usage records. An account already above a newly lowered cap retains its data and must return below the cap before creating more. API abuse limits, CSRF, session signing, editor conflicts and ownership checks remain enforced.
