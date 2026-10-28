# How TrackLab produces 3D

The active viewer combines original component meshes with **14 separate illustrative GLB framesets**, one for each published size/finish variant. These are not licensed manufacturer replicas. Frame anchors use reviewed dimensions where present; tube sections, fork profiles, component shapes and finish graphics still include documented approximations. A sourced product name does not certify its visual accuracy.

## Reproducible assets now

```powershell
npm run assets:frames
npx vitest run tests/frame-kits.test.ts
```

The exporter reads `manufacturer-catalog.ts`, uses the shared `assemblyGeometry` function, creates original tubes/stays/forks, and writes:

- `apps/web/public/models/frames/<variant-id>.glb`: self-contained metre-scale glTF 2.0 binary, loaded only when a corresponding 3D view needs it.
- `<variant-id>.model.json`: source URL, input measurements, anchor positions, bounds and fidelity/license notes.
- `packages/domain/src/frame-assets.json`: validated catalog registration metadata.

There are no copied photographs, logos, textures or manufacturer model files in these assets. The original generated geometry is designated CC0-1.0; that does not license third-party graphics. Tests check the binary format, resource independence, size budget and actual exported head-anchor positions against each variant's geometry.

The importer attaches these references only to matching source/specification records. It preserves edited technical variants, archived products and saved configurations. Admin catalog review exposes source, variant, fidelity, asset path, units and license; backend validation prevents technical changes to variants already used in saved builds. Adding rendering metadata does not create a different selected product.

## Blender/CAD production for higher fidelity

1. Choose one exact model, revision, size and finish. Record the official dimensional source, reference date and the rights covering any supplied images, graphics or model files. Unknown revision/year and missing dimensions remain unverified.
2. Import its generated GLB into Blender as a dimensioned starting assembly. Save the editable `.blend` project outside public assets. Refine the actual tube sections, weld/joint shapes, fork crown/blades and attachment interfaces against measurements and permitted reference material. The current generated file is a starting point, not evidence of an authentic surface model.
3. Preserve the contract: metres, bottom-bracket origin, +X toward the front wheel, +Y up, +Z toward the drive side after glTF export, scale 1, rotation zero. Keep `anchor_bb`, `anchor_head`, `anchor_headBottom`, `anchor_seat`, `anchor_rear` and `anchor_front` empties. Name paint meshes with `paint_`; keep fork and hardware materials separate.
4. Use a glTF-compatible metallic/roughness material setup. Bake any permitted complex surface treatment into textures; do not assume arbitrary Blender shader nodes will export. Omit logos and graphics when permission is absent. Blender's [glTF export guide](https://docs.blender.org/manual/en/3.4/addons/import_export/scene_gltf2.html) explains supported material/export behavior.
5. Export `.glb`, then check dimensions, anchors, normals, component clearance, paint selection and all camera presets in the application. Start with modest mesh counts and 1K textures; higher resolutions, compression and LOD require device/performance evidence. Current texture-free frame kits are checked below 300 KB each and do not need a compression decoder.
6. Review licensing and fidelity before registering a replacement. The current runtime schema accepts the supplied **illustrative** kits; it does not let an editor assert that these files are officially licensed. Authentic or independently verified surface models need a separate evidence-backed review and contract update. Test 2D/3D state, missing-file fallback and old saved builds before publication.

Three.js loads registered files through the [glTF loader](https://threejs.org/docs/pages/GLTFLoader). The app assembles wheels, cockpit, drivetrain and seating at frame-derived anchors, uses studio lights/contact shadows, and offers side/front/rear/three-quarter views. Camera framing is recomputed from the assembled bounds and viewport aspect. The lightweight landing page uses SVG and does not download 3D assets.

## What remains unavailable

Blender was not available on PATH in this environment, so artist editing and Blender export were **not** executed here. No authentic brand models, approved decal sheets, exact tube-profile surveys or manufacturer-provided finish textures were supplied. Those remain asset-production dependencies. AI image generation was used for interface concepts, not to invent editable or accurate bicycle meshes.

Publicly delivered models cannot be made impossible to copy with a browser quota. Session grants limit the supported viewing experience; authentication, ownership, quota history and policy enforcement remain on the backend.
