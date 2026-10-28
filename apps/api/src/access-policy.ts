import { quotaPolicySchema } from "@tracklab/domain";
import type { Config } from "./config";
import { AccessPolicy } from "./models";
export async function loadAccessPolicy(config: Config) {
  const stored = await AccessPolicy.findById("access").lean();
  const fallback = {
    guestChanges: config.GUEST_CHANGES,
    guestPreviews: config.GUEST_PREVIEWS,
    guestPreviewMinutes: config.GUEST_PREVIEW_MINUTES,
    builds: config.BUILD_LIMIT,
    createDaily: config.CREATE_DAILY_LIMIT,
    createMonthly: config.CREATE_MONTHLY_LIMIT,
    publish: config.PUBLISH_LIMIT,
    exports: config.EXPORT_DAILY_LIMIT,
    saveHourly: config.SAVE_HOURLY_LIMIT,
  };
  return {
    policy: quotaPolicySchema.parse(stored?.data || fallback),
    version: stored?.version || 0,
  };
}
