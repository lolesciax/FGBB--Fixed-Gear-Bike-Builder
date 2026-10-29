# Advanced geometry and independent spoke options · 29 October 2026

Continuation of the [structural refinement](modeling-refinement.md), using [the new brief](../requirements/advanced-geometry.md). Keep the existing six slots, source-backed colorways, appearance tokens, local development bypass and backend security. No deployment.

## Audit and scope

The v3 baseline already fixes the long-triangle rim defect, shared steering stack, open track ends, actual 20/24 spokes, connected saddle rails/clamp and complete-vertex camera fit. Its final 29-image capture pass reported no page errors. The current frame surfaces still use the same circular main tubes, fixed-width fork blades, conventional round post/collar and one rear plate silhouette. This is a real remaining morphology gap, especially for the documented Cinelli blade seat tube/dedicated post. Existing manufacturer point measurements must not be changed to disguise it.

The new spoke selector must choose a registered variant within the existing rim design. Add authored 20F/24R, 32F/32R and 36F/36R variants to neutral demo families, retaining old IDs and depths. Do not add a second configuration object or allow unsupported manufacturer drilling. Finish overrides remain unchanged and each variant carries actual hub/rim drilling and per-wheel lacing.

No screenshots accompanied the attachment. Existing local renderer captures and privately inspected official product photos are available; manufacturer photos/graphics remain research references and are not redistributed. No additional decal rights were supplied.

## Source review

| Exact reference | Confirmed scope and limits |
| --- | --- |
| [Cinelli Vigorelli aluminum](https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame) | Negative top-tube slope, blade seat tube, tapered carbon fork and dedicated post/clamp apply to this aluminum family. Existing Rainbow/80s National Blu/Special White source records match the listing. Proprietary section dimensions are not supplied; any modeled widths/sections remain labeled approximations. Do not transfer these to Vigorelli Steel. |
| [Magnum Dune](https://skreambikes.com/products/magnum_dune) | Current text/table agree on 40 mm rake, 370 mm fork and 393 mm chainstay. Existing Shade records previously had a rake conflict; do not silently rewrite those measurements from another finish listing. Surface comparisons can inform an explicitly approximate model-family profile. |
| [Ranger Forest](https://skreambikes.com/products/ranger-forest-frameset) | Table gives 425 mm rear triangle, 395 mm fork and 45 mm rake; front-disc and rack/fender/bottle provisions are stated. Mount positions and interface standards still need evidence. Retain distinct source anchors. |
| [Leader 735](https://www.leaderbikesusa.com/products/2023-leader-735-with-carbon-aero-seat-post) | The title identifies 2024 despite the URL. Hammerhead top tube, aero tubing and CASP6 post are documented; existing anchor/assembly gaps keep it draft. A morphology definition does not authorize publication. |
| [8bar KRZBERG V8](https://8bar-bikes.com/8bar_krzberg_v8/) | Oval top tube and stainless plates on both dropout faces are stated. Exact tube sections, plate drawings and protected logos are not supplied. |
| [Tsunami SNM100 standard](https://tsunamibicycle.com/product/tsunami-snm100-black/) | Referenced listing specifies alloy frame/fork, 100/120 mm spacing and removable stainless rear plates. Do not use the Elite carbon fork. Existing unavailable geometry-chart review remains a publication dependency. |
| [Dosnoventa DET NinePointNine](https://dosnoventabikes.com/frames/ninepointnine-2/dosnoventa03-det-ninepointnine-frameset/) | Pursuit geometry and carbon fork apply to this separate collaboration. Its table differs from existing Jet Black/Falcon records. Preserve generation-specific dimensions and appearance; no automatic variant conversion. |

## Stages and acceptance

| Stage | Status | Required evidence |
| --- | --- | --- |
| 1 Audit/source review | Complete | Existing code, captures, source descriptions and generation boundaries compared |
| 2 Seating and frame morphology | Verified locally | Shared variable-section profiles, separate aero post/collar, actual listed round-post diameter retained, opaque single saddle assembly |
| 3 Fork and rear ends | Verified locally | Source-associated blade/crown profiles, continuous root connection, double-sided 8bar inserts, matched SVG outlines |
| 4 Wheel configurations | Verified locally | All four demo designs offer registered 20/24, 32/32 and 36/36 builds; actual instances, drilling, SVG, history, save/reload/export and mobile controls checked |
| 5 Deep rims and appearance | Verified locally | Open centers and real holes at 25/30/60 mm; smooth bent cap normals, crisp hole edges, separate coordinated metal/rubber regions |
| 6 Camera and visibility | Verified locally | Actual vertices/instances fit ten source sizes at all eight presets plus phone/tablet/landscape; single opaque saddle survives frame/wheel changes |
| 7 Final verification | Verified locally | 106 unit/API tests, 35 browser workflows, development/PWA checks and 29-image review; external fidelity limits documented |

All section widths, blade contours, weld transitions and generic hardware not given as engineering dimensions remain authored illustrative approximations. Only reviewed qualitative construction differences are represented. Draft manufacturers stay unavailable for new builds until their independent publication checks pass.

## Morphology milestone

Four selectable source families now use registered illustrative construction profiles: Cinelli Vigorelli aluminum, Skream Magnum, Skream Ranger and 8bar KRZBERG V8. Variable tube sections and shared silhouettes preserve the original size anchors. Cinelli has a distinct blade seat tube, wheel relief, dedicated aero post and matching collar. Round posts retain the listed diameter through renderer normalization; this fixes a real 31.6-to-27.2 mm rendering error. Saddle exposure is an authored preview setting, not a rider-fit recommendation. The existing supported shell, rails and clamp remain one assembly.

Carbon blade roots meet a continuous curved crown; both rendered sides reuse mirrored geometry. The 8bar rear plates show stainless inserts on both faces. Magnum/Ranger retain integrated track ends: unpainted reference areas alone do not establish removable construction. Leader and standard Tsunami profiles remain research definitions behind draft catalog records. Their publication dependencies, unknown mount standards and protected graphics remain unresolved.

Verification at the morphology milestone: TypeScript and lint pass; 15 focused geometry/asset tests and 42 isolated API tests pass. The browser checks cover construction agreement, single opaque saddle/post/collar, seating identity through wheel changes, actual listed post diameter, source colorways, save/reopen/export and permitted-graphic isolation. Twenty private local captures cover the four families in 2D, 3D and close inspection. All 39 v4 kits retain anchors, contain no external images and remain below 300,000 bytes (largest 281,320). Previous eight finish/camera workflows also passed with the new geometry. The subsequent wheel milestone and final acceptance are recorded below.

## Registered wheel builds and rim surfaces

All four neutral wheel designs retain their original variants and specifications. New variants append explicit front/rear spoke counts, matching hub/rim drilling and authored lacing. The three presets stay within the current rim/axle/paint design; the 60 mm deep rim never becomes a shallow rim after a count change. Manufacturer options are derived only from published, fully specified registered variants with matching dimensions and paints; no extra manufacturer configurations are synthesized. Legacy unspecified 32/32 builds remain visibly unverified until a registered build is selected.

The native front/rear-labeled control uses the existing wheel variant ID in the canonical six-slot configuration. The backend still owns validation, authorization and quota behavior. Finishes survive count changes, undo/redo and save/reopen/garage/export; the API also checks public snapshots, duplication and information export. Append-only import tests preserve every original ID/specification and skip edited/archived records. Comparison ignores object key order and recognizes the original optional-catalogKind omission; an actual connected-app read caught these legacy cases. All four designs now expose the expected options in the local connected catalog. Frame-only paint swatches no longer mistake wheel build variants for colors.

The existing narrow-band rim triangulation preserves the open center and actual drilling. Normals now follow the bend's inverse transpose, smoothing radial surfaces while keeping hole walls crisp. Tests check triangle centroids, real ray-through holes, counts/instances, independent SVG counts, outward/smooth normals and the empty wheel interior across all depths/configurations. Tire rubber remains separate from the metal finish. Six focused browser workflows pass, including ten source sizes/eight presets and mobile selection. The complete local unit/API suite passes 106 tests with one live-Redis test skipped; CI supplies its own Redis. The earlier morphology push passed GitHub CI. Final regression/view evidence is recorded separately below when complete.

## Visual review and remaining boundaries

The final isolated capture pass produced 29 images with no page errors. Inspected all 16 requested view types: both sides, front/rear, both quarters, saddle, seat tube/post, head/fork, front and rear axle interfaces, each of the three counts, deep-rim close-ups and differently constructed branded frames. Additional views cover top/studio, SVG, steel seating and a 375 px phone. Close inspection intentionally zooms into a component; normal presets retain the complete bicycle.

Curated original-renderer evidence: [aero assembly](../design/advanced-geometry/cinelli-three-quarter.png), [matching SVG](../design/advanced-geometry/cinelli-2d.png), [seating](../design/advanced-geometry/cinelli-post.png), [crown](../design/advanced-geometry/cinelli-head-fork.png), [front axle](../design/advanced-geometry/cinelli-front-dropout.png), [rear inserts](../design/advanced-geometry/8bar-inserts.png), [36/36 deep rims](../design/advanced-geometry/deep-36-36-3d.png), [black rim detail](../design/advanced-geometry/deep-black.png), [steel comparison](../design/advanced-geometry/steel-three-quarter.png), [mobile fit](../design/advanced-geometry/mobile-steel-3d.png). These show anonymous temporary test UI and authored models. Private manufacturer images, runtime traces and credentials are excluded.

Measured final balanced phone scene: 143 draw calls, 185,914 triangles, 139 geometries and four textures. Frontend build: main 611.69 KB / 185.41 KB gzip, lazy 3D 1,047.05 KB / 283.93 KB gzip, CSS 91.26 KB / 18.22 KB gzip; API 228.82 KB. The existing large-chunk warning remains; initial 2D still defers Three.js/GLBs. These are measured examples, not a hardware performance guarantee.

Regression fixture corrections: the new persistence workflow uses a separate temporary standard member created only inside the guarded ephemeral test entrypoint. This avoids consuming the three-per-IP registration allowance or the admin's per-email login allowance used by other workflows. Both guards remain enabled and covered; no production/test rate cap was weakened. The full 43-test API suite passes after the legacy import correction. The development bypass workflow and both production-preview PWA checks pass.

Final local result: all 35 normal Chromium workflows pass together after the fixture corrections. TypeScript, lint and both builds pass. The full local unit/API suite passed 106 tests with one live-Redis skip; subsequent focused runs verify all 43 API tests after the legacy comparison correction and all four wheel geometry tests after the normal correction. The development workflow and both PWA workflows pass. No unexecuted physical-device or exact-CAD review is counted as complete. The previous [morphology milestone CI](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40854386623) passed; the new milestone's CI is inspected after push.

No manufacturer-exact section/CAD or graphic rights were added. The reviewed qualitative profiles remain approximate; Leader/Tsunami and other incomplete model generations stay draft. Unknown seating interfaces/mount standards remain Needs Verification. Physical device coverage, licensed graphics and exact proprietary geometry require external evidence. The postponed individual-component purchasing overhaul remains outside this task. No deployment occurred.
