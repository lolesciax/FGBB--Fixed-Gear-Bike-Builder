# TRACKLAB — EXPAND REAL FIXED-GEAR BRANDS AND MODEL SUPPORT
## Additional Requirements for Brand Authenticity and Repository Cleanup

Continue the existing TrackLab implementation and preserve all requirements from the previous Strict Brand Fidelity & Repository Restructuring prompt.

**MANDATORY: Expand the bicycle catalog beyond Cinelli and Dosnoventa. The additional brands must be integrated into the actual catalog, component selection system, compatibility engine, and model-specific 2D/3D visualization pipeline.**

Do not implement these brands merely as text labels.

---

# 1. REQUIRED BRAND CATALOG

Create or verify brand records for the following manufacturers.

## Priority 1 — Core fixed-gear brands

| Brand | Initial models to research |
|---|---|
| Cinelli | Vigorelli, Vigorelli Steel |
| Dosnoventa | 02 LA, 03 DET, 01 BCN, 05 TYO |
| Tsunami | SNM100, SNM100 Elite, SNM200 |
| Skream | Magnum, Ranger |
| Engine11 | Crit-D, Riven, Sprinter, Vortex |
| Leader | 721, 725, 735, EQNX |

## Priority 2 — Additional fixed-gear brands

| Brand | Initial models to research |
|---|---|
| State Bicycle Co. | 6061 Black Label v3, Undefeated Track, 4130 Fixed Gear |
| Wabi Cycles | Classic, Special, Lightning, Thunder, Prism |
| 8bar | KRZBERG V8, NEUKLN Steel V2 |
| Surly | Steamroller |

These are research targets, not a claim that every model has a complete supported asset set.

Verify each model's actual name, revision, size options, finish options, and technical data through the manufacturer's documentation.

Include additional fixed-gear manufacturers later through the same dynamic catalog system, without requiring another frontend rewrite.

**Do not create unrelated road, gravel, or mountain bike models unless their actual configurations are explicitly supported by the project's fixed-gear scope.**

---

# 2. OFFICIAL REFERENCE SOURCES

Research models using the following manufacturer websites.

- Cinelli: https://cinelli-milano.com/
- Dosnoventa: https://dosnoventabikes.com/
- Tsunami: https://tsunamibicycle.com/
- Skream: https://skreambikes.com/
- Engine11: https://engine11bicycles.com/
- Leader: https://www.leaderbikesusa.com/
- State Bicycle Co.: https://www.statebicycle.com/
- Wabi Cycles: https://wabicycles.com/
- 8bar: https://8bar-bikes.com/
- Surly: https://surlybikes.com/

Verify the current official domains, product pages, and model revisions before importing data.

Manufacturer websites may have different regional offerings. Do not merge incompatible specifications from different regional products, years, or variants.

Prefer official manufacturer geometry tables, product documentation, specifications, and permitted product photographs.

Store the source URL and verification date for every imported record.

---

# 3. STRICT BRAND-AUTHENTIC VISUALIZATION

Every supported model must have its own accurate rendering definition.

**The following shortcuts are strictly prohibited:**

1. Reusing the generic Studio Track frame for every brand while labeling it as a real model.
2. Changing only frame colors and calling the resulting bicycle a different model.
3. Applying another manufacturer's graphics or frame geometry.
4. Using arbitrary frame dimensions.
5. Using the same tube shape, fork, and frame proportions for different models without supporting evidence.
6. Claiming 3D model accuracy when only a generic mesh is used.
7. Displaying unrelated product images as authentic model thumbnails.
8. Presenting unverified manufacturer specifications as facts.
9. Treating a brand record as proof that its models are fully implemented.

## Model-specific visualization

For each frameset, research and implement supported differences in:

- Frame silhouette.
- Top tube geometry.
- Head tube geometry.
- Seat tube angle.
- Rear triangle geometry.
- Tube shape and thickness.
- Wheelbase.
- Chainstay length.
- Fork profile.
- Dropouts.
- Bottom bracket position.
- Seatpost interface.
- Documented frame finish.
- Permitted model-specific graphics.

Use verified technical data.

A model must not be labeled visually authentic merely because its geometry has been approximated.

Where accurate manufacturer geometry or necessary visual references are unavailable, mark the representation as approximate or unavailable.

---

# 4. BRAND-SPECIFIC MODEL REQUIREMENTS

## Tsunami

Support verified variants of the SNM100, SNM100 Elite, and SNM200.

Pay attention to documented differences in:

- Frame geometry.
- Tube profiles.
- Fork options.
- Frame size.
- Actual finishes.
- Frame/fork interfaces.

Do not make SNM100 and SNM200 identical by default.

## Skream

Support Magnum and Ranger.

The Ranger is a tracklocross-oriented frameset, so its verified wider tire clearance, fork features, and mounting interfaces must not automatically be treated as identical to the Magnum.

Ensure model-specific geometry and component compatibility.

## Engine11

Support researched variants of Crit-D, Riven, Sprinter, and Vortex.

Verify year/edition differences before implementing special finishes or branded graphics.

Do not assume limited-edition models share identical visual features.

## Leader

Support verified 721, 725, 735, and EQNX variants.

Preserve distinctions between specific model years and frameset revisions.

Do not reuse a single Leader frame shape for all models unless a particular shared geometry is documented.

## Other manufacturers

Apply the same standard to:

- State Bicycle Co.
- Wabi Cycles.
- 8bar.
- Surly.
- Cinelli.
- Dosnoventa.

The goal is consistent fidelity across the entire brand catalog, not only the first two manufacturers.

---

# 5. REQUIRED PRODUCT DATA STRUCTURE

Each frameset model must maintain its own records.

Example conceptual structure:

```typescript
type FramesetModel = {
  id: string;
  brandId: string;
  name: string;
  revision?: string;
  year?: number;
  category: "frameset";

  variants: string[];

  geometrySourceId?: string;
  assetManifestId?: string;

  specificationStatus:
    | "verified"
    | "partial"
    | "unverified";

  renderingFidelity:
    | "licensed-authentic"
    | "verified-geometry"
    | "illustrative"
    | "unavailable";

  published: boolean;
};
```

Detailed geometry, per-size dimensions, finish variants, sources, and assets should be stored in appropriate related records.

Do not put large 3D geometry or image files directly inside MongoDB.

Use asset storage with database references.

---

# 6. REQUIRED CATALOG AND BUILDER INTEGRATION

The application must support selecting brands dynamically.

Expected workflow:

**Frameset → Brand → Model → Size → Finish → Preview**

For example:

1. User opens Frameset.
2. Selects Skream.
3. Selects Magnum.
4. Chooses a verified available size.
5. Chooses a documented finish.
6. The selected product variant updates.
7. The compatibility engine checks the remaining components.
8. The available model-specific renderer loads.
9. The bike preview updates.
10. The selected brand/model information updates throughout the application.

Apply the same workflow for Tsunami, Cinelli, Dosnoventa, Engine11, Leader, and all other supported brands.

## Component compatibility

Changing a frameset must revalidate:

- Fork.
- Wheel and tire dimensions.
- Axle/dropout requirements.
- Bottom bracket.
- Crankset.
- Seatpost.
- Headset.
- Stem and steering interfaces.
- Braking mounts.
- Other dependent parts.

Do not silently preserve incompatible selections as though they were valid.

---

# 7. BRAND SUPPORT STATUS

Separate catalog availability from rendering availability.

Use the following statuses:

**Research Pending**
The model is identified but its source-backed data has not been fully collected.

**Catalog Verified**
The product and relevant specifications have been verified.

**2D Supported**
A corresponding 2D rendering is implemented and tested at its declared fidelity.

**3D Supported**
A corresponding 3D rendering is implemented and tested at its declared fidelity.

**Fully Supported**
The model has verified catalog data, required variant support, compatibility coverage, and both 2D/3D renderers at their explicitly documented fidelity levels.

Do not interpret "Fully Supported" as "Officially Licensed" unless appropriate rights exist.

Do not mark an incomplete model as fully supported simply because its product card is visible.

---

# 8. ADDITIONAL COMPONENT BRANDS

Prepare the catalog system to support real manufacturers of individual bicycle parts.

Initial candidates:

**Cranksets and drivetrain**
- Sugino
- SRAM
- Shimano
- Miche
- FSA
- KMC

**Rims, wheelsets, and hubs**
- H Plus Son
- Velocity
- Miche
- DT Swiss
- Phil Wood

**Tires**
- Continental
- Vittoria
- Schwalbe
- Panaracer

**Cockpit and seating**
- Nitto
- Thomson
- Deda
- Fizik
- Selle Italia
- Brooks

Only publish product categories and model variants actually supported by verified product information.

A manufacturer must not automatically be associated with every component type.

The initial priority remains branded framesets. Extend individual component coverage through the same verified catalog and asset pipeline.

---

# 9. CATALOG MAINTENANCE

Administrators must be able to:

- Add new manufacturers.
- Edit brand descriptions.
- Register model records.
- Add sizes and finishes.
- Maintain specifications.
- Register source URLs.
- Upload permitted 2D and 3D assets.
- Assign rendering fidelity statuses.
- Publish or archive variants.
- Mark unsupported visualizations.
- Review product-data completeness.

Use MongoDB-backed records.

Do not hardcode brands and models directly inside React components.

Use idempotent import scripts and unique identifiers to avoid duplicate products.

Existing saved builds must continue referencing the same valid variant identifiers after catalog updates.

---

# 10. REPOSITORY CLEANUP REQUIREMENTS

Preserve the repository restructuring requirements from the previous prompt.

Keep the codebase logically organized:

```text
TrackLab/
├── frontend/
│   ├── public/
│   │   └── assets/
│   └── src/
│       ├── features/
│       │   ├── builder/
│       │   ├── catalog/
│       │   └── garage/
│       └── components/
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── brands/
│   │   │   ├── products/
│   │   │   ├── variants/
│   │   │   └── builds/
│   │   └── database/
│   └── scripts/
│       └── seeds/
│
├── shared/
│   └── src/
│       ├── schemas/
│       ├── types/
│       └── compatibility/
│
├── docs/
│   ├── brands/
│   ├── geometry/
│   ├── asset-licensing/
│   └── deployment/
│
├── package.json
└── README.md
```

This structure is illustrative.

Inspect the existing architecture and only create necessary folders.

Do not introduce duplicate modules or empty folders merely to match the diagram.

Preserve frontend/backend build scripts, workspace dependencies, authentication, database operations, deployment configuration, and the existing 2D/3D rendering pipeline.

Keep shared code browser-safe.

Do not remove valuable historical catalog records, migrations, source documentation, or user data.

---

# 11. BRAND ASSETS AND LEGAL REQUIREMENTS

TrackLab remains an independent project.

Do not claim sponsorship or endorsement by any manufacturer.

All manufacturers retain ownership of their trademarks and protected assets.

Use authentic photographs, decals, logos, and 3D assets only where the required rights have been established.

Do not scrape or redistribute protected assets without authorization.

When authentic visual assets cannot be used:

- Maintain the verified product record.
- Use independently modeled geometry where appropriate.
- Identify approximation limitations.
- Omit unauthorized graphics.
- Preserve the existing brand disclaimer.

**Do not prioritize visual similarity by violating asset licensing requirements or fabricating geometry.**

---

# 12. IMPLEMENTATION PRIORITY

Complete the expansion progressively.

### Stage 1 — Existing brands

Finish auditing and improving Cinelli and Dosnoventa.

### Stage 2 — High-priority expansion

Add verified catalog records and supported rendering for:

1. Tsunami SNM100.
2. Skream Magnum.
3. Engine11 Crit-D.
4. Leader 735.

These are initial implementation targets, not a restriction on additional brands.

### Stage 3 — Additional models

Expand into:

- Tsunami SNM200.
- Skream Ranger.
- Engine11 Riven, Sprinter, and Vortex.
- Leader 721, 725, and EQNX.
- Other verified Cinelli and Dosnoventa variants.

### Stage 4 — Extended catalog

Integrate State Bicycle Co., Wabi, 8bar, Surly, and additional verified fixed-gear models.

### Stage 5 — Components

Expand verified wheelsets, tires, cranksets, cockpits, and seating components.

### Stage 6 — Verification

Test model selection, geometry, finishes, compatibility, assets, existing saved builds, and responsive rendering.

Proceed through feasible stages while documenting any missing source information or asset permissions.

---

# 13. ACCEPTANCE CRITERIA

The expanded catalog must satisfy these requirements:

1. The original brands remain supported.
2. Tsunami, Skream, Engine11, and Leader have verified brand entries.
3. Additional manufacturers are supported through the same catalog architecture.
4. Exact models and variants can be maintained through the backend.
5. Selecting a supported model updates its actual variant reference.
6. Model-specific geometry is used when verified and available.
7. Distinct frames are not represented using misleading generic geometry.
8. Available finishes correspond to documented variants.
9. Product cards identify rendering fidelity honestly.
10. Component compatibility updates after frame changes.
11. 2D and 3D use the same selected configuration.
12. Brand and product information comes from source-backed records.
13. Brand disclaimers and asset permissions are respected.
14. Existing user builds remain intact.
15. Guest and registered-user limitations remain unchanged.
16. No product prices are invented.
17. Frontend and backend remain cleanly separated.
18. Existing deployments remain compatible.
19. Tests are executed and their actual results documented.
20. Incomplete assets or product models are recorded as unfinished, not marked successful.

---

# FINAL INSTRUCTIONS

Expand TrackLab into a comprehensive fixed-gear bicycle configurator featuring Cinelli, Dosnoventa, Tsunami, Skream, Engine11, Leader, and additional verified manufacturers.

**Brand selection must produce an accurate, model-specific bicycle visualization wherever supported—not merely replace a text label or color.**

Preserve the actual geometry, finishes, technical specifications, and compatibility information of supported models.

Do not fabricate brand-specific visual differences.

Continue the previous strict repository cleanup and frontend/backend separation requirements.

Maintain the existing graphite/electric-blue design identity, MongoDB architecture, authentication, rate limits, build quotas, and saved-bike functionality.

Implement each brand through a maintainable, extendable catalog system instead of hardcoded frontend logic.

Verify each supported model and report honestly which models have complete 2D support, 3D support, verified specifications, or remaining asset limitations.