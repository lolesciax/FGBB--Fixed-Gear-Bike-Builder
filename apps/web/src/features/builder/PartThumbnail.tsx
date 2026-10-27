import { Bike, Cog, SlidersHorizontal } from "lucide-react";
import type { Product } from "@tracklab/domain";
export function PartThumbnail({
  product,
  color,
}: {
  product: Product;
  color?: string;
}) {
  if (product.slot === "frameset")
    return (
      <svg viewBox="0 0 180 120" aria-hidden="true">
        <g
          fill="none"
          stroke={color || "#303432"}
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path
            d={
              product.id.includes("pursuit")
                ? "M20 100 65 26 84 105Z M65 26 139 39 147 66 84 105 M139 39 166 105"
                : "M20 100 65 22 84 105Z M65 22 139 22 147 55 84 105 M139 22 166 105"
            }
          />
        </g>
      </svg>
    );
  if (product.slot === "wheels" || product.slot === "tires")
    return (
      <svg viewBox="0 0 140 120" aria-hidden="true">
        <circle
          cx="70"
          cy="60"
          r="47"
          fill="none"
          stroke="#313c33"
          strokeWidth={product.id.includes("deep") ? 14 : 6}
        />
        {product.slot === "wheels" &&
          Array.from({ length: 16 }, (_, i) => (
            <line
              key={i}
              x1="70"
              y1="60"
              x2={70 + Math.cos((i * Math.PI) / 8) * 44}
              y2={60 + Math.sin((i * Math.PI) / 8) * 44}
              stroke="#9ca498"
              strokeWidth="1"
            />
          ))}
        {product.id.includes("tire28") && (
          <circle
            cx="70"
            cy="60"
            r="47"
            fill="none"
            stroke="#aa8d62"
            strokeWidth="3"
          />
        )}
      </svg>
    );
  const I =
    product.slot === "drivetrain"
      ? Cog
      : product.slot === "cockpit"
        ? Bike
        : SlidersHorizontal;
  return <I size={70} strokeWidth={1.2} />;
}
