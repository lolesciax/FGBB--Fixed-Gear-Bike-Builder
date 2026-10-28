import { Bike, Cog, SlidersHorizontal } from "lucide-react";
import { assemblyGeometry, type Product } from "@tracklab/domain";
export function PartThumbnail({
  product,
  color,
}: {
  product: Product;
  color?: string;
}) {
  if (product.slot === "frameset") {
    const g = assemblyGeometry(
      product.variants.find((v) => v.color === color)?.specs ||
        product.variants[0].specs,
    );
    const { rear, front, bb, seat, head, headBottom } = g;
    return (
      <svg
        viewBox={`-40 ${seat.y - 50} ${front.x + 90} ${-seat.y + 110}`}
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke={color || "#535963"}
          strokeWidth="23"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path
            d={`M${rear.x} 0L${seat.x} ${seat.y}L${bb.x} ${bb.y}Z M${seat.x} ${seat.y}L${head.x} ${head.y}L${headBottom.x} ${headBottom.y}L${bb.x} ${bb.y} M${headBottom.x} ${headBottom.y}L${front.x} 0`}
          />
        </g>
      </svg>
    );
  }
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
