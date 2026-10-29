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
| 2 Coordinator | Pending | Explicit phases, latest request wins, failure/cancellation/cleanup |
| 3 Camera/inspection | Pending | Smooth bounded navigation, focused parts, reset and keyboard/touch controls |
| 4 Frameset strategies | Pending | Validated same-template morph, construction replacement, exact endpoints |
| 5 Component transitions | Pending | Actual wheel/spoke/bar/seating/drivetrain replacement, stable unrelated parts |
| 6 Materials | Pending | Interrupted paint/PBR transitions, no unrelated recoloring or remeshing |
| 7 Studio | Pending | Light/dark transitions and appropriate finite effects |
| 8 Builder controls | Pending | Clear lifecycle feedback, coherent cards, responsive/accessibility checks |
| 9 Landing | Pending | Lightweight source-based product presentation and immediate CTA |
| 10 Renderer modes | Pending | One canvas, no blank flash, preserved configuration and practical camera state |
| 11 Performance | Pending | Idle work, repeated switching, memory/request/frame measurements |
| 12 Acceptance | Pending | Static/unit/API/browser/build, real motion captures and CI |
