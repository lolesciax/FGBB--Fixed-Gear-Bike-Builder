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
| 2 Fork | Pending | Connected crown/steerer/tapered blades/dropouts, axis and clearance checks |
| 3 Wheels | Pending | BSD/tire/rim profiles, two flanges, lacing and hub/axle placement |
| 4 Drivetrain | Pending | Paired cranks/pedals, teeth, cog, chainline and closed chain path |
| 5 Saddle | Pending | Shaped padding/shell, rails, clamp and axis-aligned post |
| 6–7 Cockpit | Pending | Four distinct symmetric assemblies, filter, thumbnails and shared state |
| 8–9 Proportion/framing | Pending | Model/size comparisons, actual mesh projection, floor and all views |
| 10 Verification | Pending | Numeric geometry tests, screenshots/details, browser/API regressions, build and CI |
