# TRACKLAB — PRECISION 2D/3D GEOMETRY, OVERLAP ELIMINATION & REAL-WORLD ASSEMBLY REFINEMENT

## Fix Fork, Head Tube, Steerer, Headset, Axle Nuts, Washers, Front Dropouts, Rear Track Ends, Frame Junctions, and Component Intersections

### ROLE

Act as a Senior Three.js Engineer, React Three Fiber Developer, Blender Technical 3D Modeler, Bicycle Mechanical Design Specialist, SVG Rendering Engineer, UI/UX Designer, and Full-Stack Code Reviewer.

Your task is to thoroughly inspect and correct the existing TrackLab 2D and 3D bicycle assembly.

Use the supplied screenshots as the visual baseline.

**CRITICAL REQUIREMENT: Every visible bicycle component must connect correctly according to its actual mechanical interface and the selected manufacturer's documented design.**

Do not simply overlap cylinders, meshes, or SVG paths to create the appearance of a completed bicycle.

Correct actual geometry, attachment points, mesh intersections, assembly order, and rendering layers.

Preserve the current React, TypeScript, Three.js, MongoDB, and existing application architecture.

Do not rebuild TrackLab from scratch.

---

# 1. PRIMARY OBJECTIVES

Implement the following:

1. Fix overlapping geometry throughout the bicycle.
2. Rebuild the head tube and headset connection.
3. Correct steerer tube placement and exposed length.
4. Improve fork crown and fork blade geometry.
5. Implement realistic front fork dropout interfaces.
6. Improve front and rear axle attachments.
7. Model appropriate axle nuts, washers, and other visible retention hardware.
8. Correct rear track ends and their axle slots.
9. Improve chainstay and seatstay connections to rear dropouts.
10. Correct frame tube intersections and junction shapes.
11. Fix component penetration and improper lateral alignment.
12. Synchronize structural improvements between 2D and 3D.
13. Preserve model-specific manufacturer geometry.
14. Improve camera inspection and visual verification.
15. Preserve current component finishes, colorways, animations, and builder functionality.

**Do not mark the task complete based on visual improvements to a single camera angle.**

---

# 2. FULL GEOMETRY AUDIT

Before modifying the renderers, inspect:

- Existing geometry generators.
- Three.js mesh hierarchy.
- Scene graph transforms.
- Shared bicycle coordinate system.
- Frame geometry records.
- Head tube generator.
- Headset and steerer modeling.
- Fork and fork crown generator.
- Front dropouts.
- Rear track ends.
- Hub and axle generation.
- Wheel positioning.
- Stem and handlebar attachment.
- Seat tube and seatpost junction.
- Seatstay and chainstay endpoints.
- Bottom bracket and drivetrain assembly.
- Existing 2D SVG paths.
- Mesh normals.
- Material depth handling.
- Existing visual-regression tests.

For every problem identified, determine whether it originates from:

- Incorrect geometry dimensions.
- Incorrect attachment anchors.
- Incorrect component rotation.
- Incorrect world-space conversion.
- Incorrect parent-child transformation.
- Inverted axes.
- Incorrect mesh thickness.
- Mesh penetration.
- Incorrect surface visibility.
- Depth-buffer conflicts.
- Improper SVG drawing order.
- Missing mechanical connection geometry.

Document the root cause before fixing each group of problems.

---

# 3. ESTABLISH A RELIABLE ASSEMBLY COORDINATE SYSTEM

Both rendering modes must use one authoritative bicycle geometry model.

Use millimeters for technical geometry data and a consistent conversion to rendering coordinates.

Recommended 3D axes:

- X: front-to-rear bicycle direction.
- Y: vertical direction.
- Z: lateral width.

Adapt the convention to the existing implementation if it already has a consistent coordinate system.

Do not mix coordinate conventions across different mesh generators.

## Required attachment anchors

Maintain explicit reference positions for:

- Head tube top.
- Head tube bottom.
- Steering axis.
- Headset bearing interfaces.
- Fork crown.
- Front axle center.
- Rear axle center.
- Front left/right dropout interfaces.
- Rear left/right dropout interfaces.
- Bottom bracket.
- Seat tube top.
- Seat tube axis.
- Seatpost head.
- Stem clamp.
- Handlebar clamp.
- Front/rear hub centers.
- Relevant axle hardware positions.

All attached components must derive their positions from these anchors.

Avoid arbitrary per-component position offsets.

## Intentional versus incorrect intersections

Some bicycle components are designed to connect or physically overlap, such as welded tube junctions and clamped assemblies.

Do not blindly eliminate every mesh intersection.

Distinguish:

**Intentional structural intersection**
A properly modeled weld, insertion, or clamp connection.

**Incorrect penetration**
A mesh passing through another component where no such physical relationship exists.

**Rendering overlap**
Z-fighting, duplicated faces, incorrectly ordered SVG layers, or unwanted visible surfaces.

Each category requires the appropriate correction.

---

# 4. COMPLETELY FIX THE HEAD TUBE ASSEMBLY

This is a high-priority issue.

## 4.1 Head tube

Implement a realistic head tube containing:

- Correct upper opening/interface.
- Correct lower opening/interface.
- Appropriate tube profile.
- Correct head tube length.
- Correct steering angle.
- Proper top tube junction.
- Proper down tube junction.
- Realistic outer surfaces.

The head tube must appear structurally integrated with the frame.

Do not generate it as a floating cylinder with frame tubes passing through its visible external surface incorrectly.

## 4.2 Headset

Correct the visible headset assembly.

Include only appropriate supported components:

- Upper headset cover.
- Lower headset interface.
- Crown race or integrated equivalent where applicable.
- Spacers.
- Compression/top-cap details.
- Stem clamp connection.

Internal bearing geometry should not be unnecessarily visible through assembled components.

## 4.3 Steerer tube

The current steerer and stem area require correction.

Requirements:

- Steerer follows the steering axis.
- Steerer passes through the correct headset interfaces.
- The visible upper end corresponds to the selected assembly.
- Stem clamps around the appropriate steerer section.
- Spacers occupy valid positions.
- Top cap aligns correctly.
- No floating headset rings.
- No arbitrary exposed steerer extension.

Do not simply shorten the steerer by an arbitrary value to improve its appearance.

Determine the correct assembly positions first.

## 4.4 Modern headset variations

Support verified model-specific configurations.

Examples:

- Integrated headset.
- Zero-stack headset.
- External-cup headset.
- Straight steerer.
- Tapered steerer.

Do not assign the same headset geometry to every manufacturer.

---

# 5. REBUILD FORK CROWN AND FORK BLADES

The fork should look like an actual complete structural assembly.

## Required parts

- Steerer.
- Fork crown.
- Left fork blade.
- Right fork blade.
- Left front axle interface.
- Right front axle interface.

## Fork crown

Improve:

- Crown thickness.
- Crown-to-steerer connection.
- Fork blade transitions.
- Clearance under the head tube.
- Correct fork material appearance.
- Model-specific shape where verified.

Avoid oversized, floating, or disconnected crown geometry.

## Fork blades

Improve:

- Blade thickness.
- Taper.
- Tube cross-section.
- Curvature.
- Fork offset.
- Left/right symmetry where appropriate.
- Axle attachment.

For carbon forks, use the documented blade shape and appropriate aerodynamic profiles when source data supports them.

For steel/alloy forks, use the correct construction profile.

Do not automatically reuse the same carbon-fork geometry for all framesets.

## Correct axle attachment

The two fork blades must attach to their actual axle interfaces.

The wheel must sit centered between the blades.

The fork blades must not end at the middle of the wheel hub.

Both sides must occupy the correct lateral positions.

---

# 6. FRONT FORK DROPOUTS AND AXLE HARDWARE

**Mandatory detailed modeling improvement.**

The front fork dropout must correspond to the selected fork's actual axle-retention system.

## Supported interface types

Model appropriately when documented:

- Open dropout with appropriate axle interface.
- Nutted axle arrangement.
- Quick-release-compatible dropout.
- Thru-axle interface.
- Manufacturer-specific retention arrangement.

Do not render all systems using the same generic axle nut.

## Front dropout geometry

Where applicable, include:

- Fork blade termination.
- Dropout body.
- Axle opening or slot.
- Correct thickness.
- Correct axle center.
- Appropriate left/right structure.

The front axle must sit correctly within its corresponding retention interface.

## Axle nuts and washers

For products using nutted axles, represent appropriate visible hardware:

- Axle ends.
- Left/right axle nuts.
- Suitable washers or retention hardware where applicable.
- Correct lateral positioning.
- Appropriate proportions.

Hardware must not:

- Float away from the axle.
- Pass through the wheel hub.
- Be positioned inside the rim.
- Intersect fork blades incorrectly.
- Appear on a product that uses an incompatible axle-retention system.

For quick-release or thru-axle designs, use the appropriate documented hardware instead of generic track axle nuts.

## Mechanical modeling rule

Axle hardware must be attached to the hub/axle assembly and positioned relative to the dropout interfaces.

Do not place nuts using unrelated world coordinates.

---

# 7. REBUILD REAR DROPOUTS / TRACK ENDS

The rear track ends need more detail and structural accuracy.

## Typical rearward-facing track ends

When the selected frame uses them, model:

- Rear dropout plate.
- Rearward-facing axle slot.
- Correct slot orientation.
- Appropriate thickness.
- Axle position.
- Chainstay junction.
- Seatstay junction.
- Correct visible hardware.

Do not simply model a short bar extending from the rear triangle.

## Rear axle

The rear axle must:

- Pass through the rear hub.
- Align with both track-end interfaces.
- Occupy an appropriate position in the slots.
- Keep the rear wheel centered.
- Maintain correct lateral spacing.
- Align with the drivetrain.

## Rear axle nuts

Where the selected hub uses nutted axle retention:

- Position the nuts appropriately on both sides.
- Model washers or related retention hardware where supported.
- Keep nut dimensions realistic.
- Do not let nuts penetrate the dropout plate.
- Do not create floating bolts.

## Manufacturer-specific track ends

Different manufacturers have distinct rear dropout designs.

Examples:

**Tsunami SNM100**
- Removable stainless-steel dropout plates.
- Documented four-hole plate arrangement for referenced versions.

**8bar KRZBERG V8**
- Custom rear dropout construction.
- Double-sided stainless-steel dropout plates.

**Other supported track frames**
- Use the documented dropout profile, axle slot, and connection geometry.

Do not apply Tsunami's removable plates to Cinelli, Dosnoventa, Skream, or other framesets without evidence.

Do not assume all models have axle tensioning screws.

Do not invent product-specific hardware.

---

# 8. CORRECT SEATSTAY AND CHAINSTAY CONNECTIONS

Inspect the rear triangle carefully.

## Seatstays

Ensure:

- The stays begin at the correct model-specific seat tube junction.
- They terminate at the actual rear dropout assembly.
- Left and right stays have appropriate lateral separation.
- Tube profiles remain consistent.
- No stay passes through the rear tire.
- No stay floats away from the dropout.

## Chainstays

Ensure:

- Correct bottom bracket junction.
- Correct rear axle relationship.
- Appropriate lateral spacing.
- Suitable drivetrain clearance.
- Proper connection to track ends.
- No unintended intersections with chainring or rear wheel.

## Model-specific geometry

Preserve the selected manufacturer's documented stay positions.

For example, dropped seatstays and conventional high seatstay junctions must not be represented identically.

Do not modify verified frame geometry merely to conceal an overlap caused by incorrect mesh positioning.

---

# 9. FIX ALL FRAME TUBE JUNCTIONS

Inspect every connection.

Required junctions:

- Top tube ↔ Head tube.
- Down tube ↔ Head tube.
- Top tube ↔ Seat tube.
- Seatstays ↔ Seat tube.
- Seat tube ↔ Bottom bracket.
- Down tube ↔ Bottom bracket.
- Chainstays ↔ Bottom bracket.
- Chainstays ↔ Rear dropouts.
- Seatstays ↔ Rear dropouts.

## Visual requirements

- No floating tubes.
- No visible open geometry ends at unintended locations.
- No unrealistic tubes protruding through other frame surfaces.
- No detached junction caps.
- No sharp shading artifacts from overlapping cylinders.
- No excessive weld details unless the model construction requires them.

Use proper mesh joining, surface transitions, or suitable modeling techniques where needed.

For independently modeled aerodynamic tubes, ensure profiles blend correctly into junctions.

Do not replace verified tube profiles with generic round cylinders.

---

# 10. CORRECT 2D SVG OVERLAPS

Every corrected 3D attachment must also be represented coherently in 2D.

## Required SVG improvements

- Head tube projection.
- Fork/headset connection.
- Fork blade silhouette.
- Front dropout profile.
- Front axle hardware.
- Rear track-end silhouette.
- Rear axle hardware.
- Seatstay connections.
- Chainstay connections.
- Bottom bracket junction.
- Crankset layering.
- Wheel and hub layering.

## Layer ordering

Establish correct front-to-back ordering from the chosen viewpoint.

For example:

- Far-side fork blade.
- Wheel/hub assembly.
- Near-side fork blade.
- Visible axle hardware.

Adapt the actual order to the viewing direction and assembly.

Do not draw axle nuts over frame tubes merely because they were rendered later.

## SVG rendering defects

Fix:

- Duplicate paths.
- Incorrect clipping.
- Unwanted overlaps.
- Missing stroke joins.
- Open tube ends.
- Incorrect clipping masks.
- Excessive outlines.
- Misaligned gradients.

Maintain a crisp vector appearance.

---

# 11. PREVENT Z-FIGHTING AND DEPTH ARTIFACTS

Inspect the 3D renderer for:

- Coincident surfaces.
- Duplicate geometry.
- Incorrect depth writing.
- Depth-test conflicts.
- Transparent surface sorting.
- Flipped normals.
- Unnecessary double-sided materials.
- Overlapping surfaces with incompatible transforms.

Use suitable fixes based on actual causes.

Do not use arbitrary polygon offsets globally to hide incorrect geometry.

Avoid z-fighting at:

- Fork crown.
- Headset covers.
- Track-end plates.
- Axle washers.
- Stem faceplate.
- Frame junctions.
- Chainring assembly.
- Hub interfaces.

Preserve physically correct geometry wherever possible.

---

# 12. MODEL-SPECIFIC MANUFACTURER REFERENCES

Use official manufacturer product pages as the primary sources for model differences.

## Cinelli Vigorelli

https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame

Verify:

- Head tube/headset interfaces.
- Carbon fork design.
- Frame tube junctions.
- Aero seat tube and seatpost.
- Frame and fork geometry.
- Dropout construction.

## Cinelli Vigorelli Steel

https://usa.cinelli-milano.com/products/vigorelli-steel-frame-kit

Do not assume its headset, seatpost, or tube morphology is identical to the aluminum frameset.

## Tsunami SNM100

https://tsunamibicycle.com/product/tsunami-snm100-black-red/

Verify:

- Frame/fork interfaces.
- Headset.
- Fork construction.
- Rear removable dropout plates.
- Front/rear axle spacing.

## Tsunami SNM100 Elite

https://tsunamibicycle.com/product/snm100-elite-matte-black-carbon-fork/

Verify the carbon fork and model-specific differences.

## 8bar KRZBERG V8

https://8bar-bikes.com/8bar_krzberg_v8/

Verify the custom dropouts, oval top tube, and frame tube construction.

## Skream Ranger

https://skreambikes.com/products/ranger-forest-frameset

Verify the tapered carbon fork, steering interfaces, fork dimensions, and model-specific mounting features.

## Dosnoventa 03 DET

https://dosnoventabikes.com/frames/detroit/detroit-frame-true-silver-5/

Verify the pursuit-oriented frame geometry, carbon fork, and actual manufacturer assembly.

## Other manufacturers

Continue supporting the existing catalog's verified models from:

- Leader.
- Engine11.
- Skream.
- Cinelli.
- Dosnoventa.
- Tsunami.
- 8bar.
- Other source-backed manufacturers.

### Mandatory source rule

Do not copy arbitrary frameset geometry from unrelated product images.

Use the exact model, generation, and size.

Record source URLs and verification dates.

Use permitted product reference imagery.

If a detail cannot be verified, keep the geometry explicitly illustrative.

Do not fabricate exact manufacturer hardware.

---

# 13. BUILD A GEOMETRY VALIDATION SYSTEM

Add automated geometry checks.

## Attachment validation

Check:

- Head tube and steerer axes.
- Headset and fork crown connection.
- Front axle and fork dropout alignment.
- Rear axle and track-end alignment.
- Seatstay endpoints.
- Chainstay endpoints.
- Hub center alignment.
- Bottom bracket location.

## Clearance validation

Check relevant intersections between:

- Fork blades and tire.
- Frame stays and rear tire.
- Frame and wheel.
- Crank arms and chainstays.
- Chainring and frame.
- Stem/handlebar and surrounding components.
- Saddle rail and seatpost-head assembly.

Do not claim these checks establish every real-world safety requirement.

They are visualization and geometry sanity checks.

## Intersection detection

Use suitable mesh-intersection checks for critical component pairs.

Where helpful, use mesh bounding boxes, detailed triangle intersection tests, or a compatible BVH approach.

Do not rely solely on bounding boxes when their broad overlap is expected.

Exclude documented intentional assembly intersections.

Classify unexpected penetrations by component pair and severity.

Produce useful debugging diagnostics identifying the affected meshes and transforms.

## Development visualization

Add optional development-only overlays for:

- Steering axis.
- Axle centers.
- Attachment anchors.
- Frame control points.
- Dropout interfaces.
- Mesh bounds.
- Collision/intersection highlights.

Do not expose technical debug overlays to normal production users.

---

# 14. CAMERA AND INSPECTION REQUIREMENTS

The geometry must be correct from multiple camera angles.

Provide or preserve:

- Left side.
- Right side.
- Front.
- Rear.
- Front three-quarter.
- Rear three-quarter.
- Component close-up.

## Inspection presets

Add developer-accessible close-up presets for:

- Head tube.
- Headset/steerer.
- Fork crown.
- Front dropout.
- Rear track end.
- Rear axle hardware.
- Seatstay junction.
- Chainstay junction.

These are for accurate inspection and debugging.

They do not need to clutter the normal user interface.

## Camera framing

Maintain proper full-bike framing in normal viewing modes.

Inspection views may zoom into specific parts intentionally.

Do not use camera angles to hide incorrect connections.

---

# 15. PRESERVE REALISTIC MATERIALS AND FINISHES

Keep existing finish options:

- Polished.
- Pure Black.
- Verified factory finish.
- Custom Concept Finish where explicitly supported.

Preserve manufacturer colorways.

Do not change component dimensions when switching finishes.

Maintain different materials for:

- Painted frame tubes.
- Carbon forks.
- Metal axle hardware.
- Stainless-steel dropout plates.
- Rubber tires.
- Metallic cranksets.
- Saddle padding.
- Handlebar grips.

The material of an axle nut should not automatically match the frame paint.

Use appropriate physical materials for each component.

Avoid unrealistic mirror-like reflections on all hardware.

---

# 16. PRESERVE EXISTING 3D ANIMATIONS

Keep existing:

- Smooth camera transitions.
- Turntable mode.
- Component transitions.
- Frameset transitions.
- Material transitions.
- Studio lighting controls.
- Graphics quality settings.

However, ensure animations do not create geometry errors.

When switching framesets:

- Validate the destination geometry.
- Use the correct component attachment anchors.
- Update dependent transforms.
- Prevent outdated transition states.
- Avoid duplicate meshes.
- Remove obsolete temporary geometry.

Do not use morph animations to hide incorrect mechanical connections.

The final assembly must always be structurally coherent.

---

# 17. VISUAL QUALITY ASSURANCE

Use actual screenshots to verify the implementation.

## Required views

Capture:

1. Complete bicycle from left side.
2. Complete bicycle from right side.
3. Complete bicycle from front.
4. Complete bicycle from rear.
5. Three-quarter front.
6. Three-quarter rear.
7. Head tube close-up.
8. Headset and steerer close-up.
9. Fork crown close-up.
10. Front dropout and axle hardware close-up.
11. Rear track-end close-up.
12. Rear axle nut and washer close-up.
13. Seatstay/dropout junction.
14. Chainstay/dropout junction.
15. Bottom bracket junction.
16. Equivalent 2D structural close-ups.

## Manufacturer comparison

Compare the rendered components with verified and permitted manufacturer references.

Check:

- Position.
- Shape.
- Dimensions.
- Junction placement.
- Fork type.
- Dropout type.
- Axle interface.
- Visible hardware.
- Left/right symmetry where appropriate.

Do not mark the geometry accurate merely because all meshes are visible.

---

# 18. REGRESSION TESTING

Preserve and verify:

- Frameset selection.
- Model generations.
- Factory colorways.
- Wheelsets.
- 20/24, 32/32, and 36/36 configurations.
- Component finishes.
- Cockpit types.
- Saddle and seatpost.
- 2D/3D switching.
- Save and reopen.
- My Garage.
- Compatibility validation.
- Guest restrictions.
- Registered-user quotas.
- Authentication.
- API rate limiting.

Run:

- TypeScript checks.
- Lint.
- Unit tests.
- Geometry tests.
- Rendering tests.
- Browser tests.
- Production builds.

Do not claim success without execution.

Record actual failures and limitations.

---

# 19. IMPLEMENTATION ORDER

Perform changes in this order.

### Phase 1 — Audit

Inspect all existing geometry and document current overlaps.

### Phase 2 — Shared Assembly Anchors

Correct coordinate systems and attachment definitions.

### Phase 3 — Head Tube and Steerer

Fix the head tube, headset, steerer, spacers, and stem connection.

### Phase 4 — Fork and Front Dropouts

Correct the fork crown, blades, dropout interfaces, and axle hardware.

### Phase 5 — Rear Track Ends

Rebuild rear dropout geometry and correct axle positioning.

### Phase 6 — Frame Junctions

Correct seatstay, chainstay, top tube, down tube, and bottom bracket junctions.

### Phase 7 — 2D Synchronization

Apply the corrected geometry and rendering order in SVG.

### Phase 8 — Mesh Quality

Resolve incorrect intersections, normals, and depth artifacts.

### Phase 9 — Manufacturer Fidelity

Verify model-specific fork, dropout, and steering details against original references.

### Phase 10 — Visual Testing

Capture detailed inspection views and correct remaining problems.

### Phase 11 — Regression Testing

Verify all current builder functionality.

---

# 20. STRICT ACCEPTANCE CRITERIA

Do not mark this task complete unless:

1. The head tube is structurally integrated with the frame.
2. The steerer aligns correctly inside the headset.
3. Headset covers and spacers connect properly.
4. The stem attaches to the correct steering interface.
5. The fork crown is correctly positioned.
6. Fork blades connect to proper dropout interfaces.
7. Front axle hardware matches the selected axle system.
8. Nutted axle configurations show appropriately placed nuts and washers.
9. Quick-release and thru-axle systems are not incorrectly represented with track axle nuts.
10. Rear track ends have proper axle slots and structural profiles.
11. Rear axle nuts and washers are correctly positioned where applicable.
12. Seatstays and chainstays connect properly to the rear dropouts.
13. Frame tube junctions have no unintended visible penetrations.
14. No major floating or disconnected components remain.
15. No visible z-fighting remains in the affected assemblies.
16. Both 2D and 3D use consistent attachment geometry.
17. Manufacturer-specific fork and dropout styles are preserved.
18. Normal camera views display the complete bicycle.
19. Existing animations remain functional.
20. Existing component finishes and colorways remain functional.
21. Existing saved builds remain compatible.
22. Guest limits and account security remain intact.
23. Actual visual inspection has been performed.
24. Geometry and regression tests have been executed.
25. Any unresolved manufacturer-specific modeling limitations are documented.

---

# FINAL STRICT INSTRUCTIONS

**The goal is a clean, mechanically believable 2D and 3D bicycle assembly.**

Do not solve structural problems by:

- Hiding components.
- Shrinking unrelated meshes.
- Moving the camera.
- Covering gaps with decorative geometry.
- Adding oversized bolts.
- Applying excessive shadows.
- Changing materials to hide intersections.
- Applying arbitrary transforms without validating geometry.

Correct the source geometry and attachment system.

**The head tube, headset, steerer, fork crown, fork blades, dropouts, axles, axle hardware, seatstays, and chainstays must connect coherently.**

Use the actual selected manufacturer's product references and technical specifications.

Preserve model-specific construction differences between Cinelli, Dosnoventa, Tsunami, Skream, Leader, Engine11, 8bar, and other supported manufacturers.

Do not fabricate exact product details.

Continue using the existing TrackLab frontend/backend architecture, graphite/electric-blue design system, and established builder functionality.

Do not begin the postponed fully modular component customization overhaul.

**The completed bicycle must look structurally correct from every important camera angle, with clean mesh connections, realistic mechanical interfaces, and no unintended overlaps.**