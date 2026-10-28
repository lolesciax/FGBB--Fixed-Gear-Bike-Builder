import { z } from "zod";
export const quotaPolicySchema = z
  .object({
    guestChanges: z.number().int().min(1).max(100).default(24),
    guestPreviews: z.number().int().min(1).max(10).default(2),
    guestPreviewMinutes: z.number().int().min(1).max(30).default(10),
    builds: z.number().int().min(1).max(25).default(8),
    createDaily: z.number().int().min(1).max(10).default(3),
    createMonthly: z.number().int().min(1).max(50).default(15),
    publish: z.number().int().min(1).max(10).default(4),
    exports: z.number().int().min(1).max(30).default(8),
    saveHourly: z.number().int().min(1).max(600).default(120),
  })
  .strict();
export type QuotaPolicy = z.infer<typeof quotaPolicySchema>;
export const defaultQuotaPolicy = quotaPolicySchema.parse({});
