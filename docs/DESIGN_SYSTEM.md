# TrackLab design system

## Direction

Premium industrial cycling configurator: graphite, titanium, neutral off-white and electric blue. Technical and restrained, with clear mechanical geometry, compact workspace chrome and readable product information. Avoid portfolio-style decorative sections, generic dashboard styling, green brand accents, neon glow and excessive animation.

This document specifies the new direction. The existing green concept in `docs/design/builder-concept.png` is historical and is superseded for new visual work. Implementation status belongs in the roadmap.

## Semantic tokens

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#F5F6F8` | `#101319` |
| Surface | `#FFFFFF` | `#1B2029` |
| Elevated surface | `#EDEFF3` | `#252C37` |
| Primary | `#3659DB` | `#6684FF` |
| Primary text | `#171C26` | `#F5F6FA` |
| Secondary text | `#596373` | `#A5AEBD` |
| Border | `#DCE1E8` | `#343C49` |

Use dark text on the lighter dark-mode blue button fill, and white text on the light-mode primary fill, subject to measured contrast. Do not assume that white text on every blue passes AA. Success green and warning/danger colors are semantic and must include a text/icon cue.

Centralize tokens in CSS variables and expose semantic Tailwind colors. Components consume tokens instead of adding local brand hex values. Bicycle paint/material colors remain catalog data and are separate from interface tokens.

## Typography and controls

- Body text: readable sans-serif, normally 16px with a 1.5 line height.
- Controls and product descriptions: normally 14px or larger; metadata at least 12px.
- Use a limited heading scale, clear weight hierarchy and restrained tracking. Do not shrink labels to fit a broken layout.
- Primary buttons: electric blue, clear verb, consistent height and visible hover/focus/disabled/loading states.
- Icon controls: meaningful accessible name, 18–22px icons, touch-friendly hit areas, visible focus rings.
- Inputs: persistent labels, appropriate autocomplete, clear focus/error states and associated helper/error descriptions.
- Panels/cards: compact but readable, consistent padding, subtle borders, limited elevation. Avoid oversized empty containers and decorative nested cards.

## Workspace

Desktop: compact category rail, dominant centered bike canvas, component inspector, concise summary. Keep view controls visible and prevent frame/wheel clipping. Tablet: adapt to two primary regions and collapsible controls. Mobile: compact header/build actions, visible preview, category access, accessible parts sheet, concise summary and real quota information.

The mobile sheet must close via an explicit action and Escape, return focus to its trigger, contain keyboard focus, scroll internally, respect safe areas and the on-screen keyboard, and avoid stealing orbit/pan gestures from the preview.

## Cross-page rules

Keep navigation, form controls, dialogs, catalog rows, garage cards, settings and admin tables in one system. Landing content must explain the interactive configurator immediately, with Start Building and Explore Components actions. Never use invented manufacturer claims or prices as visual filler.

Preserve light/dark preferences. Check contrast, focus, reduced motion, long labels, mobile landscape and all required viewport widths. Design changes must be accompanied by functional regression evidence.

## Primary implementation references

- [Desktop graphite workspace](design/builder-graphite-desktop.png), generated with the built-in Image Gen tool as a full primary-screen reference.
- [Light mobile workspace and parts sheet](design/builder-blue-mobile.png), generated as a fresh responsive-state reference in the same system.
- Allowed primary copy: TrackLab; Builder; Parts catalog; My garage; Sign in; Bike Builder; One configuration. Every detail.; Build name; Untitled build; Save build; Illustrative assembly; Frameset; Wheels; Tires; Cockpit; Drivetrain; Seating; Choose parts; Done; Selected parts; Gear ratio; Compatibility; Needs verification. Product names, variants, specifications and usage values must come from actual state/API data.
- Use the existing functional SVG/GLB renderers, not a raster mockup. The generated photographic-looking bicycle is a composition reference, not an authentic product asset.
- Data corrections take precedence over generated artwork: keep the five actual catalog finish options (no invented patterned finish), show all actually selected parts (not generated “Not selected” rows), retain the true quota/reset state, and keep unsupported component categories documented rather than inertly pretending they work.
- Geometry/paint colors are product content; the default demonstration will be neutral graphite. Keep live catalog and permission disclosures rather than invented manufacturer imagery.
