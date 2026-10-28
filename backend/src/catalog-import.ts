import { productSchema } from "@tracklab/domain";
import { ProductModel, Brand, ModelRecordModel } from "./models";
import { expansionBrands, researchModels } from './modules/catalog/research-records';
import { seedCatalog } from "./catalog";
import { seedBrands } from "./manufacturer-catalog";

export async function importCatalog() {
  for (const brand of [...seedBrands, ...expansionBrands]) {
    const { id, ...data } = brand;
    await Brand.updateOne(
      { _id: id },
      { $setOnInsert: data },
      { upsert: true },
    );
  }
  for (const record of researchModels) await ModelRecordModel.updateOne({_id:record.id},{$setOnInsert:{data:record}},{upsert:true});
  for (const product of seedCatalog) {
    const data = productSchema.parse(product);
    await ProductModel.updateOne(
      { _id: data.id },
      { $setOnInsert: { data } },
      { upsert: true },
    );
    // Rendering metadata may be attached without changing a saved variant's technical identity.
    for(const variant of data.variants) if(variant.asset3D) await ProductModel.updateOne({_id:data.id,'data.source':data.source,'data.status':'published','data.variants':{$elemMatch:{id:variant.id,specs:variant.specs,asset3D:{$exists:false}}}},{$set:{'data.variants.$.asset3D':variant.asset3D}});
    // Upgrade only the exact untouched seed placeholder. Preserve reviewed/admin/archived data.
    if (data.id === "cinelli-vigorelli")
      await ProductModel.updateOne(
        {
          _id: data.id,
          "data.brand": "Cinelli",
          "data.name": "Vigorelli frame-kit",
          "data.description":
            "Manufacturer reference record. Authentic model geometry and licensed product assets are not registered, so selection is unavailable.",
          "data.status": "draft",
          "data.variants": { $size: 1 },
          "data.variants.0.id": "cinelli-vigorelli-reference",
          "data.variants.0.specs": {},
          "data.variants.0.color": "#808080",
        },
        { $set: { data } },
      );
  }
}
