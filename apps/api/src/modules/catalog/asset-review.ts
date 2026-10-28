import { Router, raw, type Request } from "express";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { AssetReview, Audit, ProductModel } from "../../models";
import { ApiError, type RateStore } from "../../security";
import type { Config } from "../../config";
export function assetReviewRoutes(
  config: Config,
  requireAdmin: (req: Request) => { id: string },
  rate: RateStore,
) {
  const router = Router(),
    directory = resolve(
      ".local",
      config.NODE_ENV === "test" ? "test-asset-review" : "asset-review",
    );
  router.get("/admin/asset-reviews", async (req, res) => {
    requireAdmin(req);
    res.json({
      items: await AssetReview.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .select("-storageKey")
        .lean(),
    });
  });
  router.get("/admin/asset-reviews/:id/file", async (req, res, next) => {
    requireAdmin(req);
    if (config.NODE_ENV === "production")
      throw new ApiError(
        503,
        "LOCAL_REVIEW_ONLY",
        "Local review files are unavailable in production.",
      );
    const id = z
        .string()
        .regex(/^[a-f0-9]{24}$/i)
        .parse(req.params.id),
      item = await AssetReview.findById(id).lean();
    if (
      !item?.storageKey ||
      !/^[-a-f0-9]+\.(glb|png|jpg|webp)$/.test(item.storageKey)
    )
      throw new ApiError(404, "NOT_FOUND", "Review file not found.");
    res.type("application/octet-stream");
    res.download(
      resolve(directory, item.storageKey),
      String(item.metadata?.filename || "review-asset").replace(
        /[^a-z0-9._-]/gi,
        "-",
      ),
      {dotfiles:'allow'},
      (error) => {
        if (error)
          next(
            new ApiError(
              404,
              "NOT_FOUND",
              "Review file is unavailable on this development machine.",
            ),
          );
      },
    );
  });
  router.post(
    "/admin/asset-reviews",
    (req, _res, next) => {
      try {
        requireAdmin(req);
        if (config.NODE_ENV === "production")
          throw new ApiError(
            503,
            "LOCAL_REVIEW_ONLY",
            "Asset uploads require a configured durable review store before production use.",
          );
        next();
      } catch (error) {
        next(error);
      }
    },
    raw({
      type: ["model/gltf-binary", "image/png", "image/jpeg", "image/webp"],
      limit: "2mb",
    }),
    async (req, res) => {
      const user = requireAdmin(req);
      await rate.consume(`asset-review:${user.id}`, 20, 3600000);
      const metadata = z
        .object({
          productId: z.string().regex(/^[a-z0-9-]{1,100}$/),
          filename: z.string().min(1).max(120),
          license: z.string().min(1).max(100),
          evidence: z.url().refine((value) => value.startsWith("https://")),
          permission: z.literal("confirmed"),
        })
        .strict()
        .parse(req.query);
      if (!(await ProductModel.exists({ _id: metadata.productId })))
        throw new ApiError(
          422,
          "PRODUCT_UNAVAILABLE",
          "Create a catalog draft before uploading its assets.",
        );
      if ((await AssetReview.countDocuments({ actor: user.id })) >= 100)
        throw new ApiError(
          409,
          "ASSET_REVIEW_LIMIT",
          "The local review inbox is full. Review existing uploads before adding more.",
        );
      const bytes = req.body as Buffer;
      if (!Buffer.isBuffer(bytes) || bytes.length < 12)
        throw new ApiError(
          422,
          "ASSET_INVALID",
          "Upload a GLB, PNG, JPEG or WebP file up to 2 MB.",
        );
      const mime = req.get("Content-Type")?.split(";")[0];
      let extension = "";
      if (
        mime === "model/gltf-binary" &&
        bytes.toString("ascii", 0, 4) === "glTF" &&
        bytes.readUInt32LE(4) === 2 &&
        bytes.readUInt32LE(8) === bytes.length
      ) {
        try {
          if (
            bytes.readUInt32LE(16) !== 0x4e4f534a ||
            bytes.readUInt32LE(12) > bytes.length - 20
          )
            throw new Error();
          const json = JSON.parse(
            bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
          );
          if (
            json.asset?.version !== "2.0" ||
            (json.buffers || []).some((b: { uri?: string }) => b.uri) ||
            (json.images || []).some(
              (i: { uri?: string; mimeType?: string }) =>
                i.uri ||
                !["image/png", "image/jpeg", "image/webp"].includes(
                  i.mimeType || "",
                ),
            )
          )
            throw new Error();
          extension = "glb";
        } catch {
          throw new ApiError(
            422,
            "ASSET_INVALID",
            "GLB must contain glTF 2.0 JSON and self-contained binary/image resources.",
          );
        }
      } else if (
        mime === "image/png" &&
        bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        extension = "png";
      else if (
        mime === "image/jpeg" &&
        bytes[0] === 255 &&
        bytes[1] === 216 &&
        bytes[2] === 255
      )
        extension = "jpg";
      else if (
        mime === "image/webp" &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP"
      )
        extension = "webp";
      if (!extension)
        throw new ApiError(
          422,
          "ASSET_INVALID",
          "File signature does not match a supported asset format. SVG and executable files are not accepted.",
        );
      const storageKey = `${randomUUID()}.${extension}`,
        path = resolve(directory, storageKey);
      await mkdir(directory, { recursive: true });
      await writeFile(path, bytes, { flag: "wx" });
      try {
        const item = await AssetReview.create({
          actor: user.id,
          storageKey,
          metadata,
          status: "pending",
          bytes: bytes.length,
          mime,
        });
        await Audit.create({
          actor: user.id,
          action: "asset.upload",
          target: String(item._id),
        });
        res.status(201).json({
          id: String(item._id),
          status: "pending",
          bytes: bytes.length,
          message:
            "Uploaded to the private review inbox. Not published or assigned to a renderer.",
        });
      } catch (error) {
        await unlink(path).catch(() => {});
        throw error;
      }
    },
  );
  return router;
}
