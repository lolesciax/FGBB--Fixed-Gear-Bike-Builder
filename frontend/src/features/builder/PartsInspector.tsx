import { useState, type ReactNode } from "react";
import { Check, Search } from "lucide-react";
import {WheelSpokeSelector} from './WheelSpokeSelector';
import {
  visualizationInfo,
  barTypes,
  cockpitDimensions,
  wheelBuild,
  type BarType,
  slots,
  variantById,
  type Configuration,
  type Product,
  type Slot,
  type FinishZone,type FinishId,
} from "@tracklab/domain";
import { PartThumbnail } from "./PartThumbnail";
import {ColorwaySelector} from './ColorwaySelector';
import {ComponentFinishSelector} from './ComponentFinishSelector';

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
  onFinish?:(zone:FinishZone,value:FinishId|undefined)=>void;
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
  rimWidth:'Rim width · mm',frontSpokeCount:'Front spokes',rearSpokeCount:'Rear spokes',frontLacing:'Front lacing',rearLacing:'Rear lacing',frontHubDrilling:'Front hub holes',frontRimDrilling:'Front rim holes',rearHubDrilling:'Rear hub holes',rearRimDrilling:'Rear rim holes',
  rise: "Rise · mm",
  reach: "Reach · mm",
  drop: "Drop · mm",
  sweep: "Sweep · degrees",
  stemLength: "Stem length · mm",
  tubeDiameter: "Tube diameter · mm",
};
export function PartsInspector({
  products,
  configuration,
  slot,
  pending,
  locked,
  loading,
  onSelect,
  onFinish,
  onCategory,
  notice,
}: Props) {
  const [filters, setFilters] = useState<
    Partial<
      Record<Slot, { query: string; brand: string; barType: BarType | "" }>
    >
  >({});
  const { query = "", brand = "", barType = "" } = filters[slot] || {};
  const updateFilter = (
    patch: Partial<{ query: string; brand: string; barType: BarType | "" }>,
  ) =>
    setFilters((previous) => ({
      ...previous,
      [slot]: { query, brand, barType, ...patch },
    }));
  const setQuery = (query: string) => updateFilter({ query });
  const setBrand = (brand: string) => updateFilter({ brand });
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
        (slot !== "cockpit" ||
          !barType ||
          product.variants.some((v) => v.specs.shape === barType)) &&
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
      {slot === "cockpit" && (
        <label className="cockpit-type-control">
          Handlebar type
          <select
            aria-label="Handlebar type"
            value={barType}
            onChange={(event) =>
              updateFilter({ barType: event.target.value as BarType | "" })
            }
          >
            <option value="">All handlebar types</option>
            {barTypes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
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
                updateFilter({ query: "", brand: "", barType: "" });
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          available.map((product, index) => {
            const variants = product.variants.filter(
              (v) =>
                slot !== "cockpit" || !barType || v.specs.shape === barType,
            );
            const isSelected = variants.some(
              (variant) => variant.id === configuration?.[slot],
            );
            const shown = isSelected
              ? current!.variant
              : variants.find((variant) => variant.label === "Graphite") ||
                variants[0];
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
                    {slot==='wheels'&&<span className="render-support" data-wheel-summary>{wheelBuild(shown.specs).count}F / {wheelBuild(shown.specs,true).count}R · {shown.specs.rimDepth||25} mm rim<br/>Front: {wheelBuild(shown.specs).label} · Rear: {wheelBuild(shown.specs,true).label}<br/>{[wheelBuild(shown.specs),wheelBuild(shown.specs,true)].some(b=>b.errors.length)?'Drilling/lacing conflict': [wheelBuild(shown.specs),wheelBuild(shown.specs,true)].some(b=>b.illustrative)?'Illustrative lacing · drilling unverified':product.illustrative?'Matching authored drilling · demo':'Listed drilling matches'}</span>}
                    {slot === "cockpit" && (
                      <span className="render-support">
                        {barTypes.find(
                          ([type]) => type === shown.specs.shape,
                        )?.[1] || "Unverified type"}{" "}
                        /{" "}
                        {Math.round(
                          cockpitDimensions(shown.specs).width * 1000,
                        )}{" "}
                        mm{" "}
                        {typeof shown.specs.width !== "number"
                          ? "illustrative width"
                          : product.illustrative
                            ? "demo width"
                            : "listed width"}{" "}
                        / {String(shown.specs.stemClamp || "Unknown")} mm clamp
                      </span>
                    )}
                    <span className="demo-tag">
                      {product.illustrative
                        ? "Illustrative demo"
                        : "Manufacturer reference"}
                    </span>
                    <span className="render-support">
                      {fidelity.mode2D ? "2D supported" : "2D unavailable"} /{" "}
                      {fidelity.mode3D ? "3D supported" : "3D unavailable"}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="selected-check" aria-label="Selected">
                      <Check size={16} />
                    </span>
                  )}
                </button>
                {slot==='frameset' && product.illustrative && product.variants.length > 1 && (
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
                    {variants.map((variant) => (
                      <option
                        key={variant.id}
                        value={variant.id}
                        disabled={
                          variant.status === "archived" ||
                          variant.status === "draft"
                        }
                      >
                        {variant.label}
                      </option>
                    ))}
                  </select>
                </label>
                {slot==='wheels'&&isSelected&&<WheelSpokeSelector product={product} variant={shown} disabled={pending||locked||!configuration} onSelect={id=>onSelect(slot,id)}/>}
                {slot==='frameset'&&<ColorwaySelector product={product} variant={shown} disabled={pending||locked||!configuration} onSelect={id=>onSelect(slot,id)}/>}
                {isSelected&&configuration&&onFinish&&<ComponentFinishSelector product={product} variant={shown} configuration={configuration} disabled={pending||locked} onChange={onFinish}/>}
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
                  {fidelity.construction&&<p className="fidelity-summary">{fidelity.construction}</p>}
                  <dl>
                    {Object.entries(shown.specs)
                      .filter(
                        ([key]) =>
                          !["geometry", "shape", "sidewall"].includes(key),
                      )
                      .map(([key, value]) => (
                        <div key={key}>
                          <dt>
                            {slot === "cockpit" && key === "width"
                              ? "Handlebar width · mm"
                              : slot==='saddle'&&key==='seatpost'?'Legacy post reference · mm (not saddle fit)':specLabels[key] || key}
                          </dt>
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
