import { useId } from "react";
import { Cog, SlidersHorizontal } from "lucide-react";
import {
  assemblyGeometry,
  handlebarPoints,
  type Product,
} from "@tracklab/domain";
export function PartThumbnail({
  product,
  color,
  variant,
}: {
  product: Product;
  color?: string;
  variant?: Product["variants"][number];
}) {
  const uid = useId().replace(/:/g, "");
  if (product.slot === "frameset" && !product.illustrative && !product.visual)
    return <span className="unavailable-thumbnail">Preview unavailable</span>;
  if (product.slot === "frameset") {
    const g = assemblyGeometry(
      variant?.specs ||
        product.variants.find((v) => v.color === color)?.specs ||
        product.variants[0].specs,
    );
    const { rear, front, bb, seat, head, headBottom } = g;
    return (
      <svg
        viewBox={`-40 ${seat.y - 50} ${front.x + 90} ${-seat.y + 110}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`thumbnail-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              stopColor={color || variant?.color || product.variants[0].color}
            />
            <stop offset=".5" stopColor="#848c97" />
            <stop
              offset="1"
              stopColor={color || variant?.color || product.variants[0].color}
            />
          </linearGradient>
        </defs>
        <g
          fill="none"
          stroke={`url(#thumbnail-${uid})`}
          strokeWidth={g.frameWidth}
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
  if (product.slot === "cockpit") {
    const points = handlebarPoints(
        variant?.specs || product.variants[0].specs,
      ).map(([x, y, z]) => ({ x: z * 1000, y: -x * 650 - y * 950 })),
      xs = points.map((p) => p.x),
      ys = points.map((p) => p.y),
      minX = Math.min(...xs) - 22,
      maxX = Math.max(...xs) + 22,
      minY = Math.min(...ys) - 22,
      maxY = Math.max(...ys) + 22;
    return (
      <svg
        viewBox={`${minX} ${minY} ${maxX - minX} ${Math.max(90, maxY - minY)}`}
        aria-hidden="true"
      >
        <path
          d={points.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ")}
          fill="none"
          stroke="#404b5a"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0 0L0 40"
          stroke="#798391"
          strokeWidth="22"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  const I = product.slot === "drivetrain" ? Cog : SlidersHorizontal;
  return <I size={70} strokeWidth={1.2} />;
}
