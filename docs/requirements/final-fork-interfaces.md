# TRACKLAB — FINAL PRECISION FORK, FRONT AXLE & REAR TRACK-END MODELING CORRECTIONS

## Objective

Act as a Senior Technical 3D Artist, Bicycle Mechanical Geometry Engineer, Three.js/React Three Fiber Developer, Blender Modeling Specialist, SVG Rendering Engineer, and Code Reviewer.

The existing TrackLab application has undergone multiple modeling improvements, but the latest supplied screenshots demonstrate that the fork, front axle, and rear dropout/track-end assembly still do not look sufficiently realistic.

**Your task is to fix these specific structural modeling problems at their source.**

Do not repeat the previous implementation by merely adding more rounded cylinders, rings, washers, or decorative details.

The goal is accurate mechanical geometry, clean assembly connections, correct manufacturer-specific shapes, and realistic proportions.

Preserve the current TrackLab architecture and all existing functionality.

---

# 1. INSPECT THE FIVE LATEST SCREENSHOTS

Examine the screenshots carefully before modifying code.

Pay particular attention to:

- Rear axle and dropout hardware.
- Rear track-end silhouette.
- Seatstay-to-dropout connection.
- Chainstay-to-dropout connection.
- Front fork blade termination.
- Front hub-to-fork connection.
- Fork crown shape.
- Fork crown-to-steerer junction.
- Headset and lower head tube.
- Lateral wheel/hub alignment.

Identify the underlying source files and mesh generators responsible for each visible problem.

Classify whether the problem comes from incorrect geometry, attachment points, transforms, material artifacts, or inaccurate product data.

Do not assume a previously implemented improvement is correct merely because the code compiles.

---

# 2. REAR TRACK-END GEOMETRY — HIGHEST PRIORITY

The current rear axle region still resembles an oversized circular assembly.

Rebuild it with a mechanically believable rear track-end configuration.

## 2.1 Track-end plate

For frames with rearward-facing horizontal track ends, model:

- Actual dropout plate silhouette.
- Rearward-facing axle slot.
- Correct slot orientation.
- Correct plate thickness.
- Proper axle contact area.
- Chainstay-to-plate junction.
- Seatstay-to-plate junction.
- Correct left and right plate positioning.

The track end must visibly have an axle slot, not merely a circular hole covered by a large washer.

Do not use an identical dropout design for every manufacturer.

## 2.2 Rear axle hardware

Inspect the existing rear axle assembly.

Identify whether oversized geometry comes from:

- Duplicated axle nuts.
- Hub end caps.
- Bearing locknuts.
- Dropout washers.
- Spacer meshes.
- Incorrect scaling.
- Wrong local transforms.
- Multiple meshes occupying the same position.

Remove genuinely duplicated geometry.

Represent only the hardware appropriate to the selected hub and axle interface.

The axle must pass through the hub and sit correctly in both track ends.

Do not make the axle appear to float outside the dropout.

## 2.3 Track-end geometry and axle position

Use one shared rear-axle reference.

The left and right rear dropout slots must align.

The axle should occupy a valid position in the track ends.

Maintain:

- Correct frame spacing.
- Wheel centering.
- Chainstay length.
- Rear triangle alignment.
- Chainline relationship.

Do not arbitrarily move the axle just to hide incorrect hardware.

## 2.4 Manufacturer-specific rear dropouts

Use the exact model and generation when selecting dropout geometry.

### Cinelli Vigorelli

The manufacturer documents stainless-steel removable rear plates for the referenced aluminum model.

Research the exact plate shape and fastener arrangement before modeling.

### Tsunami SNM100

The referenced manufacturer documentation identifies removable stainless-steel plates with a four-hole arrangement.

Model the actual supported plate configuration rather than using generic circular dropouts.

### 8bar KRZBERG V8

The manufacturer documents custom double-sided stainless-steel dropout plates.

These must have their own verified geometry profile.

### Other brands

Preserve product-specific designs for:

- Dosnoventa.
- Skream.
- Engine11.
- Leader.
- Other supported manufacturers.

Do not invent mechanical differences when source information is incomplete.

---

# 3. FRONT FORK AXLE — COMPLETE CONNECTION REBUILD

The screenshots show front axle and hub hardware that is not yet visually convincing.

Rebuild the front axle interface as a coherent assembly.

## 3.1 Geometry hierarchy

Use a structured relationship:

FrontWheelAssembly
- HubShell
- HubAxle
- LeftHubInterface
- RightHubInterface
- LeftForkDropout
- RightForkDropout
- AppropriateRetentionHardware

These names are conceptual. Adapt to existing code.

The front axle must align with the wheel's rotation axis.

Both fork dropouts must connect to that same axle.

## 3.2 Hub positioning

Verify:

- Hub width.
- Axle center.
- Hub shell location.
- Left/right flange positions.
- Fork inside spacing.
- Dropout thickness.
- Wheel centerline.

Do not use arbitrary lateral offsets.

When the verified fork specifies 100 mm front OLD spacing, interpret it correctly as an over-locknut dimension rather than the length of the visible axle or the hub shell alone.

Use the selected axle system's actual measurements where available.

## 3.3 Correct retention hardware

Distinguish among:

- Solid nutted axle.
- Quick-release system.
- Thru-axle system.

For a solid axle, render appropriate axle nuts and washers where required.

For quick-release systems, use the correct skewer/retention arrangement.

For thru-axles, use the corresponding documented interface.

**Do not show all three systems simultaneously.**

Do not combine oversized axle nuts with incorrect quick-release or thru-axle hardware.

Do not add large spacers merely to fill visible gaps.

## 3.4 Blade-to-dropout connection

The fork blade must terminate in a proper dropout body.

Improve:

- Blade taper.
- Blade end geometry.
- Axle opening.
- Dropout body thickness.
- Surface transitions.
- Left/right alignment.

The dropout must not appear as a separate round connector attached to a plain cylinder.

---

# 4. FORK CROWN AND BLADE PROFILES

The crown remains too simplistic.

Rebuild the shape according to the actual selected fork.

## 4.1 Fork crown

Correct:

- Crown-to-steerer connection.
- Crown width.
- Crown thickness.
- Blade separation.
- Smooth blade transitions.
- Tire clearance.
- Crown material profile.

Avoid the oversized horseshoe-shaped crown appearance seen in previous screenshots.

The selected model may use a conventional or integrated-looking crown depending on construction.

Use the applicable product reference.

## 4.2 Fork blades

Refine:

- Taper.
- Cross-sectional profiles.
- Curvature.
- Blade thickness.
- Lateral positioning.
- Blade-to-crown connection.
- Blade-to-dropout connection.

Use lofted or custom cross-sectional geometry where simple cylinders cannot produce accurate results.

Do not simply increase the number of tube segments.

## 4.3 Different fork construction styles

Support documented differences between:

- Traditional steel forks.
- Conventional aluminum forks.
- Modern carbon forks.
- Aerodynamic/bladed forks.

Do not treat all carbon forks as identical.

For example, the Cinelli Vigorelli's Columbus Futura fork must not be modeled by simply applying a carbon material to a generic aluminum fork.

## 4.4 Steerer and headset

Ensure:

- Steering axis is shared.
- Steerer passes through the headset.
- Crown connects correctly below the head tube.
- Headset covers are proportionate.
- No excessive exposed steerer.
- No duplicated spacers.
- No open surface gaps.
- No intersecting crown/headset geometry.

---

# 5. FIX FRAME-TO-DROPOUT CONNECTIONS

The rear triangle must terminate correctly at the dropout plates.

Inspect:

- Left seatstay.
- Right seatstay.
- Left chainstay.
- Right chainstay.
- Rear axle center.
- Dropout meshes.

Correct any intersections where:

- Seatstays pass through the axle.
- Chainstays end inside the hub.
- Frame tubes stop before reaching the dropout.
- Dropout plates float away from the stays.
- Left and right geometry use inconsistent offsets.

Use manufacturer-specific stay junctions.

An aerodynamic or dropped-seatstay frame must preserve its correct structural style.

---

# 6. DO NOT USE OVERSIZED DECORATIVE HARDWARE

A major visual issue is the apparent use of large rings or cylindrical shapes around connection points.

Inspect every such object.

Determine whether it represents:

- Axle nut.
- Washer.
- Hub locknut.
- Hub end cap.
- Dropout spacer.
- Bearing cover.
- Actual structural plate.

If the object is only serving as a visual patch to hide an incorrect connection, remove it and correct the underlying geometry.

## Strict rules

- No oversized circular axle connectors.
- No floating washers.
- No stacked duplicate nuts.
- No unnecessary decorative rings.
- No exposed axle ends with unrealistic proportions.
- No bolt or hardware meshes intersecting unrelated bicycle parts.

Use real component references and believable dimensions.

Do not invent exact dimensions when unavailable.

---

# 7. IMPROVE ACTUAL MESH CONSTRUCTION

Inspect the current geometry generation methods.

Where needed, replace unsuitable primitive combinations with proper custom geometry.

Use:

- Suitable custom mesh profiles.
- Cross-section interpolation.
- Lofting.
- Proper face topology.
- Smooth or intentionally hard normals.
- Correct winding.
- Controlled material boundaries.
- Blender-generated GLB assets when appropriate.

Do not use one continuous cylinder to represent a fork crown, blade, and dropout.

Do not use overlapping spheres or toruses to conceal poor junctions.

Avoid surface cracks and z-fighting.

Preserve realistic manufacturing transitions.

---

# 8. CORRECT BOTH 2D AND 3D

The structural corrections must also appear in the SVG renderer.

Update:

- Fork crown silhouette.
- Fork blade profile.
- Front dropout.
- Front axle/hub representation.
- Rear track-end silhouette.
- Rear axle hardware.
- Seatstay junction.
- Chainstay junction.

Use the shared geometry and assembly anchors.

Do not retain outdated SVG shapes after the 3D models are corrected.

Do not draw every axle nut as a generic oversized circle in the 2D view.

---

# 9. REAL MANUFACTURER REFERENCES

Use official manufacturer sources to establish model-specific structures.

## Cinelli

https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame

https://usa.cinelli-milano.com/blogs/news/shop-talk-9-vigorelli

Research the Columbus Futura fork, headset configuration, and rear removable dropout plates.

## Tsunami

https://tsunamibicycle.com/product/tsunami-snm100-black-red/

Research the aluminum fork, 100 mm front hub spacing, 120 mm rear spacing, and removable rear plates.

## 8bar

https://8bar-bikes.com/8bar_krzberg_v8/

Research the custom rear dropouts with double-sided stainless-steel plates.

## Other brands

Inspect original sources for:

- Dosnoventa.
- Skream.
- Leader.
- Engine11.

Use exact model and generation references.

Do not copy generic fork shapes from unrelated bicycle photographs.

Where technical data or legally usable visual references are insufficient, maintain an accurate illustrative classification.

---

# 10. FIX CAMERA FRAMING AND SADDLE VISIBILITY

The latest screenshots still show some full-bike views with clipped geometry.

Correct full-bike camera fitting independently from inspection-mode close-ups.

Ensure the complete bounds include:

- Saddle.
- Seatpost.
- Handlebars.
- Frame.
- Fork.
- Wheels.
- Crank arms.
- Pedals.

Also investigate why the saddle is not visibly present in some supplied screenshots.

Check mesh generation, scene transforms, loading, visibility, clipping, and conditional rendering.

Do not add a duplicate saddle without identifying the actual cause.

Normal studio views must frame the complete bicycle.

Inspection views may intentionally zoom in.

---

# 11. VISUAL VALIDATION — MANDATORY

Use Inspect mode and actual browser screenshots.

### Front fork views

- Left side.
- Right side.
- Front.
- Rear of fork.
- Three-quarter.
- Crown close-up.
- Left dropout close-up.
- Right dropout close-up.
- Axle/hub close-up.

### Rear track-end views

- Drive side.
- Non-drive side.
- Rear.
- Rear three-quarter.
- Close-up with axle.
- Close-up with appropriate hardware.

### Complete bicycle

- Side.
- Opposite side.
- Front.
- Three-quarter.
- Default studio view.

Verify no parts float, duplicate, penetrate unintentionally, or appear oversized.

Compare the same camera views before and after.

---

# 12. AUTOMATED GEOMETRY CHECKS

Add tests for:

- Front hub center matches front axle anchor.
- Front axle matches both fork dropout interfaces.
- Rear axle aligns with both rear track ends.
- Front wheel is centered between fork blades.
- Rear wheel is centered in the rear triangle.
- Seatstay endpoints match appropriate dropout junctions.
- Chainstay endpoints match appropriate dropout junctions.
- Steering axis is consistent.
- Fork crown connects to the steerer and blades.
- Wrong axle-retention hardware is not loaded.
- Duplicate hardware is not created.
- Saved configurations preserve valid component references.

Geometry checks must distinguish intentional mechanical contact from unwanted intersections.

Use actual model data and reasonable tolerances.

---

# 13. PRESERVE EXISTING FEATURES

Do not break:

- Cinelli, Dosnoventa, Tsunami, Skream, Leader, Engine11, and 8bar product records.
- Frameset colorways.
- Wheelset selections.
- 20/24, 32/32, and 36/36 spoke options.
- Polished/black component finishes.
- 2D/3D switching.
- Inspection mode.
- Camera presets.
- Frameset animations.
- Saved builds.
- MongoDB persistence.
- Authentication.
- Guest restrictions.
- Registered-user quotas.
- Compatibility checks.

Do not implement the postponed full individual-component customization system.

---

# 14. REQUIRED IMPLEMENTATION ORDER

1. Inspect the five screenshots and current renderer source.
2. Identify rear track-end hardware defects.
3. Fix the rear dropout plate geometry.
4. Correct rear axle/nut/washer placement.
5. Correct fork blade-to-dropout connections.
6. Rebuild the front axle/hub retention assembly.
7. Refine fork crown and blade surfaces.
8. Correct steerer/headset alignment.
9. Fix seatstay and chainstay junctions.
10. Apply corresponding SVG corrections.
11. Correct full-bike camera framing and inspect saddle visibility.
12. Compare actual renders with the supplied screenshots and verified product references.
13. Run geometry tests, browser tests, and production builds.
14. Fix remaining defects before reporting completion.

---

# FINAL ACCEPTANCE CRITERIA

This task is not complete unless:

- Rear track ends visibly have the correct model-specific structure.
- The rear axle sits properly within its track ends.
- Rear axle nuts and washers are not oversized or duplicated.
- Front fork dropouts align correctly with the axle.
- Appropriate front axle-retention hardware is rendered.
- The fork crown is proportionate and accurately connected.
- Both fork blades have believable shapes and transitions.
- No obvious floating or disconnected assembly parts remain.
- No incorrect large circular connectors remain around the axles.
- Seatstays and chainstays connect properly to the rear dropout assembly.
- The steerer and headset share the correct axis.
- Both 2D and 3D reflect the corrections.
- Normal full-bike camera views show the complete bicycle.
- The saddle remains visible where expected.
- Manufacturer-specific construction differences are preserved.
- Existing builder features continue working.
- Relevant automated and visual tests have actually been executed.

---

# FINAL STRICT INSTRUCTION

**Stop fixing the same fork and dropout problems through superficial visual patches.**

Identify the exact geometry and transform errors.

Reconstruct the front fork dropout, front hub axle, rear track-end plates, axle hardware, and fork crown from a coherent mechanical assembly model.

Do not add decorative rings, oversized nuts, or arbitrary cylinders simply to cover incorrect geometry.

Use manufacturer-specific sources and correct proportions.

Inspect the actual rendered bicycle from multiple viewpoints.

If a geometry model is still approximate, label it honestly.

The goal is a clean, realistically assembled fixed-gear bicycle that looks mechanically coherent in both 2D and 3D.

Preserve all working TrackLab functionality, the existing design system, and the postponed modular-customization roadmap.