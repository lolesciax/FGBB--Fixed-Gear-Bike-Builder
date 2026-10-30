# Precision assembly review — 30 October 2026

Implements the [precision assembly brief](../requirements/precision-assembly.md) within the existing six-slot builder. Development remains local; pushing commits does not authorize deployment. The drawings and original meshes remain illustrative, without manufacturer graphics or physical-fit certification.

## Audit and cause

Baseline: 13 isolated Chromium captures (six whole-bike directions, six structural details and SVG), no page errors. Three [curated baseline details](../design/precision-assembly/) accompany this review; temporary browser data stays ignored.

| Finding | Source correction |
| --- | --- |
| Dropout midplanes coincided with hub contact planes; endcaps penetrated plates | Separate contact faces, body midplanes, inserts and hardware stacks in shared metre geometry |
| Nuts lacked washers; every axle used track nuts | Contiguous annular washers/hollow hex nuts; explicit nutted, quick-release and through retention branches |
| 8bar inserts had 0.3 mm gaps | Derive both insert faces and the base plate from the same contact spacing |
| Tube fans ended at mating tube axes | Per-angle coping against actual head/seat/BB envelopes; open welded ends; 0.15 mm hidden join allowance |
| Fork crowns used unrelated vertical placement and incompatible root sections | Crown-seat plane on the steering axis, matching open blade rings, mirrored construction and welded shading normals |
| Stay and fork tips were wider than their metal plates | Authored local flattened tongues; preserve mid-tube profiles and published axle anchors |
| Solid stem end fans crossed curved clamp bores | Subdivided coped boundaries, open joined ends and detailed stem/bar/steerer mesh checks |
| Largest steel frame's missing stack used the same fixed fallback as small sizes | Constrain only missing stack by nominal tire/crown construction clearance; derive missing reach from ETT where present; label these anchors illustrative. Published stack/reach remain unchanged |
| Every carbon fork was forced to a 38.1 mm lower steerer | Use explicit selected specifications or an individually sourced reference; leave unknown lower interfaces unverified |
| SVG used frame-only component state, rounded headset stroke caps and late shading | Pass canonical geometry, share coped silhouettes, use a polygonal lower stack and ordered far-frame/wheels/near-frame/hardware layers |

## Coordinates and interfaces

`componentGeometry` uses metres, x forward, y up, z lateral, rear axle at the origin. `assemblyAnchors` exposes the same positions in millimetres with explicit units and axes. Head ends/bearings, steering/crown, axles, dropout bodies, hub contacts, hardware, BB, seat/post/rails and both cockpit clamps derive from these coordinates. GLBs keep their existing bottom-bracket origin; companion model JSON records the shared technical anchors.

Plate thickness (5 mm), inserts (1.2 mm), washers (1.5 mm), nuts (7 mm), wall thicknesses, unsourced stack heights, tube sections and flattened junction profiles are authored illustration dimensions. These are not added to manufacturer compatibility specifications. A hub/frame spacing or nominal axle mismatch is reported rather than concealed by stretching the wheel or moving published anchors. Quick-release and through hardware are illustrative branches, not new manufacturer wheel products or purchasing claims.

The missing-stack bound reserves the nominal tire radius plus 10 mm crown envelope and 3 mm running clearance, using the head angle and rake. It selects at least the previous illustrative default; it never rewrites a published stack or reach. Missing reach may be derived from ETT and this illustrative stack. A single underdetermined schematic does not establish the true manufacturer geometry.

`frame-kit-v5` and `components-v5` identify changed topology. All 39 kits regenerate from source; existing variant identities remain. Import upgrades only exact untouched older registered rendering metadata, including v4. Edited transforms/specifications and historical builds are retained. Same-family size morphs require the new common revision; old/different constructions use replacement.

## Detailed validation and development tools

Broad spatial bins prune candidate triangles. Critical pairs then use triangle/triangle separating-axis tests with coplanar in-plane axes, not bounding boxes as collision evidence. Unit fixtures distinguish overlapping AABBs from real crossing and coplanar surfaces. The report classifies alignment, clearance, penetration, possible z-fighting and intentional joins.

Fourteen mesh pairs cover both fork blades, crown/front tire, both rear stays/rear tire, seat tube/rear tire, crank arms/chainstays, chainring/chainstay, head/steerer, stem/bar and stem/steerer (stem/head for a quill). Hub/plate spacing and axle diameters receive explicit alignment checks. Intentional weld insertion, shared crown seams, bearings/clamps, hardware contact, spokes/flanges and chain/teeth are declared exclusions. These tests do not certify internal containment, manufacturing tolerances, fatigue, strength or safety. Reports show missing meshes as untested warnings.

Under Inspect, the collapsed **Development geometry tools** provides head, headset/stem, crown, front/rear dropout, front/rear hardware, stays and BB closeups. Anchors/axes, mesh bounds and intersection markers are opt-in. Diagnostics run after settled changes, not each frame; helpers stay outside the fitted bicycle and are disposed on refresh. The production build excludes the controls and overlays. Existing normal camera fitting and backend authorization stay in effect.

## Manufacturer review

Primary pages rechecked on 30 October 2026; supplied drawings and text establish the qualitative details below, not proprietary surface measurements or hardware dimensions.

| Family | Retained source facts and limits |
| --- | --- |
| [Cinelli Vigorelli Alu](https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame) | Negative top slope, 377 mm stays, aero seat tube/post, tapered Futura carbon fork; individually sourced 28.6/38.1 mm steering reference. Exact bearing/cup, crown and dropout surfaces remain approximate |
| [Vigorelli Steel](https://usa.cinelli-milano.com/products/vigorelli-steel-frame-kit) | Separate steel/Futura construction; remains draft pending its existing geometry/interface review |
| [Skream Ranger](https://skreambikes.com/products/ranger-forest-frameset) | 395 mm carbon fork, 45 mm offset, 41.8/51.8 integrated headset, 31.6 mm post and longer rear triangle; disc/fender provision is not fabricated at unknown mount coordinates |
| [8bar KRZBERG V8](https://8bar-bikes.com/8bar_krzberg_v8/) | Oval top tube and double-sided stainless dropout inserts; exact contours, bolt coordinates and logos remain unavailable |
| [Tsunami SNM100](https://tsunamibicycle.com/product/tsunami-snm100-black-red/) / [Elite](https://tsunamibicycle.com/product/snm100-elite-matte-black-carbon-fork/) | Standard and carbon-fork Elite remain distinct research generations; do not copy claimed four-hole patterns or tension screws into an unreviewed generation |
| [Dosnoventa Detroit](https://dosnoventabikes.com/frames/detroit/detroit-frame-true-silver-5/) | Retain reviewed geometry, 45 mm rake and Compass 1⅛-inch reference. The current redirected finish does not establish older finish assets or a 1½-inch lower bearing. Steel BCN retains its threaded/quill construction |

Leader, Engine11 and other incomplete records keep their existing draft gates. No prices, affiliations, licensed graphics or new exact product interfaces are inferred.

## Phase evidence

| Phase | Status | Evidence / dependency |
| --- | --- | --- |
| 1 Audit | Completed and verified | Baseline captures and source-code/contact-plane audit above |
| 2 Shared anchors | Completed and verified locally | Shared technical anchors, contact-stack and source/fallback checks |
| 3 Head/steerer | Completed and verified locally | Open head bore, source-specific steering, coped clamp joins |
| 4 Fork/front dropout | Completed and verified locally | Crown seam, mirrored blades, flattened tongues and retention variants |
| 5 Rear track ends | Completed and verified locally | Rearward slots, contiguous inserts, washer/nut face contacts |
| 6 Frame junctions | Completed and verified locally | Head/seat/BB and stay coping, flattened plate joints |
| 7 SVG synchronization | Completed and verified locally | Shared silhouettes and canonical geometry, explicit layer order |
| 8 Mesh quality | Completed and verified locally | Detailed critical-pair checks, bore rays and seam normals |
| 9 Manufacturer fidelity | Partially implemented | Supported qualitative source review above; exact proprietary surfaces/interfaces and rights remain unavailable |
| 10 Visual testing | Partially implemented | Baseline and intermediate views reviewed; final multi-family matrix pending |
| 11 Regression | In progress | Full final checks, browser/build and post-push CI pending |

Initial verification found and corrected an obsolete midplane assertion, excessive stay tessellation, a genuine steel-fork/tire collision from missing stack, and stem cap triangles crossing the bores. The focused tests now exercise corrected geometry; final results are recorded here and in the roadmap after execution.

Core milestone checks: TypeScript, lint, both builds, 120 unit/API passes (one live Redis skip), eight isolated browser workflows and production debug-code exclusion pass. Detailed checks exercise 14 pairs across all 39 base frame kits. Final visual matrix/full browser and CI evidence remain pending.
