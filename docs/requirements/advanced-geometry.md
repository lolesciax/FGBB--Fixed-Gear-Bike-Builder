# TRACKLAB — ADVANCED 2D/3D BICYCLE GEOMETRY CORRECTION & WHEELSET CONFIGURATION

## Fix Saddle, Seat Tube, Modern Frame Tubing, Forks, Track Ends, Deep-Section Wheels, and Spoke Configurations

### ROLE

Act as a Senior Three.js Engineer, React Three Fiber Developer, SVG Rendering Specialist, Blender Technical Modeler, Bicycle Frame Geometry Engineer, UI/UX Designer, Full-Stack Architect, and Quality Assurance Engineer.

Your task is to thoroughly inspect, correct, and polish the existing TrackLab bicycle modeling system.

Use the supplied screenshots as the visual baseline.

**The current bicycle still contains major geometric inaccuracies. This task must correct the actual 2D and 3D structures rather than hide problems through camera adjustments, lighting, colors, or post-processing.**

Do not restart the application.

Preserve its existing architecture, design system, authentication, MongoDB integration, saved builds, compatibility engine, and quota rules.

This implementation must prioritize model accuracy over adding unrelated features.

---

# 1. CURRENT PROBLEMS TO FIX

Based on the provided screenshots, investigate and correct the following:

### Saddle
- Saddle may appear missing or obscured in some camera angles.
- Saddle geometry lacks sufficient realistic detail.
- Saddle rails and clamp need better alignment.
- Saddle and seatpost proportions appear inconsistent.
- Saddle visibility must remain correct when switching framesets.

### Seat tube and seatpost
- Some frames have excessively exposed seat tubes or seatpost sections.
- Seat tube geometry looks too generic.
- Modern aerodynamic frames do not have sufficiently distinctive seat tube profiles.
- Frame seat tube and seatpost sometimes appear to use the same generic cylindrical representation.
- The saddle assembly needs proper mounting to the seatpost head.

### Fork
- Fork blades look too simplified.
- Fork crown shape needs improvement.
- The fork and headset assembly requires more realistic transitions.
- Some fork profiles look too narrow, straight, or generic.
- Branded modern carbon forks need model-specific profiles.

### Rear dropout / track end
- Rear axle connections look unfinished.
- Chainstays and seatstays terminate in overly simplified shapes.
- Track-end slots are not sufficiently represented.
- Model-specific dropout construction is missing or too generic.

### Deep-section wheels
- Some wheels appear like nearly solid dark discs.
- Spokes are difficult to see.
- Rim depth and inner wheel openings are not always visually correct.
- The rim, tire, and spoke layers need better separation.
- Wheel materials and shading need refinement.

### Camera
- Certain angles cut off the saddle, handlebars, or wheelsets.
- Default framing is inconsistent.
- Some zoom positions make it difficult to inspect the complete bicycle.

### 2D rendering
- The 2D renderer also needs improved geometry.
- Modern frame tube shapes must be represented in SVG.
- Wheel spoke configurations must match the selected setup.
- The SVG view must remain consistent with 3D.

**All these issues must be investigated in the actual source code and corrected.**

---

# 2. REPOSITORY-FIRST IMPLEMENTATION

Before changing code, inspect:

- Current frontend.
- Current backend.
- Shared bicycle geometry modules.
- Existing frameset records.
- Manufacturer/model variants.
- Frame size and geometry tables.
- Current procedural mesh generators.
- Imported GLB assets.
- Current SVG rendering.
- Current material and colorway system.
- Wheel assembly generation.
- Spoke and hub modeling.
- Saddle and seatpost geometry.
- Fork/headset construction.
- Track-end/dropout implementation.
- Camera controllers.
- Saved-build schema and persistence.
- Existing compatibility rules.

Determine which defects are caused by incorrect data and which are caused by rendering or transformation errors.

Do not duplicate working systems.

Do not create manufacturer-specific geometry by scattering brand-name conditions across React components.

Use a data-driven, maintainable geometry architecture.

---

# 3. MODERN FRAMESET TUBING — STRICT REQUIREMENT

TrackLab must properly represent the different tube constructions and geometries of real-world fixed-gear framesets.

**Modern framesets do not all use conventional round tubing.**

Different models have distinct:

- Top tube profiles.
- Down tube profiles.
- Seat tube profiles.
- Seatstay shapes.
- Chainstay construction.
- Head tube profiles.
- Bottom bracket junctions.
- Fork blades.
- Dropout designs.
- Seatpost arrangements.

Do not use the same universal tubular frame mesh for all manufacturers.

## 3.1 Required frame tube profiles

Support documented tube morphology, including:

- Circular.
- Oval.
- Elliptical.
- Aerodynamic/bladed.
- Tapered.
- Variable-section profiles.
- Manufacturer-specific custom shapes.

Use actual source-backed construction information.

A geometry table provides frame-point measurements, but does not necessarily provide full tube cross-sections. Use permitted manufacturer visual references and documented engineering information for morphology.

Do not invent precise proprietary shapes when the data is unavailable.

## 3.2 Top tube

Model the correct:

- Slope.
- Effective length.
- Actual visible shape.
- Cross-sectional profile.
- Seat tube connection.
- Head tube connection.
- Width/depth transitions.

For frames with aerodynamic or hammerhead-style top tubes, implement an appropriately modeled profile.

Do not substitute a plain cylindrical top tube.

## 3.3 Down tube

Improve:

- Cross-sectional shape.
- Tube depth.
- Width transitions.
- Aerodynamic profiles.
- Bottom bracket integration.
- Head tube junction.

The down tube should be visually distinct between conventional and aerodynamic frames where verified.

## 3.4 Seat tube

Improve:

- Actual frame seat tube construction.
- Seat tube angle.
- Documented aerodynamic shaping.
- Tube-to-bottom-bracket connection.
- Tube-to-top-tube connection.
- Seatstay junctions.
- Correct upper tube termination.
- Seatpost interface.

Do not treat the seat tube and seatpost as one continuous generic tube.

The seat tube is part of the frame.

The seatpost is a separate component fitted into or attached to the frame through its supported interface.

## 3.5 Seatstays

Support:

- Traditional straight seatstays.
- Curved seatstays.
- Dropped seatstays.
- Aerodynamic stay profiles.
- Model-specific junctions.

Do not automatically join all seatstays at the same point for every frameset.

## 3.6 Chainstays

Use actual documented:

- Length.
- Tube profile.
- Bottom bracket connection.
- Dropout connection.
- Tire clearance.
- Crank and chain clearance.

Ensure left and right chainstays align correctly in 3D.

---

# 4. REAL MANUFACTURER GEOMETRY REFERENCES

Use original manufacturer information as the primary source.

The following models are priority references.

## 4.1 Cinelli Vigorelli

Official source:
https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame

Important documented features:

- Negative-sloping top tube.
- Aerodynamic blade-shaped seat tube.
- Dedicated aero seatpost.
- Dedicated seat clamp.
- Tapered Columbus carbon fork.
- 377 mm chainstays.
- Model-specific headset dimensions.

The seat tube must not look like a standard oversized round cylinder.

The dedicated aero seatpost must visibly correspond to the documented frame interface.

Verify the exact selected size and model generation.

Do not apply current aluminum Vigorelli geometry to Vigorelli Steel automatically.

## 4.2 Skream Magnum

Official source:
https://skreambikes.com/products/magnum_dune

Important documented dimensions:

- Chainstay: 393 mm.
- Fork length: 370 mm.
- Fork rake: 40 mm.
- Tire clearance: 700 × 35c.

Use the selected frame size's full geometry table.

## 4.3 Skream Ranger

Official source:
https://skreambikes.com/products/ranger-forest-frameset

Important documented dimensions:

- Chainstay: 425 mm.
- Fork length: 395 mm.
- Fork rake: 45 mm.
- Tire clearance: 700 × 43mm.
- Front disc brake mount.
- Additional frame mounting points.

The Ranger must not look identical to the Magnum.

Its longer rear triangle and fork geometry must be reflected in both renderers.

## 4.4 Leader 735

Official source:
https://www.leaderbikesusa.com/products/2023-leader-735-with-carbon-aero-seat-post

Important features:

- Hammerhead-style top tube.
- Pronounced aerodynamic tubing.
- Tapered head tube.
- Dedicated aerodynamic seatpost.
- Aggressive frame geometry.

Do not render a standard round-tube bicycle and label it Leader 735.

## 4.5 8bar KRZBERG V8

Official source:
https://8bar-bikes.com/8bar_krzberg_v8/

Important features:

- Oval top tube.
- Redesigned tube profiles.
- Sloping geometry.
- Custom rear dropouts.
- Double-sided stainless-steel dropout plates.

Model these distinctive construction details where verified and visually supported.

## 4.6 Tsunami SNM100

Official source:
https://tsunamibicycle.com/product/tsunami-snm100-black/

Documented characteristics:

- 6061 aluminum frame and fork for the referenced variant.
- Model-specific headset configuration.
- 100 mm front hub spacing.
- 120 mm rear hub spacing.
- Removable stainless-steel dropout plates.

Do not automatically represent the SNM100 Elite's included fork as identical to the referenced standard version.

## 4.7 Dosnoventa DET

Official reference:
https://dosnoventabikes.com/frames/ninepointnine-2/dosnoventa03-det-ninepointnine-frameset/

Use model-specific pursuit geometry, appropriate tube construction, and supported fork specifications.

Do not substitute a generic horizontal track frame.

## 4.8 Additional brands

Maintain verified support for:

- Engine11.
- Other Dosnoventa models.
- Other Cinelli generations.
- Leader 725.
- Skream additional variants.
- Other existing catalog entries.

Every model must be evaluated individually.

**Do not invent geometric differences where manufacturer evidence is insufficient.**

---

# 5. CORRECT SADDLE MODELING

The saddle needs a complete quality review.

## 5.1 Saddle shell

Implement a believable bicycle saddle with:

- Narrow nose.
- Smoothly transitioning center.
- Correctly shaped rear section.
- Appropriate width distribution.
- Curved upper surface.
- Proper shell thickness.
- Correct edge contour.

Avoid flat polygon-like or irregular oversized meshes.

## 5.2 Saddle underside

Include appropriate:

- Saddle shell underside.
- Dual rail geometry.
- Rail connection points.
- Seatpost clamp interface.

The rails must attach correctly to the seatpost head.

## 5.3 Saddle positioning

Use an accurate transform hierarchy.

The saddle must:

- Attach to the seatpost head.
- Remain visible in normal camera views.
- Remain centered over its clamp.
- Use a plausible horizontal orientation.
- Retain its position when changing wheelsets.
- Update correctly when frame size or supported seatpost geometry changes.

## 5.4 Saddle visibility regression

Investigate why the saddle appears missing or partially absent in some configurations.

Check:

- Incorrect object transforms.
- Mesh visibility flags.
- Geometry disposal.
- Clipping planes.
- Incorrect asset loading.
- Material transparency.
- Depth-buffer issues.
- Occlusion.
- Incorrect parent-child transforms.

Do not fix this by simply adding another saddle mesh on top.

Fix the underlying cause.

---

# 6. FIX SEAT TUBE AND SEATPOST CONNECTIONS

## Standard seatpost systems

For conventional frames:

- Seatpost follows the seat tube axis.
- Seatpost fits the correct frame interface.
- Seat collar or clamp is represented appropriately.
- Saddle clamp connects to the seatpost head.

Avoid excessive arbitrary seatpost exposure.

## Aero seatpost systems

For frames using dedicated aero seatposts:

- Use the actual supported profile.
- Match the frame opening/interface.
- Use the correct model-specific orientation.
- Represent the dedicated seat clamp where appropriate.

Do not insert a generic cylindrical seatpost into a proprietary aero interface and call it exact.

## Frame size

Changing frame size must update the seat tube geometry.

Do not scale the entire bike uniformly.

Use the exact geometry data of the selected size where available.

---

# 7. REBUILD MODERN FORK GEOMETRY

The existing fork must be substantially improved.

## Required assembly

- Steerer.
- Fork crown.
- Left fork blade.
- Right fork blade.
- Front axle/dropout interfaces.

## Modern carbon forks

Where supported, reproduce:

- Documented blade profiles.
- Aerodynamic shaping.
- Appropriate crown design.
- Tapered steerer configuration.
- Correct axle-to-crown dimensions.
- Actual fork offset.

Different manufacturer forks must not automatically share one generic mesh.

## Traditional forks

For steel or conventional alloy models, use the appropriate fork construction.

Do not apply modern carbon-fork morphology to every vintage or steel frameset.

## Attachment checks

Ensure:

- Fork crown connects correctly below the headset.
- Steerer aligns with the head tube.
- Both fork blades connect to their axle interfaces.
- Front wheel remains centered.
- No fork blade penetrates the tire.
- No excessive gaps appear at fork/headset junctions.

Use verified dimensions where available.

---

# 8. REBUILD REAR DROPOUTS / TRACK ENDS

This is another structural priority.

## Track ends

Track ends must look like real mechanical rear axle interfaces.

Implement:

- Appropriate rearward-facing axle slot when documented.
- Correct dropout plate.
- Proper plate thickness.
- Seatstay connection.
- Chainstay connection.
- Axle slot position.
- Supported chain tension adjustment area.

## Actual frame variations

Different framesets may have:

- Integrated dropout plates.
- Removable stainless-steel dropout plates.
- Distinct track-end shapes.
- Additional adjustment hardware.
- Manufacturer-specific dropout designs.

Use only documented features for each model.

## Correct axle behavior

The wheel axle must occupy a valid position within the track-end geometry.

Its position should be consistent with:

- Wheelbase.
- Rear tire clearance.
- Chain length and tension representation.
- Chainstay geometry.
- Frame specifications.

Do not visually extend the dropout slot into an unrealistic position.

## 2D and 3D

Represent the dropout in both modes.

The 2D side view must show the correct track-end profile where visible.

The 3D model must provide appropriate thickness and left/right structure.

---

# 9. COMPLETE DEEP-SECTION WHEELSET MODELING

The current deep-section wheel rendering appears too dark and nearly solid.

This is not an acceptable result for a conventional spoked deep-section wheel.

## 9.1 Correct rim construction

A deep-section rim must have a realistic annular profile.

It must not be represented by an incorrectly filled circular disc.

Model:

- Rim outer wall.
- Inner rim boundary.
- Correct rim depth.
- Rim bed/interface.
- Appropriate cross-section.
- Proper tire connection.

## 9.2 Preserve the wheel opening

The area inside the rim must remain open except for:

- Hub.
- Spokes.
- Actual product-specific structures.

Do not generate opaque geometry filling the wheel interior.

Check for:

- Incorrect disc/cylinder meshes.
- Improper face triangulation.
- Wrong cap generation.
- Inverted normals.
- Duplicate coincident surfaces.
- Incorrect rendering layers.
- Material opacity.
- Depth-buffer issues.

**The central wheel area must not appear as a solid disc unless the actual selected product is a disc wheel.**

## 9.3 Improve depth perception

Use appropriate:

- Rim wall thickness.
- Inner edge shading.
- Material roughness.
- Metallic or carbon appearance.
- Controlled reflections.
- Correct shadows.

Do not make spokes disappear due to overly dark materials.

---

# 10. WHEELSET SPOKE CONFIGURATION SELECTOR

**Mandatory new functionality.**

Support these three selectable wheelset spoke configurations:

| Configuration | Front | Rear |
|---|---:|---:|
| 20F / 24R | 20 | 24 |
| 32F / 32R | 32 | 32 |
| 36F / 36R | 36 | 36 |

## User experience

Within the Wheels category, add a clear spoke-configuration selector.

Suggested controls:

- 20 / 24
- 32 / 32
- 36 / 36

The selector must show which value applies to the front and rear wheels.

Do not simply display "20/24" without explaining the relationship.

## Existing wheel designs

Maintain existing wheel profiles:

- Classic spoked.
- Deep-section.
- Other supported real models.

Spoke configuration and rim profile are different properties.

Do not automatically turn a deep-section rim into a shallow-section rim when the spoke count changes.

## Selection behavior

When changing the spoke configuration:

1. Validate the selected wheelset's available options.
2. Identify the front and rear spoke counts.
3. Verify suitable rim and hub drilling.
4. Load or generate the correct spoke geometry.
5. Apply the correct front and rear lacing patterns.
6. Update the 3D wheels.
7. Update the 2D wheels.
8. Preserve supported rim finishes.
9. Recheck necessary compatibility.
10. Save the selected configuration.

## Critical physical constraint

Do not make unsupported spoke counts appear as official manufacturer variants.

Real rims and hubs must have matching drilling.

For authentic branded products:

- Show only documented configurations.
- Validate actual rims and hubs.
- Preserve the actual spoke pattern.

For a neutral TrackLab demonstration wheelset:

- All three configurations may be modeled as explicitly illustrative options.
- Use technically plausible hub and rim geometry.
- Clearly identify them as demonstration configurations.

## Lacing

Support documented patterns such as:

- Radial.
- Two-cross.
- Three-cross.

Use the correct lacing for the selected verified product.

Do not infer that every front wheel is radial or every rear wheel is three-cross.

Spokes must connect from appropriate hub-flange holes to correct rim locations.

The count must be correct in 3D, and its 2D projection must be generated from the same spoke configuration.

---

# 11. DEEP-RIM FINISH CUSTOMIZATION

Preserve the existing finish system.

For eligible wheelsets, support:

- Polished.
- Pure Black.
- Verified Manufacturer Finish.

## Coordinated finish

Where a neutral wheelset supports a coordinated finish, apply it consistently to:

- Front rim.
- Rear rim.
- Spokes.
- Front hub.
- Rear hub.

Keep tires as rubber materials.

Do not make tires polished metal.

## Black finish

Ensure black rims remain distinguishable from:

- Tires.
- Spokes.
- Hubs.
- Background.

Use controlled lighting and material contrast.

Avoid turning the wheel into a featureless dark mass.

## Polished finish

Use realistic metallic shading rather than a flat gray color.

## Real branded wheelsets

Preserve the selected manufacturer's actual finish when documented.

If an unofficial recolor is offered, label it as a custom visual concept.

---

# 12. IMPROVE THE 2D WHEEL DISPLAY

The 2D renderer must support all three spoke configurations.

Requirements:

- Correct front/rear counts.
- Properly projected spoke layout.
- Accurate rim depth.
- Realistic inner and outer rim boundaries.
- Appropriate hub dimensions.
- Correct tire silhouette.
- Clear material separation.

The 2D rendering must not show an opaque wheel interior merely because the 3D deep rim has a dark finish.

Keep the frame and wheels proportionally accurate.

---

# 13. PRESERVE COMPONENT FINISH SELECTIONS

Retain the component appearance system requested earlier.

## Frameset

Use real manufacturer colorways.

Do not invent official finishes.

## Wheelset

- Polished.
- Pure Black.
- Verified manufacturer finish.

## Crank arms

- Polished.
- Pure Black.
- Verified manufacturer finish.

## Chainring

- Polished.
- Pure Black.
- Verified manufacturer finish.

## Cockpit

For eligible supported components:

- Stem finish.
- Handlebar finish.
- Verified manufacturer-specific appearance.

## Seatpost

- Polished.
- Pure Black.
- Verified manufacturer finish.

## Saddle

Use the supported product appearance.

Do not indiscriminately apply metallic finishes to saddle padding or shell materials.

## Important

Appearance changes must not:

- Change frame geometry.
- Reset unrelated components.
- Modify gear ratios.
- Trigger false compatibility issues.
- Create additional saved builds.

Maintain consistent 2D and 3D appearance state.

---

# 14. CORRECT SADDLE VALIDATION

Preserve the previously approved saddle compatibility correction.

Do not use seatpost diameter as a direct saddle-compatibility rule.

Validate separately:

1. Frame seat tube ↔ seatpost diameter/interface.
2. Saddle rails ↔ seatpost-head clamp.

A saddle should not be rejected merely because the selected seatpost has a different tube diameter.

However, rail and clamp compatibility must still be checked.

Unknown specifications must produce "Needs Verification."

Do not universally approve incompatible saddle/clamp systems.

---

# 15. IMPROVE CAMERA FIT AND DEFAULT PRESENTATION

The provided screenshots show clipping and inconsistent bike framing.

Fix:

- Default camera position.
- Camera target.
- Fit-to-view.
- Camera distance.
- View-specific framing.
- Zoom boundaries.
- Turntable positioning.

## Complete assembly bounding box

Include:

- Both wheels.
- Frame.
- Fork.
- Saddle.
- Seatpost.
- Handlebar.
- Crank arms.
- Pedals.
- Other visible supported components.

The complete bicycle must fit inside the normal preview.

## Camera presets

Verify:

- Left side.
- Right side.
- Front.
- Rear.
- Three-quarter front.
- Three-quarter rear.

The default studio view must not clip the bicycle.

Inspection close-ups may intentionally zoom into components, but they must be separate from normal full-bike presets.

## Automatic reframe

When a major frameset change changes the geometry:

- Recalculate the bounding box.
- Update the fit-to-view target.
- Preserve a suitable viewing margin.
- Avoid sudden excessive camera movement.

Do not mask geometry errors by moving the camera to hide the problem.

---

# 16. SYNCHRONIZE 2D AND 3D GEOMETRY

Both renderers must share the same canonical build configuration.

Shared values must include:

- Selected frameset.
- Model generation.
- Frame size.
- Frame tube geometry.
- Seat tube shape.
- Fork model.
- Head tube and steering-axis definitions.
- Front and rear dropout locations.
- Wheel axle positions.
- Rim profile.
- Front/rear spoke counts.
- Lacing configuration.
- Saddle and seatpost.
- Component finishes.
- Official frameset colorway.

Do not create separate conflicting geometry tables for SVG and Three.js.

Use one verified geometry model, with rendering-specific transformations.

---

# 17. REPOSITORY AND IMPLEMENTATION ARCHITECTURE

Preserve the existing clean frontend/backend structure.

Suggested separation:

Frontend:
- Bicycle builder.
- SVG rendering.
- Three.js rendering.
- Camera controls.
- Geometry adapters.
- Appearance controls.

Backend:
- Product models.
- Variant records.
- Geometry specifications.
- Compatibility validation.
- Saved builds.
- Catalog maintenance.

Shared, where appropriate:
- Geometry types.
- Component-slot definitions.
- Validated configuration schemas.
- Pure geometry calculations.
- Compatibility result types.

Do not unnecessarily refactor unrelated modules.

Do not create a second parallel bicycle configuration system.

Use existing reusable rendering components wherever practical.

---

# 18. MODEL FIDELITY REQUIREMENTS

Maintain accurate rendering status for every branded product.

Supported categories:

- Licensed authentic asset.
- Independently modeled from verified geometry.
- Approximate illustrative geometry.
- No suitable visualization.

Do not mark a frame as fully authentic merely because its tube junctions are connected.

Do not represent a generic frame as an exact Cinelli, Dosnoventa, Tsunami, Skream, Leader, Engine11, or 8bar product.

Preserve the independent-project trademark disclaimer.

Only use manufacturer graphics and protected assets where appropriate rights exist.

---

# 19. TESTING — STRICT ACCEPTANCE GATES

Do not mark the task complete based only on TypeScript compilation.

## Gate 1 — Structural geometry

Verify:

- Saddle is visible and connected.
- Seat tube and seatpost are distinct and aligned.
- Head tube geometry is correct.
- Steerer is not excessively exposed.
- Fork crown and blades connect correctly.
- Front axle connects to the fork.
- Rear dropouts look like functional track ends.
- Seatstays and chainstays connect properly.

## Gate 2 — Manufacturer geometry

Verify:

- Cinelli's documented aero seat tube renders differently from conventional seat tube profiles.
- Skream Magnum and Ranger use different documented geometry.
- Leader 735 has its distinctive supported aerodynamic tube profile.
- 8bar KRZBERG V8 uses its documented oval top tube and custom dropout construction.
- Tsunami SNM100 uses its appropriate fork and dropout interfaces.
- Other supported branded models use correct verified geometry records.

## Gate 3 — Wheelsets

Verify:

- Deep rims remain open-center spoked rims, not solid discs.
- Rim and tire are concentric.
- Spokes attach to hub flanges and rim.
- Spoke counts are correct.
- 20F/24R works.
- 32F/32R works.
- 36F/36R works.
- Lacing corresponds to the selected configuration.
- Front and rear wheels maintain correct axle positioning.

## Gate 4 — 2D/3D synchronization

Verify:

- Frame changes update both renderers.
- Saddle position stays consistent.
- Wheel profiles match.
- Spoke counts match.
- Component finishes match.
- Camera switching does not modify the build.
- Saved builds preserve the selected setup.

## Gate 5 — Visual inspection

Capture and inspect:

1. Full side view.
2. Full opposite-side view.
3. Front view.
4. Rear view.
5. Three-quarter front.
6. Three-quarter rear.
7. Saddle close-up.
8. Seat tube and seatpost close-up.
9. Head tube and fork close-up.
10. Front dropout close-up.
11. Rear dropout close-up.
12. 20/24 wheelset.
13. 32/32 wheelset.
14. 36/36 wheelset.
15. Deep-section rim close-up.
16. At least two differently constructed branded framesets.

Compare actual geometry against appropriate manufacturer references.

## Gate 6 — Technical validation

Run:

- TypeScript checks.
- Lint.
- Unit tests.
- Geometry validation tests.
- Compatibility tests.
- Saved-build persistence tests.
- Playwright browser tests.
- Production build.

Record the actual results.

Do not claim unexecuted tests passed.

---

# 20. IMPLEMENTATION PRIORITIES

Follow this order.

### Priority 1 — Fix saddle and seating geometry

Correct missing/occluded saddle behavior, seat tube, seatpost, rails, and clamp.

### Priority 2 — Fix fork and steering assembly

Correct the head tube, headset, steerer, fork crown, blades, and front axle.

### Priority 3 — Fix rear track ends

Improve model-specific dropouts and rear axle positioning.

### Priority 4 — Modern frame tubing

Implement verified model-specific top tube, down tube, seat tube, and stay profiles.

### Priority 5 — Correct deep-section rims

Remove incorrect opaque wheel interiors and improve rim/hub/spoke geometry.

### Priority 6 — Wheel spoke options

Implement 20/24, 32/32, and 36/36 configurations with proper validation.

### Priority 7 — Synchronize SVG rendering

Ensure the 2D preview reflects the corrected assembly and wheel configurations.

### Priority 8 — Preserve finishes and colorways

Maintain the existing manufacturer colorways and polished/black appearance controls.

### Priority 9 — Fix camera framing

Ensure normal camera presets show the complete bicycle without clipping.

### Priority 10 — Visual and functional verification

Inspect, test, and refine all affected features.

---

# FINAL ACCEPTANCE CRITERIA

The task is not complete unless:

1. Saddle geometry is visibly improved.
2. Saddle remains attached and visible across normal camera views.
3. Seat tubes and seatposts are accurately differentiated.
4. Modern frame tube profiles reflect verified manufacturer construction.
5. Forks use appropriate model-specific geometry.
6. Head tube and headset assemblies connect correctly.
7. Front axle positions are accurate.
8. Rear dropouts/track ends are correctly represented.
9. Deep-section rims no longer appear as unintended solid discs.
10. Spoke and hub connections are accurate.
11. 20F/24R is selectable and visually correct.
12. 32F/32R is selectable and visually correct.
13. 36F/36R is selectable and visually correct.
14. Unsupported spoke configurations are not misrepresented as official product variants.
15. Wheelset finish selections remain functional.
16. Official frameset colorways remain functional.
17. Component polished/black finishes remain functional.
18. 2D and 3D use consistent geometry and selections.
19. Default camera framing displays the complete bicycle.
20. Existing saved builds remain valid.
21. Authentication, quotas, and backend restrictions remain intact.
22. No major visual or functional regressions remain in the affected features.
23. Actual tests and visual verification have been performed.
24. Any remaining unsupported authentic assets are documented honestly.

---

# FINAL STRICT INSTRUCTION

**Fix the actual bicycle modeling. Do not only make the bicycle shinier or change its colors.**

The frame, seat tube, seatpost, saddle, head tube, fork, wheels, and dropouts must be properly constructed and connected.

Modern track frames use different tube morphologies, fork shapes, and rear dropout systems. TrackLab must reflect those documented differences.

Deep-section rims must look like real spoked wheels, with correctly shaped rims and visible spoke assemblies—not opaque discs.

Support the three requested spoke configurations:

- 20 front / 24 rear.
- 32 front / 32 rear.
- 36 front / 36 rear.

Preserve factory-specific variants and truthful visual-fidelity labels.

Continue using the existing graphite/electric-blue TrackLab interface.

Do not implement the postponed complete advanced individual-component customization overhaul yet.

**The goal is a realistic, structurally correct, visually polished fixed-gear bicycle in both 2D and 3D, with properly supported frame geometry and wheelset options.**