import { FrameFinish2D } from "@tracklab/domain/svg";
import { Cog, SlidersHorizontal } from "lucide-react";
import {
  assemblyGeometry,
  handlebarPoints,
  wheelDimensions,
  spokeEndpoints,
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
  if (product.slot === "frameset" && !product.illustrative && !product.visual)
    return <span className="unavailable-thumbnail">Preview unavailable</span>;
  if (product.slot === "frameset") {
    const g = assemblyGeometry(
      variant?.specs ||
        product.variants.find((v) => v.color === color)?.specs ||
        product.variants[0].specs,
    );
    const { front, seat } = g;
    return (
      <svg
        viewBox={`-40 ${seat.y - 50} ${front.x + 90} ${-seat.y + 110}`}
        aria-hidden="true"
      >
        <FrameFinish2D
          product={product}
          variant={
            variant ||
            product.variants.find((v) => v.color === color) ||
            product.variants[0]
          }
        />
      </svg>
    );
  }
  if (product.slot === "wheels") {
    const w = wheelDimensions(variant?.specs || product.variants[0].specs);
    return (
      <svg viewBox="0 0 140 120" aria-hidden="true">
        {[true, false].map((rear) => (
          <g
            key={String(rear)}
            transform={`translate(${rear ? 48 : 90} 60) scale(.12)`}
            data-thumbnail-wheel={rear ? "rear" : "front"}
          >
            <circle
              r={((w.rimInner + w.rimOuter) / 2) * 1000}
              fill="none"
              stroke="#697482"
              strokeWidth={w.rimDepth * 1000}
            />
            {spokeEndpoints(w, rear).map((s, i) => (
              <line
                key={i}
                x1={s.hub[0] * 1000}
                y1={-s.hub[1] * 1000}
                x2={s.rim[0] * 1000}
                y2={-s.rim[1] * 1000}
                stroke="#7c8796"
                strokeWidth="6"
              />
            ))}
            <circle r={rear ? 28 : 22} fill="#657181" />
          </g>
        ))}
      </svg>
    );
  }
  if (product.slot === "tires")
    return (
      <svg viewBox="0 0 140 120" aria-hidden="true">
        <circle
          cx="70"
          cy="60"
          r="47"
          fill="none"
          stroke="#37414f"
          strokeWidth={product.id.includes("deep") ? 14 : 6}
        />
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
