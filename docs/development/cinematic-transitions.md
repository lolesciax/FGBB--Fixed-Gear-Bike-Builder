# Cinematic transitions · 29 October 2026

Baseline `47fabb1`, following the [new brief](../requirements/cinematic-transitions.md). This extends the working graphite/electric-blue studio; no new catalog architecture, database schema, hosting or animation dependency is required. The roadmap remains the canonical status record.

## Audit

Installed stack: React 19.3.1, Three r186.1, R3F 9.8.2, Drei 10.7.9 and TypeScript 6. The current studio already preloads GLBs, retains the previous model while loading, owns cloned materials, fits every assembly vertex/instance, uses demand rendering, supports eight eased camera presets, a paused-on-interaction turntable, PBR paint/finish interpolation, procedural softboxes, finite contact shadows and device/runtime quality selection. Reuse these rather than adding a motion library.

Real gaps: asset readiness is a callback rather than an explicit cancellable lifecycle; replacement geometry switches immediately; there is no validated morph correspondence, component focus, bounded pan or transition cancellation. Camera, material and lighting activity have separate scheduling. Environment changes jump. Mode changes unmount the canvas and lose manual camera placement. Landing imagery is static and disconnected from the current source geometry. Existing geometry, finish, backend and persistence behavior are acceptance constraints.

Baseline private screenshots/video were captured before implementation at 1440×1000 and 375×812, including landing, builder and a size change. No page errors. Balanced default scene: 143 draw calls, 190,738 triangles, 139 geometries, four textures. Over a one-second sample after settling, idle rendered zero frames; a camera journey rendered 118 frames. These are host/browser observations, not device FPS guarantees. Existing demand rendering already works and must remain idle after new effects settle.

## Strategy boundaries

- Geometry morphing is allowed only for reviewed same-family procedural size changes with the same finish, renderer revision, component selections and validated mesh/instance correspondence. Intermediate poses are presentation effects, never products or saved configurations. Unrelated manufacturer meshes are never paired by vertex count alone.
- Different construction/topology, artwork changes or failed correspondence use a short controlled replacement. Spoke counts remain integer registered builds and bar types use replacement.
- Paint-only changes retain geometry and animate only owned material properties. All final endpoints use the canonical selected configuration.
- Leader/Tsunami examples remain unavailable where their catalog records are draft. This brief does not supply missing geometry or publication evidence. Tests must verify those boundaries instead of publishing them for animation demonstrations.
- Inspection focuses/highlights the existing assemblies and exposes their existing technical details. It does not invent compatible fork products, independent purchasing slots or fit claims. Temporary presentation state is never persisted.

## Stages

| Stage | Status | Evidence required |
| --- | --- | --- |
| 1 Audit/baseline | Complete | Source behavior, private captures and idle/render counters reviewed |
| 2 Coordinator | Verified locally | Explicit phases, request identities, stale-load rejection, skip/failure/cleanup tested |
| 3 Camera/inspection | Verified locally | One camera controller, bounded pan/zoom, actual assembly focus, technical details, reset and button navigation |
| 4 Frameset strategies | Verified locally | Live GPU same-family size morph, topology validation, construction replacement and exact endpoint restoration |
| 5 Component transitions | Verified locally | Slot-specific controlled replacement; real integer spokes, stable unrelated groups and final target geometry |
| 6 Materials | Verified locally | Finite 350ms paint/PBR interpolation, interruption continuity, exact endpoints and no unrelated recoloring/remeshing |
| 7 Studio | Verified locally | Finite 450ms light/dark changes; reused PMREM texture and contact-shadow resources |
| 8 Builder controls | Verified locally | Lifecycle feedback, registered spoke selector, 44px controls and mobile inspection/focus restoration |
| 9 Landing | Verified locally | Four live source-based SVG studies, immediate CTA, two restrained section reveals, no initial 3D download |
| 10 Renderer modes | Verified locally | One retained canvas, paused hidden rendering, manual camera retained at an unchanged viewport and grant expiry cleanup |
| 11 Performance | Verified locally | Four collected-heap/GPU cycles, two reused downloads, zero idle frames and desktop/mobile-viewport timings |
| 12 Acceptance | Verified locally; CI on push | TypeScript/lint, 111 local unit/API tests, all 42 normal browser scenarios across full/focused runs, development/PWA checks, builds and 19 reviewed captures |

## Core presentation milestone

The presentation coordinator owns preparing, loading-assets, transitioning, settling, completed, cancelled and failed phases. Asset readiness is bound to a request identity and its exact accepted configuration. Obsolete jobs cannot commit a later selection. Pending loads retain the previous bicycle; failures retain a working scene or the selected SVG with an operable retry. Skipping an animation applies the latest accepted endpoint and releases temporary resources. Selection, persistence and quota requests remain in the existing backend workflow.

Same-family `frame-kit-v4` size changes with unchanged parts/paint and no artwork may use morphing. The complete mesh/index/group/normal/instance correspondence is validated before any mutation. Only differing surfaces receive private morph buffers; unchanged geometry uses rigid placement and instances keep integer counts. Any failed correspondence falls back to replacement. Different constructions, spokes and bar types use a controlled slot reveal without scale distortion or duplicate bicycles. Intermediate shapes are explicitly presentation effects. Original cached GLB geometry is never modified. This follows Three's [immutable rendered morph-buffer requirement](https://threejs.org/docs/pages/BufferGeometry.html) and [mesh morph-target API](https://threejs.org/docs/pages/Mesh.html).

Camera ownership remains in StudioCamera: eased presets, bounded pan/zoom, final fit after model settling and interruption by direct manipulation. Inspection focuses the actual frameset/fork/wheel/crank/cockpit/seating group, highlights owned materials and shows available specifications with unknown interfaces marked Needs Verification. Navigation buttons provide a non-drag alternative; Reset Assembly returns to the assembled full-bike composition. No exploded position or inspection state enters the configuration.

Checks: TypeScript/lint pass; 16 focused lifecycle/geometry/camera tests pass. Eight focused browser workflows passed across loading/retry, source asset reuse, presets/turntable, live morphs, construction/spoke replacement, stale loads, failed-target recovery, skip and inspection/quota preservation. The live Cinelli M→XL probe used 16 temporary buffers (183,672 bytes); morph textures returned from 20 to four after settling, the six assembly groups remained singular, the target had no remaining morph attributes and no page errors occurred. Cached source/target frame geometries remain resident for reuse. The audit push passed CI. Core push `6fb09ee` exposed a 36px mobile select and the combined geometry browser scenario exceeding its 45-second CI budget; the follow-up restores 44px controls and gives that multi-step scenario a 120-second budget. The previously failing scenarios pass locally; follow-up CI remains required.

## Materials, studio and retained modes

Paint zones and component PBR properties now stop invalidating at their exact target. Interrupted changes continue from the currently displayed value; newly owned materials start at the accepted appearance before drawing. Paint anchors follow validated morph poses and return to the exact target. A permitted artwork change uses replacement rather than stretching a graphic or treating it as an ordinary paint gradient. Existing region rules continue to keep tires, grips and saddle padding out of metal finishes.

Studio Light/Dark interpolate background, fog, floor, physical lights, exposure and environment intensity. The three-panel environment texture remains the same across palette changes; no new PMREM is allocated just for a theme switch. Contact-shadow targets remain owned, finite and refreshed after geometry settles. Performance tier omits those effects. No post-processing dependency was added.

The first authorized 3D visit prepares the studio behind the selected SVG. Subsequent mode changes crossfade over 220ms and reuse one canvas while the server grant is valid. Hidden/tab-inactive scenes use `frameloop=never`. Hidden dimensions retain the last active viewport, preventing the 2D toolbar's height change from resetting a manually orbited camera. Expiry or identity change releases the retained canvas; switching modes does not renew a grant. Camera/inspection state stays presentation-only.

The home hero uses the shared source-based SVG with four existing published families, selectable without changing a workspace or quota. Its technical disclosure remains visible. Two below-fold sections reveal once through IntersectionObserver; reduced motion removes the effects. The builder keeps its six categories, compact summary, contextual cards and backend selection workflow. Wheel cards expose their registered spoke selector and keep legacy/admin variants in Specifications instead of showing two competing primary selectors.

## Acceptance and measured limits

The verified story is a published selection accepted by the existing workspace API, presented by one coordinated viewer, then retained by history, saves and exports. Camera, inspection and intermediate morph poses never enter the saved configuration. The browser server uses a temporary MongoDB replica set on 4010/5190; the local Atlas-backed app is separate. Expected missing-asset/network failures are deliberately injected in recovery scenarios.

| Boundary | Local evidence |
| --- | --- |
| Static/source | TypeScript and lint pass; no new animation/rendering dependency |
| Domain/API/data | 111 tests pass, including isolated API, geometry, exact morph endpoints, correspondence rejection, finite interruption and artwork replacement; one live Redis test skips without local test Redis |
| Full browser regression | Initial full run: 40/42 pass. Fixed a cancelled reveal writing opacity after disposal; corrected the new offline test to keep the loading boundary active until its error. All eight affected morphology/transition/performance scenarios pass on rerun |
| Final finish/resource check | Both final normal-motion interrupted-finish/contrast and collected-heap/resource scenarios pass; TypeScript/lint and the web build pass again |
| Existing systems | Registration, quotas, grant expiry, compatibility, save/reload, garage, undo/redo, admin, SVG export, all spoke variants and all cockpit types pass their browser scenarios |
| Development policy | The isolated unlimited-development workflow passes; production authorization/policy stays enforced |
| PWA | Both production-preview workflows pass; no initial 3D download or cached API/account response |
| Build | Web and API builds pass; existing lazy 3D chunk warning remains |

The full browser run also checks ten source sizes at eight camera presets plus phone/tablet/landscape aspects, required UI widths/themes, contrast and overflow. The focused normal-motion tests check actual GPU morph attributes during a Cinelli Blue M→XL change, exact cleanup, skip, incompatible construction/spoke replacement, obsolete asset completion, unavailable assets, offline recovery, non-drag inspection/reset and unchanged camera-only usage. The disposal guard fixes the real overlap window between a new coordinator request and React installing its next presentation effect; an obsolete callback cannot dim a restored saddle or rewrite disposed morph state.

Measurements below come from the isolated local Chrome harness. `gl.info` reports counts, not driver VRAM bytes. Main-scene camera timing excludes shadow/softbox passes and includes long intervals; headless scheduling can exceed a physical display's refresh rate. It is not a measured physical-device FPS guarantee.

| Measurement | Observed result |
| --- | --- |
| First 3D preparation in development | 2.73s in the repeated-cycle test; 3.62s in the recorded 1440×1000 capture (includes lazy dev modules, asset fetch and preparation) |
| Morph budget | 920ms timeline, then eased final camera fit; selection-to-complete capture 1.74s; repeated selection-to-fully-settled samples 1.31–2.14s including API and camera work |
| Temporary morph data | 16 private geometries; 183,672 bytes of additional position/normal attributes, excluding clone/texture/driver overhead; textures 20 during → four after; no remaining morph attributes |
| Four M↔XL cycles after warming | 155 geometries, four textures, 12 programs at every settled sample; two total GLB requests and no subsequent downloads |
| Collected JavaScript heap | 131.21, 131.63, 131.92, 132.12 MB across four cycles; test rejects substantial retained growth |
| Idle and hidden | Zero render-counter increments over the settled 350ms sample; mode 2D uses `never` and preserves its frame counter |
| Desktop camera sample | Mean 5.00ms, p95 5.60ms between main-scene renders (about 200 renders/s in this harness) |
| 375×812 camera sample | Mean 5.16ms, p95 5.30ms, about 194 renders/s on the same desktop host, Auto/Performance; this is viewport emulation |
| Scene work | Cinelli/default wheels: 143 calls / 193,170 triangles; 8bar/deep 36/36: 147 calls / 189,674 triangles, reduced to 146 calls / 189,672 triangles without the shadow plane in Performance |
| Production output | Main 619.01 KB / 187.61 KB gzip; deferred 3D about 1,064.72 KB / 289.39 KB gzip; CSS about 94.9 KB; PWA precache 17.38 KiB |

The warmed two-asset plateau demonstrates repeated-switch cleanup, not a catalog-wide cache limit. Selecting previously unseen source kits intentionally adds their cached geometry; the final multi-brand capture reached 220 geometries/four textures and returned to zero temporary morphs. No GPU-byte measurement or physical mobile benchmark is claimed.

## Visual review

Nineteen final views were captured and inspected: source-derived landing studies, light/dark studio, side/front/rear/three-quarter cameras, intermediate size morph, construction replacement, Magnum→Ranger, 8bar, fork inspection, deep 36/36 polished wheels, final SVG, phone studio and phone inspection. They contain no page errors. Twelve curated images in [the evidence folder](../design/cinematic-transitions) show original TrackLab rendering; raw browser state, short recordings and numeric reports stay private under `output/playwright/cinematic-final`, `output/playwright/cinematic-baseline` and `.local`.

- [Light studio](../design/cinematic-transitions/studio-light.png), [dark studio](../design/cinematic-transitions/studio-dark.png), [front alignment](../design/cinematic-transitions/view-front.png).
- [Intermediate morph](../design/cinematic-transitions/size-morph.png), [fork inspection](../design/cinematic-transitions/inspection-fork.png), [8bar endpoint](../design/cinematic-transitions/source-krzberg-v8.png).
- [Deep polished wheels](../design/cinematic-transitions/deep-wheel-polished.png) and [their canonical SVG](../design/cinematic-transitions/plan-target.png).
- [Desktop landing](../design/cinematic-transitions/landing-desktop.png), [mobile landing](../design/cinematic-transitions/landing-mobile.png), [mobile studio](../design/cinematic-transitions/mobile-studio.png), [mobile inspection](../design/cinematic-transitions/mobile-inspection.png).

The review corrected an Inspect button inheriting white studio text on a light app control. Its unselected text now follows the app's tested text token; its selected state uses the existing blue treatment. Inspection intentionally crops unrelated assemblies while keeping its actual target visible; Reset Assembly restores the full bicycle. The mobile parts sheet can expand and scroll to its navigation controls.

## Remaining dependencies

Physical desktop/mobile GPUs, touch hardware, screen readers and broader browser engines require device verification. Exact proprietary surfaces, manufacturer-approved textures/decals and draft generation publication still need their existing measurement/provenance/rights review. Dosnoventa→Tsunami and Leader 725→735 are therefore not selectable test pairs. Supported incompatible families use replacement rather than invented morph correspondence. Optional exploded positions and the postponed individual-component purchasing overhaul are not introduced. No deployment, database schema change or external provisioning is part of this milestone. [GitHub checks](https://github.com/lolesciax/FGBB--Fixed-Gear-Bike-Builder/actions/workflows/ci.yml) run after the push; CI includes live Redis.
