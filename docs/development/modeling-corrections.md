# Bicycle geometry correction audit · 28 October 2026

Baseline `618dcbe`. The supplied attachment contains the modeling brief but no separate screenshot file. Captured the actual current renderer in isolated Chrome at 1440×1000 in Studio Light, including side, front, top and quarter views. [Side baseline](../design/modeling-before-side.png), [front baseline](../design/modeling-before-front.png). Browser checks use temporary MongoDB on 4010/5190, never Atlas.

## Observed construction and causes

- The active assembly is procedural except for 39 per-variant frame/fork GLBs exported by `scripts/export-frame-kits.ts`. There is no Blender source in the repository. Side-elevation anchors use millimetres with Y down; render/export conversion is metres with X forward, Y up and Z lateral. Preserve this conversion and the published frame anchors.
- Demo forks are two uniform tubes at ±35mm starting beside the lower head tube; imported forks start at ±45mm. Neither has a connecting crown/steerer/dropouts. This produces the disconnected front-view shape. Fork shapes and cross-sections are illustrative, even on source-reviewed frames.
- Tires and rims are circular tori with hard-coded radii and only a binary 60mm rim choice. Tire width/BSD do not control the actual profile. Spokes run from one centre instead of two flanges, and the hub is a single cylinder. Side views obscure these defects; front/top expose them.
- Drivetrain is a fixed 80mm outline and five thin spokes, one short crank arm/pedal, and two open cylinders representing chain runs. Tooth count, crank length, opposite crank phasing, cog, complete chain path and chainline do not drive these meshes.
- Saddle is a scaled sphere, approximately 184mm long, with no shell/rails/clamp. The post follows an anchor line, but its attachment is unsupported visually.
- Each dropbar hook is generated in a constant-Z plane at ±180mm, followed by a separate straight centre cylinder. This creates crude hook/top junctions and a width unrelated to product dimensions. Riser and bullhorn use the same fixed lateral offsets; no flat bar exists. The default perspective can exaggerate expected near/far side overlap.
- The inspector has no handlebar-type filter and cockpit cards show a generic bike icon. Three existing cockpit demos lack dimensional metadata; those missing dimensions must be explicitly illustrative rather than manufactured product claims.
- Camera fitting projects local bounding-box corners and deliberately excludes all instanced geometry. This is insufficient for new instanced drivetrain details and wastes space on circular/curved parts. The floor is hard-coded independently of selected tire dimensions. Both must follow the complete assembly.

## Implementation contract

Keep six canonical slots, current IDs/saved builds, all reviewed frame anchors, normal policy and the approved local development bypass. Add one independent flat-bar demo, not separate stem/hub/crank configuration systems. Use shared numeric component dimensions and anchors for both renderers, plus reusable Three.js mesh builders for runtime and GLB export. Unknown manufacturer geometry/interfaces remain Needs Verification. Demo defaults, mounting stack, tube sections, lacing, saddle contours and tire section assumptions will be documented explicitly.

Use tooth-derived pitch circles and a closed external-tangent chain path; [KMC's official single-speed specification](https://www.kmcchain.com/en/product/bicycle-chain-z1wide-single-speed) supports the common 1/2-inch pitch and 1/8-inch class reference, not a claim that the demo is a KMC product. Repeated spokes/chain details should use instancing and recomputed instance bounds as described by [Three.js](https://threejs.org/docs/pages/InstancedMesh.html). No new renderer dependency, forced crank animation, new manufacturer product, copied asset or lighting redesign.

## Phase status

| Phase | Status | Required evidence |
| --- | --- | --- |
| 1 Audit | Complete | Actual source and multi-angle baseline inspected |
| 2 Fork | Implemented and checked | Connected crown/steerer/tapered blades/dropouts; 39-variant anchor/axis and tire-envelope checks |
| 3 Wheels | Implemented and checked | Continuous rim depths, shaped BSD/width-driven tires, flanges, instanced lacing/nipples, valve, endcaps and axle nuts |
| 4 Drivetrain | Implemented and checked | 180° crank/pedal pair, tooth-derived pitch circles, spider/bolts, cog/lockring and closed tangent chain |
| 5 Saddle | Implemented and checked | Rounded shaped shell/padding, converging rails, clamp and seat-axis post |
| 6–7 Cockpit | Implemented; targeted browser checks passed | Four continuous symmetric bars, filter/thumbnails, canonical state and flat-bar save/export |
| 8–9 Proportion/framing | Implemented and checked | Reviewed anchors retained, all vertices/instances fitted, eight presets, wheel-derived floor, owned studio resources |
| 10 Verification | Local acceptance complete; CI pending | 73 unit/API checks, all 22 normal-policy browser scenarios, separate development scenario, both PWA checks, type/lint/build and screenshots passed |

## Shared geometry and explicit assumptions

`packages/domain/src/components.ts` derives attachment points and dimensions in metres, +X forward, +Y up, +Z drive side. Both viewers share axes, crown, axle, spindle, chainline, saddle, stem and bar anchors. They also reuse fork control points and handlebar paths. The original six slots and saved variant IDs remain stable; no independently selected stems, hubs or cranks were introduced.

Runtime mesh builders in `frontend/src/features/builder/modeling/` are reused by the frame exporter. All 39 generated kits are now `frame-kit-v2`; historical v1 registrations still validate. The importer upgrades only the exact untouched v1 asset registration matching published source, variant, dimensions and color. Edited dimensions/transforms and archived data remain intact. Revision query parameters prevent stale GLB caches. Surface fidelity and asset rights are unchanged.

Fallbacks are illustrative rather than manufacturer claims:

- Crown/headset stack starts at 12mm. A published fork length controls the crown when it fits below the head tube within a 4–45mm stack; otherwise shared head/axle anchors take precedence and metadata retains distinct published/rendered lengths. Taper, crown sections and undocumented curvature remain schematic.
- Missing wheel values use 622mm BSD, 20mm rim width, 25mm depth and 25mm tire section. Unmeasured tire height defaults to nominal width. Wheels are not scaled to force frame fit. Frame spacing/axle interfaces remain independent of wheel interfaces; unknown values use illustrative 100/120mm spacing and 10mm axles. Missing lacing uses 32 spokes, 2-cross front/3-cross rear, illustrative 22/28mm flange radii and 28/32mm lateral offsets.
- Missing cranks use 170mm arms and 130mm lateral arm spacing. Teeth/chainline follow selected specs. Even-count instanced chain links follow the closed tangent path with nominal 12.7mm pitch and a small closure adjustment. Five-arm spider, mounting surfaces, lockring and pedal cages are illustrative; tension, exact chain length and physical mounting fit are not certified. Unknown cog/crank mounts stay unverified; known conflicts are rejected by shared backend compatibility rules. No continuous crank animation was added.
- Race saddle defaults to 275×142mm; comfort 265×175mm. Shell/padding/rail contours are original illustrations. The selected post diameter and frame seat axis control post placement. Rail compatibility and insertion depth remain unverified.
- Existing drop/riser/bullhorn IDs retain their specs. Missing dimensions use drop 400mm width/85mm reach/125mm drop, riser 620mm/35mm rise/8° sweep, bullhorn 400mm/150mm reach/35mm rise. The new independent flat demo lists 600mm width/6° sweep/22.2mm tube/90mm stem. Missing stem length is 90mm, angle 6°, tube 23.8mm for road profiles or 22.2mm for flat/riser. Cards explicitly label fallback widths. No manufacturer dimensions, prices or physical-fit approvals were invented.

## Interaction, framing and resources

Cockpit filtering uses native labeled 44px selects and category-specific query/brand state. A Frameset brand no longer empties the Cockpit category. Thumbnails project actual bar control points. Filters do not consume quota; accepted selections use the existing backend flow. Targeted Chrome checks covered four types, branded frame retention, undo, phone chooser, account conversion, save/update/duplicate/delete and saved flat-bar SVG export. Normal policy and the authorized private development bypass remain separate.

Camera fit projects all vertices and instances with maximum 82% horizontal/90% vertical targets. Side views use the available width; front/rear and wide quarter views occupy less width because height governs fit. Tests cover all eight presets, four bars and portrait/landscape aspects. The floor follows tire radius; the bike is never distorted to change its framing.

Visual review exposed a faint contact-plane triangle and GPU resource growth on quality changes. Owned `GroundShadow` renders only bicycle layer 1 into depth and uses a separate full-screen blur scene. `SoftboxEnvironment` retains the original three panel positions/intensities, prefilters once and owns the CubeUV target. Both release their resources. Four Performance → Quality → Balanced cycles stayed at 101 GPU geometries/four textures each time. Mesh/material disposal is deduplicated and unrelated parts retain their geometry. [Three.js layers](https://threejs.org/docs/pages/Layers.html) define the depth-camera exclusion.

Original lightweight landing illustrations were refreshed from the corrected independent model, with no controls or manufacturer graphics baked in. Eight-view copy matches actual controls. The tablet toolbar now uses two rows before controls collide.

## Verification evidence

Browser work uses temporary MongoDB only. TypeScript, lint, 73 unit/API/asset checks and both production builds passed. The 53 API/domain/geometry checks passed again after removing incidental API-test formatting. One live Redis integration remains skipped locally and is covered by GitHub CI. All 22 normal-policy Chrome scenarios, the separate unlimited-development scenario and both rebuilt production-preview PWA scenarios passed sequentially. The first full run exposed an outdated exact GLB response URL assertion; it was corrected for revision parameters and the complete run passed. Expected missing-asset 404s are injected by the fallback/retry test. Three.js emits an upstream deprecated Clock notice and headless shader precision notices; no page errors occurred in the final visual review.

Actual Chrome 156 captures at 1600×1100 include [right](../design/modeling-v2/side.png), [left](../design/modeling-v2/opposite-side.png), [front](../design/modeling-v2/front.png), [rear](../design/modeling-v2/rear.png), [front quarter](../design/modeling-v2/three-quarter.png), [rear quarter](../design/modeling-v2/rear-quarter.png) and [top](../design/modeling-v2/top.png). Detail checks cover [fork](../design/modeling-v2/detail-fork.png), [wheel](../design/modeling-v2/detail-wheel.png), [drivetrain](../design/modeling-v2/detail-drivetrain.png), [saddle](../design/modeling-v2/detail-saddle.png) and all four bars: [drop](../design/modeling-v2/detail-cockpit-drop.png), [riser](../design/modeling-v2/detail-cockpit-riser.png), [flat](../design/modeling-v2/detail-cockpit-flat.png), [bullhorn](../design/modeling-v2/detail-cockpit-bullhorn.png). Close-ups use the actual scene with a temporary inspection camera; they are not extra product presets. Surrounding parts can leave the close-up crop.

Reviewed [light](../design/modeling-v2/studio-light.png)/[dark](../design/modeling-v2/studio-dark.png), 390px phone/768px tablet, shallow/deep rims and black/tan tire profiles, plus actual Dosnoventa M and Skream XL GLBs. All 39 published variants retain their previous frame anchors numerically. The tablet/phone browser check also confirms undo/redo do not collide with Reset at widths 768/375/320. Refreshed landing artwork was inspected on desktop and phone without cropping off wheels or handlebars.

Headless desktop, DPR 1, after warm-up, 90 invalidated frame samples:

| Mode | Main-pass calls | Main-pass triangles | CPU render submission median / p95 | Idle frames in 1 second |
| --- | ---: | ---: | --- | ---: |
| Performance | 102 | 63,532 | 0.7 / 1.0ms | 0 |
| Balanced | 103 | 63,534 | 0.8 / 1.2ms | 0 |
| Quality | 103 | 63,534 | 0.7 / 0.9ms | 0 |

These are JavaScript submission timings, not GPU completion times or a device FPS guarantee. The unthrottled headless RAF cadence is not presented as real display performance. Four quality cycles retained 101 geometries/four textures in Balanced. The lazy WebGL chunk is 1,028.66KB raw/277.57KB gzip; main JS 561.10KB/169.27KB gzip, CSS 89.00KB/17.86KB gzip. The existing large-chunk build advisory remains. Manufacturer kits remain under the tested 300KB budget. Representative physical mobile GPU, assistive technology, authentic permitted surfaces, missing measured interfaces and Blender refinement remain production dependencies.
