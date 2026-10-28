# Access policy · revised 28 October 2026

The brand-authentic continuation replaced the earlier 12-change/five-build rules with the bounded policy below. A subsequent explicit user instruction now disables business quotas during local development while the product is polished. Production policy and authorization remain enforced.

## Temporary local development access

Set `DEVELOPMENT_DISABLE_QUOTAS=true` in the ignored root `.env`, then restart `npm run dev`. This is enabled in the current workspace. Component-change, 3D-session count, build storage, daily/monthly creation, publishing-count, export-count and business save-write quotas are bypassed. The UI displays Development access instead of misleading remaining allowances. Guests still need an account to save permanently; ownership, CSRF, verified-email publishing, revision/lease checks, compatibility, asset review and request-abuse throttling remain active.

Usage events continue to be recorded without resetting existing histories. Set the flag to `false` and restart to restore the stored limits; existing over-limit builds are retained. Development 3D grants have a 24-hour authorization lifetime and can renew while the signed workspace remains valid. Technical expiry is separate from the disabled business viewing quota.

Production startup rejects this flag. Normal browser tests explicitly disable it; a separate isolated development-browser configuration enables it for its own temporary database. No frontend query, role change or database policy edit can enable the bypass.

## Retained normal policy

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
