# TRACKLAB — COMPLETE 2D/3D MODELING REFINEMENT & COMPONENT FINISH SYSTEM
## Fix All Bicycle Geometry, Add 20/24-Spoke Wheelsets, Improve Branded Components and Finish Customization

### ROLE

Act as a Senior Full-Stack Developer, Technical 3D Artist, Bicycle Geometry Specialist, Three.js and React Three Fiber Engineer, Blender Procedural Modeling Specialist, SVG Rendering Engineer, UI/UX Designer, and Software Quality Engineer.

Your task is to significantly improve the existing TrackLab bicycle builder using the provided screenshots as visual references.

The application has improved, but several bicycle parts remain inaccurate, disproportionate, incomplete, or incorrectly positioned.

**This is a full modeling-quality improvement task for the existing 2D and 3D renderers.**

Do not restart the application.

Do not redesign the complete interface unnecessarily.

Do not hide geometry problems through lighting, camera positioning, or decorative effects.

Fix the underlying models and their assembly relationships.

---

# 1. PRIMARY OBJECTIVES

Implement all the following:

1. Correct the head tube and steerer geometry.
2. Improve the headset, spacers, stem, and fork connections.
3. Rebuild fork crowns, blades, and dropout details.
4. Improve rear dropouts and track ends.
5. Correct the front and rear wheel assemblies.
6. Add support for 20-front/24-rear spoke-count wheelsets.
7. Improve spoke geometry, lacing patterns, rim profiles, and hubs.
8. Rebuild and polish crank arms, chainrings, pedals, and drivetrain details.
9. Improve saddle shape, rails, seatpost head, and clamp.
10. Improve all existing handlebar styles.
11. Correct bicycle proportions in both 2D and 3D.
12. Implement polished and black component finishes.
13. Support additional verified manufacturer-specific finishes.
14. Add permitted manufacturer graphics, names, and decals to appropriate components.
15. Preserve official branded frameset colorways.
16. Synchronize all finish and geometry selections between 2D and 3D.
17. Correct camera framing and clipping.
18. Verify the actual rendered results using multiple views and screenshots.

**Modeling accuracy and completeness take priority over new effects or animations.**

---

# 2. INSPECT THE CURRENT IMPLEMENTATION

Before modifying anything, inspect the actual repository.

Review:

- Existing frontend/backend structure.
- Shared bicycle configuration.
- Product and variant schemas.
- Frame geometry generation.
- 2D SVG renderer.
- 3D Three.js renderer.
- Geometry/material generation functions.
- Imported GLB assets.
- Existing colorway system.
- Existing finish-selection controls.
- Component-to-renderer mapping.
- Camera control implementation.
- Existing wheelset variants.
- Saddle compatibility validation.
- Build persistence.
- Brand asset metadata.
- Existing automated tests.

Use the provided screenshots to identify visual defects.

The screenshots show issues including:

- An excessively exposed or poorly connected steerer tube.
- Simplified head tube/headset geometry.
- Unconvincing fork shapes.
- Incomplete front and rear dropout details.
- Wheel assemblies that do not look sufficiently realistic.
- Crank and drivetrain proportions that require refinement.
- Saddle proportions and visibility issues.
- Model clipping in some camera angles.
- 2D graphics that remain overly schematic.

Identify the actual cause of each issue in code.

Do not replace existing implementations blindly.

---

# 3. FIX THE HEAD TUBE, STEERER, AND HEADSET

This is the highest structural priority.

## Head tube

Correct:

- Head tube length.
- Head tube angle.
- External tube profile.
- Top tube junction.
- Down tube junction.
- Upper headset interface.
- Lower headset interface.
- Tube wall/profile representation.

The head tube must look like a properly integrated structural part of the bicycle frame.

Avoid a simple floating cylinder appearance.

## Steerer tube

The current exposed steerer looks unrealistic.

Correct:

- Actual steerer alignment.
- Steerer position inside the head tube.
- Headset connection.
- Stem clamp position.
- Top cap.
- Supported spacer arrangement.
- Visible steerer length.

Do not allow the steerer to protrude excessively above the stem without a corresponding verified assembly configuration.

The exposed upper end must follow the selected cockpit configuration.

Do not use arbitrary cylinder extensions to fill gaps.

## Headset

Model the visible headset details appropriately:

- Upper headset cover.
- Lower headset interface.
- Required spacers.
- Stem connection.
- Fork crown connection.

Support straight and tapered configurations where required by verified frame specifications.

Do not expose unnecessary internal hardware.

## Steering assembly

Use one coherent steering-axis definition.

All appropriate steering components must align and rotate correctly if steering interaction is supported.

Verify in:

- Side view.
- Front view.
- Three-quarter view.

---

# 4. REBUILD FORKS AND DROPOUTS

## Fork construction

Each supported fork must have:

- Steerer.
- Fork crown.
- Left blade.
- Right blade.
- Front dropout interfaces.

Improve:

- Crown shape.
- Blade taper.
- Blade thickness.
- Fork rake.
- Fork offset.
- Axle-to-crown proportions.
- Front tire clearance.
- Attachment to the head tube.

Do not use crude tube geometry where a more accurate modeled profile is needed.

## Front dropouts

Implement correct front axle attachment.

Support the actual documented interface of the selected fork.

Do not assume every model uses the same dropout style.

The fork blades must connect to the correct front axle position.

## Rear dropouts

Improve track ends and axle interfaces.

Support verified features such as:

- Rearward-facing track ends.
- Axle slots.
- Dropout plates.
- Chain tension adjustment interfaces.
- Seatstay junction.
- Chainstay junction.

Do not invent adjustment hardware for a model that does not include it.

## Strict geometry rules

- Both sides must align correctly.
- Wheel hubs must connect to axle interfaces.
- No dropout may float away from the frame.
- No fork blade may visibly intersect the rim or tire.
- Chainstays and seatstays must connect correctly.
- Dropouts must have believable thickness and scale.

Implement these improvements in both the 2D and 3D renderers.

---

# 5. COMPLETE WHEELSET MODELING IMPROVEMENTS

Rebuild the wheelset presentation.

Improve:

- Rim geometry.
- Rim depth.
- Hub shell.
- Hub flanges.
- Spokes.
- Spoke nipples where appropriate.
- Axle.
- Tire profile.
- Tire sidewalls.
- Wheel rotation geometry.
- Wheel assembly positioning.

Use realistic proportional dimensions.

Do not let rims, tires, spokes, and hubs appear disconnected.

## Rim profiles

Support existing verified rim profiles.

Examples:

- Shallow-section rims.
- Medium-depth rims.
- Deep-section rims.

Use correct relative depths and cross-sections.

Do not represent every rim as the same torus with different materials.

## Hubs

Improve:

- Hub shell geometry.
- Flange placement.
- Axle connection.
- Front and rear hub differences.
- Fixed-gear rear hub interfaces.

The spoke attachment points must correspond to the actual hub flanges.

## Spokes

Spokes must:

- Start at correct hub flange positions.
- Connect to correct rim positions.
- Follow the documented lacing pattern.
- Maintain appropriate thickness.
- Remain symmetrical as required.
- Avoid clipping through the tire.
- Remain properly connected during rotation.

Use instancing or efficient procedural geometry where appropriate.

---

# 6. ADD 20/24-SPOKE WHEELSET SELECTION

**Mandatory new feature.**

Add a supported wheelset option with:

- Front wheel: 20 spokes.
- Rear wheel: 24 spokes.

Display this in the catalog as:

**20F / 24R Spoke Configuration**

or an equivalent readable label.

## Requirements

When a user selects a supported 20/24-spoke wheelset:

1. Set the front spoke count to 20.
2. Set the rear spoke count to 24.
3. Load the correct hub configuration.
4. Generate or load the actual corresponding spoke geometry.
5. Apply the selected lacing pattern.
6. Maintain the correct rim geometry.
7. Maintain front/rear axle alignment.
8. Update the 2D visualization.
9. Update the 3D visualization.
10. Save the selected wheelset configuration.

Do not merely update the displayed spoke count while retaining the previous wheel geometry.

## Lacing patterns

Use the selected wheelset's documented lacing pattern.

Examples may include:

- Radial.
- Two-cross.
- Three-cross.

Do not assume all 20/24 wheelsets use the same lacing.

Use manufacturer or wheel-builder specifications when available.

## Existing wheelsets

Preserve existing supported wheelset configurations.

Do not replace all wheelsets with 20/24 spokes.

Treat 20/24 as an additional supported configuration.

Only present a wheelset as a real branded product when its actual model, specifications, and permitted assets have been verified.

---

# 7. WHEELSET FINISH CUSTOMIZATION

Implement a polished finish-selection experience.

## Default finish options

For eligible generic or customizable wheelsets:

- Polished.
- Pure Black.

For branded wheelsets:

- Verified Manufacturer Finish.
- Additional verified manufacturer finishes, where available.
- Clearly labeled Custom Concept Finish only if the application intentionally supports unofficial recoloring.

Do not create fictional official colorways.

## Wheelset-wide finish

When selecting Polished or Pure Black on a configurable wheelset, apply the corresponding coordinated appearance to:

- Front rim.
- Rear rim.
- Front spokes.
- Rear spokes.
- Front hub.
- Rear hub.
- Relevant visible wheel hardware.

Preserve actual product-specific mixed finishes when the selected variant requires them.

## Polished

Use a refined metallic appearance:

- Appropriate reflections.
- Metallic highlights.
- Controlled roughness.
- Correct material appearance.
- Suitable silver tones.

Do not make everything appear like a perfect chrome mirror.

## Pure Black

Use a clean black finish with:

- Visible surface contours.
- Appropriate roughness.
- Readable highlights.
- Correct material separation.

Avoid featureless pure-black geometry.

## Independent visual material zones

Prepare separate rendering material zones for:

- Rims.
- Spokes.
- Hubs.

This permits accurate product finishes and future customization without requiring the postponed full independent-wheel-component purchasing/configuration system.

Do not introduce conflicting product selections merely to support separate materials.

## 2D consistency

Represent polished and black finishes appropriately in SVG.

Use refined vector shading rather than only changing flat fill colors.

---

# 8. CRANKSET AND CHAINRING VISUAL CORRECTIONS

Improve:

- Right crank arm.
- Left crank arm.
- Arm thickness and shape.
- Crank spider or supported interface.
- Bottom bracket spindle connection.
- Chainring.
- Chainring teeth.
- Rear cog.
- Chain.
- Pedal attachment.

Ensure correct relative scale and positioning.

The crank arms must not appear as arbitrary flat bars.

## Crank arm finish

For eligible products, support:

- Polished.
- Pure Black.
- Verified Manufacturer Finish.

## Chainring finish

For eligible products, support:

- Polished.
- Pure Black.
- Verified Manufacturer Finish.

The crank arm and chainring should have separate appearance selections in the existing drivetrain controls when this can be implemented without the postponed full modular product-selection overhaul.

A finish change must not create a different physical component or alter mechanical compatibility.

## Brand-specific appearance

If a verified product uses distinctive branding or finish:

- Preserve the correct product appearance.
- Register appropriate artwork and material references.
- Use the manufacturer's name in the catalog.
- Use protected logos/decals on the model only when appropriate usage rights are established.

If the user selects a custom concept recolor, clearly distinguish it from an official factory variant.

Do not invent manufacturer colors or decals.

---

# 9. FIX THE SADDLE AND SEATPOST

The saddle still requires significant visual improvement.

## Saddle geometry

Improve:

- Saddle nose.
- Rear support shape.
- Width distribution.
- Saddle shell thickness.
- Top contour.
- Rails.
- Underside structure.
- Seatpost clamp connection.

The saddle must have a plausible three-dimensional form from every camera angle.

Avoid oversized, irregularly shaped, or flat placeholder meshes.

## Saddle rails

Create properly positioned rails and attachment points.

Support documented rail shapes and dimensions.

The saddle must connect to the seatpost head.

Do not create floating saddle shells or disconnected rails.

## Seatpost geometry

Improve:

- Seatpost cylinder/profile.
- Seat tube alignment.
- Seatpost head.
- Saddle clamp.
- Appropriate saddle positioning.

Support verified seatpost finishes.

## Saddle compatibility validation

Fix the current validation logic.

**Do not compare saddle compatibility directly against seatpost diameter.**

Separate these relationships:

1. Frame seat tube ↔ seatpost diameter/interface.
2. Seatpost head/clamp ↔ saddle rail type and dimensions.

A saddle should not be rejected merely because one seatpost has a different tube diameter.

However, do not universally approve all saddles and clamps.

Validate applicable rail and clamp interfaces, including round rails, oval rails, and proprietary systems.

Unknown clamp specifications must produce "Needs Verification," not automatic compatibility.

## Saddle color

Support verified saddle appearance variants where available.

Do not apply polished-metal material to the entire saddle shell unless the actual product supports that appearance.

Seatpost and saddle rails may have their own appropriate metal finishes.

---

# 10. COMPLETE COCKPIT MODELING AND FINISH CUSTOMIZATION

Preserve all four handlebar types:

- Dropbar.
- Riser.
- Straight/Flat.
- Bullhorn.

## Geometry correction

Improve:

- Handlebar width.
- Clamp section.
- Tube thickness.
- Rise.
- Sweep.
- Reach.
- Drop.
- Curvature.
- Grip areas.
- Stem alignment.
- Headset/steerer connection.

Each handlebar must have correct geometry.

Do not produce all four types from the same mesh by merely rotating it.

## Appearance controls

Add appropriate appearance controls for:

- Handlebar.
- Stem.
- Relevant visible spacers where supported.

For eligible components, support:

- Polished.
- Pure Black.
- Verified Manufacturer Finish.

## Separate visual appearance

The stem and handlebar should not be forced to share a finish.

Example:

- Stem: Polished.
- Handlebar: Pure Black.

Or:

- Stem: Black.
- Handlebar: Verified branded finish.

These are cosmetic material-zone selections, not the postponed complete independent-product customization system.

## Grips and bar tape

Maintain suitable appearances for:

- Dropbar tape.
- Flatbar grips.
- Riser grips.
- Bullhorn finishing.

Do not automatically apply polished-metal materials to rubber grips or fabric bar tape.

Use verified product colors where available.

## Manufacturer branding

Where supported and permitted:

- Display correct component branding.
- Position decals or markings appropriately.
- Preserve brand-specific color schemes.
- Avoid distorted logos.
- Avoid mirrored text.
- Avoid graphics floating above the component.

When protected graphics cannot be used, provide appropriate descriptive naming in the catalog instead.

---

# 11. OTHER COMPONENTS TO POLISH

Inspect all remaining visible bicycle components.

Improve any unfinished or inconsistent geometry.

Include:

- Headset covers.
- Spacers.
- Stem faceplate.
- Seatpost clamp.
- Pedals.
- Pedal spindles.
- Chain.
- Cog.
- Lockring.
- Hub axle ends.
- Wheel hardware.
- Crank spindle interface.
- Fork crown.
- Rear track ends.
- Tire sidewalls.
- Frame tube joints.

Maintain appropriate material consistency.

Do not make every component glossy or metallic.

Apply materials according to the component's actual construction.

---

# 12. UNIFIED MATERIAL AND COLORWAY SYSTEM

Create or improve a reusable material registry.

Recommended finish classes:

- `polished-metal`
- `black-anodized`
- `black-painted`
- `factory-finish`
- `custom-concept`

Use appropriate variants where needed.

These are conceptual identifiers, not mandatory names.

A black rubber tire, black anodized crank arm, and black painted frame must not all use the same physically based material.

Use material properties appropriate to the underlying component.

## Suggested state organization

Maintain separate appearance selections for:

- Frameset factory colorway.
- Wheelset appearance.
- Crank arm finish.
- Chainring finish.
- Handlebar finish.
- Stem finish.
- Seatpost finish.
- Other currently supported appearance zones.

Keep one canonical configuration shared by both renderers.

Do not create independent conflicting 2D and 3D color state.

## Brand colorways

For framesets, preserve official manufacturer colorways.

For branded components, show only documented factory finishes as official options.

For eligible neutral/demo components, permit polished and black.

If unofficial recoloring is supported, label the resulting appearance as a custom concept rather than the manufacturer's original product finish.

## Persistence

Save material and finish selections alongside the corresponding build configuration.

Ensure older builds continue loading through sensible schema defaults and versioned migration logic.

Do not rewrite historical selections into unverified factory variants.

---

# 13. IMPROVE THE 2D DISPLAY

The 2D viewer still requires substantial polishing.

It must not remain a simplified or outdated representation of the improved 3D bicycle.

## Required improvements

Improve:

- Frame tube contours.
- Head tube profile.
- Headset/steerer representation.
- Fork crown and visible blades.
- Front and rear dropouts.
- Wheel rims.
- Spoke patterns.
- Hubs.
- Tire cross-sections.
- Chainring.
- Crank arms.
- Chain.
- Saddle.
- Seatpost.
- Stem.
- All four handlebar types.

## 20/24 wheelsets

When a 20/24-spoke wheelset is selected:

- Render 20 spokes for the front wheel.
- Render 24 spokes for the rear wheel.
- Use the correct projected lacing arrangement.
- Preserve realistic wheel proportions.

Do not draw extra decorative spokes.

## Finish system

Show the selected:

- Frameset colorway.
- Wheelset finish.
- Crank arm finish.
- Chainring finish.
- Stem finish.
- Handlebar finish.
- Seatpost finish.

Use subtle vector gradients and material cues where appropriate.

## Layering

Fix incorrect SVG layer order.

The frame, fork, wheels, drivetrain, saddle, and cockpit must overlap in geometrically coherent ways.

The bicycle should look complete, not like a collection of disconnected paths.

---

# 14. FIX 3D CAMERA FRAMING AND CLIPPING

The screenshots show major camera-framing problems.

Some viewpoints cut off:

- Rear wheel.
- Front wheel.
- Cockpit.
- Saddle.
- Pedals.
- Other visible components.

Fix the camera system.

## Requirements

- Calculate complete assembly bounds.
- Include all visible parts.
- Use bounding-box-aware camera fitting.
- Account for perspective projection.
- Account for viewport aspect ratio.
- Maintain an appropriate target point.
- Preserve a reasonable margin.
- Recalculate after geometry changes.
- Avoid camera clipping through components.
- Keep the floor/reference plane consistent.

## Default view

The default camera should show the complete bicycle.

Use a refined three-quarter or side-oriented studio composition.

Do not start excessively zoomed in.

## Camera presets

Verify:

- Side.
- Front.
- Rear.
- Three-quarter front.
- Three-quarter rear.
- Top, where supported.

Each preset must show the complete bicycle unless the user intentionally enters a component-inspection view.

## Zoom behavior

Zoom should have sensible limits.

The model must not disappear or become impossible to recover.

Reset View must restore proper fit-to-view.

Turntable mode must not override user interactions unexpectedly.

---

# 15. UI/UX FOR COMPONENT FINISH SELECTION

Keep the existing premium graphite/electric-blue TrackLab design.

Do not redesign the overall workspace.

Improve the component panel to display finish choices clearly.

## Frameset

Use:

Brand → Model → Size → Official Colorway.

## Wheelsets

Show:

- Wheelset model.
- Spoke configuration.
- Rim profile.
- Finish options.
- Verified source/visualization status.

Include the new 20F/24R spoke configuration where supported.

## Drivetrain

Show appropriate finish controls for:

- Crank arms.
- Chainring.

## Cockpit

Show:

- Handlebar type.
- Handlebar finish.
- Stem finish.

## Seating

Show:

- Saddle product/appearance.
- Seatpost finish where supported.

## Finish control design

Use compact:

- Segmented controls.
- Swatches.
- Small visual finish cards.
- Dropdowns when the number of options is large.

Clearly distinguish:

- Factory finish.
- Polished.
- Pure Black.
- Custom Concept.

Do not show unsupported options as selectable.

Do not make the right-side panel excessively tall or crowded.

---

# 16. STRICT MODEL ACCURACY

Preserve supported brands including:

- Cinelli.
- Dosnoventa.
- Tsunami.
- Skream.
- Engine11.
- Leader.
- 8bar.
- Other verified manufacturers.

Do not apply the same geometry to all brands while claiming exact authenticity.

Use model-specific manufacturer specifications where available.

Do not invent geometry or brand graphics.

Every catalog item must have an appropriate fidelity status.

A branded product may be technically verified while its visual rendering is still approximate.

Maintain that distinction.

The UI should not claim that an illustrative model is an official manufacturer-provided 3D model.

---

# 17. COMPATIBILITY AND DATA VALIDATION

Review the compatibility engine after all visual changes.

## Cosmetic changes

Changing a finish must not incorrectly change structural compatibility.

Examples:

- Polished crank arms and black crank arms do not inherently have different fitment if they are merely finishes of the same physical variant.
- Black and polished wheel finishes do not change hub spacing or wheel diameter.
- Handlebar finishes do not change stem clamp compatibility.
- Seatpost finishes do not change seatpost diameter.

However, if a factory finish belongs to a genuinely different product variant with different specifications, validate using that variant's actual data.

## Wheelset validation

For 20F/24R configurations, validate:

- Actual product variant.
- Front/rear spoke counts.
- Hub drilling.
- Rim drilling.
- Lacing pattern.
- Wheel diameter.
- Axle interfaces.
- Frame/fork compatibility.

Do not allow arbitrary spoke-count selection for a verified factory wheelset when that model is not offered in the selected configuration.

## Saddle validation

Remove incorrect saddle-to-seatpost diameter comparisons.

Validate saddle rails against the seatpost-head clamp.

Validate seatpost diameter separately against the frame.

Do not mark incompatible rail/clamp systems as compatible.

---

# 18. PERFORMANCE AND ARCHITECTURE

Keep the existing frontend/backend structure.

Avoid unnecessary dependencies and complete rewrites.

## Rendering

- Reuse geometry where appropriate.
- Cache materials.
- Cache textures.
- Avoid unnecessary GLB reloads.
- Dispose of obsolete GPU resources.
- Use efficient spoke generation.
- Minimize unnecessary scene reconstruction.
- Preserve reasonable mobile performance.
- Use suitable graphics-quality settings.

Changing only a finish should not reconstruct the entire bicycle geometry.

Changing the spoke configuration should rebuild or load only the necessary wheel assembly assets.

## Database

Do not create separate MongoDB product records for every cosmetic combination unless they correspond to real catalog variants.

Use a structured appearance-selection system.

Preserve existing saved builds.

---

# 19. TESTING AND VISUAL VERIFICATION

Run actual tests and capture screenshots.

## Required model comparisons

Test:

- Existing wheelset vs 20F/24R wheelset.
- Polished wheels vs black wheels.
- Polished crank arms vs black crank arms.
- Polished chainring vs black chainring.
- Polished stem vs black stem.
- Polished handlebar vs black handlebar.
- Official branded finish selection.
- Saddle and seatpost appearance.
- Multiple frameset sizes.
- At least two supported branded frames.

## Required viewpoints

Capture:

1. Full left-side view.
2. Full right-side view.
3. Front.
4. Rear.
5. Three-quarter front.
6. Three-quarter rear.
7. Head tube close-up.
8. Fork/dropout close-up.
9. Wheel and hub close-up.
10. Crankset close-up.
11. Saddle/seatpost close-up.
12. Cockpit close-up.

## Required checks

Verify:

- No exposed disconnected steerer.
- No incorrect headset alignment.
- No floating fork blades.
- No detached dropouts.
- No disconnected wheel hubs.
- Correct spoke counts.
- Correct wheel alignment.
- No incorrect crank geometry.
- Correct saddle attachment.
- No missing components in camera presets.
- Correct 2D/3D finish synchronization.
- No broken saved-build configurations.
- No false compatibility errors.
- No unexpected frontend overflow.
- No unnecessary performance regression.

## Technical verification

Run:

- TypeScript checks.
- Linting.
- Unit tests.
- Geometry validation tests.
- Compatibility tests.
- Build persistence tests.
- Browser tests.
- Production builds.

Use Playwright or available browser tools to inspect the actual result.

Do not claim a successful visual correction without inspecting the rendered output.

---

# 20. IMPLEMENTATION ORDER

Follow this priority order.

### Stage 1 — Audit
Inspect existing geometry, rendering, material, product data, and validation.

### Stage 2 — Structural Geometry
Correct the head tube, steerer, headset, forks, and dropouts.

### Stage 3 — Wheelsets
Improve wheels, hubs, spokes, rims, and tires.

Implement verified 20F/24R spoke configurations.

### Stage 4 — Drivetrain
Improve crankset, crank arms, chainring, chain, cog, and pedals.

### Stage 5 — Seating
Improve saddle, rails, clamp, seatpost, and compatibility logic.

### Stage 6 — Cockpit
Polish dropbar, riser, straight/flat, and bullhorn geometry.

### Stage 7 — Unified Finish System
Implement polished, pure black, and verified manufacturer-specific finish options.

### Stage 8 — 2D Synchronization
Improve SVG geometry and appearance so it matches the selected 3D configuration.

### Stage 9 — Camera and Presentation
Fix clipping, fit-to-view behavior, materials, and lighting.

### Stage 10 — UI/UX Refinement
Improve the selection interface without redesigning the entire application.

### Stage 11 — Testing
Inspect all corrected models and finishes across both renderers.

### Stage 12 — Documentation
Record what was fixed, what remains illustrative, and which product assets still require additional verified information.

---

# 21. FINAL ACCEPTANCE CRITERIA

This task is not complete unless:

1. Head tubes and steerers are realistically assembled.
2. Fork crowns and blades have improved geometry.
3. Front and rear dropouts are correctly represented.
4. Wheels have believable rims, hubs, spokes, and tires.
5. 20F/24R spoke-count wheelset selection works.
6. Spoke counts and patterns update visually in 2D and 3D.
7. Wheelsets support eligible polished and black finishes.
8. Crank arms support eligible polished and black finishes.
9. Chainrings support eligible polished and black finishes.
10. Cockpit handles supported polished, black, and verified factory finishes.
11. Stem and handlebar finishes can be controlled separately where supported.
12. Saddle geometry is substantially improved.
13. Saddle compatibility validation no longer incorrectly depends on seatpost diameter.
14. Seatpost and saddle-clamp interfaces remain properly validated.
15. Official frameset colorways are preserved.
16. Manufacturer graphics are used only where permitted.
17. Brand-specific appearances remain accurately classified.
18. 2D rendering reflects all supported finish selections.
19. 3D rendering reflects all supported finish selections.
20. Camera presets frame the complete bicycle properly.
21. Existing saved builds continue functioning.
22. Existing quotas and authentication remain intact.
23. Current responsive layouts remain functional.
24. No unrelated features are broken.
25. Actual browser and automated tests have been executed.

---

# FINAL STRICT INSTRUCTIONS

**Do not settle for a bicycle that looks acceptable only from one camera angle.**

Correct the geometry and assembly first.

Every visible component should have appropriate proportions, attachments, and material appearance.

Implement the 20-front/24-rear spoke wheelset configuration and make its spoke geometry visibly accurate.

Use official existing frameset colorways.

For eligible non-frame components, provide Polished and Pure Black finish options.

Preserve verified brand-specific finishes and use permitted component branding where available.

Do not fabricate official manufacturer colors, logos, or product variants.

Fix the saddle and seatpost compatibility logic without introducing false universal compatibility claims.

Do not reintroduce the green portfolio theme.

Do not expand into the postponed complete advanced modular component-selection system during this milestone.

Maintain one shared bicycle configuration across both 2D and 3D.

**The target is a realistic, polished, cohesive fixed-gear bicycle builder with accurate geometry, convincing materials, selectable component finishes, and consistent rendering from every viewing angle.**