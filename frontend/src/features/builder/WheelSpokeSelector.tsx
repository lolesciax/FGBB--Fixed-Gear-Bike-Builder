import { useId } from "react";
import {
  wheelBuild,
  wheelSpokeOptions,
  type Product,
  type Variant,
} from "@tracklab/domain";
export function WheelSpokeSelector({
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
  const description = useId(),
    options = wheelSpokeOptions(product, variant);
  if (options.length < 2) return null;
  const registered = options.some((o) => o.variant.id === variant.id);
  return (
    <div className="wheel-spoke-control">
      <label>
        Spoke configuration
        <select
          aria-label="Spoke configuration"
          aria-describedby={description}
          disabled={disabled}
          value={registered ? variant.id : ""}
          onChange={(e) => onSelect(e.target.value)}
        >
          {!registered && (
            <option value="" disabled>
              Original: {wheelBuild(variant.specs).count} front /{" "}
              {wheelBuild(variant.specs, true).count} rear · unverified
            </option>
          )}
          {options.map(({ variant, front, rear }) => (
            <option value={variant.id} key={variant.id}>
              {front} front / {rear} rear
            </option>
          ))}
        </select>
      </label>
      <small id={description}>
        {product.illustrative
          ? "Authored demo drilling and lacing."
          : "Registered drilling and lacing."}{" "}
        Rim design and visual finish stay selected.
      </small>
    </div>
  );
}
