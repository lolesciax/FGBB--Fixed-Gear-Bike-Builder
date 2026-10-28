# TRACKLAB — 3D BICYCLE MODELING CORRECTION & COCKPIT EXPANSION
## Fix Fork, Wheelset, Crankset, Saddle, and Handlebar Geometry

### ROLE

Act as a Senior Three.js Developer, React Three Fiber Engineer, Blender Procedural Modeling Specialist, Bicycle Geometry Engineer, Technical 3D Artist, UI/UX Designer, and Full-Stack Code Reviewer.

Your task is to inspect and substantially improve the existing TrackLab 3D bicycle visualization.

Use the provided screenshot as the visual baseline.

The current bicycle looks too simplified and contains several noticeable geometry, scale, attachment, and proportion issues.

**This is a targeted 3D modeling improvement task, not a request to redesign the entire application.**

### PRIMARY OBJECTIVES

1. Correct the front fork geometry and steering assembly.
2. Improve the wheelset, tire, rim, hub, and spoke models.
3. Rebuild the crankset and drivetrain geometry to look physically plausible.
4. Improve the saddle and seatpost representation.
5. Fix the existing dropbar geometry.
6. Add riser, straight/flat, and bullhorn handlebar options.
7. Correct overall bicycle proportions and component alignment.
8. Improve the 3D model's scale and camera framing.
9. Preserve accurate brand-specific frameset geometry.
10. Verify 3D modeling quality from multiple camera angles.

Do not simply increase mesh subdivisions, change colors, or add lighting effects and call the geometry fixed.

---

# 1. INSPECT THE EXISTING 3D IMPLEMENTATION

Before editing:

- Inspect the existing React Three Fiber scene.
- Locate the bicycle mesh generation code.
- Inspect Blender scripts if present.
- Inspect GLB asset definitions.
- Review the component assembly hierarchy.
- Inspect geometric dimensions and coordinate systems.
- Identify existing component anchor points.
- Review the frame/fork connection.
- Review wheel geometry and placement.
- Review crankset and drivetrain.
- Review the saddle and seatpost.
- Review handlebar generation.
- Inspect current product-to-renderer mapping.
- Review camera presets and bounding-box calculations.
- Verify 2D/3D state synchronization.

Determine which parts are created through procedural Three.js geometry and which are imported GLB models.

Do not invent assumptions about the current code.

Record existing implementation problems and their underlying causes.

---

# 2. ESTABLISH REALISTIC BICYCLE GEOMETRY STANDARDS

Use a consistent real-world measurement system.

Recommended world scale:

**1 Three.js unit = 1 meter.**

Preserve an existing equivalent scale if it is already consistent and correct.

All geometry must use compatible units.

Define a consistent coordinate convention, for example:

- X: bicycle forward direction.
- Y: upward.
- Z: lateral direction.

Apply this convention consistently to all assemblies, geometry generators, imported models, and camera controls.

## Critical attachment points

The bicycle assembly must define and reuse:

- Rear axle center.
- Front axle center.
- Bottom bracket center.
- Head tube upper connection.
- Head tube lower connection.
- Fork steerer axis.
- Fork crown.
- Seat tube axis.
- Seatpost connection.
- Saddle clamp.
- Stem steerer connection.
- Stem handlebar clamp.
- Crank spindle axis.
- Chainring plane.
- Rear cog plane.

Do not manually position components using unrelated arbitrary coordinates.

Derive component transforms from the selected frame geometry and the relevant attachment interfaces.

## Geometry validation

Use model-specific verified geometry when available.

If a manufacturer specification is incomplete, do not invent missing dimensions and classify the result as an accurate replica.

Use clearly documented illustrative assumptions where necessary.

Verify geometric consistency across:

- Frame sizes.
- Handlebar variations.
- Wheel variations.
- Camera presets.
- Branded models.

---

# 3. REBUILD THE FRONT FORK

**The fork is a priority issue.**

The current fork representation looks overly simplified and does not convincingly reproduce a proper rigid track-bike fork.

## Required geometry

Create a more complete fork assembly with:

- Steerer tube.
- Fork crown.
- Left fork blade.
- Right fork blade.
- Front dropouts or axle interfaces.
- Appropriate blade taper.
- Correct crown-to-blade connections.
- Correct wheel clearance.

The front fork must align with the head tube and headset.

## Steering alignment

- The steerer must share the correct steering axis.
- The fork crown must connect below the head tube at the appropriate position.
- Fork blades must extend toward the front axle.
- Both blades must connect to the front axle interfaces.
- The wheel must remain centered between the fork blades.
- The front axle must use the selected model's documented geometry.
- No fork blade should intersect a tire or rim.
- The fork must not visually float away from the frame.

## Fork rake

Support documented fork offset/rake.

Do not create a perfectly straight fork by default if the actual selected model requires a different geometry.

Do not exaggerate rake merely for appearance.

## Shape improvement

Replace crude straight cylinders with more refined geometry where appropriate.

Support:

- Tapered blade profiles.
- Appropriate curvature.
- Smooth transitions.
- Correct crown thickness.
- Appropriate material finishes.
- Realistic edge treatment.

The geometry must remain technically credible.

## Model-specific behavior

Different branded forks may use different materials and shapes.

Do not automatically reuse the same fork model across unrelated framesets.

Use proper product references and fidelity classifications.

---

# 4. REBUILD THE WHEELSET

**The current wheels are too schematic.**

They need improved visual depth, realistic spokes, correct tire geometry, and properly modeled hubs.

## 4.1 Wheel assembly

Each wheel should have:

- Rim.
- Tire.
- Hub shell.
- Axle.
- Spokes.
- Appropriate rim/hub interfaces.

Maintain separate front and rear wheel assemblies within the 3D rendering architecture.

This does not require implementing the postponed advanced individual-part selection interface.

## 4.2 Rim geometry

Improve:

- Rim cross-section.
- Rim depth.
- Inner and outer rim surfaces.
- Rim thickness.
- Rounded edges.
- Valve area where appropriate.
- Metallic or carbon-like materials when supported by the actual product.

Support visually distinct rim profiles.

Examples:

- Traditional shallow rim.
- Medium-depth rim.
- Deep-section rim.

Do not assume all wheel models use the same geometry.

## 4.3 Tire geometry

The current tires appear too thick and inflated.

Improve:

- Tire cross-section.
- Appropriate sidewall shape.
- Tread region.
- Bead/rim interface representation.
- Correct overall diameter.
- Correct tire width.
- Realistic rubber material.

Do not use a generic oversized torus when it produces an inaccurate bicycle tire.

A torus-like procedural approach is acceptable only if its profile, placement, and dimensions produce a credible result.

## 4.4 Spoke geometry

Improve:

- Accurate spoke origin at hub flanges.
- Correct connection to rim positions.
- Appropriate spoke count.
- Suitable spoke thickness.
- Proper radial or crossed lacing according to the selected design.
- Symmetrical and coherent distribution.
- Correct front and rear hub placement.

Spokes must not:

- Start from the wrong wheel center.
- Float away from the hub.
- Pass through the tire.
- Stop before reaching the rim.
- Form random intersections.

Use efficient instancing or geometry reuse where appropriate.

## 4.5 Hubs

Implement more believable hub geometry.

Include:

- Hub shell.
- Hub flanges.
- Axle.
- Appropriate end caps.
- Correct lateral positioning.
- Rear fixed-cog interface where relevant.

The hub must remain concentric with the rim and tire.

## 4.6 Wheel positioning

- Front wheel must align with the fork.
- Rear wheel must align with the rear dropouts.
- Both wheels must rest at the same appropriate ground level.
- The wheels must remain parallel when the steering is centered.
- Rim and tire must be concentric.
- Axles must remain correctly positioned after frameset changes.

Do not distort wheel diameter independently to make frames fit.

---

# 5. REBUILD THE CRANKSET AND DRIVETRAIN

**The current crankset looks too thin and mechanically incomplete.**

Create a more convincing fixed-gear crank assembly.

## Required visual elements

- Bottom bracket/spindle interface.
- Right crank arm.
- Left crank arm.
- Chainring.
- Chainring spider or supported mounting interface.
- Chainring bolts where appropriate.
- Rear cog.
- Chain.
- Left and right pedals.

Model the crankset according to the selected product interface wherever verified.

## Crank arms

Use:

- Proper 3D thickness.
- Tapered or otherwise documented arm profiles.
- Correct attachment to spindle.
- Proper pedal mounting points.
- Accurate relative scale.

The left and right crank arms must be correctly phased, ordinarily 180 degrees apart for a conventional bicycle crank assembly.

Do not render both crank arms extending in the same direction.

Do not allow pedal models to float away from the crank arms.

## Chainring

Improve:

- Ring thickness.
- Tooth geometry.
- Correct rotational axis.
- Appropriate mounting interface.
- Proper position relative to the drive-side crank.
- Correct material appearance.

Avoid making the chainring look like an oversized decorative disc or a thin floating outline.

Tooth count must correspond to actual selected product data when available.

## Rear cog

- Position the cog on the correct drive-side rear hub interface.
- Maintain alignment with the front chainring plane.
- Respect the supported fixed-cog mounting system.

## Chain

Generate a geometrically coherent chain path between chainring and cog.

The chain must:

- Travel around the front chainring.
- Travel around the rear cog.
- Form plausible upper and lower chain runs.
- Align with the drivetrain plane.
- Avoid intersection with unrelated components.
- Update correctly when relevant frame or drivetrain geometry changes.

Where individual chain links are modeled, use efficient geometry or instancing.

If using a simplified chain mesh, preserve correct alignment and visual scale.

## Pedals

Improve:

- Pedal body dimensions.
- Pedal spindle placement.
- Attachment to crank arms.
- Appropriate depth.
- Left/right orientation.

Avoid generic floating rectangular pedal shapes.

## Crank animation

Do not add continuous crank rotation by default.

Any optional drivetrain animation must preserve the physical relationship among:

- Crank arms.
- Chainring.
- Chain.
- Rear cog.
- Fixed rear wheel.

Do not animate independently in ways that create mechanical contradictions.

---

# 6. REBUILD THE SADDLE AND SEATPOST

**The current saddle looks too small and overly flat.**

Implement a more believable fixed-gear saddle.

## Saddle shape

Create a realistic bicycle saddle silhouette:

- Narrow front nose.
- Appropriately shaped rear support area.
- Gradually changing width.
- Subtle shell curvature.
- Plausible top padding profile.
- Correct thickness and length.
- Rounded edges.

Do not represent the saddle as a simple flattened capsule or rectangular object.

## Saddle details

Add appropriate:

- Saddle shell.
- Rail system.
- Saddle clamp attachment.
- Seatpost head connection.

Use refined materials.

Avoid excessive gloss on surfaces that should appear matte or textured.

## Seatpost

Improve:

- Seatpost tube proportions.
- Correct frame insertion/alignment.
- Seatpost head.
- Saddle clamp.
- Appropriate saddle placement.

The seatpost must follow the selected frame's seat tube axis.

The saddle must sit above the seatpost head and attach correctly through its rails or supported interface.

Do not leave gaps between parts.

Do not position the saddle at an unrealistic angle merely to make it visible.

---

# 7. FIX THE EXISTING DROP HANDLEBAR

The current 3D cockpit appears to have unnatural overlapping curves.

Inspect the actual geometry generator.

Determine whether the issue is caused by:

- Incorrect curve control points.
- Incorrect local coordinate orientation.
- Duplicate bar geometry.
- Wrong mirrored geometry.
- Incorrect rotation transforms.
- Improper stem attachment.
- Camera projection.
- Incorrect handlebar scale.

Fix the underlying problem.

## Proper dropbar shape

Model a realistic handlebar with:

- Center clamp region.
- Left and right tops.
- Appropriate reach.
- Forward hooks.
- Curved drops.
- Proper bar end positioning.
- Correct left/right symmetry.

Use smooth tube geometry with a consistent, plausible cross-section.

Do not generate arbitrary overlapping loops.

The left and right drops must occupy opposite lateral sides.

From a side view, some overlap is expected due to projection, but the geometry must be correct when inspected from front and three-quarter views.

The handlebar must attach to the stem clamp.

Do not attach handlebar geometry directly to unrelated frame coordinates.

---

# 8. ADD RISER, STRAIGHT/FLAT, AND BULLHORN HANDLEBARS

**Mandatory additional functionality.**

Extend the existing Cockpit category with four primary handlebar types:

1. Dropbar.
2. Riser Bar.
3. Straight/Flat Bar.
4. Bullhorn Bar.

Do not remove the existing dropbar.

## 8.1 Dropbar

Use the corrected dropbar from Phase 7.

It should have:

- Center clamp.
- Left and right tops.
- Proper reach.
- Hooks.
- Curved drops.

## 8.2 Riser bar

Create a realistic riser handlebar.

Required characteristics:

- Central stem clamp region.
- Left and right lateral extensions.
- Supported upward rise.
- Documented backsweep where available.
- Appropriate width.
- Correct end positioning.

The riser must visibly differ from a flat handlebar.

Avoid exaggerated upward bends unless supported by the selected model.

## 8.3 Straight/Flat bar

Create a realistic flat handlebar.

Required characteristics:

- Central stem clamp.
- Primarily lateral bar shape.
- Minimal or model-specific rise.
- Appropriate width.
- Supported sweep when documented.
- Consistent tube diameter.

A flat bar must not visually resemble a dropbar or bullhorn.

It must remain correctly aligned with the stem.

## 8.4 Bullhorn bar

Create a recognizable bullhorn handlebar.

Required characteristics:

- Central clamp.
- Left and right lateral bar sections.
- Forward-facing extensions.
- Appropriate upward or curved tip profiles.
- Correct symmetry.
- Proper attachment to the stem.

Do not simply rotate a dropbar upward and label it as a bullhorn.

Create actual bullhorn geometry.

## 8.5 Geometry configuration

For all handlebar types, support relevant product-backed dimensions such as:

- Width.
- Clamp diameter.
- Rise.
- Reach.
- Drop.
- Sweep.
- Tube profile.
- Material appearance.

Use only dimensions applicable to the selected handlebar type.

Do not invent manufacturer values.

---

# 9. COCKPIT SELECTION UX

Extend the current Cockpit category without rebuilding the full modular part-selection system.

## Interface

When users open Cockpit, provide a clear handlebar type selector.

Options:

- Dropbar.
- Riser.
- Straight/Flat.
- Bullhorn.

Selecting a type should filter the available handlebar products or supported illustrative options.

## Product cards

Show:

- Handlebar type.
- Brand and model, when verified.
- Product-specific visual thumbnail.
- Available verified variant.
- Compatible stem interface.
- Rendering availability.
- Selection state.

## Selection behavior

When a user selects a handlebar:

1. Validate the supported option.
2. Check required cockpit fitment data.
3. Update the existing cockpit configuration.
4. Replace the relevant handlebar geometry.
5. Preserve the selected frameset and unrelated bicycle components.
6. Recalculate cockpit attachment positioning.
7. Update the 3D model.
8. Update the 2D representation where supported.
9. Provide appropriate compatibility feedback.

Do not reset the bicycle when switching between bar types.

## Important limitation

This phase does not authorize the complete independent-component customization overhaul.

Do not add separate advanced configuration systems for every stem, cog, crank arm, or hub yet.

Only improve current models and extend the supported cockpit handlebar choices.

---

# 10. CONSISTENT COMPONENT PROPORTIONS

The entire bicycle needs a proportionality review.

Inspect:

- Overall wheel diameter.
- Frame triangle dimensions.
- Fork length.
- Handlebar height.
- Stem length.
- Saddle dimensions.
- Seatpost extension.
- Crank arm length.
- Pedal size.
- Wheelbase.
- Tire thickness.
- Drivetrain location.

Use verified frame geometry and documented component dimensions wherever available.

Avoid arbitrary proportions.

## Required result

The bicycle should look like a real fixed-gear bicycle in:

- Side view.
- Front view.
- Rear view.
- Three-quarter view.
- Top view, where supported.

A model that only looks acceptable in the default camera angle is not sufficient.

---

# 11. IMPROVE CAMERA FRAMING

The screenshot shows the bicycle occupying too little of the available canvas.

Fix the actual 3D camera framing.

## Requirements

- Calculate the complete assembly bounding box.
- Include fork, bars, wheels, pedals, and saddle.
- Center the camera target correctly.
- Adapt the camera distance to the model's dimensions.
- Recalculate fit after a frameset or cockpit change.
- Avoid clipping the model.
- Avoid extreme zoom distances.
- Maintain reasonable floor clearance.
- Preserve camera controls.

As a starting target, aim for approximately 65–80% of available preview width, depending on camera angle and aspect ratio.

Use bounding-box and field-of-view calculations rather than arbitrary fixed camera distances.

The bike should not be tiny in the center of a mostly empty studio scene.

## Camera presets

Verify:

- Side.
- Front.
- Rear.
- Three-quarter front.
- Three-quarter rear.

Each preset must properly frame the bicycle.

The camera should not cut off handlebars, pedals, saddle, or wheels.

---

# 12. MATERIALS AND RENDERING QUALITY

Improve model quality primarily through better geometry.

Then refine the materials.

## Appropriate materials

Use realistic material settings for:

- Painted frames.
- Metallic rims.
- Rubber tires.
- Crank arms.
- Steel components.
- Handlebar tape.
- Saddle shell.
- Saddle padding.
- Seatpost.

Use physically based materials where appropriate.

Avoid:

- Excessive metallic shine.
- Unnatural plastic appearance.
- Strong reflective artifacts.
- Overly thick black outlines.
- Unnecessary emissive glow.
- Extreme contrast that hides geometry.

Preserve the existing premium studio-light and studio-dark environments.

Ensure details remain visible in both.

---

# 13. MODEL ASSEMBLY AND CODE QUALITY

Keep geometry generation organized and reusable.

Suggested components:

- `FrameMesh`
- `ForkMesh`
- `WheelAssembly`
- `RimMesh`
- `TireMesh`
- `HubMesh`
- `SpokeAssembly`
- `CranksetAssembly`
- `ChainringMesh`
- `ChainMesh`
- `SaddleAssembly`
- `SeatpostMesh`
- `StemMesh`
- `HandlebarMesh`

These are conceptual responsibilities.

Adapt them to the actual repository.

Do not create duplicate modules if equivalent implementations already exist.

## Procedural geometry

Use suitable Three.js primitives and curve/extrusion geometry.

For example:

- Tube geometry for curved handlebars.
- Lathe/extruded geometry for appropriate rotational surfaces.
- Custom indexed geometry for shaped tubes and parts.
- Instancing for repeated spokes or chain links.

Use Blender-generated GLB assets when procedural Three.js geometry is insufficient.

The goal is realistic and maintainable models, not the maximum number of meshes.

## Performance

- Cache reusable geometry.
- Avoid rebuilding meshes unnecessarily.
- Dispose of obsolete GPU resources.
- Reuse suitable materials.
- Optimize draw calls.
- Avoid excessive mesh subdivisions.
- Preserve responsive camera controls.
- Keep mobile GPU usage under control.

Do not add a heavy runtime AI 3D generator.

---

# 14. BRAND-SPECIFIC COMPATIBILITY

Preserve the existing support for brands such as:

- Cinelli.
- Dosnoventa.
- Tsunami.
- Skream.
- Engine11.
- Leader.
- Other verified manufacturers.

Use the actual selected model's frame and component information.

Do not use generic geometry for every brand while claiming exact authenticity.

## Fork compatibility

Check the relevant:

- Steerer/headset interface.
- Axle/dropout interface.
- Wheel clearance.
- Documented fork geometry.
- Other necessary fitment information.

## Cockpit compatibility

Check:

- Stem clamp interface.
- Handlebar clamp diameter.
- Supported cockpit assembly.
- Relevant control compatibility.

## Drivetrain compatibility

Check:

- Crank and bottom bracket interface.
- Chainring attachment.
- Chainline where sufficient information exists.
- Rear cog interface.
- Related selected components.

Unknown data must remain marked "Needs Verification."

Do not fake compatibility to make a model appear complete.

---

# 15. PRESERVE THE EXISTING APPLICATION

Do not break:

- Current builder layout.
- 2D viewer.
- 3D viewer.
- Frameset selection.
- Brand catalog.
- Product variants.
- MongoDB persistence.
- Compatibility engine.
- Authentication.
- Guest access.
- Registered-user saved-build limits.
- Rate limiting.
- My Garage.
- Save functionality.
- Camera presets.
- Graphics quality settings.
- Studio environments.
- Turntable controls.
- Brand disclaimers.

Keep the graphite/electric-blue TrackLab design.

Do not reintroduce the green portfolio theme.

Preserve the current frontend/backend repository separation.

Do not implement the postponed full modular individual-component customization feature during this task.

---

# 16. TESTING AND VISUAL VERIFICATION

Use actual browser testing and visual inspection.

Do not rely only on successful compilation.

## Required 3D model views

Capture screenshots of the corrected bicycle from:

1. Left side.
2. Right side.
3. Front.
4. Rear.
5. Three-quarter front.
6. Three-quarter rear.
7. Close-up of fork.
8. Close-up of wheelset.
9. Close-up of crankset.
10. Close-up of saddle.
11. Close-up of each handlebar type.

## Fork tests

Verify:

- Correct steering axis.
- Fork crown connection.
- Both fork blades connect to the axle.
- Front wheel remains centered.
- No tire/fork intersection.
- Correct steering behavior where supported.

## Wheelset tests

Verify:

- Rim and tire are concentric.
- Hub is centered on the axle.
- Spokes connect correctly.
- Front/rear wheels align.
- Tire profile is believable.
- Deep and shallow rim variants are visually distinct.

## Crankset tests

Verify:

- Crank arms are correctly attached and phased.
- Chainring is correctly positioned.
- Pedals connect to their crank arms.
- Rear cog alignment is plausible.
- Chain follows the drivetrain geometry.
- Components do not float or intersect incorrectly.

## Saddle tests

Verify:

- Correct seatpost alignment.
- Saddle attaches to its clamp.
- Saddle shell and rails are visible.
- Appropriate overall proportions.
- No unsupported floating geometry.

## Cockpit tests

Verify all four:

- Dropbar.
- Riser.
- Straight/Flat.
- Bullhorn.

For every type:

- Correct geometry.
- Left/right symmetry where applicable.
- Correct stem attachment.
- Correct rotation.
- Correct size.
- No duplicated handlebar meshes.
- No overlapping geometry errors.
- Correct 2D/3D state.
- Appropriate compatibility feedback.

## Responsive and performance tests

Test:

- Mobile.
- Tablet.
- Desktop.
- Performance graphics mode.
- Balanced graphics mode.
- Quality graphics mode.
- Studio Light.
- Studio Dark.

Measure performance where tooling is available.

Run:

- TypeScript checks.
- Lint.
- Unit tests.
- Geometry validation tests.
- Browser tests.
- Production builds.

Do not claim tests passed unless they were actually executed.

---

# 17. IMPLEMENTATION ORDER

Follow this order.

### Phase 1 — 3D Geometry Audit

Inspect the existing scene, coordinate system, assembly hierarchy, and source files.

### Phase 2 — Correct Fork Geometry

Fix the steerer, crown, blades, and axle alignment.

### Phase 3 — Improve Wheelsets

Rebuild rims, tires, hubs, and spokes with believable proportions and correct attachment.

### Phase 4 — Improve Crankset

Correct crank arms, chainring, pedals, cog, and chain geometry.

### Phase 5 — Improve Saddle

Rebuild saddle shell, rails, clamp, and seatpost positioning.

### Phase 6 — Fix Dropbar

Correct duplicated, overlapping, or improperly oriented handlebar geometry.

### Phase 7 — Add Cockpit Types

Implement riser, flat/straight, and bullhorn geometry and connect them to the existing selection workflow.

### Phase 8 — Improve Overall Proportions

Validate model-specific geometry and correct the complete bicycle assembly.

### Phase 9 — Camera and Visual Polish

Improve framing, materials, lighting, and camera presets without hiding geometry issues.

### Phase 10 — Verification

Inspect real 3D screenshots, fix errors, run automated tests, and document remaining limitations.

---

# FINAL ACCEPTANCE CRITERIA

Do not mark the task complete until:

1. The fork has a believable rigid-bike structure.
2. The fork steerer, crown, and blades connect correctly.
3. The front wheel aligns with the fork.
4. Wheel rims have proper depth and shape.
5. Tires no longer look excessively inflated.
6. Hubs and spokes attach correctly.
7. The crankset has realistic depth and proportions.
8. Both crank arms and pedals are positioned correctly.
9. The chainring and rear cog align appropriately.
10. The chain follows a plausible drivetrain path.
11. The saddle has an improved anatomical shape.
12. The saddle and seatpost attach correctly.
13. The existing dropbar geometry is corrected.
14. Riser handlebars are available and visually distinct.
15. Straight/flat handlebars are available and visually distinct.
16. Bullhorn handlebars are available and visually distinct.
17. Cockpit selection works through the existing builder.
18. The 3D bicycle is appropriately sized inside the preview.
19. Camera presets show no obvious model clipping.
20. Component proportions remain consistent across supported frame models.
21. Model-specific fidelity classifications remain accurate.
22. Existing saved builds and account workflows are preserved.
23. Guest and registered-user quotas remain intact.
24. The application remains responsive.
25. Tests and actual visual verification have been performed.

---

# FINAL STRICT INSTRUCTION

**Fix the underlying 3D model geometry, not just its visual styling.**

The current bicycle looks unfinished because several parts have incorrect proportions, shapes, or attachment relationships.

Prioritize:

- Fork accuracy.
- Realistic wheelsets.
- Proper crankset geometry.
- Correct saddle and seatpost construction.
- Accurate cockpit geometry.
- Riser, straightbar, and bullhorn options.
- Better overall bicycle proportions.

Do not merely add more shadows, reflections, or animations to hide the current modeling problems.

Make the bicycle believable from every camera angle.

Use verified product dimensions and manufacturer references where available.

Do not fabricate brand-specific details or misrepresent illustrative assets as authentic.

Preserve the existing TrackLab architecture, UI/UX, security, database, quotas, and working functions.

Do not begin the postponed complete modular individual-part customization system.

**The expected result is a substantially more realistic fixed-gear bicycle model with correctly assembled parts and four usable handlebar types in the current builder.**