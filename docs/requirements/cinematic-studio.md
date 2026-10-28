# TRACKLAB — ULTRA-PREMIUM UI/UX, CINEMATIC 3D ANIMATIONS & INTERACTIVE VISUAL EXPERIENCE

## PRIMARY OBJECTIVE

Act as a Senior Creative Frontend Developer, UI/UX Design Director, Three.js Specialist, React Three Fiber Developer, Motion Design Engineer, WebGL Performance Engineer, and Full-Stack Code Reviewer.

Your task is to transform the existing **TrackLab — Hybrid 2D/3D Fixed-Gear Bike Builder** into a premium, cinematic, highly interactive bicycle customization platform.

The current application already has an established design system, functional builder, 2D/3D visualization, real-brand catalog integration, authentication, and account limitations.

Your responsibility is to elevate the overall visual and interactive experience to a professional production standard.

**This is an implementation task, not merely a request for suggestions or mockups.**

### MAIN GOALS

1. Create an ultra-premium, cinematic UI/UX.
2. Improve the complete application layout and visual hierarchy.
3. Introduce sophisticated, purposeful animations.
4. Create smooth and realistic 3D bicycle interactions.
5. Improve camera movement, lighting, shadows, and materials.
6. Add elegant transitions between bike models and rendering modes.
7. Improve component selection and product presentation.
8. Make the landing page feel immersive and premium.
9. Improve responsive interactions on mobile and tablet.
10. Optimize animation performance and loading.
11. Maintain accurate manufacturer-specific bicycle models.
12. Preserve all existing backend and frontend functionality.

### IMPORTANT PRIORITY

We are currently focusing on improving the bicycle modeling and visual experience.

**Do not implement the previously planned complete individual-component customization system yet.**

The advanced individual-part system involving independently configurable stems, crank arms, chainrings, cogs, seatposts, hubs, and other individual parts is postponed until branded 2D/3D modeling is sufficiently polished.

Preserve existing component customization functionality without expanding its scope unnecessarily.

---

# PHASE 1 — COMPLETE UI/UX AND 3D IMPLEMENTATION AUDIT

Before implementing improvements, inspect the existing repository.

Review:

- React frontend architecture.
- Current Tailwind design system.
- Global typography.
- Theme tokens.
- Page layouts.
- Navigation system.
- Landing page.
- Bike Builder workspace.
- Component catalog.
- My Garage.
- Authentication screens.
- Account settings.
- Admin interface.
- Current SVG bicycle renderer.
- Current Three.js scene.
- React Three Fiber integration.
- 3D camera configuration.
- Lighting setup.
- Materials.
- Shadow system.
- Asset loading.
- Existing animations.
- Current dependencies.
- Performance bottlenecks.
- Responsive behavior.

Identify which existing implementations can be improved rather than replaced.

Do not unnecessarily rewrite functional components.

Document existing issues before making major changes.

Use Playwright or available browser tools to inspect the actual application and capture baseline screenshots.

Do not judge the interface exclusively from source code.

---

# PHASE 2 — ESTABLISH AN ULTRA-PREMIUM DESIGN LANGUAGE

## Design direction

TrackLab must feel like a luxury product configurator.

The visual direction should combine:

- Modern automotive configurators.
- Premium cycling studios.
- High-end industrial product design.
- Cinematic product visualization.
- Minimalist interface design.
- Precise motion design.
- Elegant and restrained microinteractions.

The application should feel sophisticated, technical, immersive, and professional.

Do not make it look like:

- A generic SaaS dashboard.
- A developer portfolio.
- A basic bicycle illustration tool.
- A gaming interface full of neon effects.
- A template-heavy landing page.
- A website overloaded with glassmorphism.

### Color identity

Preserve TrackLab's existing graphite/titanium/electric-blue identity.

Suggested foundation:

- Deep graphite backgrounds.
- Charcoal and titanium surfaces.
- Neutral studio backgrounds.
- Off-white typography.
- Muted secondary text.
- Electric-blue interactive accents.
- Subtle neutral borders.

Do not use the green theme from my other projects.

Do not change the entire visual identity without a clear reason.

Use existing semantic Tailwind and CSS theme tokens.

Refine the theme variables where needed rather than introducing scattered hardcoded values.

### Surface design

Introduce:

- Refined layered surfaces.
- Subtle elevation.
- Controlled surface contrast.
- Soft borders.
- Elegant shadows.
- Delicate gradients where appropriate.
- Smooth hover feedback.
- Distinct selected states.
- Refined floating controls.

Avoid excessive glow, blur, or transparency.

Use visual effects to communicate depth, not simply decorate the application.

### Typography

Improve typography throughout the application.

Use:

- Strong, confident headings.
- Clean body typography.
- Consistent font sizing.
- Distinct product names.
- Readable specification labels.
- Balanced text density.
- Clear visual hierarchy.

Do not use unnecessarily small typography.

Avoid excessively large uppercase headings everywhere.

The overall result should look premium without sacrificing readability.

---

# PHASE 3 — CINEMATIC 3D BICYCLE PRESENTATION

This is the most important visual upgrade.

The bicycle must feel like a premium product displayed inside a professional digital studio.

## 3.1 Professional studio environment

Improve the Three.js scene using:

- Physically based materials.
- Suitable environment lighting.
- Soft ambient illumination.
- Controlled key lighting.
- Subtle fill lighting.
- Rim lighting.
- Realistic reflections.
- High-quality contact shadows.
- Appropriate ground-plane presentation.
- Physically plausible material roughness.
- Consistent scene exposure.

Use suitable HDR environments or equivalent lighting techniques where permitted and performance allows.

Avoid excessive shine.

Avoid making metal or painted surfaces look like plastic.

Do not use dramatic lighting that hides the actual bicycle geometry.

Provide at least two professionally designed environments:

**Studio Light**
- Soft neutral background.
- Balanced lighting.
- Clear component visibility.
- Minimal reflections.

**Studio Dark**
- Graphite background.
- Cinematic rim lighting.
- Controlled reflections.
- Clear bicycle silhouette.

Both environments must work with different bicycle colors.

Use subtle floor shadows to establish depth.

Do not overload the scene with unnecessary environmental objects.

## 3.2 Cinematic camera controls

Replace basic or abrupt camera behavior with smooth, controlled movement.

Implement:

- Smooth orbit rotation.
- Inertial camera movement.
- Smooth zoom.
- Smooth reset.
- Animated camera presets.
- Fit-to-bike framing.
- Controlled camera distance limits.
- Correct camera target placement.
- Automatic recalculation after frame changes.

Support camera presets:

- Side Profile.
- Front.
- Rear.
- Three-Quarter Front.
- Three-Quarter Rear.
- Top, where appropriate.
- Default Studio.

Camera movement between presets should animate smoothly.

Use interpolation, damped motion, or suitable motion techniques.

Avoid immediate camera teleportation.

Prevent the camera from clipping through the bicycle or floor.

Camera controls must remain predictable.

## 3.3 Premium initial presentation

When the user opens the 3D builder:

1. Load the supported bicycle model.
2. Position the camera using verified bounds.
3. Apply studio lighting.
4. Present the bike with a subtle reveal.
5. Smoothly transition to the default viewing angle.
6. Enable user interaction.

Avoid long startup cinematics.

The user must be able to interact with the bicycle quickly.

Do not replay the intro every time the user changes categories.

Respect reduced-motion preferences.

## 3.4 Turntable presentation

Implement an optional cinematic turntable mode.

When enabled:

- The camera or scene slowly rotates around the bicycle.
- Rotation remains smooth.
- Motion uses stable frame-rate-independent timing.
- User interaction pauses or stops the automatic movement.
- A clear control allows users to disable it.

Do not force automatic rotation permanently.

Do not rotate the bike while a user is actively examining a selected component.

Avoid unnecessary motion on mobile or reduced-motion devices.

---

# PHASE 4 — ADVANCED 3D ANIMATIONS AND EFFECTS

Introduce purposeful visual animations.

Animations must improve interaction quality and perceived realism.

## 4.1 Bicycle reveal animation

Create a subtle presentation animation when the viewer first loads a supported model.

Possible techniques:

- Camera dolly.
- Gentle opacity reveal.
- Controlled lighting transition.
- Smooth camera framing.
- Subtle floor shadow introduction.

Avoid unrealistic bicycle stretching or geometry distortion.

Do not animate the entire bicycle through exaggerated floating or bouncing effects.

## 4.2 Frame selection transitions

When a user changes from one branded frameset to another:

1. Validate the selected catalog variant.
2. Determine which rendering assets are available.
3. Preload required assets when feasible.
4. Keep the current bicycle stable while loading.
5. Transition between the available models.
6. Update camera framing.
7. Restore interactive controls.
8. Update specifications and compatibility.

Use restrained fades, material transitions, or camera movement when technically appropriate.

Do not morph unrelated frames using arbitrary vertex deformation.

Geometry transitions must not falsely suggest manufacturing accuracy.

If exact model assets are unavailable, show the correct illustrative or unavailable state.

## 4.3 Component selection feedback

When a user selects a component:

- Highlight the selected part.
- Show the corresponding catalog selection.
- Provide immediate feedback.
- Update the appropriate rendering.
- Preserve the remaining build.
- Update compatibility information.

A subtle emissive outline or selection overlay may be used where supported.

Avoid applying unrealistic permanent neon glows.

Selection highlights must not obscure paint, decals, or actual geometry.

## 4.4 Material transitions

Where the product supports different verified finishes:

- Transition smoothly between supported material states.
- Preserve correct roughness and metallic properties.
- Update color or texture correctly.
- Keep realistic reflections.
- Avoid unnecessary geometry reloads for material-only changes.

Do not invent manufacturer finish variants.

## 4.5 Optional visual effects

Evaluate and selectively implement:

- Contact shadows.
- Ambient occlusion.
- High-quality anti-aliasing.
- Subtle bloom for suitable highlights.
- Controlled tone mapping.
- Refined environment reflections.
- Depth-based presentation effects where appropriate.

Do not enable every post-processing effect merely because it exists.

Choose effects based on visual benefit and measurable rendering cost.

Avoid extreme bloom, chromatic aberration, heavy motion blur, and unnecessary lens distortion.

Visual fidelity and performance are more important than the number of effects.

---

# PHASE 5 — PREMIUM 2D/3D VIEW SWITCHING

Improve the transition between rendering modes.

Current mode switching should feel seamless.

## Requirements

- Preserve the selected bicycle configuration.
- Preserve the selected product variant.
- Preserve supported finishes.
- Preserve compatibility results.
- Preserve relevant camera/view preferences where practical.
- Avoid blank flashes.
- Show meaningful loading feedback.
- Keep the UI responsive.
- Maintain stable preview dimensions.

Use a subtle crossfade or equivalent transition where appropriate.

Do not display an unrelated generic bicycle while a branded model is loading.

Do not claim 3D support when no suitable model is available.

Support explicit rendering fidelity labels:

- Authentic licensed asset.
- Verified geometry model.
- Illustrative preview.
- Visualization unavailable.

Provide a high-quality 2D fallback when 3D is unsupported or fails.

---

# PHASE 6 — ULTRA-PREMIUM BIKE BUILDER WORKSPACE

Improve the existing builder layout without destroying its successful structure.

The bicycle must remain the visual centerpiece.

## Desktop layout

Retain three primary regions:

**Left:** Compact component categories.

**Center:** Large interactive bicycle viewer.

**Right:** Contextual component selection.

Refine their proportions and visual hierarchy.

## Central viewer

Requirements:

- Large bicycle presentation.
- Responsive fit-to-view.
- Minimal visual clutter.
- Compact floating controls.
- Proper camera controls.
- Studio environment selection.
- 2D/3D toggle.
- Optional auto-rotate control.
- Full-screen preview.
- Selected component feedback.

Do not reduce bicycle size to make room for excessive secondary information.

## Builder toolbar

Improve:

- Build name.
- Frameset identification.
- Undo/redo.
- Save action.
- Quota indicator.
- Viewer controls.

Use a compact professional toolbar.

Avoid multiple stacked header bars.

## Component navigation

Create refined category controls with:

- Consistent icons.
- Subtle active state animations.
- Clear labels.
- Proper keyboard focus.
- Compact spacing.
- Smooth interaction feedback.

Avoid excessive sidebar widths.

## Product selection panel

Improve:

- Product card images.
- Brand hierarchy.
- Variant selection.
- Finish options.
- Active selection.
- Compatibility feedback.
- Rendering availability.
- Loading skeletons.

Keep the component selection panel clean and scannable.

Avoid giant product cards that show only one or two items at a time.

## Summary information

Keep the selected-parts, gear-ratio, and compatibility summary compact.

Use expandable details instead of permanently occupying valuable preview space.

Do not restore the previous oversized summary layout.

---

# PHASE 7 — ADVANCED MICROINTERACTIONS

Create a consistent motion system across the application.

Implement purposeful transitions for:

- Navigation.
- Buttons.
- Product cards.
- Category switching.
- Filters.
- Tabs.
- Dialogs.
- Drawers.
- Bottom sheets.
- Tooltips.
- Notifications.
- Loading states.
- Save feedback.

## Motion guidelines

Use a small, coherent motion-token system.

Suggested starting points:

- Fast feedback: approximately 120–180 ms.
- Standard transitions: approximately 180–280 ms.
- Larger panel transitions: approximately 250–400 ms.
- Camera transitions: context-dependent, generally under approximately 900 ms.

These are design guidelines, not hardcoded universal durations.

Use appropriate easing.

Avoid animations that feel slow or delay basic actions.

## Button interactions

Implement subtle:

- Hover response.
- Press feedback.
- Focus indicators.
- Loading feedback.
- Success confirmation.

Avoid excessive scale effects.

## Product cards

Use:

- Subtle elevation.
- Border transitions.
- Selected-state emphasis.
- Smooth image transitions.
- Consistent thumbnail scaling.

Avoid excessive card tilt or distracting 3D hover effects.

## Drawers and modals

Use polished opening and closing transitions.

Maintain:

- Proper focus management.
- Scroll locking.
- Keyboard accessibility.
- Escape-key handling.
- Reduced-motion support.

Do not let animations delay functionality.

---

# PHASE 8 — CINEMATIC LANDING PAGE

Redesign the landing-page presentation to match the premium builder experience.

Do not copy the styling or layout of my other projects.

## Hero section

Create a sophisticated landing-page hero.

Suggested headline:

**Build Beyond the Ordinary.**

Supporting text:

"Explore iconic fixed-gear framesets, customize your setup, and experience your build in an interactive 2D and 3D studio."

Include:

- Start Building.
- Explore Framesets.
- Premium bicycle visualization.
- Strong visual hierarchy.
- Clear product positioning.

## Hero animation

Where suitable, use a polished 3D bicycle presentation.

Possible features:

- Slow cinematic camera reveal.
- Gentle bicycle rotation.
- Smooth lighting.
- Subtle entrance transitions.
- Premium studio environment.

Do not force a heavy interactive 3D scene onto every visitor.

Use a progressive enhancement approach.

For low-performance devices, reduced-motion settings, and slow connections, provide a high-quality static or lightweight visual fallback.

Do not let the hero animation delay the primary CTA.

## Page sections

Improve:

- Hero.
- Supported Brands.
- How It Works.
- 2D/3D Features.
- Bike Customization.
- Component Compatibility.
- My Garage.
- Brand Acknowledgments.
- Footer.

Use refined transitions between sections.

Avoid repetitive cards and excessive whitespace.

Do not add unnecessary sections merely to make the landing page longer.

---

# PHASE 9 — REAL BRANDED BIKE PRESENTATION

TrackLab supports real manufacturers, including:

- Cinelli.
- Dosnoventa.
- Tsunami.
- Skream.
- Engine11.
- Leader.
- Other verified supported manufacturers.

Maintain strict model authenticity requirements.

## Brand visual rules

- Every represented branded model must use correct variant metadata.
- Do not treat a generic frame as an exact branded model.
- Do not simply change the color and manufacturer name.
- Use model-specific geometry wherever verified and implemented.
- Preserve supported manufacturer finishes.
- Maintain correct frame and fork relationships.
- Do not invent proprietary decals.
- Do not claim official affiliations or licensing without evidence.

## Premium presentation

Use high-quality studio presentation for supported models.

Improve:

- Frame materials.
- Wheel shading.
- Fork details.
- Component contours.
- Geometry alignment.
- Camera framing.
- Product card previews.

Avoid unnecessary effects that hide inaccuracies in geometry.

**Accurate modeling takes priority over cinematic effects.**

If a model's geometry is incomplete, keep its fidelity status honest.

---

# PHASE 10 — MY GARAGE VISUAL IMPROVEMENTS

Make My Garage feel like a premium bicycle collection.

Use consistent visual previews.

Each card should show:

- Bicycle preview.
- Build name.
- Main frameset.
- Last updated date.
- Compatibility status.
- Visibility.
- Edit.
- Duplicate.
- Delete.

## Card presentation

Implement:

- Consistent preview dimensions.
- Refined hover states.
- Subtle image transitions.
- Proper text hierarchy.
- Compact actions.
- Responsive layout.

Optional supported interactions may include lightweight preview angle changes.

Do not load a full heavy 3D scene for every garage card.

Prefer cached preview images or lightweight rendering strategies.

## Account limits

Preserve existing user quotas.

Registered users retain their configured saved-build limits.

Do not introduce unlimited saving.

Do not change database behavior merely to improve animations.

---

# PHASE 11 — AUTHENTICATION AND ACCOUNT UI

Improve authentication screens to match the premium TrackLab identity.

Implement:

- Better form hierarchy.
- Refined input styling.
- Smooth but restrained transitions.
- Clear validation messages.
- Proper password visibility control.
- Loading feedback.
- Success/error states.
- Responsive layouts.

Do not introduce unnecessary full-screen animations that make login slower.

Make account registration benefits clear without aggressive prompts.

---

# PHASE 12 — ADVANCED RESPONSIVE DESIGN

The premium experience must work on all devices.

## Desktop

Use:

- Spacious but efficient layouts.
- Large bicycle visualization.
- Stable component panels.
- Appropriate pointer interactions.
- Optimized camera controls.

## Tablet

Adapt panel positions and layout density.

Avoid cramped three-column layouts.

Maintain prominent bicycle visualization.

## Mobile

Build a premium touch-first experience.

Use:

- Compact header.
- Large bicycle preview.
- Accessible 2D/3D controls.
- Smooth bottom sheets.
- Touch-friendly product cards.
- Accessible category navigation.
- Appropriate camera interaction.
- Safe-area support.
- Stable scrolling.

## Mobile 3D controls

Support:

- Touch orbit.
- Pinch zoom where appropriate.
- Camera presets.
- Reset controls.
- Graceful fallback.

Prevent gesture conflicts between:

- Camera rotation.
- Page scrolling.
- Bottom sheets.
- Navigation gestures.

Avoid rendering excessively expensive visual effects on mobile.

---

# PHASE 13 — ADVANCED PERFORMANCE OPTIMIZATION

The application must remain fast and responsive.

Beautiful animations must not come at the cost of usability.

## Performance goals

Use these as initial targets:

- Aim for smooth 60 FPS interactions on capable desktop hardware.
- Aim for approximately 30 FPS or better for supported mobile 3D sessions, using adaptive quality.
- Keep ordinary UI interactions responsive.
- Avoid unnecessary render loops when the scene is idle.
- Minimize JavaScript and asset download sizes.
- Prevent repeated model loading.
- Avoid significant layout shifts.

Measure actual performance on representative devices.

Do not claim consistent FPS without profiling.

## Three.js optimization

Implement where appropriate:

- Lazy-loaded 3D scenes.
- Asset caching.
- Geometry reuse.
- Material reuse.
- Compressed GLB assets.
- Optimized textures.
- Reduced unnecessary draw calls.
- Appropriate mesh complexity.
- Selective shadows.
- Adaptive pixel ratio.
- GPU resource cleanup.
- Optional quality levels.
- Frustum culling.
- Reduced post-processing on weaker devices.

## Quality presets

Introduce suitable graphics settings:

**Auto**
Automatically choose a reasonable quality level.

**Performance**
Reduced shadows and expensive effects.

**Balanced**
Moderate visual quality and performance.

**Quality**
Enhanced visual presentation for capable devices.

Preserve a manual override where appropriate.

## Motion preferences

Respect `prefers-reduced-motion`.

Provide a motion-reduced experience without removing core functionality.

Do not rely on animation to communicate essential information.

---

# PHASE 14 — ANIMATION ARCHITECTURE

Use the project's existing animation tools where suitable.

Evaluate whether Framer Motion/Motion for React, GSAP, React Spring, or existing CSS transitions are appropriate for specific requirements.

Do not install multiple overlapping animation libraries without a clear technical reason.

Suggested responsibilities:

- CSS transitions for simple feedback.
- One established React animation solution for interface transitions where needed.
- React Three Fiber and Three.js animation techniques for 3D camera and scene transitions.
- Blender-authored animations only when appropriate for reusable 3D assets.

Avoid mixing several independent animation systems that fight over the same properties.

## Reusable motion tokens

Centralize:

- Durations.
- Easing.
- Spring settings.
- Transition presets.
- Reduced-motion alternatives.

Do not scatter arbitrary timings throughout the codebase.

Avoid unnecessary dependencies.

---

# PHASE 15 — REPOSITORY AND ARCHITECTURE RULES

Preserve the clean frontend/backend structure requested earlier.

Recommended organization:

- `frontend/` — React UI, layouts, animation components, 2D/3D rendering.
- `backend/` — Express API, authentication, MongoDB, rate limits.
- `shared/` — Shared domain schemas and types where appropriate.
- `docs/` — Architecture, design system, modeling, and implementation documentation.

Within the frontend, organize animation-related code sensibly.

Possible modules include:

- `features/builder/renderers/3d/`
- `features/builder/animations/`
- `components/motion/`
- `styles/motion-tokens.css`

Use the current repository as the source of truth.

Do not create redundant folders or abstractions.

Do not modify backend business logic unnecessarily for visual improvements.

---

# PHASE 16 — PRESERVE EXISTING SYSTEM FUNCTIONALITY

Do not break or remove:

- Guest access.
- Guest quotas.
- Registered-user limits.
- Authentication.
- Rate limiting.
- MongoDB persistence.
- My Garage.
- Component catalog.
- Brand specifications.
- Component compatibility.
- 2D rendering.
- 3D rendering.
- Saved configurations.
- Public sharing.
- Administrative maintenance.
- Brand disclaimers.
- Verified-source pricing policy.

Maintain the latest approved account limits.

The UI must continue displaying actual server-provided quota information.

Do not implement unlimited saved builds.

Do not generate fake catalog data or product prices.

Do not introduce client-only access-control checks.

---

# PHASE 17 — TESTING AND VISUAL VERIFICATION

After implementing improvements, test the actual application.

## UI verification

Test:

- Landing page.
- Bike Builder.
- Parts Catalog.
- My Garage.
- Authentication.
- Account settings.
- Admin pages.

Verify dark and light themes.

## 3D verification

Check:

- Scene loading.
- Camera rotation.
- Camera transitions.
- Camera reset.
- Auto-rotate.
- Frame switching.
- Finish changes.
- Component highlighting.
- Studio environments.
- Shadows.
- Reflection quality.
- 2D/3D transitions.
- Missing-asset fallbacks.
- Low-performance fallback.
- GPU resource cleanup.

## Responsive verification

Test representative viewport sizes:

- 320px.
- 375px.
- 430px.
- 768px.
- 1024px.
- 1366px.
- 1440px.
- 1920px.

Check both portrait and landscape where appropriate.

## Accessibility

Verify:

- Keyboard navigation.
- Focus states.
- Accessible dialogs.
- Reduced-motion behavior.
- Color contrast.
- Touch interactions.
- Non-drag alternatives.
- Screen-reader labels.
- Loading announcements.

## Performance

Measure:

- Initial page load.
- 3D scene load.
- Model switching latency.
- Frame-rate stability.
- Memory usage.
- GPU impact.
- Bundle sizes.
- Network requests.
- Layout shifts.

Use available profiling and browser tools.

## Regression testing

Run:

- TypeScript checks.
- Lint.
- Unit tests.
- API integration tests.
- Browser tests.
- Production builds.

Fix regressions.

Do not claim tests or benchmarks passed without executing them.

---

# PHASE 18 — IMPLEMENTATION PRIORITIES

Follow this order.

## Priority 1 — Audit and Rendering Quality

Inspect the application and establish a reliable baseline.

Prioritize the quality of existing branded 2D/3D models.

## Priority 2 — Premium Design System

Refine typography, surfaces, colors, spacing, and UI hierarchy.

## Priority 3 — Cinematic 3D Studio

Improve camera behavior, environment, lighting, shadows, and model presentation.

## Priority 4 — 3D Motion and Transitions

Implement camera presets, turntable mode, model changes, selection feedback, and rendering-mode transitions.

## Priority 5 — Builder Workspace

Improve the three-region layout, floating controls, compact summary, product selection, and visual feedback.

## Priority 6 — Landing Page

Implement a cinematic yet performant bicycle-focused hero and refined page sections.

## Priority 7 — Secondary Pages

Polish the catalog, garage, authentication, account, and administration layouts.

## Priority 8 — Mobile Optimization

Ensure advanced animations and 3D interactions remain usable on mobile and tablet.

## Priority 9 — Performance and Accessibility

Optimize animation systems, rendering quality, resource usage, and reduced-motion support.

## Priority 10 — Verification and Refinement

Run automated tests, inspect screenshots, profile the 3D viewer, resolve regressions, and document the results.

---

# FINAL ACCEPTANCE CRITERIA

Do not consider the task complete until:

1. TrackLab has a cohesive ultra-premium design.
2. The application preserves its distinctive graphite/electric-blue identity.
3. The bicycle remains visually prominent.
4. The 3D viewer has improved studio lighting.
5. Camera transitions are smooth.
6. Supported camera presets work correctly.
7. Auto-rotation can be controlled.
8. Branded models retain accurate fidelity classifications.
9. Model switching does not produce misleading representations.
10. Materials and finishes display correctly.
11. The 2D/3D transition is refined.
12. Product cards and selection controls are polished.
13. The landing page has a premium product presentation.
14. The garage has consistent high-quality previews.
15. Mobile interactions remain usable.
16. Graphics settings and fallbacks work appropriately.
17. Reduced-motion preferences are respected.
18. No essential functionality is animation-dependent.
19. Guest and registered-user restrictions remain functional.
20. No existing saved configurations are lost.
21. Performance has been evaluated.
22. Automated tests have been executed.
23. Remaining visual-asset limitations are documented.
24. No unfinished implementation is falsely reported as complete.

---

# FINAL STRICT INSTRUCTIONS

Transform TrackLab into an **ultra-premium interactive fixed-gear bicycle configurator**.

The result should feel like a professionally designed product studio with exceptional visual quality and intuitive interactions.

Use cinematic 3D camera movement, studio lighting, polished transitions, and refined microinteractions.

However:

- Do not sacrifice accuracy for visual effects.
- Do not exaggerate animations.
- Do not introduce excessive neon or glow effects.
- Do not sacrifice mobile performance.
- Do not break the existing system.
- Do not fabricate authentic branded models.
- Do not change the existing business rules.
- Do not reintroduce the green portfolio theme.
- Do not implement the postponed fully modular individual-component builder yet.

**Focus on making the existing bicycle modeling, 3D visualization, and complete application experience exceptionally polished first.**

Inspect, implement, test, compare, and refine the application until its visual presentation, interaction quality, performance, and responsive behavior meet the documented requirements.

The bicycle must remain the main attraction, and every animation must have a meaningful purpose.