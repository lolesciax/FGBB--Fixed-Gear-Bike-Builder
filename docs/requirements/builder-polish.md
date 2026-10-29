# TRACKLAB — COMPLETE 2D/3D POLISH, FINISH SYSTEM, AND VISUAL REFINEMENT
## Improve Everything in the Builder While Preserving Realistic Geometry and Existing Brand Support

### ROLE

Act as a Senior Full-Stack Developer, React/TypeScript Engineer, UI/UX Designer, SVG Rendering Specialist, Three.js / React Three Fiber Engineer, Bicycle Geometry Specialist, and Technical Product Visualization Engineer.

Your task is to comprehensively polish the existing TrackLab builder in both 2D and 3D.

This is not only a styling task. It is a combined geometry, rendering, asset, finish-system, product-logic, and UX refinement task.

The current TrackLab implementation already includes:
- 2D and 3D builder views
- branded frameset support
- a developing catalog system
- colorways for framesets
- current geometry improvements in progress
- cockpit variations
- wheelset, crankset, saddle, and other bicycle assemblies
- saved builds, quotas, authentication, and builder workflows

You must improve and polish the current implementation without restarting the project.

---

# PRIMARY GOALS

1. Polish the entire 2D and 3D bicycle presentation.
2. Improve weak or unrealistic bicycle parts and geometry.
3. Preserve and use official existing colorways for branded framesets.
4. Add a clean finish-selection system for non-frameset components.
5. Make wheelsets, cranksets, chainrings, and cockpit parts visually configurable by finish.
6. Improve saddle appearance and fix saddle compatibility validation.
7. Ensure 2D and 3D stay synchronized.
8. Improve consistency, quality, and realism across all visible bicycle parts.
9. Preserve current builder functionality and current project scope.
10. Do not start the postponed full advanced modular customization overhaul beyond what is already in the current implementation.

---

# IMPORTANT SCOPE RULE

We are still prioritizing modeling quality and visual fidelity first.

Do not turn this task into the postponed full “every tiny part independently configurable” system if that architecture is not yet ready.

However, where the current builder already supports category-level or practical part-level changes, improve and refine them.

This task is about:
- polishing
- improving geometry
- improving 2D and 3D rendering
- improving component appearance
- improving finish/color control
- fixing validation logic
- improving builder UX

Do not remove working features.

---

# PHASE 1 — INSPECT THE CURRENT IMPLEMENTATION

Before changing anything, inspect:

- frontend structure
- backend structure
- builder state and configuration model
- current 2D renderer
- current 3D renderer
- current geometry source
- current catalog product/variant records
- current frameset colorway implementation
- current cockpit implementation
- current wheelset, crankset, drivetrain, and saddle rendering
- current finish/color handling
- current validation rules
- current save/build persistence
- current product compatibility logic

Identify:
- weak-looking geometry
- inconsistent proportions
- unfinished parts
- incorrect validation rules
- parts that do not visually update when they should
- duplicated rendering logic
- mismatches between 2D and 3D
- places where the builder still feels rough or incomplete

Do not assume the current code is correct just because it renders.

Audit first, then improve.

---

# PHASE 2 — GLOBAL POLISH FOR BOTH 2D AND 3D

Polish the full bicycle in both views.

## Improve the following overall qualities:
- cleaner proportions
- better alignment
- better component scaling
- better visual consistency
- better material/finish quality
- improved edges and contours
- improved silhouettes
- more believable component thickness
- better attachment relationships
- improved depth cues in 2D
- improved surface realism in 3D
- improved fit-to-view framing
- fewer awkward empty areas around the bike
- better presentation in all major camera angles

The bicycle should feel professionally visualized, not like a rough prototype.

Both 2D and 3D should look like the same bicycle.

---

# PHASE 3 — FRAMESET COLORWAY SYSTEM

Keep frameset brands using their existing official colorways.

## Strict requirement
For frameset brands such as:
- Cinelli
- Dosnoventa
- Tsunami
- Skream
- Engine11
- Leader
- 8bar
- other verified supported brands

use the real existing verified colorways already associated with those product variants.

Do not replace official frameset colorways with arbitrary generic colors.

## Requirements
- preserve existing official colorway structure
- make colorway switching visually meaningful in 2D and 3D
- preserve correct model-to-colorway mapping
- preserve branded finish names
- use approved brand-specific appearance where available
- preserve correct fork finish when tied to the frameset variant
- do not fabricate fake official colorways

## UX
Frameset selection should continue to support:
Brand → Model → Size → Colorway

Use:
- actual colorway labels
- visual swatches or preview thumbnails
- consistent selected state
- synchronized 2D/3D updates

---

# PHASE 4 — UNIVERSAL FINISH SYSTEM FOR NON-FRAMESET PARTS

Add a reusable finish system for supported visible components outside the frameset.

These parts should be able to use:
- Polished
- Pure Black
- Brand Color (only when a selected brand/product variant actually supports a branded or unique finish)

This is not a random color picker.
This is a controlled finish system.

## Finish types

### Polished
Represents polished alloy / polished metal / silver metallic appearance.

### Pure Black
Represents clean black finish.

### Brand Color
Only available when a product variant actually has a specific branded or unique color/finish.

Do not show Brand Color as an option when it is not supported by the selected component variant.

---

# PHASE 5 — WHEELSET POLISH AND FINISH OPTIONS

Improve the wheelset visually and allow finish changes.

## Wheelset improvements
Improve:
- rim shape
- rim depth
- spoke realism
- spoke attachment
- hub geometry
- axle area
- tire/rim relationship
- overall wheel proportions
- front/rear consistency

## Finish system for wheelsets
For wheelsets, allow supported finish changes for:
- rims
- spokes
- hubs

Primary supported finish presets:
- Polished
- Pure Black

If a selected branded wheel product has a unique color or branded appearance, allow Brand Color as an additional option.

## Important logic
If the wheelset is treated as one current visual unit, applying the finish should affect:
- rims
- spokes
- hubs

Do not leave spokes unchanged while rims change color unless the selected wheel product explicitly defines mixed finishes.

## 2D and 3D
The selected wheel finish must visually update in:
- 2D side view
- 3D model

Do not allow one mode to stay outdated.

---

# PHASE 6 — CRANKSET, CRANK ARMS, AND CHAINRING FINISH OPTIONS

Improve crankset quality and add clean finish logic.

## Visual improvement
Improve:
- crank arm shape
- crank arm thickness
- spindle area
- chainring profile
- chainring teeth
- mounting spider/interface
- pedal connection
- overall drivetrain look

## Finish rules

### Crank arms
Allow:
- Polished
- Pure Black
- Brand Color only if supported by the actual selected branded component

### Chainring
Allow:
- Polished
- Pure Black
- Brand Color only if the selected chainring product actually has a branded or unique supported appearance

Do not invent colored branded chainrings.

### Crankset grouping
If the current builder treats crank-related visible parts as a grouped assembly, still allow finish changes in a sensible way without breaking the existing build architecture.

Maintain visual consistency between:
- crank arms
- spider
- chainring
- spindle region
where appropriate

Do not force everything to always use the exact same finish if the selected product supports distinct appearances, but do not create unrealistic mismatched defaults either.

## 2D and 3D
Finish changes must reflect in both modes.

---

# PHASE 7 — COCKPIT POLISH AND FINISH OPTIONS

Polish the cockpit and allow finish changes part by part where currently practical.

Current supported cockpit variations include:
- Dropbar
- Riser
- Straight/Flat
- Bullhorn

Improve them all in both 2D and 3D.

## Improve geometry
Fix:
- bar shape
- stem attachment
- handlebar proportions
- sweep / rise / reach / drop characteristics
- thickness
- end alignment
- symmetry
- overlap issues
- incorrect orientation

## Finish options
For supported cockpit-visible parts, allow:
- Polished
- Pure Black
- Brand Color if supported

At minimum this should apply to:
- handlebar
- stem

If the current implementation can support it cleanly, also allow consistent finish handling for:
- spacers
- seatpost clamp area visuals
- visible cockpit hardware

Do not overcomplicate beyond what is currently practical.

## Important
A bullhorn must not just be a recolored dropbar.
A riser must not just be a rotated flat bar.
Geometry and finish are separate concerns.

## 2D and 3D
Changing cockpit type or finish must correctly update both renderers.

---

# PHASE 8 — SADDLE, SEATPOST, AND VALIDATION FIXES

Improve the saddle visually and correct its compatibility logic.

## Visual improvement
Improve:
- saddle shell shape
- saddle nose
- rear shape
- rails
- clamp representation
- seatpost connection
- thickness and proportions
- overall realism

The saddle must look like a believable bicycle saddle, not a flat placeholder.

## Validation fix
Fix the compatibility validation so that:

### Saddle compatibility rule
Saddles are compatible with all seatpost sizes.

In other words:
- seatpost diameter/size should not wrongly invalidate saddle compatibility
- saddle selection should not fail simply because the seatpost size differs
- the validation should focus on the saddle rail / clamp interface rather than seatpost tube size

If seatpost head/rail compatibility is abstracted in the current system, then saddle should be considered generally compatible unless an actual clamp/interface conflict exists.

Do not incorrectly tie saddle compatibility directly to seatpost diameter.

## Finish behavior
If supported in the current implementation:
- saddle color/finish can use the actual product appearance
- seatpost can use Polished, Pure Black, or Brand Color where supported

Do not introduce fake branded saddle colorways.

---

# PHASE 9 — OTHER PARTS THAT SHOULD ALSO BE POLISHED

If the following visible parts are present in the current builder, polish them too:

- seatpost
- pedals
- chain
- cog
- headset
- head tube interfaces
- fork crown
- dropouts
- wheel axles
- hub details
- bottom bracket area
- spacers
- stem faceplate
- bar tape / grips if visually supported

If a part is visible, it should not look neglected compared with the rest of the bicycle.

Do not leave old rough prototype meshes or outdated SVG shapes when the rest of the bike has improved.

---

# PHASE 10 — 2D RENDERER POLISH

The 2D display must be significantly improved as well.

## Requirements
Improve:
- frame illustration quality
- fork silhouette
- head tube representation
- dropouts
- wheels
- hubs
- spokes
- crankset
- chainring
- saddle
- seatpost
- handlebar types
- colorway rendering
- finish rendering for non-frame components
- layer order
- shading
- subtle highlights
- visual depth cues
- clean outlines and paths

The 2D output should feel like a premium technical product illustration.

## Finish system in 2D
Polished vs Pure Black should look meaningfully different in 2D.

Examples:
- polished can use metallic silver-like vector shading
- pure black should use darker matte-like representation
- brand color should reflect the specific product finish when supported

Do not simply swap a flat fill color with no refinement.

---

# PHASE 11 — 3D RENDERER POLISH

Improve the 3D model presentation while keeping geometry accuracy first.

## Improve:
- materials
- reflections
- roughness values
- metallic behavior
- black finish appearance
- polished metal appearance
- frame paint
- fork finish
- wheel component materials
- crank materials
- cockpit materials
- saddle materials
- seatpost finish
- small hardware consistency

## Finish system in 3D
Support reusable material presets for:
- Polished
- Pure Black
- Brand Color

Use physically based materials.

### Polished
Should feel like polished alloy / polished metal, not chrome mirror unless appropriate.

### Pure Black
Should feel like proper black component finish, not featureless flat void-black.

### Brand Color
Should only appear for actual supported brand/product variants.

Do not create fake brand colors for unsupported products.

---

# PHASE 12 — SYNCHRONIZATION RULES

2D and 3D must always reflect the same current configuration.

This includes:
- selected frame
- selected size
- selected official frameset colorway
- selected wheel finish
- selected crank arm finish
- selected chainring finish
- selected cockpit type
- selected cockpit finishes
- saddle/product appearance
- seatpost finish where supported

Do not allow the 2D renderer to show outdated finishes or cockpit types after the 3D updates.

Do not allow the 3D renderer to lag behind the selected state.

---

# PHASE 13 — BUILDER UI/UX IMPROVEMENTS FOR FINISH SELECTION

Refine the builder controls to support these appearance options clearly.

## Frameset section
Continue using:
- brand
- model
- size
- official colorway

## Other parts
For wheelsets, crankset, chainring, seatpost, and cockpit, provide clean appearance controls.

Use:
- segmented control
- compact dropdown
- swatch selector
- small finish cards
or another clean premium control

Do not clutter the interface.

The controls should clearly distinguish:
- Official Colorway
- Finish
- Brand Color

Do not confuse official frame colorways with generic component finish selections.

## Product logic
If a selected branded component variant has a fixed product appearance, show it appropriately.
If it supports finish switching, show the supported options only.
Do not expose invalid finish options.

---

# PHASE 14 — VALIDATION AND COMPATIBILITY LOGIC

Review validation rules affected by this polish update.

## Must fix
- saddle should not be incorrectly rejected because of seatpost size
- finish choice should not affect compatibility
- colorway choice should not affect structural compatibility unless the variant itself changes product specification
- switching polished/pure black should not reset related component geometry
- cockpit finish changes should not trigger false incompatibility

Validation should focus on actual product interfaces, not cosmetic appearance.

---

# PHASE 15 — PRESERVE EXISTING FUNCTIONALITY

Do not break:
- authentication
- guest mode
- quotas
- saved builds
- build persistence
- My Garage
- frameset selection
- catalog logic
- compatibility engine
- brand disclaimers
- 2D/3D switching
- camera presets
- studio environments
- existing premium theme
- current builder workflows

Do not reintroduce the green portfolio style.

Do not start the postponed complete advanced modular customization system if the architecture is not yet ready.

---

# PHASE 16 — TESTING REQUIREMENTS

Test thoroughly.

## Visual tests
Verify in both 2D and 3D:
- official frameset colorways
- wheelset polished
- wheelset pure black
- crank arms polished
- crank arms pure black
- chainring polished
- chainring pure black
- cockpit polished
- cockpit pure black
- brand color where actually supported
- dropbar
- riser
- straight/flat
- bullhorn
- saddle appearance
- seatpost finish
- overall visual consistency

## Validation tests
Verify:
- saddle works across seatpost sizes
- no false saddle incompatibility
- finish switching does not break compatibility
- colorway changes do not break geometry
- cockpit finish changes do not reset the bike
- 2D and 3D remain synchronized
- saved builds retain selected appearance values

## Rendering tests
Capture:
- left side
- right side
- front
- rear
- three-quarter front
- three-quarter rear

Also capture:
- close-up wheelset
- close-up crankset
- close-up saddle
- close-up cockpit
- at least two branded framesets with different official colorways

## Technical tests
Run:
- TypeScript checks
- lint
- unit tests
- build tests
- browser tests if available
- visual regression where practical

Do not mark complete without actual verification.

---

# PHASE 17 — IMPLEMENTATION ORDER

Follow this order:

1. Audit current builder and rendering logic
2. Polish and stabilize shared geometry/rendering logic
3. Preserve and refine frameset official colorways
4. Implement reusable finish system for non-frame components
5. Improve wheelsets and their finish switching
6. Improve crankset, crank arms, and chainring finish switching
7. Improve cockpit geometry and cockpit finish switching
8. Improve saddle and fix saddle compatibility validation
9. Improve seatpost and remaining visible parts
10. Synchronize 2D and 3D appearance handling
11. Polish builder controls for appearance selection
12. Run validation, visual, and technical tests
13. Fix discovered issues
14. Document remaining limitations honestly

---

# FINAL ACCEPTANCE CRITERIA

Do not consider this task complete until:

1. Frameset brands still use their proper existing official colorways.
2. Wheelsets can use Polished and Pure Black finishes.
3. Wheel finish changes affect rims, spokes, and hubs consistently.
4. Crank arms can use Polished and Pure Black finishes.
5. Chainrings can use Polished and Pure Black finishes unless a branded product has its own supported color.
6. Cockpit parts can use Polished and Pure Black, and Brand Color where supported.
7. Dropbar, riser, straight/flat, and bullhorn all remain supported and polished.
8. Saddle looks substantially improved.
9. Saddle is compatible across seatpost sizes and validation is fixed accordingly.
10. Seatpost finish works correctly where supported.
11. 2D and 3D reflect the same selected appearance state.
12. Finish switching does not reset the bicycle.
13. Cosmetic choices do not incorrectly affect compatibility.
14. The overall bicycle looks more premium and consistent.
15. Existing builder features continue to work.
16. Saved builds retain appearance selections.
17. UI/UX remains clean and premium.
18. Performance remains acceptable.
19. Tests and visual verification have been performed.
20. Remaining unsupported branded visual states are documented honestly.

---

# FINAL STRICT INSTRUCTION

Polish TrackLab’s 2D and 3D builder so the bicycle feels complete, refined, and premium.

Preserve official frameset colorways for branded frames.

Add a controlled finish-selection system for visible non-frame components such as:
- wheelsets
- crank arms
- chainrings
- seatpost
- cockpit parts
and other supported visible parts.

Support:
- Polished
- Pure Black
- Brand Color where actually supported

Fix the incorrect saddle validation so saddles are not wrongly blocked by seatpost size.

Improve weak or unfinished visuals throughout the bicycle, including parts the user did not explicitly list if they are visibly under-polished.

Do not fake unsupported brand colors.
Do not break geometry.
Do not break saved builds.
Do not break the builder architecture.
Do not start the postponed advanced modular customization overhaul unless necessary for existing current features.

The final result should be a polished, premium, visually coherent fixed-gear bicycle configurator with strong 2D and 3D consistency.