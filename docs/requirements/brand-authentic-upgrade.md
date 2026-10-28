# TRACKLAB — BRAND-AUTHENTIC BIKE BUILDER & USER EXPERIENCE UPGRADE

## OBJECTIVE

Act as a Senior Full-Stack Developer, React/TypeScript Engineer, UI/UX Designer, Bicycle Product Modeling Specialist, Three.js Developer, Database Architect, and Security Engineer.

Improve the existing TrackLab application to deliver a more realistic, brand-specific fixed-gear bicycle customization experience.

The application already has a functional builder layout, a component catalog, 2D/3D controls, guest restrictions, and some manufacturer product records.

**Do not rebuild the application from scratch. Inspect the repository and improve the existing implementation.**

### Main priorities

1. Make branded bicycles visually recognizable.
2. Replace the generic-looking bicycle with higher-quality, model-specific rendering.
3. Make real frameset differences visible when switching brands and models.
4. Improve the landing-page bicycle presentation.
5. Replace schematic product thumbnails with better permitted visual assets.
6. Redesign guest and registered-user limitations.
7. Improve quota feedback and registration flow.
8. Preserve existing compatibility rules and security.
9. Maintain the existing graphite and electric-blue TrackLab visual identity.
10. Verify the actual implementation through browser testing.

---

# PHASE 1 — REPOSITORY AND SYSTEM AUDIT

Inspect the current codebase before changing anything.

Review:

- Current SVG renderer.
- Current 3D renderer.
- Bicycle geometry definitions.
- Default bike configuration.
- Frameset product data.
- Brand and model variants.
- Rendering asset references.
- Catalog API.
- Product cards.
- Landing-page hero bicycle.
- Guest session system.
- Registered-user quotas.
- Rate limiting.
- My Garage.
- Account registration.
- Existing database schemas.
- Administrative catalog maintenance.

Identify which features use hardcoded illustrative data and which load verified records from MongoDB.

Determine whether changing a frame variant currently changes:

- Only the displayed name.
- Only the color.
- The underlying geometry.
- The fork geometry.
- The frame proportions.
- The rendering materials.
- The model-specific visual details.

Document the findings.

Do not treat the existence of a Cinelli or Dosnoventa catalog entry as proof that its visual representation is accurate.

---

# PHASE 2 — MODEL-SPECIFIC FRAMESET RENDERING

## Problem

The current bicycle still looks like a generic schematic.

Although real manufacturer names appear in the catalog, the bicycle does not yet look sufficiently different between actual frame models.

Fix this at the rendering architecture level.

## 2.1 Build a model-specific frameset system

Each supported frame variant must have its own verified technical and rendering metadata.

Support:

- Manufacturer.
- Product model.
- Model year or revision.
- Frame size.
- Top tube length.
- Effective top tube length, when provided.
- Seat tube length.
- Head tube length.
- Head tube angle.
- Seat tube angle.
- Chainstay length.
- Wheelbase.
- Stack.
- Reach.
- Bottom bracket measurements.
- Fork rake/offset.
- Supported wheel and tire dimensions.
- Tube profiles.
- Frame finish.
- Approved decal/graphic assets.
- Model-specific attachment interfaces.

Do not invent missing dimensions.

Where a measurement is unavailable, identify it as unverified.

## 2.2 Accurate geometry

Create a reusable geometry-generation system capable of mapping verified frame dimensions into the bicycle's SVG coordinate system.

Do not use one fixed set of frame points for every manufacturer.

A new frameset selection should update its corresponding geometry when verified data and rendering support are available.

Support differences in:

- Top tube slope.
- Seat tube angle.
- Head tube angle.
- Chainstay length.
- Wheelbase.
- Tube thickness/profile.
- Seat stays.
- Fork shape.
- Bottom bracket location.
- Seatpost interface.
- Frame size.

Keep the bicycle correctly assembled as frame geometry changes.

Use actual measurements and derived coordinates where mathematically appropriate.

Do not add arbitrary brand-specific geometry merely to create visual differences.

## 2.3 Initial supported models

Prioritize these models:

### Cinelli

- Vigorelli.
- Vigorelli Steel, when supported data and assets are ready.

### Dosnoventa

- 02 LA.
- 03 DET.
- 01 BCN.

Verify exact model revisions, available sizes, and finishes through manufacturer information.

Official sources:

https://usa.cinelli-milano.com/

https://dosnoventabikes.com/

Record the original source and verification date.

Do not assume every listed manufacturer variant is still available or identical across years.

## 2.4 Frame-specific appearance

Where verified visual references and usage rights allow:

- Reproduce recognizable frame silhouettes.
- Implement appropriate tube profiles.
- Reproduce supported manufacturer finishes.
- Preserve the correct fork design.
- Add subtle realistic shading.
- Match approved graphic placements.
- Apply model-specific materials.
- Respect realistic proportions.

For example, a verified Cinelli Vigorelli rendering should reflect its own geometry and design, rather than displaying the generic Studio Track frame with another name.

Likewise, supported Dosnoventa models must use their own geometry, proportions, and finish definitions.

## 2.5 Branding and intellectual property

Do not automatically reproduce or redistribute manufacturer logos, graphics, photographs, or 3D models without appropriate rights.

Use:

- Authorized manufacturer assets.
- Licensed product images/models.
- Independently created frame geometry using verified technical dimensions.
- Appropriate original visual assets where allowed.

Keep legal/asset permission records.

If exact model graphics cannot be used, omit them rather than applying unauthorized logos.

A manufacturer name may identify a catalog item without claiming that its renderer is an officially licensed model.

---

# PHASE 3 — HIGHER-QUALITY 2D BICYCLE RENDERING

The current bicycle looks too simple and mechanical.

Improve the entire vector composition.

## Frame

- Improve tube contours.
- Use realistic connecting points.
- Improve joint precision.
- Support tube profiles and aerodynamic shapes.
- Provide realistic material shading.
- Match supported frame geometry.
- Improve geometry fidelity at every size.

## Wheels

Improve:

- Rim depth.
- Spoke geometry.
- Hub details.
- Rim profiles.
- Tire thickness.
- Tire sidewalls.
- Valve placement where supported.
- Overall visual consistency.

Implement meaningful visual differences between supported wheel models.

A deep-section wheel should not merely be the same rim with a different name.

## Drivetrain

Improve:

- Crank arms.
- Chainrings.
- Teeth detail, where useful.
- Chain appearance.
- Cog position.
- Pedal shape.
- Bottom bracket placement.
- Realistic drivetrain alignment.

## Cockpit

Improve:

- Drop handlebars.
- Riser bars.
- Bullhorn bars.
- Stem geometry.
- Grip and bar-tape representation.
- Handlebar placement.
- Model-specific component positioning.

## Saddle and seatpost

Improve:

- Saddle silhouette.
- Seatpost proportions.
- Clamp representation.
- Alignment with frame geometry.
- Appropriate visual materials.

## Rendering rules

Avoid cartoon-style parts.

Avoid excessive black outlines.

Avoid overly reflective gradients.

Do not distort dimensions to fill the canvas.

Use a refined, high-resolution studio visualization style.

Preserve good performance on mobile.

---

# PHASE 4 — ADVANCED 3D VISUALIZATION

Inspect the current Three.js implementation.

Improve the model assembly and visual quality without breaking existing interactions.

## Requirements

- Support modular bicycle assemblies.
- Use correct relative component dimensions.
- Standardize attachment points.
- Use realistic materials.
- Provide appropriate studio lighting.
- Improve shadows.
- Improve camera framing.
- Support front, rear, side, and three-quarter views.
- Keep selected components synchronized with 2D.
- Lazy-load 3D assets.
- Handle missing models gracefully.

## Brand-specific models

A real branded 3D representation must use an appropriately modeled and permitted asset.

Do not use the same generic frame mesh for Cinelli, Dosnoventa, and every other brand while presenting it as authentic.

Maintain a rendering fidelity status for every model:

- Licensed authentic asset.
- Independently modeled with verified geometry.
- Approximate illustrative model.
- No 3D model available.

Expose accurate availability information in the UI.

An approximate model must be labeled accordingly.

## Asset production

Where appropriate, create an organized Blender-to-GLB workflow.

Standardize:

- Units.
- Origin points.
- Orientation.
- Attachment transforms.
- Mesh naming.
- Materials.
- LOD/mesh complexity.
- Texture resolution.
- Compression.
- Asset licensing metadata.

Do not assume genuine branded GLB files can be downloaded from public websites.

If the environment cannot create accurate 3D assets, complete the geometry, asset loading, metadata, and admin integration, then clearly document the remaining asset production requirements.

---

# PHASE 5 — PRODUCT CARDS AND REAL BRAND PRESENTATION

The current catalog uses generic frame-line thumbnails.

This does not adequately communicate the real visual identity of Cinelli and Dosnoventa products.

Improve the product selection interface.

## Product cards should show

- Manufacturer name.
- Exact model.
- Product image or supported rendered preview.
- Model-specific finish.
- Available sizes.
- 2D visualization support.
- 3D visualization support.
- Compatibility status where relevant.
- Selected state.
- Source information.
- Available product specifications.

## Visual assets

Use licensed or otherwise permitted manufacturer photos where available.

If no usable product photo is available, use the actual model-specific renderer when supported.

Do not display a generic geometry sketch as though it were an official product photograph.

Clearly label independently modeled or approximate visuals.

## Card design

Use compact, premium product cards.

Improve:

- Image consistency.
- Brand hierarchy.
- Product titles.
- Finish selector.
- Size selector.
- Selection feedback.
- Loading skeletons.
- Product details access.

Avoid excessive vertical padding.

Allow users to compare multiple framesets efficiently.

## Product preview

When the user selects a frame card:

1. Load the actual product variant.
2. Validate the selected size and finish.
3. Update the shared configuration.
4. Check compatibility.
5. Update supported rendering geometry.
6. Reframe the bicycle.
7. Show appropriate feedback.

The bicycle must change visually when supported model-specific geometry or materials differ.

Do not silently pretend that an unavailable authentic rendering was loaded.

---

# PHASE 6 — IMPROVE THE DEFAULT BIKE

Replace the current weak-looking starter bicycle.

## New default experience

When opening the builder, provide a polished starting configuration that immediately communicates TrackLab's purpose.

Preferred approach:

- Display a verified, visually supported frameset.
- Use properly registered components.
- Use balanced studio lighting.
- Fit the bicycle prominently inside the preview.
- Use the correct frame geometry.
- Apply the correct supported finish.

If an accurate branded setup is not ready, use an exceptionally polished neutral demonstration bike and clearly label it illustrative.

Do not attach a brand name to a generic demonstration frame and claim that it is authentic.

## Onboarding

For first-time visitors:

1. Open the builder.
2. Show the bicycle immediately.
3. Highlight the Frameset category.
4. Explain that users can choose a real brand.
5. Allow selection of supported frame models.
6. Continue customization.

Keep onboarding short and dismissible.

Do not force lengthy tutorials or popups.

---

# PHASE 7 — IMPROVE THE LANDING PAGE

The current homepage is functional but still appears too basic for an interactive bicycle customization platform.

Improve the hero section.

## Requirements

- More premium presentation.
- Stronger bicycle-focused visuals.
- Better visual hierarchy.
- Less generic appearance.
- Stronger Start Building action.
- More refined spacing.
- Better desktop/mobile balance.

## Hero bicycle

The current hero shows a generic Studio Track illustration.

Replace it with the best properly supported and legally usable bicycle visualization.

Preferred options:

1. A verified model-specific render.
2. A properly licensed bicycle photograph.
3. A polished neutral demonstration rendering.

Do not claim the landing-page bicycle is an authentic branded model if its visual data is only approximate.

## Suggested visual direction

Use a high-quality studio product presentation:

- Large bicycle.
- Subtle graphite/light-neutral background.
- Controlled lighting.
- Clear frame silhouette.
- Minimal visual distractions.
- Premium typography.

Maintain the existing graphite and electric-blue identity.

Do not introduce the green theme from my other projects.

Avoid excessive 3D effects or animations that slow down the landing page.

---

# PHASE 8 — REVISE GUEST AND REGISTERED-USER LIMITATIONS

The current guest limit of 12 component changes per day is too restrictive.

Update the quota system to provide a better balance between usability and resource protection.

## 8.1 GUEST ACCESS

Guests are visitors without registered accounts.

### Proposed limits

| Feature | Limit |
|---|---|
| Active temporary build | 1 |
| Component replacements | 24 per rolling 24 hours |
| 3D demo sessions | 2 per rolling 24 hours |
| 3D demo session duration | Up to 10 minutes per session |
| Permanent saved builds | 0 |
| Public build publishing | 0 |
| Image exports | 0 |

### Guest behavior

Guests can:

- Explore the public catalog.
- Inspect products.
- View verified specifications.
- Create one temporary configuration.
- Make 24 accepted component substitutions per rolling 24 hours.
- View compatibility feedback.
- Use limited 3D demonstrations.
- Register to save their configuration.

Guests cannot:

- Save builds permanently.
- Access My Garage.
- Publish builds.
- Export build images.
- Duplicate saved builds.
- Bypass guest limits through ordinary page refreshes.

### Important quota rules

Do not count:

- Opening categories.
- Searching brands.
- Viewing product details.
- Rotating the bicycle.
- Zooming.
- Resetting the camera.
- Opening specifications.
- Selecting the already-selected variant.
- Invalid or rejected component changes.

Only count accepted product or variant replacement operations, according to a documented consistent policy.

Use idempotent requests and atomic counters to prevent duplicate charging or concurrent quota bypasses.

### 3D demo behavior

A guest receives two authorized 3D viewing sessions per rolling 24 hours.

Each session may last up to ten minutes.

Switching temporarily to 2D and back during the same valid session should not consume another session.

Rotate/zoom/camera interactions must not consume additional session grants.

Implement the authorization and expiry on the backend, acknowledging that publicly delivered assets cannot be made completely tamper-proof by browser controls alone.

### Guest messaging

Replace confusing quota wording with:

"Guest Mode · 24 changes remaining"

When a guest has reached the limit:

"Daily customization limit reached. Your next allowance begins [reset time]."

Provide a clear Register or Sign In action.

Do not repeatedly display large registration modals after every action.

---

# PHASE 9 — REVISE REGISTERED-USER LIMITATIONS

Registered users should receive meaningful additional value.

However, the application must not permit unlimited permanent configurations.

## New default limits

| Feature | Limit |
|---|---|
| Active saved builds | 8 |
| New saved builds | 3 per rolling 24 hours |
| New saved builds | 15 per rolling 30 days |
| Published builds | 4 |
| Image exports | 8 per rolling 24 hours |
| Component selection | Normal API abuse limits only |
| Editing existing builds | Allowed without additional build slots |
| 2D viewer | Full supported access |
| 3D viewer | Full supported access with fair-use protection |

Registered accounts should not be charged a daily component-change quota.

The user should be able to customize an existing bicycle freely.

Apply reasonable server-side rate limiting to protect the API.

## Important rules

- Editing a saved build does not create another build.
- Duplicate Build consumes one available slot and creation quota.
- A deleted build releases an active slot.
- Deleting does not refund already consumed creation quota.
- Public builds count toward the owner's eight saved slots.
- Publishing uses one of the four permitted public-build slots.
- Unpublishing frees the public slot.
- Concurrent requests must not bypass limits.
- Guests cannot create permanent builds.
- Administrative overrides must be protected and audited.

## Save experience

Use debounced autosaving for existing authenticated builds where appropriate.

Do not make every component click create a new database record.

Do not create a new build automatically on every page visit.

Provide:

- Saving indicator.
- Saved status.
- Unsaved changes warning.
- Retry action after save failure.
- Revision conflict handling.

Only create a new saved build after an explicit user action.

Use sensible write throttling and batch changes to avoid unnecessary MongoDB writes.

---

# PHASE 10 — RATE LIMITING AND BACKEND ENFORCEMENT

Preserve the existing centralized rate-limiting implementation.

Update quota rules according to the new policies.

Use:

- Server-managed authenticated identities.
- Signed guest sessions.
- Redis-backed quota counters or equivalent distributed atomic storage.
- Durable long-term build-creation records.
- Atomic build-slot enforcement.
- Request idempotency.
- Endpoint-specific limits.
- Appropriate 429 responses.
- Retry-After information.
- Accurate reset timestamps.

Do not depend on frontend counters for security.

Do not allow simultaneous requests to exceed limits.

Do not punish users for ordinary read-only navigation.

Use additional fair-use protection for:

- Catalog APIs.
- Authentication.
- Compatibility checks.
- 3D asset access.
- Image exports.
- Build saving.
- Administrative operations.

Do not use invasive browser fingerprinting.

Use proportionate secondary protections against automated abuse while taking shared networks into account.

---

# PHASE 11 — ACCOUNT AND REGISTRATION UX

Make account creation valuable rather than mandatory for basic exploration.

## Guest interface

Display a compact remaining-usage indicator.

Do not permanently occupy valuable preview space with large account-promotion banners.

## Registration benefits

Clearly explain that registration provides:

- Eight saved build slots.
- Full supported 2D/3D customization.
- Personal My Garage.
- Build editing.
- Shareable public builds.
- Image exports.
- Better continuity across devices.

Do not market unimplemented features as available.

## Preserve guest configuration on login

When a guest registers or signs in:

1. Preserve the current in-memory draft during the authentication transition where practical.
2. Validate the current component selections.
3. Check the user's available saved-build slots.
4. Offer to save the existing configuration.
5. Create the saved build only after the user confirms.

Do not automatically overwrite an existing user build.

Do not promise cross-device guest persistence.

## My Garage

Display the revised slot usage.

Example:

"My Garage · 3 of 8 builds used"

Provide clear information about:

- Remaining build slots.
- Creation limits.
- Public build limits.
- Storage status.

Keep the UI compact and accessible.

---

# PHASE 12 — REUSABLE QUOTA CONFIGURATION

Do not hardcode these new quotas throughout the frontend and backend.

Create one validated source of truth for account policies.

Support separate configurable plans or access policies:

- Guest.
- Registered.
- Administrator.

Do not implement subscription billing or paid account tiers.

Administrators should be able to adjust supported quota values within safe bounds.

Store configuration changes in the audit log.

Frontend quota displays must use the server's actual policy response.

Do not duplicate quota calculations across components.

---

# PHASE 13 — VISUALIZATION FIDELITY AND TRANSPARENCY

Create a reliable distinction between product data verification and rendering accuracy.

These must not be treated as the same thing.

A manufacturer product may have verified specifications without an accurate visual model.

## Suggested statuses

**Verified Specifications**

The technical information is supported by recorded sources.

**Model-Specific Visualization**

The rendered geometry uses verified dimensions and documented modeling assumptions.

**Officially Licensed Asset**

An authentic product asset is used with appropriate authorization.

**Illustrative Visualization**

The bicycle is approximate and does not reproduce exact manufacturer geometry.

**Visualization Unavailable**

No suitable asset exists for the selected mode.

Use these statuses consistently throughout the catalog and builder.

Avoid claiming:

- Official partnership.
- Manufacturer-approved simulation.
- Perfect geometry.
- Exact product replication.
- Guaranteed component compatibility.

Unless those claims are demonstrably supported.

---

# PHASE 14 — USER EXPERIENCE REFINEMENTS

Improve the builder's overall usability.

## Navigation

- Keep component categories compact.
- Make Frameset the initial category for new builds.
- Highlight selected components.
- Preserve selection when switching categories.
- Avoid unnecessary scrolling.

## Main preview

- Keep the bicycle large.
- Maintain correct aspect ratio.
- Improve model framing.
- Use a clean studio background.
- Prevent clipping.
- Keep camera controls compact.

## Component panel

- Improve brand filtering.
- Improve product thumbnails.
- Display model names prominently.
- Make selected variants obvious.
- Provide detailed information on demand.
- Show actual visualization availability.

## Summary bar

Keep the existing compact summary layout.

Do not restore the old oversized selected-parts panel.

Use expandable information for detailed compatibility and technical specifications.

## Responsive behavior

Review:

- Desktop.
- Tablet.
- Mobile portrait.
- Mobile landscape.

Ensure the new product images, geometry controls, and quota information work at every viewport size.

---

# PHASE 15 — DATABASE AND MIGRATION REQUIREMENTS

Inspect existing MongoDB schemas before introducing changes.

Update relevant models for:

- New quota policies.
- Model-specific geometry.
- Frame finish variants.
- Rendering fidelity.
- Rendering asset licenses.
- Product source verification.
- 3D asset references.
- Updated user build limits.

Use safe migrations.

Do not delete existing user builds.

Do not overwrite saved configurations merely because a model's visual representation changes.

Maintain compatibility with old saved records.

Provide versioning and migration paths for updated configuration schemas.

Before changing build-limit behavior, inspect how existing accounts are counted.

Do not unexpectedly delete or lock existing saved builds during migration.

If an account already exceeds the new limit, preserve its existing builds and restrict further creation until usage is within policy.

---

# PHASE 16 — TESTING AND QUALITY ASSURANCE

Verify the actual application after implementation.

## Branding tests

- Cinelli models appear correctly.
- Dosnoventa models appear correctly.
- Verified finishes are available.
- Product variants resolve correctly.
- Branded products do not use misleading generic visuals.
- Missing visual assets display accurate fallback states.

## Geometry tests

- Frame proportions update correctly.
- Components stay attached.
- Wheels remain positioned correctly.
- Drivetrain alignment remains valid.
- Frame size changes update supported geometry.
- 2D/3D configurations remain synchronized.

## Guest quota tests

- 24 successful replacements are allowed.
- The next replacement is blocked until quota reset.
- Page refresh does not reset the quota.
- Invalid attempts do not consume the change quota.
- Read-only actions do not consume the quota.
- The 3D session policy is enforced.
- Guests cannot save builds.

## Registered-user tests

- Eight saved builds are allowed.
- A ninth active build is blocked.
- Daily creation limits work.
- Rolling 30-day creation limits work.
- Editing does not consume new build slots.
- Deleting frees a slot but not historical quota.
- Public build limits work.
- Export limits work.
- Concurrent creation cannot bypass quotas.

## Security tests

- Users cannot access other users' private builds.
- Guests cannot access account-only endpoints.
- Quota requests cannot be bypassed through basic request manipulation.
- Admin endpoints remain protected.
- API rate limits return correct responses.
- Sensitive account information is not exposed.

## Responsive visual tests

Test representative viewport sizes:

- 320px.
- 375px.
- 430px.
- 768px.
- 1024px.
- 1366px.
- 1440px.
- 1920px.

Use Playwright or available browser tools to inspect the rendered application.

Capture before-and-after screenshots.

Verify that the new bicycle rendering and product cards are more representative of their supported models.

Run:

- TypeScript checks.
- Linting.
- Unit tests.
- API integration tests.
- Browser tests.
- Production builds.

Do not claim tests passed without executing them.

---

# PHASE 17 — IMPLEMENTATION ORDER

Complete the work in this order.

### Stage 1 — Audit
Inspect existing code, rendering, catalog, and quota logic.

### Stage 2 — Model Data
Implement verified per-model geometry, variants, finishes, and asset metadata.

### Stage 3 — Authentic 2D Rendering
Improve the vector renderer, bicycle proportions, and model-specific differences.

### Stage 4 — Catalog Visuals
Improve product thumbnails, model cards, brand presentation, and rendering transparency.

### Stage 5 — Default Bicycle
Replace the poor-looking starter configuration with the best supported polished visualization.

### Stage 6 — 3D Integration
Improve the model pipeline and implement accurate supported assemblies.

### Stage 7 — Guest Limits
Replace the existing restrictive guest quota behavior with the revised rules.

### Stage 8 — Registered-User Limits
Implement the eight-build policy, creation quotas, public-build limits, and export limits.

### Stage 9 — UI/UX Improvements
Refine the builder, landing page, registration, and garage.

### Stage 10 — Testing
Execute browser, API, quota, compatibility, security, and responsive checks.

---

# FINAL ACCEPTANCE CRITERIA

The task should not be considered complete until:

1. The default bicycle looks significantly more refined.
2. Supported brands use model-specific product data.
3. At least two supported branded frames have meaningfully different, verified geometry-based visual representations.
4. Model finishes use accurate or appropriately labeled representations.
5. The product catalog shows improved visual previews.
6. The homepage has a better bicycle presentation.
7. Guests receive the updated 24-change policy.
8. Guest 3D sessions follow the new limits.
9. Registered users have eight saved build slots.
10. Registered build creation remains limited.
11. Registered users can edit existing builds without consuming extra slots.
12. All quotas are enforced on the backend.
13. Existing user configurations remain intact.
14. Brand disclaimers and asset permissions are respected.
15. The application remains responsive.
16. The graphite/electric-blue design system is preserved.
17. 2D and 3D rendering remain synchronized.
18. Existing authentication, compatibility, and database workflows still function.
19. Tests have been executed.
20. Any unavailable authentic assets or unverifiable model data are documented rather than fabricated.

---

# FINAL INSTRUCTION

Improve TrackLab from a generic bicycle customization demo into a credible branded fixed-gear bicycle builder.

The priority is not simply to display Cinelli or Dosnoventa names.

**The bicycle must visually represent the selected model as accurately as the available verified specifications and permitted rendering assets allow.**

Implement meaningful differences in frame geometry, component design, finish, and supported graphical details.

Improve the homepage and product cards so they reflect the same higher-quality visual standard.

Replace restrictive guest limits with a fair but controlled trial experience.

Give registered users more value through limited permanent storage, publishing, and exports.

Do not allow unlimited saved configurations or unrestricted backend usage.

Preserve all security measures, compatibility rules, and existing working features.

Do not introduce fake manufacturer models, inaccurate product geometry, unauthorized branding, fabricated prices, or misleading claims of official endorsement.

Implement, verify, document, and refine all feasible improvements. Clearly identify any work that remains blocked by unavailable verified data, permissions, credentials, or authentic 3D assets.