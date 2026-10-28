# TRACKLAB — BIKE BUILDER VISUAL & UX IMPROVEMENTS
## Larger Bicycle Preview, Compact Workspace, Better Default Bike, and Real Branded Framesets

### ROLE

Act as a Senior React Developer, UI/UX Designer, Bicycle Visualization Engineer, 2D/3D Graphics Developer, and Full-Stack Architect.

Your task is to significantly improve the existing TrackLab Bike Builder based on the provided screenshot and current implementation.

This is an implementation task, not simply a design recommendation.

**PRIMARY OBJECTIVES:**

1. Make the bicycle significantly larger and more visible.
2. Reduce the unnecessary vertical space occupied by information below the preview.
3. Improve the default bicycle's proportions, visual quality, and realism.
4. Implement actual branded bicycle framesets, starting with Cinelli and Dosnoventa.
5. Ensure users can select branded frames and see meaningful differences in the builder.
6. Improve component selection and catalog presentation.
7. Make the workspace more compact, intuitive, and fully responsive.
8. Preserve all existing business logic, security, quotas, and functional features.

Do not simply apply CSS scaling to the current bicycle and consider the problem solved.

---

# 1. INSPECT THE CURRENT IMPLEMENTATION

Before modifying code, inspect:

- Current Bike Builder page.
- Layout containers and CSS Grid/Flexbox structure.
- Header and builder toolbar.
- Component category sidebar.
- SVG 2D renderer.
- 3D renderer and asset loading.
- Default bike configuration.
- Bicycle geometry and proportions.
- Component positioning logic.
- Selected-parts summary.
- Gear-ratio display.
- Compatibility summary.
- Guest workspace information.
- Right-side component selector.
- Catalog API and database models.
- Product and brand seed data.
- Existing branded product records.
- Mapping between products and rendering assets.

Identify why the current builder displays illustrative products rather than real branded framesets.

Determine whether the issue is:

- Missing brand records.
- Missing product variants.
- Missing database seeds.
- Incorrect API queries.
- Filters excluding branded products.
- Missing component assets.
- Renderer mappings supporting only demo components.
- Hardcoded starter configurations.
- Fallback data overriding real product results.

Fix the actual cause.

Do not assume the database is empty or invent missing features without inspecting the repository.

---

# 2. MAKE THE BICYCLE PREVIEW MUCH LARGER

The current preview contains too much empty space, and the bicycle looks small compared with the available viewing area.

Make the bicycle the dominant visual element.

## Desktop layout

Keep the existing three-region concept, but improve the proportions.

**Left region:**
Compact component navigation.

**Center region:**
Large, responsive bicycle visualization.

**Right region:**
Component search, filtering, and selection.

The center preview must receive the majority of the available horizontal and vertical space.

## Bicycle sizing requirements

- Increase the bicycle's visible size substantially.
- Target approximately 70–85% of the available canvas width when the aspect ratio allows it.
- Use the available canvas height efficiently.
- Calculate fit-to-view based on the complete bicycle's actual bounding box.
- Maintain accurate bicycle proportions.
- Center the bicycle horizontally and vertically.
- Prevent wheels, handlebars, and saddles from being clipped.
- Preserve appropriate margins for controls.
- Recalculate camera framing after major frame geometry changes.
- Avoid excessive empty grid space.
- Do not distort the bicycle using independent X/Y scaling.

A useful starting target is for the bicycle to occupy approximately 70–80% of the canvas height where practical.

Use aspect-ratio-aware fitting rather than rigid sizing rules.

## Viewport-aware layout

The builder should take advantage of the available browser viewport.

Use responsive viewport-aware sizing, CSS Grid, and appropriately constrained regions.

For example:

- Main builder should use the available workspace height.
- Visualization should expand into space recovered from unnecessary summary panels.
- Component panels should scroll independently when needed.
- The bicycle preview should remain stable when navigating between categories.
- Avoid making the main document excessively tall.

Use `100dvh` and responsive constraints where appropriate, accounting for the application header and safe areas.

Do not create nested scroll regions unless they have a clear purpose.

---

# 3. REDUCE THE LARGE INFORMATION SECTION BELOW THE BIKE

The current layout places three relatively large sections below the bicycle:

- Selected parts.
- Gear ratio.
- Compatibility.

This information occupies too much vertical space.

It makes the bicycle preview smaller than necessary.

## Replace with a compact information bar

On desktop, create a compact summary bar directly below the preview.

Suggested structure:

`Selected Parts 6/6  |  Gear Ratio 2.88:1  |  Compatibility: Needs Verification  |  View Details`

This is a layout example; all displayed values must come from the actual configuration.

Target a compact summary height of approximately 56–80px, depending on content and accessibility needs.

Do not display the entire list of selected components permanently.

## Expandable details

Move detailed information into an expandable drawer, accordion, or secondary panel.

### Selected parts

Show the complete component breakdown only when expanded.

### Gear ratio

Display the current ratio prominently in the compact bar.

Move gear-inch calculations and additional information into details.

### Compatibility

Display the current overall status.

Include the number of unresolved checks, if applicable.

Provide a "Review checks" action that opens the detailed validation results.

## Interaction requirements

- Details must remain accessible.
- Expanding information must not unnecessarily resize the bicycle preview.
- Avoid introducing layout shifts.
- Maintain keyboard accessibility.
- Keep the summary readable.
- Preserve all existing compatibility data and calculations.

The goal is to free up vertical space for the bicycle without removing functionality.

---

# 4. COMPACT THE BUILDER HEADER AND GUEST BAR

The current workspace also spends unnecessary space on its title, build name, Save button, and guest banner.

## Builder toolbar

Create a compact, unified builder toolbar.

Include:

- Build name.
- Current frame/model.
- Save action.
- Undo/redo where appropriate.
- Optional workspace actions.

Do not use a large page heading area that pushes the bicycle preview downward.

Keep the build name editable without requiring an oversized form.

## Guest information

The current full-width guest information bar is visually heavy.

Replace it with a more compact quota indicator.

Example:

`Guest Mode · 7/12 changes remaining`

Provide an accessible details popover or compact expansion showing:

- Remaining changes.
- Reset time.
- Temporary configuration notice.
- Registration option.

Do not remove guest warnings or quota visibility.

Do not make the entire bottom section permanently occupy unnecessary height.

## Guest Save behavior

Guests cannot permanently save builds.

Therefore, the builder should clearly distinguish:

- Authenticated users: Save Build.
- Guests: Sign In to Save or Create Account to Save.

If clicking Save as a guest opens authentication, make that behavior obvious.

Do not suggest that a guest configuration was saved successfully.

Preserve the existing backend quota system.

---

# 5. REDESIGN THE DEFAULT BICYCLE

The current default bicycle has an unattractive schematic appearance.

Its frame, wheels, tires, crankset, and cockpit do not yet convey the visual quality expected of a premium bicycle configurator.

Improve the default bicycle substantially.

## Required visual improvements

### Frame

- More believable track-bike silhouette.
- Correct tube connections.
- Better frame proportions.
- Distinct head tube, top tube, down tube, seat tube, and stays.
- Improved fork shape and positioning.
- More realistic geometry based on supported frame specifications.
- Appropriate tube widths.
- Better color and material presentation.

### Wheels

- More refined rim appearance.
- Improved hub detail.
- Better tire proportions.
- Proper wheel placement.
- Consistent spoke spacing.
- Distinct styling for supported wheel types.
- More believable visual depth.

### Drivetrain

- Improve crankset appearance.
- Improve chainring proportions.
- Ensure crank arms and pedals are positioned correctly.
- Improve chain alignment.
- Keep wheel, crank, and chain geometry consistent.

### Cockpit

- Better handlebar silhouette.
- Improved stem proportions.
- Correct connection to the steerer.
- Better representation of different bar types.

### Seating

- Improved saddle appearance.
- Correct seatpost angle and positioning.
- Appropriate saddle sizing relative to the frame.

## Visual rendering quality

The default bicycle should look like a carefully designed fixed-gear bicycle illustration rather than a basic engineering diagram.

Use:

- Clean vector geometry.
- Consistent line weights.
- Subtle material shading.
- Precise alignment.
- Realistic assembly positioning.
- Consistent component detail.
- High-resolution rendering.
- Neutral studio-style background.

Do not overload the bicycle with unnecessary shadows, gradients, or glowing effects.

## Default configuration

Replace the visually weak demonstration bicycle with a refined starter configuration.

The preferred default should use a real, verified frameset when sufficiently accurate and permitted rendering assets are available.

Otherwise, use a polished neutral demonstration bicycle clearly labeled as illustrative until the authentic visual assets are ready.

Do not apply Cinelli or Dosnoventa branding to a generic bicycle shape and present it as an authentic representation.

Do not invent manufacturer-specific frame geometry.

---

# 6. IMPLEMENT REAL BRANDED BIKE FRAMESETS

**This is a major requirement.**

TrackLab was designed to let users configure fixed-gear bicycles from actual brands.

The current screenshot shows generic illustrative products instead.

Implement the branded frameset selection properly, using the real database catalog and rendering pipeline.

## Initial priority brands

### Cinelli

Start by researching and supporting verified variants of:

- Cinelli Vigorelli frameset.
- Cinelli Vigorelli Steel frameset, if its correct specifications and assets can be established.

Official reference:

https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame

### Dosnoventa

Start by researching and supporting verified variants of:

- Dosnoventa 02 LA.
- Dosnoventa 03 DET.
- Dosnoventa 01 BCN.

Official references:

https://dosnoventabikes.com/frames/

https://dosnoventabikes.com/

Additional brands such as Engine11, Leader, and Tsunami can be added after their product records and technical data are verified.

Do not introduce fictional models.

## Important distinction

A branded frameset may have multiple sizes, finishes, revisions, and geometries.

Do not treat all variants as identical.

Store actual verified information for each supported product variant.

## Database and catalog integration

Ensure brands and framesets are properly represented in MongoDB.

Implement or fix:

- Brand records.
- Product records.
- Frame variants.
- Available sizes.
- Verified colors.
- Geometry references.
- Compatibility specifications.
- Rendering asset references.
- Official product source URLs.
- Publication status.

Create safe and idempotent catalog seed or import procedures when necessary.

Do not introduce duplicate brand or product records.

## Frameset selection UI

When users select Frameset, display actual supported brands.

Suggested user flow:

1. Open Frameset category.
2. Choose a brand.
3. Browse available frame models.
4. Select a frame.
5. Select verified size/finish options.
6. Preview the resulting bicycle.
7. Receive compatibility feedback.
8. Confirm the configuration.

Example:

Brand: Cinelli

Model: Vigorelli

Size: Select verified available size

Finish: Select verified available finish

The model must come from the actual catalog API.

## Brand selection behavior

Changing brands should not merely update a text label.

It must update the selected real frameset record and the appropriate renderer configuration.

Where accurately modeled variants exist, changing framesets should update:

- Frame geometry.
- Frame color and finish.
- Frame tube arrangement.
- Fork shape and geometry.
- Seat tube position.
- Relevant geometry measurements.
- Attached component placement.
- Compatibility checks.

Do not display the same generic frame for every brand while implying that each is an authentic model.

If authentic 2D or 3D representation is unavailable, clearly label the view as illustrative and disclose the limitation.

---

# 7. BUILD A PROPER BICYCLE VISUAL ASSET SYSTEM

The visual rendering system must support different frames, wheels, handlebars, and components.

## 2D assets

Implement a modular SVG-based asset architecture.

Each supported component should provide:

- Visual asset identifier.
- Rendering geometry.
- Component category.
- Attachment anchor positions.
- Bounding box.
- Scale and orientation data.
- Supported visual variants.
- Source and licensing metadata.

Use consistent coordinate systems.

Frames should establish the primary assembly geometry.

## 3D assets

For 3D-supported components, maintain:

- GLB asset reference.
- Scale.
- Rotation.
- Attachment transforms.
- Material configuration.
- Geometry bounds.
- Source and license.
- Verification status.

Use the same canonical selected configuration as the 2D renderer.

## Asset integrity

Do not use manufacturer product photographs as direct substitutes for composable bicycle geometry.

Do not create an inaccurate collection of layered photographs and call it a working bike configurator.

Do not download or redistribute proprietary model files without appropriate permission.

Independently created schematic assets must be labeled appropriately when they are not faithful representations of branded products.

---

# 8. IMPROVE THE COMPONENT SELECTION PANEL

The current panel has too much vertical spacing, limited visible options, and very basic component thumbnails.

Improve the right-side catalog.

## Requirements

- More compact product entries.
- Consistent thumbnail dimensions.
- Clearly visible brand and model names.
- Better selected-item styling.
- Readable variant selectors.
- Collapsible specifications.
- Search and brand filtering.
- Proper loading states.
- No redundant information.
- No oversized internal padding.

When selecting a frameset, prioritize displaying the brand and actual model.

When selecting wheels, show supported real products separately from illustrative demo options.

## Remove misleading demo content

The current interface contains labels such as:

- Studio Track.
- Classic spokes.
- Deep section.
- Illustrative demo.

Determine which items are only demonstration data.

Do not automatically delete demo records that may be needed for development.

Instead:

- Separate development demo items from public catalog items.
- Hide demo-only records from the production catalog when real products are available.
- Prevent illustrative items from being misrepresented as real branded components.
- Provide proper catalog empty states when products are unavailable.

## Selected components

Selected components should have clear highlights without overly thick borders.

The entire selection area should scroll smoothly.

Avoid trapping scroll interaction inside unnecessary nested panels.

---

# 9. IMPROVE WORKSPACE VISUAL HIERARCHY

The bicycle should always be the primary focus.

Suggested hierarchy:

1. Bicycle preview.
2. Selected frameset and customization controls.
3. Component choices.
4. Compatibility feedback.
5. Secondary specifications.

Reduce the visual competition between navigation, details, and the bicycle.

## Canvas styling

The current dense grid background makes the builder resemble a technical drawing interface.

Consider a cleaner studio canvas with:

- Subtle neutral background.
- Very light grid or optional grid overlay.
- Appropriate contrast with bicycle components.
- Minimal distractions.
- Refined selection highlighting.

Keep the established graphite and electric-blue TrackLab theme.

Do not restore the green portfolio theme.

## Viewer controls

Keep controls compact and discoverable.

Include:

- 2D/3D selection.
- Zoom in/out.
- Fit to view.
- Reset camera.
- Pan/rotate controls when relevant.
- Full-screen preview.

Do not let controls obscure bicycle parts.

---

# 10. MAKE THE WORKSPACE MORE RESPONSIVE

Desktop improvements must not break mobile.

## Desktop

Use a large center visualization area.

Keep category navigation compact.

Give component selection a consistent usable width.

Minimize permanently expanded secondary panels.

## Tablet

Adapt the layout to avoid three cramped columns.

Use a collapsible catalog panel where appropriate.

## Mobile

The bicycle should appear immediately below the compact header.

Use:

- Large bicycle preview.
- Compact 2D/3D controls.
- Horizontal component navigation.
- Component-selection bottom sheet.
- Collapsible compatibility information.
- Visible authenticated Save action.
- Compact quota indicator.

Do not place the entire selected-parts table below the preview.

Do not let the bottom sheet permanently cover most of the bicycle.

Support mobile touch gestures without interfering with page scrolling.

---

# 11. PRESERVE ALL EXISTING FUNCTIONALITY

Do not break:

- Authentication.
- Guest mode.
- Guest limits.
- Registered-user saved-build quotas.
- Rate limits.
- MongoDB data.
- Existing product variants.
- Compatibility checking.
- Gear calculations.
- 2D viewer.
- 3D viewer.
- Undo/redo.
- My Garage.
- Save workflows.
- Brand disclaimers.
- Pricing restrictions.
- Admin catalog management.

Do not rewrite working systems unnecessarily.

Improve the existing architecture where possible.

Do not introduce mock frontend data to make branded products appear available.

Product selection must use the actual catalog.

---

# 12. TESTING AND VISUAL VERIFICATION

After implementing the improvements, use Playwright or available browser tooling to review the actual result.

Test at:

- 1920 × 1080.
- 1440 × 900.
- 1366 × 768.
- 1024 × 768.
- 768 × 1024.
- 430 × 932.
- 375 × 812.
- 320 × 568.

## Visual tests

Verify that:

1. The bicycle is noticeably larger than in the original screenshot.
2. The bicycle is properly centered.
3. Frame, wheels, cockpit, and saddle remain visible.
4. The lower information panel is compact.
5. The preview uses the recovered space.
6. The bike looks more refined and visually accurate.
7. The builder does not waste unnecessary vertical space.
8. The right panel remains usable.
9. The component sidebar is consistent.
10. The mobile builder works without overflow.

## Functional tests

Verify that:

1. Cinelli appears in the frameset catalog when valid published data is present.
2. Dosnoventa appears in the frameset catalog when valid published data is present.
3. Selecting a real frame updates the selected variant.
4. Supported rendering assets produce an appropriate visual change.
5. Missing authentic assets are clearly identified.
6. Compatibility checks update correctly.
7. Switching between 2D and 3D preserves selections.
8. Quota enforcement still works.
9. Guest save restrictions still work.
10. Existing saved builds still load.
11. No console errors or broken API calls are introduced.

Capture before-and-after screenshots and compare their bicycle visibility, layout density, alignment, and usability.

Run the existing TypeScript, lint, build, unit, and integration checks.

Never claim a feature was verified without running the relevant checks.

---

# 13. IMPLEMENTATION PRIORITIES

Implement changes in this order.

## PRIORITY 1 — Fix the workspace proportions

- Reduce the large lower information area.
- Compact the builder header.
- Compact the guest banner.
- Expand the central viewer.
- Improve desktop viewport usage.

## PRIORITY 2 — Fix bicycle visualization

- Improve the default bicycle's appearance.
- Correct geometry and component positioning.
- Improve wheel, frame, and drivetrain details.
- Implement proper fit-to-view behavior.
- Reduce unnecessary canvas distractions.

## PRIORITY 3 — Implement branded framesets

- Inspect the actual catalog implementation.
- Verify Cinelli and Dosnoventa product data.
- Fix catalog/database integration.
- Implement brand and model selection.
- Register permitted rendering assets.
- Connect real variants to the bicycle renderer.
- Validate component compatibility.

## PRIORITY 4 — Improve component browsing

- Compact product cards.
- Improve filters.
- Improve specifications disclosure.
- Improve selected-component feedback.
- Separate illustrative demo items from real products.

## PRIORITY 5 — Responsive polish and testing

- Optimize mobile and tablet layouts.
- Test real component selection.
- Validate 2D and 3D consistency.
- Check theme compatibility.
- Fix all discovered regressions.

---

# 14. ACCEPTANCE CRITERIA

Do not mark this task complete until:

- The bicycle is significantly more visible in the builder.
- The canvas occupies more of the usable viewport.
- The selected-parts, gear-ratio, and compatibility information no longer consumes excessive height.
- The default bike's visual quality has substantially improved.
- The catalog exposes verified supported branded framesets.
- Users can select real Cinelli and Dosnoventa catalog entries.
- Brand selections are connected to actual product variant records.
- Supported visual assets reflect the selected components.
- Unsupported branded geometry is not falsely presented as authentic.
- All builder controls remain functional.
- Guest and registered-user restrictions remain intact.
- Desktop and mobile layouts are responsive.
- No existing important functionality is lost.
- Actual browser verification has been performed.
- Remaining unavailable authentic 3D models or assets are explicitly documented.

If suitable licensed branded visual assets are not available, still complete the functional brand catalog, frame-selection workflow, verified data integration, compact layout, and improved neutral renderer. Clearly distinguish completed functionality from blocked authentic rendering work.

---

# FINAL INSTRUCTION

**Make the bicycle the centerpiece of TrackLab.**

The current UI gives too much space to secondary information and does not make the bicycle visually prominent enough.

Fix the layout so that the bicycle occupies the majority of the available preview space.

Replace the weak-looking default bike with a significantly more refined visualization.

Most importantly, implement real branded frameset selection rather than relying only on generic illustrative components.

Do not simply rename the existing demo frame to Cinelli or Dosnoventa.

Use verified product records and appropriate rendering assets.

Preserve the existing graphite/electric-blue design identity, security rules, build quotas, and working application features.

Implement the actual changes, inspect them visually, test them, and fix regressions before considering this improvement complete.