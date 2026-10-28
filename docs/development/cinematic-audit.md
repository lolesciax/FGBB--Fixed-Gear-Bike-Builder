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
