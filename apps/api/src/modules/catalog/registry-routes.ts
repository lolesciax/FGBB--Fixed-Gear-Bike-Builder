import { Router, type Request } from "express";
import mongoose from "mongoose";
import {
  brandSchema,
  modelRecordSchema,
  visualizationInfo,
  type Product,
  type ModelRecord,
} from "@tracklab/domain";
import { Brand, ModelRecordModel, ProductModel, Audit } from "../../models";
import { ApiError } from "../../security";

export function registryRoutes(requireAdmin: (req: Request) => { id: string }) {
  const router = Router();
  router.get("/brands", async (_req, res) => {
    const brands = await Brand.find().sort({ name: 1 }).lean();
    res.json({
      items: brands.map(
        ({ _id, name, description, source, reviewedAt, categories }) => ({
          id: _id,
          name,
          description: description || "",
          source,
          reviewedAt,
          categories: categories || [],
        }),
      ),
    });
  });
  router.get("/models", async (_req, res) => {
    const records = await ModelRecordModel.find()
      .sort({ "data.brandId": 1, "data.name": 1 })
      .lean();
    const products = (
      await ProductModel.find({ "data.status": "published" }).lean()
    ).map((p) => p.data as Product);
    res.json({
      items: records.map((record) => {
        const data = record.data as ModelRecord,
          product = products.find((p) => p.id === data.productId);
        const visual =
          product && visualizationInfo(product, product.variants[0]);
        return {
          ...data,
          published: !!product,
          variants: product?.variants.length || 0,
          renderingFidelity: visual?.mode2D ? "illustrative" : "unavailable",
          support: [
            ...(data.specificationStatus === "verified"
              ? ["Catalog Verified"]
              : ["Research Pending"]),
            ...(visual?.mode2D ? ["2D Supported"] : []),
            ...(visual?.mode3D ? ["3D Supported"] : []),
          ],
        };
      }),
    });
  });
  router.put("/admin/brands/:id", async (req, res) => {
    const user = requireAdmin(req),
      input = brandSchema.parse(req.body);
    if (input.id !== req.params.id)
      throw new ApiError(422, "ID_MISMATCH", "Brand ID must match the URL.");
    const { id, ...data } = input;
    const existing = await Brand.findById(id).lean();
    if (
      existing &&
      existing.name !== input.name &&
      (await ProductModel.exists({ "data.brand": existing.name }))
    )
      throw new ApiError(
        409,
        "BRAND_NAME_REFERENCED",
        "This name identifies existing products. Preserve it and edit the description.",
      );
    await mongoose.connection.transaction(async (session) => {
      await Brand.updateOne(
        { _id: id },
        { $set: data },
        { upsert: true, session },
      );
      await Audit.create(
        [{ actor: user.id, action: "brand.update", target: id }],
        { session },
      );
    });
    res.json(input);
  });
  router.put("/admin/models/:id", async (req, res) => {
    const user = requireAdmin(req),
      input = modelRecordSchema.parse(req.body);
    if (input.id !== req.params.id)
      throw new ApiError(422, "ID_MISMATCH", "Model ID must match the URL.");
    if (!(await Brand.exists({ _id: input.brandId })))
      throw new ApiError(
        422,
        "BRAND_UNAVAILABLE",
        "Register the manufacturer first.",
      );
    if (input.productId) {
      const product = await ProductModel.findById(input.productId).lean(),
        brand = await Brand.findById(input.brandId).lean();
      if (
        !product ||
        product.data.brand !== brand?.name ||
        product.data.slot !== "frameset"
      )
        throw new ApiError(
          422,
          "MODEL_PRODUCT_MISMATCH",
          "The linked product must be a frameset from this manufacturer.",
        );
    }
    await mongoose.connection.transaction(async (session) => {
      await ModelRecordModel.updateOne(
        { _id: input.id },
        { $set: { data: input } },
        { upsert: true, session },
      );
      await Audit.create(
        [{ actor: user.id, action: "model.update", target: input.id }],
        { session },
      );
    });
    res.json(input);
  });
  return router;
}
