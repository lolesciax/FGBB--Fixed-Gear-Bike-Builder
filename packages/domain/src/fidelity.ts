import type { Product, Variant } from "./index";
const anchors = [
  "seatTube",
  "headTube",
  "headAngle",
  "seatAngle",
  "chainstay",
  "bbDrop",
  "stack",
  "reach",
];
export function visualizationInfo(product: Product, variant: Variant) {
  const missing = anchors.filter(
    (key) => typeof variant.specs[key] !== "number",
  );
  const supported =
    product.illustrative ||
    product.visual?.assetId === "tracklab-parametric-v2";
  return {
    specifications: product.provenance
      ? "Source-reviewed specifications"
      : product.illustrative
        ? "Demo dimensions"
        : "Specifications unverified",
    fidelity: !supported
      ? "Visualization unavailable"
      : "Approximate illustrative model",
    missing,
    mode2D: supported,
    mode3D: supported,
    limitations:
      "Tube widths, fork profiles, components and finish graphics remain approximate. No officially licensed model is included.",
  };
}
