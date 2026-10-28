# Frameset source and rendering review · 27 October 2026

This release adds product identification and dimensional planning, not authentic manufacturer models or a verified complete assembly. Official facts were checked against these pages. No photographs, logos, proprietary SVG/GLB files or retailer prices were imported.

| Record | Published variant scope | Official source | Important limits |
| --- | --- | --- | --- |
| Cinelli Vigorelli | XS/S/M/L/XL, Rainbow | [Americas product and per-size geometry](https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame) | Rainbow graphics are not reproduced: neutral approximate color. Dedicated aero seatpost interface is recorded; round demo seatpost fit remains unverified. Only the reviewed finish is offered. |
| Dosnoventa 02 LA | S/M/L, Jet Black Gloss | [Official LA page](https://dosnoventabikes.com/frames/los-angeles/los-angeles-jet-black-frame/) | Listed stack/reach, seat/head angles, chainstay, BB drop, seat/head tube lengths and clearance inform anchors. Wheelbase is derived, not a published dimension. |
| Dosnoventa 03 DET | S/M/L, Jet Black Gloss | [Official DET page](https://dosnoventabikes.com/frames/detroit/detroit-frame-true-silver-5/) | The URL contains an old silver slug; the current page explicitly lists Jet Black Gloss. Use current page facts. Its lower stack and different reach change the assembly. |
| Dosnoventa 01 BCN | S/M/L, Fighter Blue Matt | [Official BCN page](https://dosnoventabikes.com/frames/barcelona/dosnoventa01-bcn-fighter-blue-frameset/) | Source publishes seat/head tube lengths, angles, top tube, chainstay and BB drop, but no stack/reach. Those preview anchors and fork rake use illustrative defaults and are not stored as manufacturer facts. The listed fork maximum differs from frame clearance: keep the smaller 28 mm frame limit. |
| Cinelli Vigorelli Steel | M research record, **draft** | [Official Steel page](https://usa.cinelli-milano.com/products/vigorelli-steel-frame-kit) | Its 31.6 mm seatpost conflicts with the current 27.2 mm demo seating assembly. Full size/geometry and seating support need review. Do not publish a variant that cannot be assembled with the supported catalog. |

Finish hex values are approximate preview colors, not manufacturer color codes. Source publication does not establish current stock, a model year, permission to redistribute images, or compatibility of an entire bicycle. Missing axle, hub, cockpit, chainline and other interface facts remain missing and produce unresolved compatibility checks.

## Catalog and import

Brands have stable MongoDB IDs. Products have stable IDs and each size/finish combination has a distinct variant ID. Product records retain an official URL, review timestamp, reviewed field names and explicit rendering limitations. Demo records remain identified separately and can be hidden in the inspector. There are not yet real replacements for all demo component categories, so the starter remains a neutral illustrative bicycle; production catalog curation remains unfinished.

`npm run seed` and normal API startup use the same idempotent importer. It inserts missing records and only upgrades the exact known old Cinelli draft placeholder. It retains existing reviewed, modified and archived records. It never deletes catalog or build data. Local development targets only the configured `tracklab_dev` database. Existing saved variant IDs and catalog snapshots remain supported.

## Independent rendering assets

`tracklab-parametric-v2` is independently authored procedural geometry, dedicated under CC0-1.0 for these new visual assets. This does not license manufacturer trademarks, photographs or product data compilations. No manufacturer's 3D model is included. The registry records units, orientation, anchors, scale, visual variants, source, license and verification state; assembly calculations provide bounds and anchor positions for each selected variant. The GLB reference is explicitly null for this procedural asset.

Both SVG and Three.js use the same frame-derived anchor function. Known measurements change component positions; remaining tube, fork, cockpit and saddle profiles are schematic. SVG uses a complete-assembly viewBox with uniform aspect fitting. Three.js fits an actual Box3 against camera aspect and field of view on frame changes, resize and reset. Existing schematic GLBs remain in the repository as historical assets; the active assembly now uses procedural geometry to keep attachment points aligned across frame sizes.

Authentic branded geometry, finish graphics and manufacturer-supplied models remain unavailable. The viewer and catalog disclose this explicitly. No branding is painted onto the independent geometry.

## Asset-loading upgrade · 28 October 2026

The procedural registry above remains the shared geometry fallback. Published manufacturer variants now also register 14 independent, texture-free illustrative GLBs, generated from those same anchors. Each size/finish loads its own file; these files do not establish authentic tube profiles or finish graphics. See [production contract and Blender workflow](3d-production.md). The importer can attach this reviewed rendering metadata to matching published specifications without replacing technical records, archived entries or saved configurations.
