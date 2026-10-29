# Builder polish and controlled component finishes · 29 October 2026

## Audit

Baseline `d7d5ad6` preserves source-backed frame colorways, 39 original frame/fork kits and four bar profiles. The [new brief](../requirements/builder-polish.md) adds controlled non-frame finishes and corrects seating validation. Existing visual evidence is in the [colorway review](colorways.md) and [geometry review](modeling-corrections.md).

Observed gaps: component WebGL constructors hard-code materials; SVG components share one dark metal gradient, so the catalog variant color does not change most visible component finishes. Drivetrain and cockpit parts share materials that must be separated before independent finish updates. The saddle's bundled `seatpost` field participates in a hard frame-diameter check; changing a saddle can therefore require an unrelated seatpost replacement. The drawn post also prefers the saddle field over the frame. Current shell/rails exist, but padding, clamp hardware, rim edges, crank/spider detailing and SVG shading still need close-up refinement. Mobile finish cards occupy a short scroll region above the fixed Done action.

## Implementation decisions

- Keep the six component slots and existing variant IDs. Store optional appearance overrides inside the signed/saved canonical configuration, with backward-compatible absence preserving old appearances. Do not put cosmetic keys through geometry iteration or compatibility comparisons.
- Controlled zones: wheelset as one rim/spoke/hub finish, crank arms/spider, chainring, handlebar, stem/spacers and seatpost. Offer Polished and Pure Black for authored demos. Brand Color requires an explicit product/variant finish registration and source; unsupported products receive no invented branded choice. Manufacturer frames keep their current sourced colorway records.
- Finish mutation uses existing backend workspace authorization, validation, idempotency and business quotas. Persist overrides through save/reopen/duplicate/share/export and full-configuration undo/redo. Unsupported overrides are rejected; changing a product removes overrides it cannot support.
- Saddle shape/product selection is independent of frame post diameter. The illustrated post follows the selected frame's documented diameter, with an explicit schematic fallback when unknown. Only a documented rail/clamp conflict can block the seating selection; an abstracted interface is generally compatible without claiming measured physical fit.
- Reuse owned physical materials and loaded geometry during cosmetic changes. Keep tires, chain, tape/grips and saddle padding on appropriate rubber/fabric finishes. Improve component detailing and matching SVG silhouettes using existing anchors.

## Phase status

| Phase | Status | Required verification |
| --- | --- | --- |
| Audit and scope | Complete | Existing code, actual colorway/angle captures and current validation inspected |
| Canonical finishes and saddle validation | Pending | Domain/API security, legacy saves, real interface conflicts and persistence |
| Shared SVG/WebGL finish controls | Pending | All six zones, material reuse, undo/redo and unsupported brand options |
| Geometry and visual refinement | Pending | Wheels, crank, saddle, all bars and remaining hardware, major angles/close-ups |
| Regression and responsive review | Pending | Full checks, isolated browser suites, light/dark/mobile evidence and CI |

No deployment, new hosting, manufacturer asset permissions or advanced independent-part system is authorized. Exact manufacturer surfaces, missing graphics, source conflicts and physical-device/accessibility limitations remain documented rather than being hidden by polish.
