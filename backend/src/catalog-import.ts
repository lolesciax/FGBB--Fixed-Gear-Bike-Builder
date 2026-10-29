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
    // Replace only exact original older rendering registrations, never technical
    // dimensions, custom transforms, archived records or another asset's provenance.
    for (const variant of data.variants) if (variant.asset3D?.revision === 'frame-kit-v3') {
      for(const revision of ['frame-kit-v1','frame-kit-v2'])await ProductModel.updateOne({_id:data.id,'data.source':data.source,'data.status':'published','data.variants':{$elemMatch:{id:variant.id,specs:variant.specs,color:variant.color,asset3D:{...variant.asset3D,revision}}}},{$set:{'data.variants.$.asset3D':variant.asset3D}});
    }
    // Append reviewed finish records/variants after exact legacy asset upgrades.
    // Never rewrite existing variants, archived records, admin colorways or builds.
    if(data.colorways?.length) {
      const original=data.variants.filter(v=>!v.colorwayId);
      const existing=await ProductModel.findById(data.id).lean();
      if(existing&&!existing.data.colorways&&JSON.stringify(existing.data.variants)===JSON.stringify(original))
        await ProductModel.updateOne({_id:data.id,'data.source':data.source,'data.status':data.status,'data.colorways':{$exists:false},'data.variants':{$eq:existing.data.variants}},{$set:{'data.colorways':data.colorways},$push:{'data.variants':{$each:data.variants.filter(v=>v.colorwayId)}}});
    }
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
