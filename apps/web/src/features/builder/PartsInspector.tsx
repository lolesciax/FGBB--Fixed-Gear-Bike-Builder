import { useState, type ReactNode } from "react";
import { Check, Search } from "lucide-react";
import {
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
  const current = configuration
    ? variantById(products, configuration[slot])
    : null;
  const available = products.filter(
    (product) =>
      product.status === "published" &&
      product.slot === slot &&
      (!brand || product.brand === brand) &&
      `${product.brand} ${product.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      {notice}
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
          available.map((product) => {
            const isSelected = product.variants.some(
              (variant) => variant.id === configuration?.[slot],
            );
            const shown = isSelected
              ? current!.variant
              : product.variants.find(
                  (variant) => variant.label === "Graphite",
                ) || product.variants[0];
            return (
              <article
                className={`product-option ${isSelected ? "selected" : ""}`}
                key={product.id}
              >
                <button
                  className="product-select"
                  aria-label={`Select ${product.name}`}
                  aria-pressed={isSelected}
                  disabled={pending || locked || isSelected || !configuration}
                  onClick={() => onSelect(slot, shown.id)}
                >
                  <div className="part-thumbnail">
                    <PartThumbnail product={product} color={shown.color} />
                  </div>
                  <div className="product-identity">
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
                {product.variants.length > 1 && (
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
                <label className="variant-row">
                  <span>Variant</span>
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
