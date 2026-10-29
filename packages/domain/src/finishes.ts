import { z } from "zod";
import { paintSchema, type Paint } from "./colorways";
import type { Configuration, Product, Variant, Slot } from "./index";
export const finishZones = [
  "wheelset",
  "crankArms",
  "chainring",
  "handlebar",
  "stem",
  "seatpost",
] as const;
export type FinishZone = (typeof finishZones)[number];
export const finishIdSchema = z.enum(["polished", "pure-black", "brand"]);
export type FinishId = z.infer<typeof finishIdSchema>;
export const appearanceSchema = z
  .object({
    wheelset: finishIdSchema.optional(),
    crankArms: finishIdSchema.optional(),
    chainring: finishIdSchema.optional(),
    handlebar: finishIdSchema.optional(),
    stem: finishIdSchema.optional(),
    seatpost: finishIdSchema.optional(),
  })
  .strict();
export const componentFinishSchema = z
  .object({
    zone: z.enum(finishZones),
    options: z.array(finishIdSchema).min(1).max(3),
    brand: paintSchema
      .extend({
        name: z.string().trim().min(1).max(100),
        source: z.url().refine((v) => v.startsWith("https://")),
      })
      .optional(),
  })
  .strict()
  .refine(
    (v) =>
      new Set(v.options).size === v.options.length &&
      (!v.options.includes("brand") || !!v.brand),
    "Brand Color needs an exact source-backed finish; options must be unique.",
  );
export const finishSlots: Record<FinishZone, Slot> = {
  wheelset: "wheels",
  crankArms: "drivetrain",
  chainring: "drivetrain",
  handlebar: "cockpit",
  stem: "cockpit",
  seatpost: "saddle",
};
export const finishLabels: Record<FinishZone, string> = {
  wheelset: "Wheelset",
  crankArms: "Crank arms",
  chainring: "Chainring",
  handlebar: "Handlebar",
  stem: "Stem",
  seatpost: "Seatpost",
};
export const finishNames: Record<FinishId, string> = {
  polished: "Polished",
  "pure-black": "Pure Black",
  brand: "Brand Color",
};
export const componentPresets: Record<"polished" | "pure-black", Paint> = {
  polished: {
    color: "#b9c2cd",
    finish: "exposed-metal",
    roughness: 0.24,
    metalness: 0.88,
    clearcoat: 0.12,
    clearcoatRoughness: 0.28,
  },
  "pure-black": {
    color: "#202731",
    finish: "satin",
    roughness: 0.42,
    metalness: 0.35,
    clearcoat: 0.08,
    clearcoatRoughness: 0.35,
  },
};
export function finishOptions(
  product: Product,
  variant: Variant,
  zone: FinishZone,
): FinishId[] {
  if (product.slot !== finishSlots[zone]) return [];
  const registration = variant.componentFinishes?.find((r) => r.zone === zone);
  if (registration)
    return registration.options.filter(
      (id) => id !== "brand" || !!registration.brand,
    );
  return product.illustrative ? ["polished", "pure-black"] : [];
}
export function componentPaint(
  product: Product,
  variant: Variant,
  zone: FinishZone,
  id?: FinishId,
): Paint | undefined {
  const registration = variant.componentFinishes?.find((r) => r.zone === zone);
  const selected =
    id || (registration?.options.includes("brand") ? "brand" : undefined);
  if (!selected || !finishOptions(product, variant, zone).includes(selected))
    return;
  return selected === "brand"
    ? variant.componentFinishes?.find((r) => r.zone === zone)?.brand
    : componentPresets[selected];
}
export function appearanceIssues(
  configuration: Configuration,
  catalog: Product[],
) {
  const errors: string[] = [];
  for (const zone of finishZones) {
    const id = configuration.appearance?.[zone];
    if (!id) continue;
    const product = catalog.find((p) =>
        p.variants.some((v) => v.id === configuration[finishSlots[zone]]),
      ),
      variant = product?.variants.find(
        (v) => v.id === configuration[finishSlots[zone]],
      );
    if (
      !product ||
      !variant ||
      !finishOptions(product, variant, zone).includes(id)
    )
      errors.push(`${finishLabels[zone]} does not support this finish.`);
  }
  return errors;
}
export function pruneAppearance(
  configuration: Configuration,
  catalog: Product[],
): Configuration {
  const next: Configuration = {
    ...configuration,
    appearance: { ...configuration.appearance },
  };
  for (const zone of finishZones) {
    if (!next.appearance?.[zone]) continue;
    const product = catalog.find((p) =>
        p.variants.some((v) => v.id === next[finishSlots[zone]]),
      ),
      variant = product?.variants.find((v) => v.id === next[finishSlots[zone]]);
    if (
      !product ||
      !variant ||
      !finishOptions(product, variant, zone).includes(next.appearance[zone]!)
    )
      delete next.appearance[zone];
  }
  if (!Object.keys(next.appearance || {}).length) delete next.appearance;
  return next;
}
export const appearanceForSlot = (configuration: Configuration, slot: Slot) =>
  JSON.stringify(
    finishZones
      .filter((zone) => finishSlots[zone] === slot)
      .map((zone) => configuration.appearance?.[zone] || null),
  );
export function finishGradient(paint: Paint) {
  const mix = (amount: number) =>
    "#" +
    [1, 3, 5]
      .map((i) => {
        const c = parseInt(paint.color.slice(i, i + 2), 16);
        return Math.round(
          amount > 0 ? c + (255 - c) * amount : c * (1 + amount),
        )
          .toString(16)
          .padStart(2, "0");
      })
      .join("");
  return [
    { at: 0, color: mix(-0.35) },
    { at: 0.24, color: mix(0.35) },
    { at: 0.39, color: mix(0.7) },
    { at: 0.53, color: paint.color },
    { at: 1, color: mix(-0.5) },
  ];
}
