# TRACKLAB — AUTHENTIC COLORWAYS, SPRITES, DECALS & FRAME FINISHES
## Mandatory Addition to the Existing 2D/3D Bicycle Modeling Improvements

### PRIMARY OBJECTIVE

Extend the existing TrackLab bicycle modeling improvement task to include accurate, model-specific manufacturer colorways, visual graphics, decals, and rendering assets.

**Strict requirement: Selecting a branded bicycle's colorway must produce a visually meaningful result in both 2D and 3D, using the correct model, finish, geometry, and permitted graphic assets.**

Do not implement this as a simple color picker that changes the entire bicycle to one solid color.

The goal is to represent the actual visual identity of supported Cinelli, Dosnoventa, Tsunami, Skream, Engine11, Leader, and other verified bicycle models.

Preserve all requirements from the previous geometry correction prompt, particularly the head tube, fork, dropout, wheelset, crankset, saddle, and cockpit improvements.

---

# 1. OFFICIAL COLORWAY SYSTEM

Create a database-driven colorway system.

Every supported frame model must have its own documented colorway variants.

## Required properties

Each colorway should define:

- Manufacturer.
- Model.
- Model year or revision.
- Colorway name.
- Associated size/product variant.
- Primary paint appearance.
- Secondary paint appearance, if applicable.
- Additional paint regions.
- Finish type.
- Approved decals or graphics.
- Fork finish.
- Finish availability.
- 2D rendering assets.
- 3D material and texture references.
- Manufacturer source.
- Verification date.
- Visual accuracy classification.
- Asset licensing information.

Do not invent official colorways.

Do not assume a colorway from one model year exists for every other year.

Do not use generic manufacturer-wide palettes when the actual finish varies by model.

---

# 2. INITIAL VERIFIED COLORWAY TARGETS

Research and implement supported colorways using official manufacturer documentation.

## Cinelli Vigorelli

Initial colorways to verify:

- 80s National Blu.
- Rainbow.
- Special White.

Each colorway should have its corresponding documented appearance.

A Rainbow colorway must not simply be represented by a randomly generated rainbow gradient.

The actual pattern, paint distribution, and supported graphical details should guide the visual implementation.

## Dosnoventa

Initial model-specific colorways:

**02 LA**
- Traffic White.
- Jet Black.

**03 DET**
- Falcon.
- Jet Black.

**01 BCN**
- Fighter Blue.
- Jet Black.

Do not assume the Jet Black finishes have identical graphics, paint materials, or decals across all models.

## Tsunami, Skream, Engine11, and Leader

Research the actual supported finishes for each exact model and revision.

Do not fabricate variants such as Neon Red, Racing Blue, or Carbon Edition unless those specific products can be verified.

Additional brands must use the same catalog and rendering architecture.

---

# 3. 2D SPRITE AND GRAPHIC ASSET SYSTEM

Improve the 2D renderer with model-specific visual layers.

A sprite may be a transparent raster asset, while SVG can provide scalable vector artwork.

Choose the appropriate representation for each visual element.

Do not rely on one flattened complete-bicycle image.

## Required visual layers

Where applicable, create separate layers for:

- Base frame geometry.
- Base paint.
- Secondary paint regions.
- Model-specific decorative patterns.
- Permitted manufacturer graphics.
- Frame lettering or decal assets.
- Fork paint.
- Fork graphics.
- Component materials.
- Highlight and shading overlays.

The underlying frame geometry should remain dimensionally correct.

## Sprite and SVG requirements

- Transparent backgrounds where appropriate.
- Consistent coordinates.
- Correct scaling.
- Proper layer order.
- High-resolution presentation.
- Appropriate image formats.
- No distorted graphics.
- No stretched decals.
- Correct model-to-asset mapping.
- Efficient caching.

Prefer SVG paths for geometry-aligned vector artwork.

Use optimized transparent PNG or WebP assets for supported texture details that cannot reasonably be represented as SVG.

Do not automatically generate one giant sprite sheet if independently registered SVG or raster layers are more maintainable.

## Important

A paint or decal layer must follow the actual frame tube or component silhouette.

It must not float beside the frame.

Changing frame size should preserve the intended relative graphic placement wherever the manufacturer design supports that variation.

---

# 4. 3D COLORWAY MATERIAL AND TEXTURE SYSTEM

The 3D renderer must support advanced product-specific materials.

Use the existing Three.js and React Three Fiber architecture.

## Required materials

Support verified finishes such as:

- Gloss paint.
- Matte paint.
- Satin finishes.
- Metallic finishes.
- Supported gradient or multicolor paint.
- Clear-coated surfaces.
- Exposed metal, where applicable.
- Other documented manufacturer finishes.

Use physically based materials.

Appropriate properties may include:

- Base color.
- Roughness.
- Metalness.
- Clearcoat.
- Clearcoat roughness.
- Normal maps.
- Texture maps.
- Material masks.

Use these properties only where they improve fidelity to the documented product.

## Multi-region paint

A bicycle frame must support more than one paint region.

Example material zones:

- Top tube.
- Down tube.
- Seat tube.
- Head tube.
- Seat stays.
- Chainstays.
- Fork blades.
- Fork crown.

These regions should support the actual paint and graphic distribution of the selected colorway.

Do not create arbitrary region boundaries that falsely represent a manufacturer finish.

## Decal mapping

Where appropriately licensed, support applying graphics to 3D geometry through:

- UV-mapped textures.
- Model-specific texture atlases.
- Decal meshes.
- Other suitable texture-projection techniques.

Ensure:

- Correct placement.
- Correct orientation.
- No mirrored lettering.
- No stretched artwork.
- No texture seams across visible graphic areas where avoidable.
- No z-fighting.
- No floating graphics.
- Correct behavior after model changes.

Do not use an unrelated generic frame UV layout for every branded model.

---

# 5. COLORWAY SELECTOR UI/UX

Improve the existing Frameset selection panel.

Recommended selection workflow:

**Brand → Model → Size → Colorway**

## User interface

Each supported colorway should show:

- Official colorway name.
- Visual swatch or thumbnail.
- Correct associated model.
- Available sizes or variants.
- Rendering support.
- Selected state.

Use compact, premium visual controls.

Do not rely on color swatches alone because some manufacturer colorways contain complex graphics.

Use small rendered thumbnails when appropriate.

Provide accessible text labels for every option.

## Selection behavior

When the user selects a colorway:

1. Identify the exact product variant.
2. Validate its relationship to the selected frame model and size.
3. Load the appropriate visual definition.
4. Update the 2D paint and graphics.
5. Update the 3D materials and permitted textures.
6. Preserve bicycle geometry unless the selected variant also changes documented geometry.
7. Preserve unrelated selected components.
8. Update catalog and build information.
9. Save the selected variant in the current configuration.
10. Display accurate visualization status.

Colorway switching must not reset the entire bicycle.

Do not unnecessarily reload geometry when only material properties change.

Use restrained transitions between supported finishes.

---

# 6. OFFICIAL COLORWAYS VS CUSTOM COLORS

Keep official manufacturer finishes separate from hypothetical user-created colors.

## Official Colorway

A documented manufacturer finish for a specific product variant.

It must have an authoritative source.

## Custom Concept Color

An optional future feature for experimenting with a personally selected finish.

If implemented later:

- Clearly label it as a custom concept.
- Do not present it as an official manufacturer colorway.
- Do not fabricate model availability.
- Do not apply protected graphics without permission.

For the current milestone, prioritize official verified colorways.

Do not expand the project into a complete custom paint editor.

---

# 7. DATABASE ARCHITECTURE

Inspect the existing MongoDB product and variant schemas.

Extend the current system rather than creating duplicate product catalogs.

Suggested conceptual data model:

```typescript
type Colorway = {
  id: string;
  productId: string;
  name: string;
  modelRevision?: string;
  manufacturerYear?: number;

  appearance: {
    finishType: string;
    primaryColor?: string;
    secondaryColor?: string;
    paintRegions?: string[];
  };

  assets: {
    preview2D?: string;
    svgLayers?: string[];
    materialPreset3D?: string;
    textureMaps3D?: string[];
    decalAssetIds?: string[];
  };

  source: {
    url: string;
    verifiedAt: string;
  };

  fidelity:
    | "licensed-authentic"
    | "verified-appearance"
    | "approximate"
    | "unavailable";

  published: boolean;
};
```

This is a conceptual structure. Adapt it to the existing database.

A product colorway must reference appropriate product variants and models.

Maintain stable identifiers.

Do not overwrite old saved configurations when colorway definitions change.

Use versioning or historical references where necessary.

Store large texture and image assets in object storage rather than MongoDB.

---

# 8. ADMINISTRATIVE ASSET MANAGEMENT

Extend existing catalog maintenance to support colorways.

Administrators should be able to:

- Register a manufacturer colorway.
- Associate it with a model.
- Associate supported sizes.
- Define finish properties.
- Register SVG layers.
- Upload licensed texture assets.
- Register model-specific 3D materials.
- Link verified sources.
- Review asset permissions.
- Preview 2D output.
- Preview 3D output.
- Publish or archive colorways.

Validate missing or unsupported assets before publishing.

Do not let incomplete colorways appear as fully verified visual reproductions.

Use existing backend validation and authorization.

---

# 9. STRICT AUTHENTICITY REQUIREMENTS

The following are prohibited:

1. Randomly generated manufacturer colorways.
2. Assigning the same official colorway to unrelated models without verification.
3. Using plain solid colors where the documented finish contains significant patterns and graphics, while claiming an exact representation.
4. Adding arbitrary manufacturer logos.
5. Stretching logos or decals across unrelated tube shapes.
6. Reusing incorrectly mapped texture assets.
7. Displaying the wrong fork finish.
8. Changing frame geometry simply because the colorway changes, unless the actual selected model variant has different geometry.
9. Claiming that an illustrative rendering is an exact manufacturer replica.
10. Reproducing protected graphics or proprietary imagery without appropriate rights.

If accurate official visuals cannot be created legally or technically, preserve the verified catalog record and classify the rendering as approximate or unavailable.

Do not invent missing graphics to imitate a brand's design.

---

# 10. 2D/3D SYNCHRONIZATION

Both renderers must use the same selected colorway identifier.

Example:

User selects:

- Brand: Cinelli.
- Model: Vigorelli.
- Size: Supported verified size.
- Colorway: Rainbow.

The 2D renderer should load the corresponding supported paint/graphic layers.

The 3D renderer should load the corresponding material and texture configuration.

Switching between 2D and 3D must preserve the selected colorway.

Do not maintain independent colorway selections for each rendering mode.

The same selected colorway must also appear consistently in:

- Builder.
- Product catalog.
- Build details.
- My Garage preview.
- Shareable build preview.

Only display authentic graphic details in modes where suitable authorized assets exist.

---

# 11. PERFORMANCE

Colorway changes should be efficient.

Requirements:

- Cache frequently used materials.
- Cache texture assets.
- Avoid unnecessary scene reconstruction.
- Dispose of obsolete resources safely.
- Use compressed textures where appropriate.
- Keep 2D rendering responsive.
- Avoid downloading full-resolution texture sets unnecessarily.
- Preserve mobile performance.
- Lazy-load optional visual details.

Do not call an external AI image or 3D generation service whenever users change a colorway.

Colorways should use prepared, validated assets.

---

# 12. TESTING AND VERIFICATION

Test:

- Official colorway selection.
- Correct product-to-colorway mapping.
- Supported frame-size relationships.
- SVG paint regions.
- 2D graphic alignment.
- 3D texture placement.
- Material transitions.
- Fork finish consistency.
- Saved build colorway persistence.
- 2D/3D synchronization.
- Archived colorway handling.
- Missing asset fallback.
- Mobile rendering.
- Dark and light studio environments.

Capture side, front, rear, and three-quarter views where appropriate.

Compare permitted reference images with actual rendered output.

Check that:

- Colorways are not assigned to the wrong models.
- Decals are not mirrored.
- Graphics are not stretched.
- Paint appears on the intended surfaces.
- Texture seams are not visibly broken.
- Frame geometry remains accurate.
- Saved builds reopen with the correct selected appearance.

Run TypeScript checks, existing tests, and production builds.

Document actual verification results.

---

# 13. IMPLEMENTATION PRIORITY

Complete in this order:

1. Inspect existing variant and rendering architecture.
2. Verify official manufacturer colorways.
3. Create or extend colorway records.
4. Implement shared colorway selection state.
5. Register 2D SVG and sprite assets.
6. Implement 3D material and texture mapping.
7. Improve the Frameset colorway selector.
8. Synchronize 2D/3D rendering.
9. Integrate with saved builds.
10. Verify visual appearance and performance.

Do not interrupt the previously requested geometry corrections.

Head tubes, forks, dropouts, wheels, cranksets, saddles, and handlebars remain structural priorities.

Implement the colorway system on top of accurate and stable geometry.

---

# FINAL ACCEPTANCE CRITERIA

The colorway upgrade is complete only when:

- Official verified colorways are represented by stable variant records.
- The correct colorways appear under the correct frameset models.
- 2D rendering supports the corresponding available paint and graphic layers.
- 3D rendering supports the corresponding materials and textures.
- Both rendering modes reflect the same selected variant.
- Frame and fork finishes remain consistent.
- Supported graphics are positioned correctly.
- Model-specific appearance is preserved.
- Colorway changes do not reset unrelated components.
- Saved builds preserve their colorway.
- Existing account limits and security remain intact.
- Brand assets and trademarks are handled appropriately.
- Rendering fidelity is communicated accurately.
- Visual comparison and automated checks have been performed.

---

# FINAL STRICT INSTRUCTION

TrackLab must accurately represent not only the physical shape of supported branded framesets but also their documented visual identity.

**A colorway is not just a HEX color.**

Support correct paint distribution, documented finishes, visual patterns, and permitted model-specific graphics.

Use high-quality SVG/sprite layers in 2D and appropriate physically based materials and textures in 3D.

Do not substitute random colors, fabricated decals, or incorrect graphics.

Do not sacrifice geometry accuracy for appearance.

Preserve the existing TrackLab design identity, authentication, database, quotas, rate limits, rendering architecture, and saved builds.

Continue prioritizing high-quality modeling.

Do not begin the postponed complete individual-component customization overhaul.

The final result should show a recognizable, consistent, and accurately documented bicycle colorway in both the 2D and 3D builder.