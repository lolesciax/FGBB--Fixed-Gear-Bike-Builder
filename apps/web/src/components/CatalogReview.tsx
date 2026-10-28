import { useMemo, useState } from "react";
import { productSchema, visualizationInfo } from "@tracklab/domain";
import { PartThumbnail } from "../features/builder/PartThumbnail";
export function CatalogReview({ text }: { text: string }) {
  const [variantId, setVariant] = useState("");
  const parsed = useMemo(() => {
    try {
      return productSchema.safeParse(JSON.parse(text));
    } catch {
      return null;
    }
  }, [text]);
  if (!parsed?.success)
    return (
      <p className="small muted">
        Choose a valid record to review geometry and asset provenance.
      </p>
    );
  const product = parsed.data,
    variant =
      product.variants.find((v) => v.id === variantId) || product.variants[0],
    info = visualizationInfo(product, variant);
  return (
    <section className="catalog-review">
      <h3>Visualization review</h3>
      <div className="review-image">
        <PartThumbnail
          product={product}
          variant={variant}
          color={variant.color}
        />
      </div>
      <label>
        Review variant
        <select value={variant.id} onChange={(e) => setVariant(e.target.value)}>
          {product.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <p>
        {info.specifications}. {info.fidelity}.
      </p>
      <p>{info.limitations}</p>
      <dl>
        <dt>Original source</dt>
        <dd>
          {product.source ? (
            <a href={product.source} target="_blank" rel="noreferrer">
              Official product source
            </a>
          ) : (
            "Independent demo"
          )}
        </dd>
        <dt>3D asset</dt>
        <dd>
          {variant.asset3D?.url ||
            "Procedural fallback / no registered frame kit"}
        </dd>
        <dt>Asset license</dt>
        <dd>
          {variant.asset3D?.license ||
            product.visual?.license ||
            "Not registered"}
        </dd>
        <dt>Origin / units</dt>
        <dd>
          {variant.asset3D
            ? `${variant.asset3D.origin} / ${variant.asset3D.units}`
            : "See procedural registry"}
        </dd>
      </dl>
    </section>
  );
}
