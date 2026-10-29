# Structural assembly refinement and 20F/24R wheelsets · 29 October 2026

## Audit baseline

Baseline `181cd3f`. The [new brief](../requirements/modeling-refinement.md) continues the prior [polish milestone](builder-polish.md), whose final [CI](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/runs/40816779054) passed. No screenshots accompanied this attachment; the existing local render evidence and new live close-ups are the starting references. Manufacturer pictures remain private research references. No new graphics rights were supplied; the user's paint-approximation/missing-graphics instruction remains active.

Actual code gaps: `wheelDimensions` exposes one spoke count for both wheels; `spokeEndpoints` hard-codes front two-cross/rear three-cross. There is no selectable 20F/24R variant or drilling/lacing validation. The steering stack uses a fixed 44mm stem-center offset and 22mm extension; the GLB fork includes a cockpit-independent upper steerer. Headsets are uniform short cylinders, crowns are transverse cylinders and all dropouts are closed annuli. Tubes meet at head-tube end faces. Saddle/rail abstraction currently returns compatible; this new brief explicitly requires unknown interfaces to remain Needs Verification. Component finish zones, canonical persistence, complete-vertex camera fitting and existing geometry/material ownership already work and must be extended rather than replaced.

## Implementation plan and acceptance

| Stage | Status | Evidence required |
| --- | --- | --- |
| 1 Audit | Complete | Code, prior renders and new requirements compared |
| 2 Structural assembly | Pending | One steering axis/stack, integrated head tube/crown, appropriate dropout interfaces, updated original kits and both viewers |
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
