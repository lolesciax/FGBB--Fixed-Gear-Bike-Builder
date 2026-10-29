import { z } from "zod";
import type { Product, Variant } from "./index";
import { componentGeometry, type Position } from "./components";
const id = z.string().regex(/^[a-z0-9-]{1,100}$/);
const https = z.url().refine((v) => v.startsWith("https://"));
const hex = z.string().regex(/^#[a-f0-9]{6}$/i);
export const paintZones = [
  "top",
  "down",
  "seat",
  "head",
  "seatstay",
  "chainstay",
  "fork",
  "crown",
  "bb",
] as const;
export type PaintZone = (typeof paintZones)[number];
export const paintSchema = z
  .object({
    color: hex,
    finish: z.enum([
      "gloss",
      "matte",
      "satin",
      "metallic",
      "exposed-metal",
      "unknown",
    ]),
    roughness: z.number().min(0).max(1),
    metalness: z.number().min(0).max(1),
    clearcoat: z.number().min(0).max(1),
    clearcoatRoughness: z.number().min(0).max(1),
  })
  .strict();
const stops = z
  .array(z.object({ at: z.number().min(0).max(1), color: hex }).strict())
  .min(2)
  .max(8)
  .refine(
    (s) =>
      s[0].at === 0 &&
      s.at(-1)!.at === 1 &&
      s.every((v, i) => !i || v.at > s[i - 1].at),
    "Paint stops must run strictly from 0 to 1.",
  );
export const graphicLayerSchema = z
  .object({
    id,
    zone: z.enum(paintZones),
    side: z.enum(["drive", "non-drive", "both"]),
    from: z.number().min(0).max(0.95),
    to: z.number().min(0.05).max(1),
    width: z.number().positive().max(4096),
    height: z.number().positive().max(4096),
    license: z.string().min(1).max(120),
    evidence: https,
    permission: z.enum(["pending", "confirmed"]),
    paths: z
      .array(
        z
          .object({
            d: z
              .string()
              .max(12000)
              .regex(/^[MmLlHhVvCcSsQqTtAaZz0-9eE.,+\s-]+$/),
            fill: hex,
          })
          .strict(),
      )
      .max(24)
      .optional(),
    raster: z
      .object({
        reviewId: z.string().regex(/^[a-f0-9]{24}$/),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((v) => v.to > v.from, "Graphic placement must have positive length.")
  .refine(
    (v) => Boolean(v.paths?.length) !== Boolean(v.raster),
    "Use one safe vector layer or reviewed raster.",
  );
export const colorwaySchema = z
  .object({
    id,
    revision: z.number().int().positive(),
    productId: id,
    name: z.string().trim().min(1).max(100),
    modelRevision: z.string().min(1).max(120),
    manufacturerYear: z.number().int().min(1900).max(2100).optional(),
    sizes: z.array(z.string().min(1).max(30)).min(1).max(16),
    status: z.enum(["draft", "published", "archived"]),
    availability: z.enum(["listed", "not-listed", "unknown"]),
    source: z
      .object({
        url: https,
        verifiedAt: z.iso.datetime(),
        references: z.array(https).max(6),
      })
      .strict(),
    fidelity: z.enum([
      "licensed-authentic",
      "verified-appearance",
      "approximate",
      "unavailable",
    ]),
    paint: paintSchema,
    regions: z
      .array(
        z
          .object({
            zone: z.enum(paintZones),
            stops,
            paint: paintSchema.optional(),
          })
          .strict(),
      )
      .max(9),
    graphics: z.array(graphicLayerSchema).max(12),
    missingGraphics: z.array(z.string().min(1).max(200)).max(12),
    limitations: z.string().min(1).max(1000),
    license: z.literal("original-paint-approximation"),
  })
  .strict();
export type Colorway = z.infer<typeof colorwaySchema>;
export type Paint = z.infer<typeof paintSchema>;
export type GraphicLayer = z.infer<typeof graphicLayerSchema>;
export function selectedColorway(product: Product, variant: Variant) {
  return product.colorways?.find((c) => c.id === variant.colorwayId);
}
export function colorwayIssues(product: Product) {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const c of product.colorways || []) {
    if (seen.has(c.id)) errors.push("Duplicate colorway identifier.");
    seen.add(c.id);
    if (c.productId !== product.id || product.slot !== "frameset")
      errors.push(`${c.name}: wrong model association.`);
    if (new Set(c.regions.map((r) => r.zone)).size !== c.regions.length)
      errors.push(`${c.name}: duplicate paint region.`);
    if (new Set(c.graphics.map((g) => g.id)).size !== c.graphics.length)
      errors.push(`${c.name}: duplicate graphic identifier.`);
    if (new Set(c.sizes).size !== c.sizes.length)
      errors.push(`${c.name}: duplicate size association.`);
    if (c.status === "published") {
      if (c.graphics.some((g) => g.permission !== "confirmed"))
        errors.push(`${c.name}: graphics permission is pending.`);
      if (c.fidelity !== "approximate" && c.fidelity !== "unavailable")
        errors.push(
          `${c.name}: this schematic renderer cannot certify an authentic appearance; use approximate until a separate fidelity review is implemented.`,
        );
      for (const size of c.sizes)
        if (
          !product.variants.some(
            (v) => v.colorwayId === c.id && v.specs.size === size,
          )
        )
          errors.push(`${c.name}: missing ${size} variant.`);
    }
  }
  for (const v of product.variants) {
    const c = selectedColorway(product, v);
    if (v.colorwayId && (!c || !c.sizes.includes(String(v.specs.size))))
      errors.push(`${v.id}: colorway/size mismatch.`);
    if (v.geometryVariantId) {
      const base = product.variants.find((b) => b.id === v.geometryVariantId);
      if (
        !base ||
        base.geometryVariantId ||
        geometrySignature(base) !== geometrySignature(v)
      )
        errors.push(`${v.id}: geometry reference does not match.`);
    }
  }
  return errors;
}
export function geometrySignature(variant: Variant) {
  // Compare the actual generated surfaces/anchors. A separately sourced clearance
  // limit remains a compatibility fact without forcing an identical mesh reload.
  return JSON.stringify(componentGeometry({ frameset: variant.specs }));
}
export function paintFor(
  c: Colorway | undefined,
  zone: PaintZone,
  color: string,
): Paint {
  return (
    c?.regions.find((r) => r.zone === zone)?.paint ||
    c?.paint || {
      color,
      finish: "unknown",
      roughness: 0.34,
      metalness: 0.35,
      clearcoat: 0.22,
      clearcoatRoughness: 0.38,
    }
  );
}
export function stopsFor(
  c: Colorway | undefined,
  zone: PaintZone,
  color: string,
) {
  return (
    c?.regions.find((r) => r.zone === zone)?.stops || [
      { at: 0, color: c?.paint.color || color },
      { at: 1, color: c?.paint.color || color },
    ]
  );
}
export function finishAnchors(specs: Variant["specs"]) {
  const g = componentGeometry({ frameset: specs });
  return {
    top: [g.seat, g.head],
    down: [g.bb, g.lower],
    seat: [g.bb, g.seat],
    head: [g.lower, g.head],
    seatstay: [g.rear, g.seat],
    chainstay: [g.rear, g.bb],
    fork: [g.front, g.crown],
    crown: [g.crown, [g.crown[0], g.crown[1] + 0.02, 0]],
    bb: [g.bb, [g.bb[0] + 0.02, g.bb[1], 0]],
  } as Record<PaintZone, [Position, Position]>;
}
export function zoneForMesh(name: string): PaintZone | undefined {
  if (name.startsWith("fork_blade")) return "fork";
  if (name === "fork_crown") return "crown";
  if (name === "paint_bottom_bracket") return "bb";
  return paintZones.find(
    (zone) => name === `paint_${zone}` || name.startsWith(`paint_${zone}_`),
  );
}
export const graphicUrl = (g: GraphicLayer) =>
  g.raster
    ? `/api/colorway-assets/${g.raster.reviewId}/${g.raster.sha256}`
    : undefined;
export function renderFrameSpecs(specs: Variant["specs"]) {
  const keys = [
    "geometry",
    "material",
    "seatTube",
    "headTube",
    "headAngle",
    "seatAngle",
    "chainstay",
    "bbDrop",
    "stack",
    "reach",
    "wheelbase",
    "forkRake",
    "forkLength",
    "forkProfile",
    "frontSpacing",
    "rearSpacing",
    "frontAxleDiameter",
    "rearAxleDiameter",
  ];
  return Object.fromEntries(
    keys.filter((k) => specs[k] !== undefined).map((k) => [k, specs[k]]),
  );
}
