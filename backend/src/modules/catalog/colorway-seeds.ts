import {
  colorwaySchema,
  geometrySignature,
  type Colorway,
  type Paint,
  type PaintZone,
  type Product,
} from "@tracklab/domain";
const verifiedAt = "2026-10-28T14:00:00.000Z";
const dos = "https://dosnoventabikes.com/frames/";
const cinelli =
  "https://usa.cinelli-milano.com/products/vigorelli-track-alu-frame";
const skream = "https://skreambikes.com/products/";
type Definition = {
  key: string;
  name: string;
  color: string;
  source: string;
  finish?: Paint["finish"];
  regions?: Colorway["regions"];
  notes?: string;
  patch?: (size: string) => Record<string, string | number | boolean>;
};
const solid = (zone: PaintZone, color: string) => ({
  zone,
  stops: [
    { at: 0, color },
    { at: 1, color },
  ],
});
const fade = (zone: PaintZone, a: string, b: string) => ({
  zone,
  stops: [
    { at: 0, color: a },
    { at: 1, color: b },
  ],
});
const split = (zone: PaintZone, base: string, upper: string, at: number) => ({
  zone,
  stops: [
    { at: 0, color: base },
    { at: at - 0.002, color: base },
    { at: at + 0.002, color: upper },
    { at: 1, color: upper },
  ],
});
const ranger = (upper: string) => [
  split("seat", "#b7a07b", upper, 0.56),
  split("down", "#b7a07b", upper, 0.36),
  split("seatstay", "#b7a07b", upper, 0.7),
  solid("chainstay", "#b7a07b"),
  solid("bb", "#b7a07b"),
  solid("fork", upper),
  solid("crown", upper),
];
const definitions: Record<string, Definition[]> = {
  "cinelli-vigorelli": [
    {
      key: "80s-national-blu",
      name: "80s National Blu",
      color: "#0876bb",
      source: cinelli,
      regions: [
        fade("top", "#47b9d0", "#0867ba"),
        fade("seat", "#0876bb", "#47b9d0"),
        solid("seatstay", "#47b9d0"),
        fade("chainstay", "#47b9d0", "#0876bb"),
        fade("fork", "#47b9d0", "#0876bb"),
      ],
      notes:
        "Blue/cyan paint variation inferred from the exact official reference; gradient extent and pigment are approximate. Lettering, emblems and badges are omitted.",
    },
    {
      key: "rainbow",
      name: "Rainbow",
      color: "#37383e",
      source: cinelli,
      notes:
        "Official reference has a dark base with localized multicolor graphics. Those graphics and iridescent detail are unavailable; no full-frame rainbow gradient is fabricated.",
    },
    {
      key: "special-white",
      name: "Special White",
      color: "#e7e2d0",
      source: cinelli,
      notes:
        "Approximate warm off-white paint. Metallic lettering, small decorative graphics and badges omitted.",
    },
  ],
  "dosnoventa-02-la": [
    {
      key: "jet-black",
      name: "Jet Black",
      color: "#151619",
      finish: "gloss",
      source: dos + "los-angeles/los-angeles-jet-black-frame/",
    },
    {
      key: "traffic-white",
      name: "Traffic White",
      color: "#eeeFEB",
      finish: "matte",
      source: dos + "los-angeles/dosnoventa02-la-traffic-white-frameset/",
      patch: () => ({ forkTireClearance: 28 }),
    },
  ],
  "dosnoventa-03-det": [
    {
      key: "jet-black",
      name: "Jet Black",
      color: "#17171a",
      finish: "gloss",
      source: dos + "detroit/detroit-frame-true-silver-5/",
    },
    {
      key: "falcon",
      name: "Falcon",
      color: "#8b7153",
      finish: "matte",
      source: dos + "detroit/dosnoventa03-det-falcon-frameset/",
      patch: (size): Record<string, number> =>
        size === "L" ? { seatTube: 590 } : {},
    },
  ],
  "dosnoventa-01-bcn": [
    {
      key: "fighter-blue",
      name: "Fighter Blue",
      color: "#466b88",
      finish: "matte",
      source: dos + "barcelona/dosnoventa01-bcn-fighter-blue-frameset/",
    },
    {
      key: "jet-black",
      name: "Jet Black",
      color: "#151719",
      finish: "gloss",
      source: dos + "barcelona/barcelona/",
    },
  ],
  "skream-magnum": [
    {
      key: "shade",
      name: "Shade",
      color: "#6e6d77",
      source: skream + "magnum-shade-frameset",
    },
    {
      key: "lagoon",
      name: "Lagoon",
      color: "#089dce",
      source: skream + "magnum-lagoon-frameset",
    },
  ],
  "skream-ranger": [
    {
      key: "forest",
      name: "Forest",
      color: "#43504d",
      source: skream + "ranger-forest-frameset",
      regions: ranger("#43504d"),
      notes:
        "Two-tone upper green/gray and lower champagne paint; tube-relative boundary locations are approximate. Brand lettering and markings omitted.",
    },
    {
      key: "sepia",
      name: "Sepia",
      color: "#a9653e",
      source: skream + "ranger-sepia-frameset",
      regions: ranger("#a9653e"),
      notes:
        "Two-tone copper/brown upper and champagne lower paint; tube-relative boundary locations are approximate. Brand lettering and markings omitted.",
    },
  ],
};
export function withSeedColorways(product: Product): Product {
  if (product.slot !== "frameset" || product.illustrative) return product;
  const defs = definitions[product.id] || [
    {
      key: "documented-finish",
      name: String(product.variants[0].specs.finish || "Unverified finish"),
      color: product.variants[0].color,
      source: product.source!,
      notes:
        "Existing model-specific source record. Pigment/finish properties and any omitted graphics are approximate.",
    },
  ];
  const base = product.variants.filter((v) => !v.colorwayId);
  const sizes = [...new Set(base.map((v) => String(v.specs.size)))];
  const colorways = defs.map((d) =>
    colorwaySchema.parse({
      id: `${product.id}-${d.key}-v1`,
      revision: 1,
      productId: product.id,
      name: d.name,
      modelRevision:
        product.revision || "Official listing; model year unspecified",
      ...(product.year ? { manufacturerYear: product.year } : {}),
      sizes,
      status: product.status === "published" ? "published" : "draft",
      availability: "listed",
      source: { url: d.source, verifiedAt, references: [] },
      fidelity: product.status === "published" ? "approximate" : "unavailable",
      paint: {
        color: d.color,
        finish: d.finish || "unknown",
        roughness:
          d.finish === "matte" ? 0.78 : d.finish === "gloss" ? 0.22 : 0.38,
        metalness: d.finish?.includes("metal") ? 0.6 : 0.22,
        clearcoat: d.finish === "gloss" ? 0.5 : 0.12,
        clearcoatRoughness: 0.3,
      },
      regions: d.regions || [],
      graphics: [],
      missingGraphics: [
        "Manufacturer lettering, logos and model-specific markings are not licensed or included.",
      ],
      limitations:
        (d.notes ||
          "Frame and fork paint are approximations of this exact model listing. Graphics are omitted.") +
        " HEX and physical-material values are display approximations, not measured finishes. Geometry remains schematic; availability is a dated listing, not live stock.",
      license: "original-paint-approximation",
    }),
  );
  const additions = defs.flatMap((d, index) =>
    base.map((v) => {
      const specs = {
        ...v.specs,
        ...d.patch?.(String(v.specs.size)),
        finish: d.name,
        colorApproximate: true,
      };
      const same = geometrySignature({ ...v, specs }) === geometrySignature(v);
      // Variant identity includes finish; original IDs and old paint stay untouched.
      return {
        ...v,
        id: `${product.id}-${d.key}-${String(v.specs.size).toLowerCase()}-v1`,
        label: `${v.specs.size} / ${d.name}`,
        color: d.color,
        specs,
        colorwayId: colorways[index].id,
        ...(same ? { geometryVariantId: v.id } : { asset3D: undefined }),
      };
    }),
  );
  // Compatibility facts remain variant-specific even when render geometry agrees.
  return { ...product, colorways, variants: [...base, ...additions] };
}
