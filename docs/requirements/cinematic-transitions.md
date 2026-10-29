# TRACKLAB — ULTRA-PREMIUM 3D ANIMATION, ADVANCED FRAMESET MORPHING & CINEMATIC UI/UX

## PRIMARY OBJECTIVE

Act as a Senior Creative Developer, Three.js Engineer, React Three Fiber Specialist, Technical 3D Artist, Motion Designer, UI/UX Design Director, WebGL Performance Engineer, and Full-Stack Code Reviewer.

Transform the existing TrackLab application into an ultra-premium, cinematic fixed-gear bicycle configurator.

Implement advanced 3D animation, smooth model transitions, intelligent frameset morphing, component replacement animations, refined lighting, realistic materials, and premium interface interactions.

**This is an implementation task, not a request to create static mockups or visual concepts.**

Inspect the existing repository and rendering architecture before making changes.

### Main objectives

1. Build a sophisticated 3D animation system.
2. Implement intelligent transitions between branded framesets.
3. Add advanced geometry morphing where technically compatible.
4. Create cinematic component replacement animations.
5. Improve the presentation of wheels, forks, cranksets, saddles, and handlebars.
6. Introduce refined studio lighting and realistic material effects.
7. Improve the landing page and builder UI/UX.
8. Add premium camera transitions and inspection modes.
9. Implement polished 2D/3D switching.
10. Optimize animations for desktop and mobile.
11. Preserve accurate manufacturer geometry and factory finishes.
12. Maintain all existing TrackLab functionality.

### Strict scope restriction

Do not begin the postponed complete individual-component customization overhaul.

Continue using the existing supported component categories and selection workflows.

This phase focuses on **animations, transitions, presentation, morphing, and rendering quality**, not expanding the underlying parts catalog into a completely new modular configuration system.

---

# PHASE 1 — INSPECT THE CURRENT APPLICATION

Before implementation, examine:

- Existing frontend architecture.
- React and TypeScript versions.
- Three.js and React Three Fiber versions.
- Drei integration.
- Existing animation dependencies.
- Current 3D scene.
- Procedural bicycle geometry.
- GLB assets.
- Frameset geometry generation.
- Component attachment transforms.
- Model selection workflow.
- Camera controls.
- Studio lighting.
- Material definitions.
- Render-quality settings.
- Current 2D renderer.
- Current responsive UI.
- Saved-build configuration.
- Product variants and colorways.

Identify existing animation functionality.

Determine what should be reused, improved, or replaced.

Do not install unnecessary animation libraries.

Do not rewrite functioning rendering code without a verified reason.

Capture baseline screenshots and record existing performance problems before making changes.

---

# PHASE 2 — ADVANCED ANIMATION ARCHITECTURE

Build a reusable animation system for the bicycle builder.

The architecture must support:

- Frameset transitions.
- Component transitions.
- Material transitions.
- Camera movements.
- Studio environment transitions.
- 2D/3D switching.
- Selection highlighting.
- Inspection animations.
- Introductory animations.

Use a centralized transition coordinator instead of allowing unrelated components to control the same transforms.

## Animation lifecycle

Implement explicit states:

- Idle.
- Preparing.
- Loading assets.
- Transitioning.
- Settling.
- Completed.
- Cancelled.
- Failed.

The current build configuration must remain authoritative.

Animation state must not become a second source of truth for the selected bicycle.

## Rapid user interactions

Handle situations where users quickly select multiple framesets or components.

Requirements:

- Cancel obsolete transitions.
- Prevent stale asset loads from replacing newer selections.
- Avoid simultaneous conflicting camera animations.
- Avoid duplicate bicycle meshes.
- Clean up temporary materials and geometry.
- Preserve the latest valid selection.
- Recover gracefully after loading failures.

Do not block the entire application unnecessarily during transitions.

## Animation tools

Use the existing stack where suitable:

- React Three Fiber.
- Three.js.
- Drei.
- Existing React animation tools.
- A single suitable UI motion library if needed.

Use `useFrame` for appropriate scene animations.

Avoid React state updates on every rendered frame.

Use refs and appropriate animation controllers for frequently updated transforms.

---

# PHASE 3 — ADVANCED FRAMESET MORPHING

**This is the primary feature of the upgrade.**

When changing between supported branded framesets, the transition should feel cinematic, refined, and technically coherent.

Examples:

- Cinelli Vigorelli → Dosnoventa 03 DET.
- Dosnoventa 02 LA → Tsunami SNM100.
- Skream Magnum → Skream Ranger.
- Leader 725 → Leader 735.
- 8bar KRZBERG V8 → another supported frameset.

## 3.1 Do not use naive mesh interpolation

Different manufacturers have different:

- Tube profiles.
- Tube lengths.
- Head tube shapes.
- Fork designs.
- Seatstays.
- Chainstays.
- Bottom bracket junctions.
- Dropout structures.
- Frame materials.
- Mesh topology.

Do not directly interpolate arbitrary vertex arrays between unrelated meshes.

This can produce:

- Collapsed geometry.
- Twisted tubing.
- Disconnected junctions.
- Self-intersections.
- Distorted frame proportions.
- Invalid mesh normals.
- Broken fork alignment.

These are unacceptable as final transition behavior.

## 3.2 Implement three transition strategies

### Strategy A — Geometry-aware morphing

Use when the source and destination geometries share a compatible procedural representation or validated morph-target topology.

Potentially animate:

- Top tube slope.
- Head tube angle.
- Seat tube angle.
- Frame-point positions.
- Rear triangle proportions.
- Tube profile parameters.
- Fork geometry parameters.
- Attachment transforms.

Use the existing shared frame geometry system.

Maintain coherent structural connections throughout the transition where practical.

For example:

A documented transition between two compatible parametric frame templates may smoothly change the top tube position while updating the connected head tube and seat tube endpoints.

Do not claim intermediate animated shapes are actual manufacturer products.

The starting and ending states must correspond to their selected verified models.

### Strategy B — Cinematic model replacement

Use when models have incompatible topology, different physical construction, or insufficient common parametric structure.

Recommended sequence:

1. User selects a new frameset.
2. Validate the target variant.
3. Preload its supported rendering assets.
4. Maintain the current bicycle during loading.
5. Begin a subtle cinematic camera movement.
6. Fade or reveal the source frameset appropriately.
7. Introduce the destination frameset.
8. Transition materials and lighting where appropriate.
9. Reposition dependent assemblies using their valid target transforms.
10. Settle the camera into the final composition.

Use restrained crossfades, controlled reveals, or short spatial separation effects.

Do not force a destructive geometric morph.

Do not stretch a steel frame into a carbon aero frame through an inaccurate intermediate mesh.

### Strategy C — Material-only transition

Use when the user changes only a supported colorway or finish.

Examples:

- Black → Polished wheelset.
- Polished → Black crank arms.
- Factory colorway A → Factory colorway B.
- Black → Polished stem.

Animate relevant material properties where supported.

Do not rebuild the entire bicycle for a material-only change.

## 3.3 Morphing accuracy

The completed transition must:

- Preserve selected target geometry.
- Use correct frame size.
- Preserve relevant model-specific tube profiles.
- Maintain correct wheel and axle alignment.
- Maintain valid endpoint component attachments.
- Keep the correct fork and headset interface.
- Preserve appropriate factory colorway information.

Intermediate animation frames are visual effects, not compatibility validation states.

Do not persist intermediate geometry as a saved configuration.

---

# PHASE 4 — CINEMATIC FRAMESET TRANSFORMATION EXPERIENCE

Create a polished transition experience when changing major framesets.

## Suggested sequence

**Stage 1 — Selection**

Highlight the selected manufacturer/model card.

**Stage 2 — Preparation**

Preload the required model geometry, assets, and materials.

**Stage 3 — Camera movement**

Move the camera subtly toward a composition that presents the frame well.

**Stage 4 — Frame transformation**

Apply the appropriate validated morph or cinematic mesh replacement.

**Stage 5 — Assembly update**

Reposition supported components using the destination frame's attachment geometry.

**Stage 6 — Material reveal**

Show the selected official finish and permitted graphical assets.

**Stage 7 — Final presentation**

Smoothly reframe the complete bicycle.

## Visual direction

The effect should feel like a premium automotive configurator.

Use:

- Controlled camera movement.
- Short material transitions.
- Smooth transformation curves.
- Refined highlights.
- Delicate lighting changes.
- Proper depth perception.

Avoid:

- Explosions.
- Excessive particles.
- Unnecessary floating frames.
- Long transformations.
- Aggressive glowing outlines.
- Unnatural bicycle stretching.
- Distracting spinning animations.

## Duration

Use responsive transition durations.

Suggested starting ranges:

- Material changes: 200–500 ms.
- Individual component swaps: 300–700 ms.
- Major frameset changes: 600–1,200 ms.
- Camera preset transitions: 400–900 ms.

These are design starting points, not rigid universal requirements.

Allow reduced-motion alternatives.

Do not delay component selection unnecessarily.

---

# PHASE 5 — ADVANCED COMPONENT CHANGE ANIMATIONS

Improve visual feedback when supported components change.

Do not expand the component-selection architecture beyond its current scope.

## Wheelsets

When selecting another wheelset:

- Preload or generate the target wheel geometry.
- Preserve the frame.
- Transition the relevant front/rear wheel assemblies.
- Update rim depth.
- Update the selected spoke arrangement.
- Update materials.
- Maintain correct axle placement.

Do not create floating wheels during ordinary product replacement unless explicitly using a short, optional inspection-style animation.

### 20/24, 32/32, and 36/36 spokes

When selecting another supported spoke configuration:

- Update the actual spoke geometry.
- Keep hub and rim drilling consistent.
- Use the correct lacing configuration.
- Transition between assemblies smoothly.

Do not interpolate spoke counts into fractional or physically impossible spokes.

Use geometry replacement or a coordinated reveal.

## Fork

When changing to a supported compatible fork:

- Update the steerer assembly.
- Update the fork crown.
- Replace blade geometry.
- Preserve correct front axle attachment.
- Reframe the bicycle if necessary.

Do not morph incompatible axle or steering interfaces as though they were compatible.

## Crankset

For supported crankset changes:

- Use a short refined visual transition.
- Preserve the bottom bracket position.
- Maintain correct crank alignment.
- Preserve chainring/cog relationships.
- Update the applicable geometry.

Do not allow the chain or pedals to become detached during the final state.

## Saddle

Improve saddle transitions:

- Smoothly replace the shell/rail assembly.
- Maintain the seatpost-head attachment.
- Preserve correct saddle positioning.
- Avoid sudden scale changes.

## Cockpit

Support animated visual changes among:

- Dropbar.
- Riser.
- Straight/Flat.
- Bullhorn.

Use correct target geometry.

Do not morph arbitrary incompatible handlebar meshes directly.

For substantially different handlebar types, use a smooth replacement transition.

Preserve valid stem and headset attachment relationships.

---

# PHASE 6 — OPTIONAL EXPLODED COMPONENT INSPECTION

Implement a controlled component-inspection mode for currently supported assemblies.

This is a visualization feature, not the postponed full modular configuration workflow.

## Inspection behavior

When the user requests to inspect a supported component:

1. Focus the camera on the selected assembly.
2. Highlight the relevant geometry.
3. Optionally separate the visual assembly slightly from the bicycle.
4. Show available technical information.
5. Allow the user to return to the normal assembled view.

Suitable inspection targets include:

- Frameset.
- Fork.
- Wheelset.
- Crankset.
- Cockpit.
- Saddle/seatpost.

## Strict rules

- Never save exploded positions as actual bicycle assembly geometry.
- Preserve the actual configuration.
- Keep temporary visual separation small and understandable.
- Provide a clear Reset Assembly action.
- Do not perform animations that imply incompatible parts physically fit together.
- Disable or simplify the effect on low-performance devices.

This mode should be optional.

---

# PHASE 7 — ADVANCED CINEMATIC CAMERA SYSTEM

Improve the existing camera controls.

## Required features

- Smooth orbit.
- Damped rotation.
- Smooth zoom.
- Smooth pan.
- Animated camera presets.
- Fit-to-view.
- Reset camera.
- Turntable mode.
- Component focus.
- Proper viewport-bound camera fitting.

## Camera presets

Support:

- Full Side Profile.
- Front.
- Rear.
- Front Three-Quarter.
- Rear Three-Quarter.
- Top, where appropriate.
- Default Studio.
- Component Inspection.

## Camera transitions

Use smooth interpolation with stable easing.

Avoid abrupt camera jumps.

The camera should not:

- Clip through bicycle geometry.
- Pass beneath the floor unexpectedly.
- Cut off the wheels.
- Hide the cockpit.
- Overzoom during frameset changes.
- Lose the bicycle after switching models.

Use appropriate complete-assembly bounds when calculating the target framing.

## Turntable mode

Implement an optional slow, refined rotation around the bicycle.

User interaction should pause turntable animation.

The turntable must not interfere with component selection or camera presets.

Respect reduced-motion preferences.

---

# PHASE 8 — PREMIUM STUDIO LIGHTING & RENDERING EFFECTS

Upgrade the existing studio environment.

## Studio lighting

Implement refined:

- Ambient lighting.
- Key lighting.
- Fill lighting.
- Subtle rim lighting.
- Soft contact shadows.
- Appropriate environment reflections.

Support the existing:

- Studio Light.
- Studio Dark.

## Materials

Improve appearance for:

- Painted aluminum.
- Steel.
- Carbon-like surfaces where appropriate.
- Polished metal.
- Black anodized components.
- Rubber tires.
- Saddle shells.
- Saddle padding.
- Handlebar tape and grips.

Use physically based materials.

The bicycle should look convincing rather than excessively glossy.

## Post-processing

Evaluate and selectively implement:

- Ambient occlusion.
- Anti-aliasing.
- Contact shadows.
- Subtle bloom.
- Tone mapping.
- Environment reflections.
- Controlled depth effects where appropriate.

Do not apply every effect by default.

Avoid:

- Excessive bloom.
- Heavy motion blur.
- Chromatic aberration.
- Extreme depth of field.
- Unnecessary cinematic lens distortion.

The bicycle's actual geometry and factory graphics must remain clearly visible.

## Realism rule

Do not use lighting effects to conceal incorrect geometry.

Modeling accuracy remains the priority.

---

# PHASE 9 — PREMIUM MATERIAL AND COLORWAY TRANSITIONS

Preserve the existing factory colorway system.

For framesets, use only verified manufacturer-listed colorways as official options.

For eligible customizable components, preserve:

- Polished.
- Pure Black.
- Verified Manufacturer Finish.
- Explicitly labeled Custom Concept Finish when supported.

## Material animation

Support smooth transitions between valid material presets.

Examples:

- Polished rim → Black rim.
- Black crank arms → Polished crank arms.
- Factory paint A → Factory paint B.
- Polished stem → Black stem.

Only animate materials that actually change.

Do not accidentally recolor:

- Tires as polished metal.
- Saddle padding as chrome.
- Rubber grips as aluminum.
- Unrelated components.

## Manufacturer artwork

Keep approved decal/graphic mappings intact.

Do not stretch, mirror, or distort branded graphics during transitions.

If an exact texture cannot be transitioned safely, use a short material/texture crossfade or asset replacement.

---

# PHASE 10 — ULTRA-PREMIUM BUILDER UI/UX

Retain TrackLab's established graphite/titanium/electric-blue identity.

Do not use the green portfolio theme.

Improve the current builder without redesigning its functional architecture.

## Main layout

Maintain:

- Compact component-category navigation.
- Large bicycle viewer.
- Contextual component catalog.
- Compact build summary.
- Save controls.

## Floating controls

Refine:

- Camera selection.
- Studio environment.
- Quality mode.
- Turntable.
- Reset view.
- Zoom.
- 2D/3D mode.

Use consistent button sizes, icons, focus states, and spacing.

Do not let controls cover the bicycle.

## Component cards

Improve:

- Active state.
- Hover state.
- Image/preview quality.
- Brand/model hierarchy.
- Variant selection.
- Finish selection.
- Compatibility indicators.
- Rendering status.
- Loading skeletons.

Use subtle transitions.

Avoid excessive card animations.

## Interaction feedback

Provide:

- Loading model.
- Preparing transition.
- Model switched.
- Material updated.
- Geometry unavailable.
- Transition failed.
- Unsupported rendering mode.

Do not display success feedback until the selection is actually applied.

---

# PHASE 11 — CINEMATIC LANDING PAGE

Improve the existing TrackLab homepage.

The hero should resemble a premium bicycle product studio.

## Visual presentation

Use:

- Large bicycle visualization.
- Refined typography.
- Clear primary call to action.
- Cinematic but restrained lighting.
- Optional slow camera reveal.
- Carefully balanced composition.
- Premium spacing and surfaces.

## Hero motion

Where practical:

1. Load a validated supported bicycle.
2. Present a subtle camera reveal.
3. Establish the default studio composition.
4. Keep the Start Building action immediately available.

Avoid long intro animations.

Do not force a heavy 3D experience onto low-performance devices.

Provide a static or lightweight fallback.

## Scrolling animations

Use subtle section reveals and motion where appropriate.

Avoid excessive parallax.

Do not make every page section animate unnecessarily.

---

# PHASE 12 — PREMIUM 2D/3D MODE TRANSITIONS

The existing 2D/3D toggle should feel refined.

When changing modes:

1. Preserve the selected build.
2. Preserve the selected frame/model.
3. Preserve the selected colorway.
4. Preserve component selections.
5. Preserve compatible camera framing where practical.
6. Prepare the destination renderer.
7. Transition without a blank flash.
8. Enable interaction after the destination is ready.

Use a subtle crossfade or another appropriate effect.

Do not render two expensive interactive 3D scenes simultaneously without a performance reason.

## 2D animations

The 2D renderer may use:

- Subtle component transitions.
- Paint/finish transitions.
- Proper zoom animations.
- Selected-part highlighting.
- View transitions.

SVG path morphing is permitted only when the geometry/path structure supports a correct transformation.

Otherwise use appropriate shape replacement.

Both renderers must remain synchronized.

---

# PHASE 13 — GRAPHICS QUALITY PRESETS

Preserve and improve the existing graphics-quality selector.

Support:

### Auto

Select an appropriate quality level based on measured device capability and runtime performance.

### Performance

Reduce expensive effects, shadows, and render resolution where appropriate.

### Balanced

Provide good visual quality at a reasonable performance cost.

### Quality

Enable higher-quality visual settings on capable devices.

## Adaptive behavior

Adjust as necessary:

- Device pixel ratio.
- Shadow quality.
- Post-processing.
- Texture resolution.
- Reflection quality.
- Geometry detail where alternatives exist.
- Animation complexity.

Do not degrade geometry accuracy merely to create an animation effect.

Use lower-complexity render assets when necessary.

---

# PHASE 14 — PERFORMANCE REQUIREMENTS

Premium effects must not make TrackLab slow.

## Performance targets

Aim for:

- Smooth 60 FPS interaction on capable desktop devices.
- Approximately 30 FPS or better on supported mobile devices under suitable settings.
- Fast response to component selection.
- Minimal unnecessary asset downloads.
- No significant UI layout shifts.
- Stable memory usage during repeated model changes.

These are targets to measure, not guarantees.

## Optimizations

Implement where appropriate:

- Geometry caching.
- Material caching.
- Texture reuse.
- GLB asset preloading.
- Asset compression.
- Instanced repeated geometry.
- Efficient render-loop scheduling.
- On-demand rendering when idle.
- Temporary continuous rendering during active animation.
- Scene cleanup.
- GPU resource disposal.
- Reduced unnecessary React rerenders.
- Adaptive quality settings.

Avoid mounting a new complete Three.js canvas every time the user changes a frame.

Do not create repeated GPU resource leaks.

## Idle behavior

When the bicycle is stationary and no effects are running, reduce unnecessary rendering work.

Resume rendering appropriately for:

- Camera interaction.
- Turntable animation.
- Component transitions.
- Material animation.
- Model changes.

Use the actual installed React Three Fiber version's supported rendering APIs.

---

# PHASE 15 — ACCESSIBILITY & REDUCED MOTION

Implement accessible motion controls.

Respect:

- `prefers-reduced-motion`.
- Keyboard navigation.
- Touch interaction.
- Focus management.
- Accessible labels.
- Non-drag alternatives.

## Reduced-motion mode

Disable or simplify:

- Automatic turntable.
- Large camera sweeps.
- Complex frame morphing.
- Exploded-view motion.
- Extensive parallax.
- Nonessential cinematic reveals.

Use short fades or immediate updates instead.

The builder must remain fully functional.

Do not make essential actions dependent on animations.

---

# PHASE 16 — RESPONSIVE DESIGN

Ensure the animations remain usable across desktop, tablet, and mobile.

## Desktop

Provide the complete supported cinematic experience.

## Tablet

Adapt control positioning and visual effects to the available viewport.

## Mobile

Prioritize:

- Touch-friendly camera controls.
- Large bicycle preview.
- Compact selection sheets.
- Minimal screen obstruction.
- Reduced effects where appropriate.
- Stable frame rates.
- Reliable mode switching.

Prevent gesture conflicts between:

- Camera rotation.
- Page scrolling.
- Bottom-sheet gestures.
- Pinch zoom.

Do not allow floating camera controls to obscure component selection.

---

# PHASE 17 — PRESERVE SYSTEM FUNCTIONALITY

Do not break:

- Authentication.
- Guest access.
- Guest quotas.
- Registered-user build limits.
- Rate limiting.
- MongoDB persistence.
- My Garage.
- Build saving.
- Frameset selection.
- Existing brands.
- Factory colorways.
- Component finish selections.
- 20/24, 32/32, and 36/36 wheelset options.
- Compatibility engine.
- 2D rendering.
- 3D rendering.
- Camera presets.
- Brand disclaimers.
- Admin catalog management.

**Animations must not create new saved builds or consume component-change quotas for camera movements.**

A component change should follow the existing authoritative selection and quota policy.

Do not change database schemas unnecessarily merely to support a temporary visual transition.

Do not allow development-only quota bypasses to become active in production.

Do not begin the postponed complete modular individual-component customization overhaul.

---

# PHASE 18 — TESTING & VISUAL VERIFICATION

Use actual browser testing and visual inspection.

## Frameset transitions

Test:

- Cinelli → Dosnoventa.
- Dosnoventa → Tsunami.
- Skream Magnum → Ranger.
- Leader 725 → 735.
- Other supported pairs.

Verify:

- Correct target geometry.
- Correct model-specific tube profiles.
- No collapsed meshes.
- No distorted junctions in true morphing transitions.
- No duplicate parts.
- Correct fork/headset alignment at the final state.
- Correct wheel positioning.
- Correct factory colorway.
- Correct rendering status.
- Proper camera framing.

## Component transitions

Test:

- Classic wheelset → deep-section wheelset.
- 20/24 → 32/32 spokes.
- 32/32 → 36/36 spokes.
- Polished → Black rims.
- Black → Polished crank arms.
- Chainring finish changes.
- Dropbar → Riser.
- Riser → Bullhorn.
- Saddle changes.
- Fork changes where supported.

Validate that component changes do not reset unrelated selections.

## Animation robustness

Test:

1. Rapidly switching models.
2. Switching models while assets load.
3. Changing camera angles during transitions.
4. Cancelling a transition.
5. Switching between 2D and 3D during loading.
6. Losing network connectivity.
7. Loading an unavailable 3D asset.
8. Repeated model switching.
9. Returning from component inspection.
10. Reduced-motion mode.

No stale animation may overwrite a newer valid selection.

## Visual testing

Capture screenshots and short recordings where supported.

Review:

- Default studio view.
- Side profile.
- Front.
- Rear.
- Three-quarter.
- Frameset transition.
- Component transition.
- Material transition.
- Inspection mode.
- Studio Light.
- Studio Dark.
- Mobile preview.

## Performance testing

Measure:

- Scene load time.
- Transition duration.
- Frame rate.
- GPU memory behavior where measurable.
- JavaScript memory usage.
- Draw calls.
- Asset requests.
- Idle rendering activity.
- Mobile performance.

## Technical checks

Run:

- TypeScript.
- Lint.
- Unit tests.
- Geometry tests.
- Integration tests.
- Playwright browser tests.
- Production builds.

Do not claim tests passed without executing them.

---

# PHASE 19 — IMPLEMENTATION ROADMAP

Implement in this order.

### Stage 1 — Animation audit
Inspect existing rendering and animation systems.

### Stage 2 — Transition coordinator
Build a reusable animation lifecycle with cancellation, cleanup, and loading management.

### Stage 3 — Camera improvements
Implement smooth presets, framing, component focus, and reliable turntable controls.

### Stage 4 — Frameset morphing
Implement safe geometry-aware morphing and cinematic replacement for incompatible models.

### Stage 5 — Component transitions
Add transitions for the currently supported frame, wheel, fork, crankset, saddle, and cockpit changes.

### Stage 6 — Material effects
Improve polished, black, and factory-finish transitions.

### Stage 7 — Studio presentation
Improve lighting, materials, shadows, and optional post-processing.

### Stage 8 — Premium builder UI
Polish floating controls, product cards, category transitions, and interaction feedback.

### Stage 9 — Landing page
Introduce an appropriate cinematic product presentation.

### Stage 10 — 2D/3D transition system
Improve rendering-mode switching while retaining the same configuration.

### Stage 11 — Performance
Implement adaptive graphics quality, resource management, and efficient rendering.

### Stage 12 — Testing and refinement
Verify actual rendered behavior and fix discovered issues.

---

# FINAL ACCEPTANCE CRITERIA

Do not mark the task complete unless:

1. Camera preset transitions are smooth.
2. Default camera framing shows the complete bicycle.
3. The turntable works without interrupting normal controls.
4. Model transitions preload assets where appropriate.
5. Compatible geometries can use validated morphing.
6. Incompatible geometries use appropriate cinematic replacement.
7. Frameset transitions preserve correct final geometry.
8. Model changes do not produce distorted frame junctions.
9. Component changes have refined visual feedback.
10. Spoke configuration changes retain correct actual geometry.
11. Material transitions work correctly.
12. Factory colorways remain accurate.
13. Supported component finishes remain intact.
14. Studio lighting looks refined without excessive visual effects.
15. 2D/3D transitions are smooth.
16. The builder interface has consistent premium motion.
17. The landing page has an appropriate premium presentation.
18. Mobile interactions remain functional.
19. Reduced-motion preferences are respected.
20. The system avoids unnecessary rendering when idle.
21. Repeated model changes do not introduce GPU resource leaks.
22. Existing builds, quotas, authentication, and database workflows remain intact.
23. Automated and browser tests have been executed.
24. Remaining limitations are documented.
25. No unsupported branded geometry is presented as an authentic manufacturer replica.

---

# FINAL STRICT INSTRUCTIONS

**Make TrackLab feel like an ultra-premium interactive bicycle customization studio.**

Focus on advanced 3D animation, intelligent frameset morphing, cinematic component transitions, smooth camera movement, realistic lighting, refined materials, and premium UI/UX.

The system must understand that different bicycle models have different physical geometry.

Do not force arbitrary mesh morphing between incompatible framesets.

Use real geometry-aware morphing only when it can be implemented safely and correctly.

For incompatible geometries, use refined cinematic mesh replacement.

Do not distort branded frames to achieve visual effects.

Do not compromise correct forks, head tubes, dropouts, wheels, saddle geometry, or component attachments.

Preserve accurate factory colorways and supported polished/black component finishes.

Maintain the established graphite/electric-blue TrackLab design system.

Do not add unnecessary animations, excessive glow, or distracting visual effects.

Do not sacrifice mobile performance.

Do not implement the postponed full individual-component customization overhaul.

**The final result should feel like a high-end automotive configurator adapted specifically for realistic fixed-gear bicycle customization, with professional 3D transitions and a cohesive, responsive, cinematic interface.**