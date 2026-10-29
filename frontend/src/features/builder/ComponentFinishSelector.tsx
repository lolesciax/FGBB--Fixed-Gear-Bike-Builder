import {
  finishZones,
  finishSlots,
  finishLabels,
  finishNames,
  finishOptions,
  type Configuration,
  type Product,
  type Variant,
  type FinishZone,
  type FinishId,
} from "@tracklab/domain";
export function ComponentFinishSelector({
  product,
  variant,
  configuration,
  disabled,
  onChange,
}: {
  product: Product;
  variant: Variant;
  configuration: Configuration;
  disabled: boolean;
  onChange: (zone: FinishZone, value: FinishId | undefined) => void;
}) {
  const zones = finishZones.filter(
    (zone) =>
      finishSlots[zone] === product.slot &&
      finishOptions(product, variant, zone).length,
  );
  if (!zones.length) return null;
  return (
    <section
      className="component-finishes"
      aria-label={`${product.name} finishes`}
    >
      <p className="small muted">{product.illustrative?'Visual finish · illustrative materials':'Visual finish · registered product colors'}</p>
      {zones.map((zone) => (
        <label key={zone}>
          {finishLabels[zone]} finish
          <select
            aria-label={`${finishLabels[zone]} finish`}
            value={configuration.appearance?.[zone] || ""}
            disabled={disabled}
            onChange={(e) =>
              onChange(zone, (e.target.value as FinishId) || undefined)
            }
          >
            <option value="">Original appearance</option>
            {finishOptions(product, variant, zone).map((id) => (
              <option value={id} key={id}>
                {finishNames[id]}
                {id === "brand"
                  ? ` / ${variant.componentFinishes?.find((r) => r.zone === zone)?.brand?.name}`
                  : ""}
              </option>
            ))}
          </select>
        </label>
      ))}
      {product.slot === "wheels" && (
        <small>
          Polished and Pure Black coordinate rims, spokes and hubs. Registered factory finishes retain their mixed colors. Tire rubber stays separate.
        </small>
      )}
      {product.slot === "saddle" && (
        <small>
          Saddle shape is independent of post diameter. The illustrated post
          follows the frame; verify the real rail/clamp interface.
        </small>
      )}
    </section>
  );
}
