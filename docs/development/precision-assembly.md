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

### Nominal-width stress limits — unresolved

A separate stress audit used each frame's published maximum tire width as both width **and an assumed section height**, across all 39 kits. Fourteen kits report triangle intersections. This is a renderer limitation with incomplete tire and tube/crown surface data, not evidence that the manufacturer's real frame cannot fit its stated tire size. The default 25 mm illustration passes all 14 critical pairs for all 39 kits. The diagnostics must continue to expose these failures; do not resize the tire or rewrite published anchors to make a test green.

| Authored stress case | Actual reported mesh pairs |
| --- | --- |
| Dosnoventa 02 LA S/M/L, 32 mm | Rear tire/seat tube; S also front tire/crown |
| Skream Magnum XS–XL, 35 mm | Rear tire/seat tube |
| Wabi Prism 47–62, 38 mm | Both rear chainstays/tire; 60/62 also seat tube/tire |

The [Magnum page](https://skreambikes.com/products/magnum-shade-frameset) and [Prism page](https://wabicycles.com/products/wabi-prism-frameset) retain their published 35/38 mm limits; those values are not altered. The positive default-width matrix and a negative nominal-envelope regression verify that the diagnostics distinguish these cases. Required next inputs: mounted tire section height/profile on the selected rim, verified tube sections, crown geometry and clearance-oriented stay shapes. Maximum-width and exact manufacturer fidelity therefore remain unfinished; this task is not an overlap-free certification of every combination.

| Phase | Status | Evidence / dependency |
| --- | --- | --- |
| 1 Audit | Completed and verified | Baseline captures and source-code/contact-plane audit above |
| 2 Shared anchors | Completed and verified locally | Shared technical anchors, contact-stack and source/fallback checks |
| 3 Head/steerer | Completed and verified locally | Open head bore, source-specific steering, coped clamp joins |
| 4 Fork/front dropout | Partially implemented | Default-width seam/contact/retention checks pass; LA S nominal-width crown case remains unresolved |
| 5 Rear track ends | Completed and verified locally | Rearward slots, contiguous inserts, washer/nut face contacts |
| 6 Frame junctions | Partially implemented | Coped attachment tests pass; the nominal-width stress cases above require verified sections |
| 7 SVG synchronization | Completed and verified locally | Shared silhouettes and canonical geometry, explicit layer order |
| 8 Mesh quality | Partially implemented | Detailed diagnostics, bore rays and baseline clearances verified; maximum-width intersections remain explicit failures |
| 9 Manufacturer fidelity | Partially implemented | Supported qualitative source review above; exact proprietary surfaces/interfaces and rights remain unavailable |
| 10 Visual testing | Completed and verified for documented baseline | Fifty four-family views plus a settled mobile recapture reviewed; nominal-width limits remain outside this baseline |
| 11 Regression | Verified locally; CI pending | Final 121 unit/API passes (one Redis skip), 43 normal + one development + two PWA browser checks and both builds pass; final CI is inspected after pushing |

Initial verification found and corrected an obsolete midplane assertion, excessive stay tessellation, a genuine steel-fork/tire collision from missing stack, and stem cap triangles crossing the bores. The focused tests now exercise corrected geometry; final results are recorded here and in the roadmap after execution.

Core milestone checks: TypeScript, lint, both builds, 120 unit/API passes (one live Redis skip), eight isolated browser workflows and production debug-code exclusion pass. Detailed checks exercise 14 pairs across all 39 base frame kits. Final visual matrix/full browser and CI evidence remain pending.

## Final visual evidence

The isolated Chromium matrix captured 50 views: six whole-bike directions, head/crown/front/rear dropout details and SVG for Cinelli Vigorelli M / 80s National Blu, Skream Ranger M / Forest, 8bar KRZBERG V8 M and Dosnoventa DET M. Cinelli adds headset/stem, front/rear hardware, stay and BB inspections. No page errors were recorded. A separate settled 375×812 recapture waits for real canvas dimensions and camera-fit convergence, retaining the same selected model. Inspection images include the existing subtle selected-mesh highlight.

- [Cinelli matrix](../design/precision-assembly/after-cinelli-gallery.png), [Skream matrix](../design/precision-assembly/after-skream-gallery.png), [8bar matrix](../design/precision-assembly/after-8bar-gallery.png), [Dosnoventa matrix](../design/precision-assembly/after-dosnoventa-gallery.png).
- [Head tube](../design/precision-assembly/after-cinelli-head.png), [headset/stem](../design/precision-assembly/after-cinelli-headset.png), [crown](../design/precision-assembly/after-cinelli-crown.png), [front dropout](../design/precision-assembly/after-cinelli-front-dropout.png), [rear track end](../design/precision-assembly/after-cinelli-rear-dropout.png).
- [Front hardware](../design/precision-assembly/after-cinelli-front-hardware.png), [rear hardware](../design/precision-assembly/after-cinelli-rear-hardware.png), [BB junction](../design/precision-assembly/after-cinelli-bb.png), [8bar insert](../design/precision-assembly/after-8bar-rear-dropout.png), [SVG](../design/precision-assembly/after-cinelli-svg.png), [mobile](../design/precision-assembly/after-mobile.png).

Visual review exposed a real closeup-camera issue: the normal 40 mm pan-floor margin displaced the target of a tiny nut or dropout. Development closeups now put the floor below the mesh; all nine presets assert the actual target centre within 0.1 mm. A retained 2D→mobile→3D regression also checks the real camera fit, canvas size, canvas identity and current frame. Normal camera behavior is unchanged. This camera correction does not alter source geometry.

## Regression findings

The first full local run passed 42/43; the initial core CI [41031176711](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/41031176711) failed on the same saved-build handoff. Network evidence showed the PATCH arrived without a preceding lease acquisition. Follow-up commit 7b4f555 locks the handoff and requires the saved route's lease. Its regression holds the lease response, proves zero premature PATCH requests and disabled edit/save controls, then completes save/autosave/retry/garage/export. Backend lease/ownership rules were retained.

The final clean normal browser run passes all 43 workflows in 5.4 minutes. TypeScript/lint, both builds and all 121 local unit/API tests pass (one live Redis skip); the final explicit-anchor-origin/asset subset passes all ten checks. The existing lazy-3D bundle warning remains. CI includes its own Redis service. These software checks do not resolve the nominal-width stress cases or proprietary asset/physical-device dependencies.

The unlimited-development workflow and both production-preview PWA workflows also pass. The production browser opens Inspect and verifies development geometry tools are absent. No test database or browser runtime data is included in the committed evidence. Final CI is checked after the QA milestone push.

GitHub verification: [7b4f555 / run 41032528849](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/41032528849) completed successfully, including Redis, the full browser suite and development/PWA checks. The final QA commit includes the additional centering/origin/known-envelope evidence and is checked separately after pushing.
