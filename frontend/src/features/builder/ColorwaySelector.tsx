import { selectedColorway, type Product, type Variant } from "@tracklab/domain";
import { PartThumbnail } from "./PartThumbnail";
export function ColorwaySelector({
  product,
  variant,
  disabled,
  onSelect,
}: {
  product: Product;
  variant: Variant;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  const current = selectedColorway(product, variant),
    size = String(variant.specs.size);
  const colorways = (product.colorways || []).filter(
    (c) => c.status === "published",
  );
  if (!colorways.length) return null;
  return (
    <section
      className="colorway-selector"
      aria-label={`${product.name} colorways`}
    >
      <p className="finish-label">
        <span>Colorway · {size}</span>
        <strong>{current?.name || "Previous paint approximation"}</strong>
      </p>
      <div className="colorway-options">
        {colorways.map((c) => {
          const target = product.variants.find(
            (v) =>
              v.colorwayId === c.id &&
              v.specs.size === variant.specs.size &&
              (!v.status || v.status === "published"),
          );
          return (
            <button
              key={c.id}
              className="colorway-option"
              aria-label={`${product.name} ${c.name} colorway`}
              aria-pressed={current?.id === c.id}
              disabled={disabled || !target || current?.id === c.id}
              onClick={() => target && onSelect(target.id)}
            >
              <PartThumbnail product={product} variant={target || variant} />
              <span>{c.name}</span>
              <small>
                {!target
                  ? "Unavailable in this size"
                  : c.fidelity === "unavailable"
                    ? "Reference paint only"
                    : "Paint preview"}
              </small>
            </button>
          );
        })}
      </div>
      {current && (
        <div className="colorway-status" role="status">
          <span>
            {current.fidelity === "unavailable"
              ? "Appearance unavailable; reference paint"
              : "Approximate paint"}{" "}
            ·{" "}
            {current.paint.finish === "unknown"
              ? "surface finish unverified"
              : current.paint.finish}
          </span>
          <span>
            {current.missingGraphics.length
              ? "Manufacturer graphics omitted"
              : current.graphics.length
                ? "Reviewed graphics registered"
                : "Paint regions only"}
          </span>
          <a href={current.source.url} rel="noreferrer" target="_blank">
            Official finish source
          </a>
          <details>
            <summary>Appearance and source details</summary>
            <p>{current.limitations}</p>
            <p>
              {current.modelRevision}. Checked{" "}
              {current.source.verifiedAt.slice(0, 10)}. Listing status:{" "}
              {current.availability}; stock is not tracked.
            </p>
            {current.missingGraphics.map((note, i) => (
              <p key={i}>{note}</p>
            ))}
          </details>
        </div>
      )}
    </section>
  );
}
