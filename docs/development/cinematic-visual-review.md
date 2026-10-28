# Cinematic presentation review · 28 October 2026

This is an application milestone, not an authentic manufacturer asset delivery or production release. The source brief is [archived here](../requirements/cinematic-studio.md); baseline issues and rendering measurements are in [the audit](cinematic-audit.md).

## Reference and browser method

The generated references in `docs/design/` guide composition, density, hierarchy and motion. Actual manufacturer records, verified dimensions, variants, access policy and visualization fidelity override generated content. Original renderer captures are shipped as lightweight landing artwork; generated photographic-looking bicycles are not represented as real product assets.

No browser-control connector was available. Used the Playwright skill's terminal fallback, installed Chrome, temporary MongoDB and the isolated 4010/5190 server. Functional checks include 320/375/430/768/1024/1366/1440/1920 widths, both themes, portrait and landscape; camera fitting also has numeric portrait/landscape projection tests. Native dialogs retain focus/Escape/scroll cleanup. Reduced motion removes scene travel and turntable while retaining presets and selection controls.

| Reference | Native image size | Review target |
| --- | --- | --- |
| `cinematic-builder-reference.png` | 1504×1046 | Desktop studio at matching CSS viewport |
| `cinematic-home-reference.png` | 1586×992 | Hero at matching CSS viewport and full-page continuation |
| `cinematic-landing-details-reference.png` | 1505×1045 | Downstream studio/features and garage section |
| `cinematic-garage-reference.png` | 1505×1045 | Saved collection at matching CSS viewport |
| `cinematic-forms-reference.png` | 1374×1145 | Account and authentication states |
| `cinematic-mobile-reference.png` | 853×1844 | Phone-shaped raster reference; check matching aspect at 375×812 and functional 320×568/430×932. Its pixel width is not a phone CSS breakpoint. |

## Fidelity ledger

| Comparison | Reference evidence | Implementation and decision |
| --- | --- | --- |
| Hero hierarchy and copy | Large two-line headline, paired actions and bicycle-led composition | Requested “Build Beyond the Ordinary.”, supplied studio description, Start building and Explore framesets. Enlarged typography and cropped the original render within safe margins; no text or controls baked into artwork. |
| Palette and surfaces | Graphite, titanium, electric blue, restrained borders | Existing semantic theme values retained in both themes. Added 10px surfaces and subtle hover elevation. Dark-mode blue buttons keep dark foreground for measured contrast rather than copying low-contrast generated white text. |
| Bicycle presentation | Photographic-looking black bicycle and textured floor | Intentionally use the actual original geometry and matte studio floor. Repaired an initially harsh floor horizon, removed captured toolbar overlays and reduced selection emission so graphite/black finishes remain legible. Exact tube sections, graphics, chain detail and authentic surface models remain external modeling dependencies. |
| Builder structure | Three regions, dominant bicycle and compact bottom dock | Retained functional rail, inspector, summary and canonical configuration. Seven camera presets, environment/quality and optional turntable use native controls. Extra source/fidelity notices and real development/policy text are retained; incorrect generated “Fidelity: High” and invented variants are excluded. |
| Mobile | Preview, compact controls, category access and concise summary | Two-row controls with 44px touch targets and a taller 3D preview; native parts sheet remains keyboard accessible and internally scrollable. Brief landscape entrance overflow was repaired by using opacity-only sheet entry. Camera/environment labels use concise visible wording, with full camera names available to accessibility APIs. |
| Downstream sections | Light/Dark studio comparison, how-it-works and garage invitation | One switchable environment panel replaces the two simultaneous reference panels, keeping the existing how-it-works content readable and the mobile continuation compact. Includes an explicit builder link, data-backed manufacturer links and frame shelf, original SVG example and Open my garage. No fake user collection or automatic homepage WebGL download. |
| Garage | Consistent collection previews and compact actions | Actual saved name, frameset/variant, date, compatibility and public/private text. Lightweight canonical SVGs, ownership-protected actions and real empty/full/error states remain. |
| Forms | Sidebar sections, calm forms, visible password controls | Profile/Security/Access anchors, grouped forms, visibility toggles, native validation and real save feedback. Retained established application headings and API-backed benefits instead of generated filler. |
| Admin | Consistent panels and scannable maintenance | Collapsible policy/research/asset areas, selected record state, source review and bounded JSON editor. Technical details stay in the administration workflow. |
| Motion and icons | Restrained entrance/hover, predictable controls | Central CSS durations/easing; R3F camera/material motion; native Web Animations exit using the fast token. Existing Lucide metaphors retained. No tilt, bloom stack or extra animation library. |

Above-the-fold copy comparison: headline, supporting sentence and primary CTA pair follow the audit's approved list. Existing navigation labels remain Builder / Parts catalog / My garage / Sign in. Intentional additions/retentions: “No account needed to explore,” original-illustration disclosure, actual temporary-server development notice and data-backed manufacturer names. Generated decorative tagline, wide-tracked replacement wordmark and claims of high or official fidelity are excluded. Account wording remains the established working copy, not a new marketing promise.

## Final screenshot comparison

Inspected the reference and latest screenshots with `view_image`, including [native desktop landing](../design/cinematic-home-after.png), [desktop studio](../design/cinematic-after-studio.png), [phone landing](../design/cinematic-home-mobile-after.png) and [phone studio](../design/cinematic-mobile-after.png). Account/auth, catalog, garage and admin were inspected at their reference sizes using private temporary browser captures; those runtime images and fixture credentials are excluded from Git. Final captures use settled/reduced-motion states so opening transitions do not masquerade as transparent panels.

Computed desktop hero typography was 84px/87.36px at weight 650, body 18px/29.7px, CTA 14px/21px and caption 12px/18px. Native-size comparison covered the copy, composition, typography, palette, imagery, spacing, icons and responsive/motion points above. Repaired the horizon seam, captured toolbar overlay, overly blue selection, clipped mobile control names, narrow profile inputs and landscape sheet entrance. Core landing → filtered catalog → builder → sign-in/save → garage/account/admin interactions were exercised against actual API behavior.

The application presentation and interactions were verified against the references within the deliberate differences in this ledger. No clipped primary content or unresolved actionable visual mismatch remained in the inspected states. This is not a claim that the original illustrative meshes match the generated photographic concept or a licensed manufacturer surface.

## Scope and remaining acceptance

| Brief phases | Status |
| --- | --- |
| 1–2: audit and presentation system | Implemented; visual review and evidence recorded |
| 3–7: studio, motion, mode switching and workspace | Implemented application behavior; physical-device/assistive-technology review remains |
| 8: landing | Implemented with original static renders and working progressive navigation; no forced WebGL |
| 9: authentic branded presentation | Illustrative geometry retained honestly. Licensed surfaces/graphics and missing source geometry are still required |
| 10–12: garage, auth/account and responsive layout | Implemented; browser checks cover core workflows and required width range |
| 13–14: optimization and motion architecture | Demand rendering, instancing, quality budgets and cache/material cleanup implemented. Hardware FPS/thermal and controlled GPU benchmarks remain open |
| 15–16: architecture and preservation | Existing app/API/domain structure, six component categories and backend authorization/policy retained. No backend changes in this presentation task |
| 17–18: verification and priorities | Executed checks recorded in the roadmap. Deployment remains held; the individual-part expansion remains postponed |

Physical mobile touch/pinch, full screen-reader review, sustained hardware FPS, production SMTP and authentic permitted models are not certified by desktop Chromium. No 60FPS or exact manufacturing-geometry claim is made.
