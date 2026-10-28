import { z } from "zod";
const id = z.string().regex(/^[a-z0-9-]{1,100}$/);
const https = z.url().refine((value) => value.startsWith("https://"));
export const brandSchema = z
  .object({
    id,
    name: z.string().trim().min(1).max(80),
    description: z.string().max(1000),
    source: https,
    reviewedAt: z.iso.datetime(),
    categories: z
      .array(
        z.enum([
          "frameset",
          "wheels",
          "tires",
          "cockpit",
          "drivetrain",
          "saddle",
        ]),
      )
      .max(6),
  })
  .strict();
export type CatalogBrand = z.infer<typeof brandSchema>;
export const modelRecordSchema = z
  .object({
    id,
    brandId: id,
    name: z.string().trim().min(1).max(120),
    source: https,
    checkedAt: z.iso.datetime(),
    revision: z.string().max(100).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
    specificationStatus: z.enum(["verified", "partial", "unverified"]),
    notes: z.string().max(2000),
    productId: id.optional(),
  })
  .strict();
export type ModelRecord = z.infer<typeof modelRecordSchema>;
