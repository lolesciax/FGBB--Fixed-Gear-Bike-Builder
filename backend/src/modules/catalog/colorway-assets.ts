import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Config } from "../../config";
import { AssetReview } from "../../models";
import type { GraphicLayer } from "@tracklab/domain";
export async function reviewedRaster(
  config: Config,
  productId: string,
  graphic: GraphicLayer,
) {
  if (!graphic.raster || config.NODE_ENV === "production") return null;
  const item = await AssetReview.findOne({
    _id: graphic.raster.reviewId,
    status: "approved",
    sha256: graphic.raster.sha256,
    "metadata.productId": productId,
  }).lean();
  if (
    !item ||
    !["image/png", "image/jpeg", "image/webp"].includes(item.mime || "") ||
    !/^[-a-f0-9]+\.(png|jpg|webp)$/.test(item.storageKey || "")
  )
    return null;
  try {
    const bytes = await readFile(
      resolve(
        ".local",
        config.NODE_ENV === "test" ? "test-asset-review" : "asset-review",
        item.storageKey!,
      ),
    );
    if (
      createHash("sha256").update(bytes).digest("hex") !== graphic.raster.sha256
    )
      return null;
    return { bytes, mime: item.mime! };
  } catch {
    return null;
  }
}
