# Cinematic studio audit and implementation reference · 28 October 2026

Baseline: `bbc9d91`. Browser inspection used isolated Chromium at 5190 with temporary MongoDB, including landing, catalog, builder/3D, account and admin. Atlas was not used for browser regression work. The existing three-region builder and compact summary are retained.

## Observed issues

- Camera presets and fit write the camera position immediately. Four views exist; rear quarter/top/default studio, motion preferences and turntable controls are absent.
- Fixed ambient/directional illumination and uniform roughness flatten graphite paint. Contact shadows are barely visible. There is no independent light/dark studio or graphics setting.
- GLBs are lazy and cached, but a new Suspense load can temporarily hide the assembly. Selection has no visible 3D highlight. The many separately drawn cylindrical spokes are a draw-call opportunity.
- The homepage is a lightweight SVG composition with basic downstream sections. Secondary pages use the shared palette but need consistent surface, hierarchy and feedback refinement. Auth has no password-visibility control.
- Native dialogs already support focus/Escape and the mobile sheet measures available height. Preserve these behaviors while adding motion. Current idle rendering is demand-driven and should remain so.

## Approved implementation direction

Use the six `docs/design/cinematic-*-reference.png` concepts for composition, density, typography and restrained lighting. They cover desktop/mobile builder, hero/downstream landing, collection and forms. Existing API facts take precedence over generated concept content: incorrect concept size/finish labels and “High” fidelity are excluded. Generated photographic-looking bicycles and invented fixture builds are reference material only, never manufacturer assets or real user data.

- Keep Inter, existing graphite/titanium/off-white/blue semantic tokens and both themes. Refine 10px panel corners, thin borders, subtle elevation, compact native controls and visible focus. No green identity, decorative badges, neon or heavy blur.
- Use CSS motion tokens for UI feedback and R3F frame updates for camera/material motion; no overlapping animation libraries. Fast 140ms, normal 220ms, panel 300ms and camera around 650ms, with reduced-motion alternatives.
- Studio controls: Camera, Environment, Graphics quality, Turntable and Reset. Provide side/front/rear/front-quarter/rear-quarter/top/studio views. Pause turntable on manipulation, selection, hidden tabs and reduced motion.
- Preserve one canonical configuration, six current component categories, source geometry, assets, saved IDs, API authorization, quota policy and the already approved local development bypass. The fully modular individual-part system remains postponed.
- Landing copy: “Build Beyond the Ordinary.”; “Explore fixed-gear framesets. Shape your setup. See every angle in one considered studio.”; Start building; Explore framesets; “One configuration. Every angle.”; Open the studio; “Keep the good ideas.”; Open my garage. Brand names and access copy remain data-driven. Use actual renderer captures/lightweight SVG, with no automatic homepage GLB download.

## Verification plan and practical limits

Test all studio settings, smooth camera/fit, turntable pause, reduced motion, model cache/loading/failure, selection, finish/configuration retention, native dialogs, authentication, garage/account/admin flows, responsive layouts and both policy modes. Compare concepts with actual screenshots at native desktop/mobile sizes and record concrete fidelity differences. Measure browser timing, renderer calls/triangles and idle behavior where available; software Chromium is not a physical-device FPS certification.

Authentic manufacturer surface models, exact tube surveys, licensed graphics and Blender artist refinement are still external dependencies. This work improves the presentation of accurately labeled illustrative geometry and does not upgrade its fidelity claim.

## Studio implementation and measured evidence

Seven presets now fit the actual assembly bounds and move around the target using a shortest-angle spherical path. Orbit damping, bounded zoom and reset remain available. Initial entry has a short 8% dolly and restrained reveal. Turntable uses elapsed time, starts only by request and stops on manipulation, category/part selection, view changes, hidden tabs or reduced motion. Per-part emissive feedback restores the original material state. Paint transitions invalidate only while changing.

Light/Dark use neutral key/fill/rim lighting, an original locally generated softbox environment, a seamless matte presentation floor and finite-frame contact shadows. No external HDR request or new animation dependency is introduced. Performance omits the environment/contact pass; Balanced and Quality increase reflection/shadow resolution and pixel-ratio budgets. Auto also watches active frame times; manual quality is authoritative. Geometry and shared GLB caches are retained; per-instance material clones are disposed.

Replacement GLBs warm the shared cache outside the current canvas assembly. The prior model stays visible with a loading status until the requested kit is ready. Failure keeps the exact selected configuration in SVG and offers retry. Mode entry uses the exact selected SVG while WebGL initializes. Renderer fidelity remains illustrative.

Instrumentation in isolated software Chromium at 1440×1000 observed zero draw calls during a settled 1.2-second idle window before and after. Original spokes required 56 meshes; the two instanced wheel meshes remove 54 regular draw submissions. Baseline sampled 179 calls in its active RAF, including its repeated shadow work; the new scene sampled 35 in steady active RAFs with separate setup/shadow bursts. These are observations of different scene pipelines, not a like-for-like GPU or FPS benchmark. Heap snapshots were approximately 57.6MB before and 56.5MB after, with no claim of a controlled memory improvement. Startup observations include a deliberate wait and are not pure load latency. Physical mobile GPU, thermal, sustained 60FPS and assistive-technology review remain open.
