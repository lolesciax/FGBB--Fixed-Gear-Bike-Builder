# Fork, axle and track-end reconstruction

Local development continuation, 30 October 2026. [Requested scope](../requirements/final-fork-interfaces.md). Exact manufacturer CAD and physical-fit certification remain outside the available evidence.

## Audit

The new attachment contains text but no five new screenshots. The baseline is the five latest saved precision-assembly closeups: Cinelli rear hardware, 8bar rear dropout, Cinelli front dropout, crown and head. Their source generators were audited before editing.

| Visible defect | Actual cause | Correction |
| --- | --- | --- |
| Large circular axle assembly | Exposed `hub_bearing_seat_*` discs, overlapping shoulder primitives and a generic C-shaped rear block | Continuous annular hub shell/end interfaces; real profiled plates and one retention group |
| Rear stays crowd the axle | Generic endpoints 12 mm forward and 8 mm above/below the axle | Profile-owned seatstay/chainstay receivers, outside the washer envelope |
| Identical rear plates | One generic insert and incorrect integrated-plate selection for the aluminum Vigorelli | Source-generation construction profiles, distinct contours and 2/3/4 fastener patterns |
| Bulbous crown and intermittent gaps | Rotating cross-sections unrelated to the centre path, plus polar sampling that skipped the flat deck corners | Elliptical shoulders with their actual tangent/normal, explicit flat-face/corner topology and a seated lower-bearing profile |
| Abrupt blade ends | Flat-ended tubes and a tall, separately extruded rectangular lug | Shared tapered blade end and compact lug whose upper neck enters the blade wall |
| Cropped bicycle after inspection | Closing the panel left its inspection target active | Both Return to parts and the Inspect toggle clear the target; full-bike bounds already include the saddle |

Primary files: domain `construction.ts`, `components.ts`, `forks.ts`, `morphology.ts`, `paths.ts` and `interfaces.ts`; Three.js `modeling/frame.ts` and `modeling/wheel.ts`; shared `FrameFinish2D.tsx`/`Bike2D.tsx`; builder inspection state. No duplicate saddle was added.

## Source review and limits

| Exact reference | Supported construction | Remaining uncertainty |
| --- | --- | --- |
| Cinelli aluminum Vigorelli / 2024 Futura Caliper, [product](https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame), [Shop Talk 9](https://usa.cinelli-milano.com/blogs/news/shop-talk-9-vigorelli) | Removable stainless rear plates; two visible fasteners per outer plate in the official closeup; flat carbon crown; IS42/28.6 and IS52/40 headset reference | Contours, fastener coordinates, sections and plate thickness are authored approximations |
| [8bar KRZBERG V8](https://8bar-bikes.com/8bar_krzberg_v8/) | Custom double-sided stainless inserts; three visible fasteners per outer plate in the linked official studio closeup; raised stay receiver | No proprietary plate CAD, tolerances or exact sections |
| [Standard Tsunami SNM100](https://tsunamibicycle.com/product/tsunami-snm100-black-red/) | Alloy fork, 100/120 mm spacing, four-hole removable plate record | Linked replacement-plate page has conflicting three/four-bolt text; inner-face fastening/section dimensions remain unverified. Standard profile stays research/draft and is not copied to Elite |
| [Skream Ranger Forest](https://skreambikes.com/products/ranger-forest-frameset) and retained Magnum source | Different carbon fork proportions and distinct rear receiver profiles | Sections and contours remain illustrative; no verified proprietary hardware pattern is invented |
| [Dosnoventa Detroit](https://dosnoventabikes.com/frames/detroit/detroit-frame-true-silver-5/) | Narrower carbon reference; visible wear-plate surface | No readable fastener pattern, so no guessed bolts. BCN retains a steel construction. Current source changes are not silently written into old technical variants |
| Leader 735, Engine11 and other incomplete records | Retain catalog records, draft/review status and existing construction where known | No generic rendering fallback establishes an exact manufacturer design or authorizes publication |

Official photographs were inspected privately as references. They are not bundled, committed or used as textures. Geometry is independently authored. Every contour coordinate, crown/blade section, nut dimension and hub detail without a published measurement is **illustrative**, not a verified product specification. Render-family metadata does not modify saved technical dimensions, prices, compatibility or rights.

## Mechanical contract

- Both viewers retain the rear-axle origin, forward/up/lateral axes and one canonical six-slot configuration. Published axle anchors, chainstay length, wheelbase, steering axis and chainline are unchanged.
- Hub contact faces use OLD, independently from shell width and axle length. Frame body/insert faces and washer/nut faces remain separate. Stays terminate inside their real plate receiver, away from the axle.
- Nutted hubs have exactly one washer and one nut per side. QR uses a hollow spindle, skewer, adjusting nut and one cam/lever. Through axles have one socket head without an extra lever or second head. These are renderer interfaces; no unreviewed hub product is made selectable.
- The rear slot extends visibly rearward beyond the washer. Slot/bore running clearance is authored at 0.35 mm radially; the front lug's 0.2 mm edge bevel reduces its minimum local clearance. These are visual tolerances, not machining instructions.
- Crown/blade root rings coincide within 0.02 mm. Bearing-seat rays verify actual contact at 24 positions; crown-plane checks use a 0.01 mm tolerance. Lateral strip progression rejects folded inner shoulders. Blade end rings and rear stay rings are tested against the actual plate surfaces.
- The existing critical-pair validator checks 14 pairs across 39 base frames at the 25 mm baseline and distinguishes intentional mating interfaces from unwanted penetration. It is not a complete solid-body collision or physical assembly certificate.
- Frame kits advance to v6 because topology changes. All 39 are regenerated, with shared plate/fastener geometry and omitted unused UV buffers keeping the existing 300,000-byte budget (largest: 297,620 bytes). World-space paint and projected graphics keep their existing mapping; textured materials retain UVs. Exact untouched legacy v1-v5 asset registrations can upgrade; custom transforms, technical data and saved history remain protected.

## Verification status

| Work | Status | Evidence |
| --- | --- | --- |
| Rear profiles, hardware, fork and SVG | Completed and verified for the illustrative assembly | Source patterns, actual open slots/bores, stay and blade seating, contact planes, retention exclusion and crown topology tests |
| Camera and saddle | Completed and verified locally | Both panel exit paths clear inspection; browser regression checks full projected bounds, retained canvas and exactly one visible opaque saddle |
| Visual comparison | Completed and verified for the documented baseline | 69 isolated-browser captures: four source families, seven whole-bike directions, head/crown, left/right ends, hubs, SVG, exit state and 375×812 mobile; no page errors |
| Full regression and builds | Completed and verified locally | 128 unit/API passes, one live Redis skip; all 44 normal, one development and two production-preview PWA browser checks pass. TypeScript, lint and both builds pass. GitHub CI runs and is inspected after push |
| Manufacturer fidelity / maximum tire envelope | Partially implemented | Exact proprietary sections, mounted tire profiles, dimensional evidence and graphics rights remain dependencies |

The repeated 39-kit nominal-width stress audit still reports 14 failing kits: LA S/M/L at 32 mm (rear tire/seat tube, S also front crown), Magnum XS–XL at 35 mm (rear tire/seat tube), Prism 47–62 at 38 mm (both rear chainstays, 60/62 also seat tube). It assumes section height equals width; actual mounted tire profiles and proprietary sections are required. No tire is silently reduced and no manufacturer clearance value is rewritten. The negative Magnum regression remains active. A successful 25 mm baseline does not prove every nominal maximum fits.

## Original-renderer visual evidence

The same named whole-bike and structural views were compared with the previous [precision-assembly baseline](precision-assembly.md#final-visual-evidence). Closeups intentionally crop unrelated parts and retain the existing subtle inspection highlight; they are not full-bike framing examples. All normal views include the saddle, bars, tires and pedals.

- Four-family matrices: [Cinelli](../design/final-fork-interfaces/cinelli-gallery.png), [8bar](../design/final-fork-interfaces/8bar-gallery.png), [Skream](../design/final-fork-interfaces/skream-gallery.png), [Dosnoventa](../design/final-fork-interfaces/dosnoventa-gallery.png).
- [Crown](../design/final-fork-interfaces/cinelli-crown.png), [right fork end](../design/final-fork-interfaces/cinelli-front-dropout.png), [left fork end](../design/final-fork-interfaces/cinelli-front-dropout-left.png), [rear track end](../design/final-fork-interfaces/cinelli-rear-dropout.png), [8bar rear plate](../design/final-fork-interfaces/8bar-rear-dropout.png).
- [Front hub/axle](../design/final-fork-interfaces/cinelli-front-hub.png), [rear hub/axle](../design/final-fork-interfaces/cinelli-rear-hub.png), [375×812 mobile](../design/final-fork-interfaces/mobile.png).

Business policy, authentication, saved builds, colorways, component finishes, spoke selections, lazy viewing, transitions and the local-only development hold remain in force. No deployment, release or Atlas cleanup is part of this task.

## Regression found during acceptance

The first complete browser run passed 43/44 and exposed an actual exported-asset morph regression. Independent vertex welding split the collar and front-lug normals differently between sizes; the viewer correctly refused the mismatched indices and used replacement instead of size morphing. Procedural-mesh tests alone could not detect that artifact difference. The exporter now preserves the original correspondence and removes only unused UV buffers, staying within the existing budget. A new regression loads every exported size through GLTFLoader and passes those actual meshes to the production morph validator across all supported families. It passes, as does the previously failing browser workflow. The final clean normal run passes all 44 checks in 6.3 minutes; the development check and both PWA checks also pass.

Production contains no development geometry controls/overlay strings. Existing lazy-3D bundle-size and upstream Three.js deprecation warnings remain. Live Redis is skipped locally and provided by the GitHub workflow. These software checks do not supply missing manufacturer dimensions or resolve the 14 nominal-envelope stress cases.
