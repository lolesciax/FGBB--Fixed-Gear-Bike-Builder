import { useState } from "react";
import {
  compatibility,
  slots,
  variantById,
  type Configuration,
  type Product,
} from "@tracklab/domain";
import { categoryNames } from "./PartsInspector";
export function FrameChangeReview({
  current,
  proposed,
  catalog,
  pending,
  onApply,
  onClose,
  guest,
}: {
  current: Configuration;
  proposed: Configuration;
  catalog: Product[];
  pending: boolean;
  onApply: (configuration: Configuration) => void;
  onClose: () => void;
  guest: boolean;
}) {
  const [selection, setSelection] = useState(proposed);
  const result = compatibility(selection, catalog),
    changed = slots.filter((slot) => selection[slot] !== current[slot]).length;
  return (
    <dialog
      className="dialog frame-change-dialog"
      aria-labelledby="frame-review-title"
      ref={(node) => {
        if (node && !node.open) node.showModal();
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
    >
      <h2 id="frame-review-title">Review dependent parts</h2>
      <p>
        {variantById(catalog, proposed.frameset)?.product.name} needs changes to
        your current parts. Choose replacements, then apply the complete
        selection together.
      </p>
      <div className="notice">
        {changed} accepted component changes
        {guest
          ? ` will use ${changed} guest changes`
          : " will update the existing configuration"}
        . Known conflicts must be resolved; missing measurements remain
        unverified.
      </div>
      {result.rules
        .filter((rule) => rule.state === "incompatible")
        .map((rule) => (
        <p className="error-box" role="alert" key={rule.id}>
            {rule.message}
          </p>
        ))}
      {slots
        .filter((slot) => slot !== "frameset")
        .map((slot) => (
          <label key={slot}>
            {categoryNames[slot]}
            <select
              aria-label={`Replacement ${categoryNames[slot].toLowerCase()}`}
              disabled={pending}
              value={selection[slot]}
              onChange={(event) =>
                setSelection({ ...selection, [slot]: event.target.value })
              }
            >
              {catalog
                .filter(
                  (p) =>
                    p.slot === slot &&
                    (p.status === "published" ||
                      p.variants.some((v) => v.id === current[slot])),
                )
                .flatMap((product) =>
                  product.variants
                    .filter(
                      (variant) =>
                        !variant.status ||
                        variant.status === "published" ||
                        variant.id === current[slot],
                    )
                    .map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {product.brand} / {product.name} / {variant.label}
                      </option>
                    )),
                )}
            </select>
          </label>
        ))}
      <p className="small muted">
        The server validates every selected variant. Cancel retains your
        existing build and allowance.
      </p>
      <div className="dialog-actions">
        <button className="button" disabled={pending} onClick={onClose}>
          Cancel frame change
        </button>
        <button
          className="button primary"
          disabled={pending || result.state === "incompatible" || !changed}
          onClick={() => onApply(selection)}
        >
          Apply {changed} changes
        </button>
      </div>
    </dialog>
  );
}
