# Colorway implementation review · 28 October 2026

## Audit and scope

Baseline `4185052`. The new [brief](../requirements/colorways.md) extends the completed geometry correction. The user confirmed no licensed graphics are supplied and authorized documented paint approximations with missing graphics flagged. Keep geometry, six canonical selections, backend policy and local-only development intact.

Current variants hold a single HEX swatch plus a finish string; the 39 GLBs identify size geometry. Runtime `useKitPaint` overwrites every paint material with the same color/roughness; forks are separate dark materials. SVG uses a global frame gradient and metallic fork. There is no versioned colorway record, region definition, finish-specific physical material or colorway publication gate. Product snapshots already exist, but current-catalog merging can override a saved variant's appearance. Admin JSON maintenance and private GLB/raster review uploads already work; extend them instead of making another product catalog.

The implementation will embed versioned model-specific colorways and exact size associations in existing Product records. Variant IDs remain the canonical selection. Materials and SVG regions will share definitions; same-size finishes will reuse geometry. Publication must validate source, scope, regions, assets and permissions. Referenced appearance revisions must remain immutable, including exports/garage/share previews. No custom paint editor or new component slots.

## Official research

Checked public manufacturer pages and product variant payloads on 28 October 2026. Images were inspected privately for paint distribution, not copied into public assets. HEX/PBR values will be explicitly approximate; source photos do not establish exact pigment, gloss measurement or permission to reproduce graphics. Availability is a dated listing, not live stock.

- [Cinelli Americas Vigorelli](https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame): the official variant payload lists 80s National Blu, Rainbow and Special White in XS/S/M/L/XL. No model year is inferred from image dates. Blue reference shows blue/cyan spatial variation; Rainbow is a dark frame with localized graphics, not a full-frame rainbow gradient; Special White is off-white with graphics. Those graphics remain missing. Geometry is the existing reviewed table; dedicated aero post and surface fidelity remain unresolved.
- Dosnoventa [LA Jet Black](https://dosnoventabikes.com/frames/los-angeles/los-angeles-jet-black-frame/) and [Traffic White](https://dosnoventabikes.com/frames/los-angeles/dosnoventa02-la-traffic-white-frameset/): named gloss black/matt white, S/M/L. The white page lists a different fork tire limit from the black page; do not silently overwrite existing technical data or assume every finish shares every specification.
- Dosnoventa [DET Jet Black](https://dosnoventabikes.com/frames/detroit/detroit-frame-true-silver-5/) and [Falcon](https://dosnoventabikes.com/frames/detroit/dosnoventa03-det-falcon-frameset/): gloss black/matt Falcon, S/M/L. Falcon L lists 590mm seat tube; Jet Black L lists 580mm. A colorway must not alias that differing geometry. Year/revision unspecified.
- Dosnoventa [BCN Fighter Blue](https://dosnoventabikes.com/frames/barcelona/dosnoventa01-bcn-fighter-blue-frameset/) and [Jet Black](https://dosnoventabikes.com/frames/barcelona/barcelona/): matt blue/gloss black, S/M/L. Keep steel fork, missing stack/reach and separate graphics review; do not borrow LA/DET artwork.
- Skream [Magnum Shade](https://skreambikes.com/products/magnum-shade-frameset), [Lagoon](https://skreambikes.com/products/magnum-lagoon-frameset), [Ranger Forest](https://skreambikes.com/products/ranger-forest-frameset) and [Sepia](https://skreambikes.com/products/ranger-sepia-frameset): official size payloads and geometry reviewed. Forest/Sepia show a two-tone lower-frame treatment and matching upper-color fork; no lettering is licensed. Paint-boundary placement is an explicitly approximate visual transcription. Magnum fork rake conflict remains unresolved.
- [Tsunami SNM100](https://tsunamibicycle.com/product-category/products/tsunami-snm100/) lists multiple named finishes, including Black and Magic Blue. SNM100 Elite is a separate carbon-fork revision. Exact geometry review remains incomplete, so these stay research/draft rather than pretending color metadata completes a selectable model.
- [Engine11 Crit-D Gun Metal](https://engine11bicycles.com/products/crit-d-gun-metal), [Blue Skin](https://engine11bicycles.com/products/copy-of-crit-d-pop-art), [Eggplant](https://engine11bicycles.com/products/crit-d-golden-chaos), and [Neon Charcoal](https://engine11bicycles.com/products/crit-d-metal-blue) are model-specific listings. URL slugs do not reliably match current names. Existing anchor gaps and artwork rights keep them in research/draft.
- [Leader 725 2021](https://www.leaderbikesusa.com/products/725-frame) lists five finishes; this is not evidence those finishes exist for the separate 2024 listing. Existing 2024 model records remain separate and incomplete. No revision-wide palette is inferred.

## Phase status

| Work | Status | Acceptance evidence |
| --- | --- | --- |
| Architecture and source audit | Complete | Existing code/snapshot/security paths inspected; official payloads and private paint references inspected |
| Versioned colorway records and backend validation | Not started | Exact model/size/revision relations, permission gates and safe import |
| Shared paint layers and physical materials | Not started | SVG/WebGL zone agreement, matching fork and preserved geometry |
| Selector and admin review | Not started | Accessible size → colorway choices, honest support, preview and publication feedback |
| Saved state and regression verification | Not started | Immutable appearance history, exports/garage/share, responsive visual evidence, tests/build/CI |

Licensed-authentic reproduction is not claimed. The practical milestone is documented paint approximation with missing graphics, as authorized. Future licensed assets must be prepared, reviewed and versioned; no per-selection generation service or hosting/storage provisioning.
