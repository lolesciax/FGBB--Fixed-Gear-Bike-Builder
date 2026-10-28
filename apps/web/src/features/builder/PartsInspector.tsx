import { useState, type ReactNode } from "react";
import { Check, Search } from "lucide-react";
import {
  visualizationInfo,
  slots,
  variantById,
  type Configuration,
  type Product,
  type Slot,
} from "@tracklab/domain";
import { PartThumbnail } from "./PartThumbnail";

export const categoryNames: Record<Slot, string> = {
  frameset: "Frameset",
  wheels: "Wheels",
  tires: "Tires",
  cockpit: "Cockpit",
  drivetrain: "Drivetrain",
  saddle: "Seating",
};
type Props = {
  products: Product[];
  configuration: Configuration | null;
  slot: Slot;
  pending: boolean;
  locked: boolean;
  loading: boolean;
  onSelect: (slot: Slot, variant: string) => void;
  onCategory?: (slot: Slot) => void;
  notice?: ReactNode;
};
const specLabels: Record<string, string> = {
  rearSpacing: "Rear spacing · mm",
  frontSpacing: "Front spacing · mm",
  tireClearance: "Tire clearance · mm",
  seatpost: "Seatpost · mm",
  stemClamp: "Bar clamp · mm",
  bottomBracket: "Bottom bracket",
  brakeMount: "Brake interface",
  bsd: "Bead seat diameter · mm",
  width: "Tire width · mm",
  chainWidth: "Chain width · inch",
  cogWidth: "Cog width · inch",
  chainline: "Chainline · mm",
  frontTeeth: "Chainring teeth",
  rearTeeth: "Cog teeth",
  rimDepth: "Rim depth · mm",
};
export function PartsInspector({
  products,
  configuration,
  slot,
  pending,
  locked,
  loading,
  onSelect,
  onCategory,
  notice,
}: Props) {
  const [query, setQuery] = useState(""),
    [brand, setBrand] = useState("");
  const [showDemos, setShowDemos] = useState(true);
  const current = configuration
    ? variantById(products, configuration[slot])
    : null;
  const available = products
    .filter(
      (product) =>
        product.status === "published" &&
        product.slot === slot &&
        (showDemos || !product.illustrative) &&
        (!brand || product.brand === brand) &&
        `${product.brand} ${product.name}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => Number(a.illustrative) - Number(b.illustrative));
  return (
    <>
      {notice}
      {products.some(
        (p) => p.slot === slot && !p.illustrative && p.status === "published",
      ) && (
        <label className="demo-toggle">
          <input
            type="checkbox"
            checked={showDemos}
            onChange={(event) => setShowDemos(event.target.checked)}
          />
          Include independent demo parts
        </label>
      )}
      {onCategory && (
        <label className="sheet-category-label">
          Component category
          <select
            value={slot}
            onChange={(event) => onCategory(event.target.value as Slot)}
          >
            {slots.map((value) => (
              <option key={value} value={value}>
                {categoryNames[value]}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="inspector-filters">
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">
            Search {categoryNames[slot].toLowerCase()}
          </span>
          <input
            aria-label={`Search ${categoryNames[slot].toLowerCase()}`}
            placeholder={`Search ${categoryNames[slot].toLowerCase()}…`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="brand-label">
          <span className="sr-only">Filter by brand</span>
          <select
            aria-label="Filter by brand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          >
            <option value="">All brands</option>
            {[
              ...new Set(
                products
                  .filter((p) => p.slot === slot && p.status === "published")
                  .map((p) => p.brand),
              ),
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="product-options">
        {loading ? (
          <p className="muted">Loading parts…</p>
        ) : available.length === 0 ? (
          <div className="empty-inline">
            <Search size={26} />
            <p>No parts match your search.</p>
            <button
              className="text-button"
              onClick={() => {
                setQuery("");
                setBrand("");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          available.map((product, index) => {
            const isSelected = product.variants.some(
              (variant) => variant.id === configuration?.[slot],
            );
            const shown = isSelected
              ? current!.variant
              : product.variants.find(
                  (variant) => variant.label === "Graphite",
                ) || product.variants[0];
            const fidelity = visualizationInfo(product, shown);
            return (
              <article
                data-catalog-kind={
                  product.illustrative ? "demo" : "manufacturer"
                }
                className={`product-option ${isSelected ? "selected" : ""}`}
                key={product.id}
              >
                {(index === 0 ||
                  available[index - 1].illustrative !==
                    product.illustrative) && (
                  <p className="catalog-group-label">
                    {product.illustrative
                      ? "Independent demo parts"
                      : "Source-reviewed products"}
                  </p>
                )}
                <button
                  className="product-select"
                  aria-label={`Select ${product.name}`}
                  aria-pressed={isSelected}
                  disabled={pending || locked || isSelected || !configuration}
                  onClick={() => onSelect(slot, shown.id)}
                >
                  <div className="part-thumbnail">
                    <PartThumbnail
                      product={product}
                      variant={shown}
                      color={shown.color}
                    />
                  </div>
                  <div className="product-identity">
                    <span className="product-brand">{product.brand}</span>
                    <h3>{product.name}</h3>
                    <span className="demo-tag">
                      {product.illustrative
                        ? "Illustrative demo"
                        : "Manufacturer reference"}
                    </span>
                    <span className="render-support">
                      {product.illustrative
                        ? "Schematic 2D / 3D"
                        : "Asset support unverified"}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="selected-check" aria-label="Selected">
                      <Check size={16} />
                    </span>
                  )}
                </button>
                {product.illustrative && product.variants.length > 1 && (
                  <div className="finish-controls">
                    <div className="finish-label">
                      <span>Finish</span>
                      <span>{shown.label}</span>
                    </div>
                    <div className="swatches">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          title={variant.label}
                          aria-label={`${product.name} ${variant.label} finish`}
                          aria-pressed={configuration?.[slot] === variant.id}
                          className={
                            configuration?.[slot] === variant.id
                              ? "selected"
                              : ""
                          }
                          style={
                            { "--swatch": variant.color } as React.CSSProperties
                          }
                          disabled={pending || locked}
                          onClick={() => onSelect(slot, variant.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {!product.illustrative && (
                  <p className="visual-disclosure">
                    Schematic preview / approximate finish
                  </p>
                )}
                <label className="variant-row">
                  <span>
                    {product.illustrative ? "Variant" : "Size / finish"}
                  </span>
                  <select
                    aria-label={`${product.name} variant`}
                    disabled={pending || locked}
                    value={shown.id}
                    onChange={(event) => onSelect(slot, event.target.value)}
                  >
                    {product.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.label}
                      </option>
                    ))}
                  </select>
                </label>
                <details className="product-specs">
                  <summary>Specifications</summary>
                  <p>{product.description}</p>
                  <p className="fidelity-summary">
                    {fidelity.specifications}. {fidelity.fidelity}. 2D:{" "}
                    {fidelity.mode2D ? "supported" : "unavailable"} / 3D:{" "}
                    {fidelity.mode3D ? "supported" : "unavailable"}.
                  </p>
                  <p className="fidelity-summary">
                    {fidelity.limitations}
                    {fidelity.missing.length
                      ? " Unverified anchors: " + fidelity.missing.join(", ")
                      : ""}
                  </p>
                  <dl>
                    {Object.entries(shown.specs)
                      .filter(
                        ([key]) =>
                          !["geometry", "shape", "sidewall"].includes(key),
                      )
                      .map(([key, value]) => (
                        <div key={key}>
                          <dt>{specLabels[key] || key}</dt>
                          <dd>{String(value)}</dd>
                        </div>
                      ))}
                  </dl>
                  <p>{product.acknowledgment}</p>
                  {product.source && (
                    <a href={product.source} rel="noreferrer" target="_blank">
                      Manufacturer source
                    </a>
                  )}
                </details>
              </article>
            );
          })
        )}
      </div>
      <p className="inspector-footnote">
        Original schematic assets. Demo parts are not products for sale.
      </p>
    </>
  );
}
