# Structural assembly refinement and 20F/24R wheelsets · 29 October 2026

## Audit baseline

Baseline `181cd3f`. The [new brief](../requirements/modeling-refinement.md) continues the prior [polish milestone](builder-polish.md), whose final [CI](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40816779054) passed. No screenshots accompanied this attachment; the existing local render evidence and new live close-ups are the starting references. Manufacturer pictures remain private research references. No new graphics rights were supplied; the user's paint-approximation/missing-graphics instruction remains active.

Actual code gaps: `wheelDimensions` exposes one spoke count for both wheels; `spokeEndpoints` hard-codes front two-cross/rear three-cross. There is no selectable 20F/24R variant or drilling/lacing validation. The steering stack uses a fixed 44mm stem-center offset and 22mm extension; the GLB fork includes a cockpit-independent upper steerer. Headsets are uniform short cylinders, crowns are transverse cylinders and all dropouts are closed annuli. Tubes meet at head-tube end faces. Saddle/rail abstraction currently returns compatible; this new brief explicitly requires unknown interfaces to remain Needs Verification. Component finish zones, canonical persistence, complete-vertex camera fitting and existing geometry/material ownership already work and must be extended rather than replaced.

## Implementation plan and acceptance

| Stage | Status | Evidence required |
| --- | --- | --- |
| 1 Audit | Complete | Code, prior renders and new requirements compared |
| 2 Structural assembly | Complete | Shared steering stack, profiled head tube/crown, open dropout slots, v3 kits and synchronized SVG; checks below |
| 3 Wheelsets | Complete | Additional authored 20/24 demo, actual spokes/drilled flanges/rim bridges, independent lacing, SVG/export/save/history verification |
| 4 Drivetrain | Complete | Lenticular tapered arms, connected root bosses/cog seat, bored lockring and pedal hardware; unchanged gearing and chain path |
| 5 Seating | Complete | Shared shell/cover contour, supported rail anchors, split round/oval clamp grooves; distinct fit checks and unknown => unverified |
| 6 Cockpit | Complete | Four bar profiles/materials verified; faceplate and fasteners now share the stem angle |
| 7 Materials | Complete | Independent rim/spoke/hub materials, coordinated presets and source-backed mixed factory regions verified |
| 8 SVG synchronization | Complete | Shared centripetal stays/rails/bars, saddle/arm outlines, actual wheel counts/materials and corrected far-crank layering |
| 9 Camera | Complete | Real vertices/instances checked across four source sizes, eight presets, phone/tablet/landscape, zoom and reset |
| 10 UX | Complete | Visible wheel-build labels, coordinated finish guidance and existing accessible controls verified across the responsive matrix |
| 11 Verification | Verified locally; CI follow-up | 100 tests + one local Redis skip, 31 browsers, one development and two PWA checks, builds and inspected views |
| 12 Documentation | Complete for v3 milestone | Evidence, assumptions and subsequent morphology/spoke-option dependencies recorded |

Preserve existing IDs, technical measurements, saved appearances, six slots, backend policy and local development bypass. Add an authored neutral wheelset with documented demo dimensions/lacing; do not claim an unreviewed branded 20/24 product. Generic geometry and unknown manufacturer interfaces remain explicitly illustrative. Source-reviewed asset revisions may update original renderer geometry without rewriting saved product specifications. No new independent component-purchasing system, custom paint editor, deployment or hosting.

## Stage 2 — structural assembly

One shared axis now places the headset cover, consecutive spacers, stem clamp, concealed upper steerer and top cap. Fork kits end their steerer inside the head tube; they no longer bake in a cockpit-independent extension. Known straight/tapered dimensions and threaded headsets select the appropriate illustrative profile; generic cockpit geometry does not certify physical fit. Head-tube bores and tube junctions, a swept crown, tapered blades and axle-centered slotted plates replace the previous closed rings and transverse crown cylinder. Stays attach to the forward solid plate region. Through-axle plates remain a distinct supported profile when explicitly specified. Unknown dropout styles use documented illustrative defaults; no manufacturer tension hardware is invented.

All 39 original frame kits regenerated as `frame-kit-v3`, retaining anchors and specifications. The largest is 187,232 bytes (previous maximum 214,732). The catalog importer upgrades only an exact original v1/v2 asset registration with unchanged specifications; edited transforms/specifications and archived variants remain untouched.

Verification: TypeScript and ESLint pass; 54 targeted tests pass across structural steering, complete assembly geometry, GLB anchors and isolated API integration. Tests cover zero/fractional/tall spacer stacks, straight/tapered/quill construction, actual open slots, all published fork/tire envelopes and exact asset migration guards. Live isolated-browser review captured SVG, both sides, front/rear and quarter views plus head/fork/rear-dropout close-ups without page errors. Crown clearance on the large BCN failed the first geometry check and was corrected in the mesh profile. All other stages remain explicitly pending. Audit commit CI [40817961008](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40817961008) passed.

## Stage 3 — wheel build selection

`Studio 20 / 24` is an additional authored demo: 20 radial front spokes, 24 two-cross rear spokes, 622 mm BSD, 30 mm deep/22 mm wide rims, 100/120 mm hub spacing and 10 mm axles. These are TrackLab demonstration values, not manufacturer specifications or a recommended wheel build. Existing classic/deep/M9 IDs keep 32/32 illustrative fallback geometry. Their unspecified drilling/lacing stays unverified. No arbitrary per-wheel purchase or spoke-count editor was introduced.

Both viewers derive each wheel's count and lacing from one shared build definition. Real flange holes and curved inner-rim bridge holes align with the spoke endpoints. Nipple/spoke instances have the actual counts. Hub shoulders connect the shell to axle endcaps. Separate rim/spoke/hub materials retain coordinated Polished/Pure Black behavior, with tire rubber separate. Lacing and drilling mismatches become incompatible; absent data remains unverified. Wheel cards show counts, lacing, depth and drilling status. Spoke-only/depth changes no longer rebuild unchanged tire meshes.

Verification: TypeScript and ESLint pass; 20 targeted domain/mesh tests pass, including raycasts through actual drilling and exact SVG counts. Four isolated browser workflows pass: 20/24 versus retained 32/32, actual instance counts, finishes/history, unchanged unrelated geometry, responsive finish controls, save/reload/garage and an exported SVG containing exactly 44 spoke lines. Final multi-angle visual/camera review remains stage 11.

## Stage 4 — drivetrain and live geometry corrections

Added tapered crank outlines shared with SVG, varying arm thickness, root bosses that join the arms to the spindle/spider, a rear-hub cog seat, a bored lockring and pedal grip pins. Pitch circles, tooth counts, opposed pedals, chain tangency and independent crank/chainring finishes remain intact. Mounting contours and tooth/link closure remain illustrative; unspecified real cog/crank interfaces still require verification.

The live wheel review exposed an interior-rim triangulation defect missed by vertex/raycast tests: long triangles bent across the wheel center. Clipping the developed strip into short angular bands before curving it preserves real drilling without disc-like faces. A trial general tessellator was too expensive and did not meet the surface-envelope test; it was replaced by bounded band clipping. New triangle-centroid checks prevent the regression. Live review also found that the compact workspace's existing CSS hid wheel metadata; the dedicated wheel summary is now explicitly visible and its browser assertion checks visibility.

Verification: 16 focused assembly/wheel/finish tests pass, including mount contact and the corrected wheel surface envelope. TypeScript/lint pass. Updated isolated live captures of all six major angles and four structural/drivetrain close-ups show open wheels and connected crank/cog assemblies, with no page errors. Structural commit [CI 40820060821](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40820060821) passed. Seating and final regression review remain next.

## Stage 5 — seating geometry and interfaces

Both viewers now share the full saddle section contour, cover/shell silhouette, slimmer race padding, relief and rail anchors. Cover tips close onto the shell; the first live close-up exposed a tip gap and a closure regression now covers it. Rails attach to underside bosses and pass through actual round/oval grooves in a split clamp, with a straight clamped section and a narrower post head that clears the rails. Post finishes leave shell/cover/rails in their own materials.

`postDiameter`, when explicitly registered, is checked against the frame separately. Legacy bundled saddle `seatpost` fields remain unchanged and are not used as rail-fit restrictions. Without a selected post diameter, the renderer illustrates the frame's post size and the actual post fit stays unverified. Rail/clamp checks recognize round, oval and named proprietary interfaces; incomplete/unknown interfaces are unverified, and documented type/dimension/system conflicts are incompatible. Generic visible hardware remains illustrative rather than a certification of a proprietary clamp.

Verification: 65 relevant domain/mesh/API checks passed after correcting a floating-point test assertion; a further isolated API check brings the API suite to 42 passing tests and verifies rejection without quota charges. Thirteen seating/assembly tests pass after the cover-tip correction. Seven browser workflows pass across all four bars, finish materials, mobile controls, source frames, save/reload/garage/export and missing-asset recovery. Updated SVG and saddle close-ups were inspected. Wheel milestone [CI 40820446499](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40820446499) passed. Drivetrain CI found an existing cockpit-test timing race (frame response counted in the next four-bar test); the test now waits for the actual selected frame before recording usage. Its rerun is tracked with this follow-up.

## Stages 6–7 — cockpit contact and finish regions

Preserved all four continuous, symmetric bar profiles, tapered center clamps, wrapped/gripped ends and caps. Faceplate position and bolt axes now use the stem angle consistently. Independent stem and bar materials leave tape/grips rubber. The earlier shared stack controls the steerer clamp rather than extending a fork mesh to fill gaps.

Optional source-backed `brand.regions` specifies rim, spoke and hub paints within an exact wheelset variant; the existing wheelset selection and six appearance zones remain canonical. SVG gradients and owned 3D materials read the same regions. Polished/Pure Black still override all regions together; original/factory appearance preserves a registered mix. Other component zones reject wheel-specific regions. No manufacturer component graphics or unsupported real products were added. Current demos retain their original appearance plus controlled presets; real component manufacturers remain a catalog/rights dependency.

Verification: TypeScript/lint and 13 focused finish/assembly tests pass. Five isolated browser workflows pass, including an administrator-registered temporary mixed-finish fixture exercised through the actual API, both viewers, coordinated overrides and restoration without geometry changes. The fixture is restored in `finally` and never enters Atlas. All four cockpit profiles, mobile finish editing and save/export behavior also pass. Materials remain per-model owned and disposed, with no texture/decal downloads for these color-only regions.

## Stages 8–10 — projected geometry, camera and restrained UX

Factored exact open centripetal spline controls into the shared domain, without adding Three to the initial SVG bundle. Projected stays, rails and bars now use the mesh curve convention. Shared crank/saddle outlines, actual per-wheel counts and region paints remain synchronized. The far crank/pedal sits behind the frame/wheels; outer axle hardware stays above the dropout plates. Wheel thumbnails use each variant's real front/rear count, lacing and rim depth. Viewer metadata identifies `components-v3`.

The existing complete-vertex camera fitter passed the new live projection test and was retained. It tests Dosnoventa LA S/L and Cinelli Vigorelli XS/XL at all eight presets, then phone/tablet/landscape aspects, depth bounds, visible control clearance, zoom limits and reset. Every actual mesh vertex and instance is projected, not just a box or metadata declaration. No lighting or camera offset was used to conceal structural geometry.

Verification: full local suite passes 100 tests with one live Redis check skipped; this includes the 42-test isolated API suite. Source-curve equivalence and SVG layering checks pass. Four isolated browser workflows pass for real projected bounds, the complete responsive width/theme matrix, AA semantic contrast and wheelsets. A stale earlier catalog assertion still expected abstracted rail compatibility; CI identified it and it now expects the new required unverified state. Final build, comprehensive browsers and curated visual evidence are tracked in stage 11.

## Final v3 acceptance and remaining continuation

The complete isolated run passes **31 normal-policy browser workflows, one development-bypass workflow and both production-preview PWA workflows**. TypeScript, lint and frontend/API builds pass. The full unit/API suite passes **100 tests**, with the live Redis check skipped locally and retained in CI. The latest CI exposed a test-fixture collision with real saved-build immutability: the mixed-finish test edited a referenced demo variant. It now appends a separate temporary fixture variant and restores the product afterward; the complete local browser suite passes with the protection enforced.

The final capture set contains 29 images and reports no page errors. Inspected both full sides, front/rear/quarter views, fork/rear-end/hub/crank/saddle/cockpit details, Cinelli XS/XL, Ranger L and mobile controls. Curated evidence: [full assembly](../design/modeling-refinement/three-quarter.png), [saddle support](../design/modeling-refinement/saddle.png), [front axle](../design/modeling-refinement/fork-dropout.png), [rear end](../design/modeling-refinement/rear-dropout.png), [drivetrain](../design/modeling-refinement/crank.png), [Cinelli XL baseline](../design/modeling-refinement/cinelli-xl-3d.png), [mobile finish controls](../design/modeling-refinement/phone-wheel-controls.png). Public screenshots contain only the original renderer and unauthenticated test UI; private manufacturer references and runtime logs are excluded.

Representative Balanced counters for the 20/24 assembly: 144 draw calls, 166,826 triangles, 142 geometries and four textures. These are scene counters, not an FPS guarantee. Build output: initial JS 597.12 kB / 180.90 kB gzip; deferred 3D 1,043.94 / 282.69 kB; CSS 91.00 / 18.19 kB; API 206.45 kB. The existing large-chunk warning remains. No hosting or release was performed.

This milestone does not claim manufacturer-exact tube sections or authentic assets. The subsequent [advanced geometry brief](advanced-geometry.md) explicitly extends the remaining universal circular tubes/round post and generic fork/plate morphology, and adds 32/36 spoke choices within each retained rim design. Those are separate pending implementation stages. Licensed graphics, exact proprietary sections, physical device coverage and production asset storage remain external dependencies.
