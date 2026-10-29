# Structural assembly refinement and 20F/24R wheelsets · 29 October 2026

## Audit baseline

Baseline `181cd3f`. The [new brief](../requirements/modeling-refinement.md) continues the prior [polish milestone](builder-polish.md), whose final [CI](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40816779054) passed. No screenshots accompanied this attachment; the existing local render evidence and new live close-ups are the starting references. Manufacturer pictures remain private research references. No new graphics rights were supplied; the user's paint-approximation/missing-graphics instruction remains active.

Actual code gaps: `wheelDimensions` exposes one spoke count for both wheels; `spokeEndpoints` hard-codes front two-cross/rear three-cross. There is no selectable 20F/24R variant or drilling/lacing validation. The steering stack uses a fixed 44mm stem-center offset and 22mm extension; the GLB fork includes a cockpit-independent upper steerer. Headsets are uniform short cylinders, crowns are transverse cylinders and all dropouts are closed annuli. Tubes meet at head-tube end faces. Saddle/rail abstraction currently returns compatible; this new brief explicitly requires unknown interfaces to remain Needs Verification. Component finish zones, canonical persistence, complete-vertex camera fitting and existing geometry/material ownership already work and must be extended rather than replaced.

## Implementation plan and acceptance

| Stage | Status | Evidence required |
| --- | --- | --- |
| 1 Audit | Complete | Code, prior renders and new requirements compared |
| 2 Structural assembly | Complete | Shared steering stack, profiled head tube/crown, open dropout slots, v3 kits and synchronized SVG; checks below |
| 3 Wheelsets | Pending | Existing configurations plus actual 20-front/24-rear geometry, flange/rim drilling and lacing validation, persistence |
| 4 Drivetrain | Pending | Arm/spider/pedal/cog/chain proportions and attachments inspected/refined |
| 5 Seating | Pending | Supported shell/rails/clamp; separate frame/post and rail/clamp checks, unknown => unverified |
| 6 Cockpit | Pending | Four distinct profiles, steering/clamp continuity, tape/grips kept separate |
| 7 Materials | Pending | Coordinated wheel finish and separate rim/spoke/hub material regions; existing six controlled zones and source-backed factory support preserved |
| 8 SVG synchronization | Pending | Geometry/count/finish agreement, coherent silhouettes/layering and all visible interfaces |
| 9 Camera | Pending | Actual rendered projection bounds at all presets/aspects, reset and sensible zoom limits |
| 10 UX | Pending | Clear spoke/lacing/rim/finish support, restrained native controls, responsive behavior |
| 11 Verification | Pending | Domain/API/geometry/persistence checks, isolated browser suites, builds, live views and CI |
| 12 Documentation | In progress | Per-stage checks, assumptions, missing brand assets and remaining external dependencies |

Preserve existing IDs, technical measurements, saved appearances, six slots, backend policy and local development bypass. Add an authored neutral wheelset with documented demo dimensions/lacing; do not claim an unreviewed branded 20/24 product. Generic geometry and unknown manufacturer interfaces remain explicitly illustrative. Source-reviewed asset revisions may update original renderer geometry without rewriting saved product specifications. No new independent component-purchasing system, custom paint editor, deployment or hosting.

## Stage 2 — structural assembly

One shared axis now places the headset cover, consecutive spacers, stem clamp, concealed upper steerer and top cap. Fork kits end their steerer inside the head tube; they no longer bake in a cockpit-independent extension. Known straight/tapered dimensions and threaded headsets select the appropriate illustrative profile; generic cockpit geometry does not certify physical fit. Head-tube bores and tube junctions, a swept crown, tapered blades and axle-centered slotted plates replace the previous closed rings and transverse crown cylinder. Stays attach to the forward solid plate region. Through-axle plates remain a distinct supported profile when explicitly specified. Unknown dropout styles use documented illustrative defaults; no manufacturer tension hardware is invented.

All 39 original frame kits regenerated as `frame-kit-v3`, retaining anchors and specifications. The largest is 187,232 bytes (previous maximum 214,732). The catalog importer upgrades only an exact original v1/v2 asset registration with unchanged specifications; edited transforms/specifications and archived variants remain untouched.

Verification: TypeScript and ESLint pass; 54 targeted tests pass across structural steering, complete assembly geometry, GLB anchors and isolated API integration. Tests cover zero/fractional/tall spacer stacks, straight/tapered/quill construction, actual open slots, all published fork/tire envelopes and exact asset migration guards. Live isolated-browser review captured SVG, both sides, front/rear and quarter views plus head/fork/rear-dropout close-ups without page errors. Crown clearance on the large BCN failed the first geometry check and was corrected in the mesh profile. All other stages remain explicitly pending. Audit commit CI [40817961008](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40817961008) passed.
