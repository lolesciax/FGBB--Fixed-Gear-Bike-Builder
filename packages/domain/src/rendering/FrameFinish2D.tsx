import React, { useId } from "react";
import { componentGeometry, forkBladePoints } from "../components";
import {
  finishAnchors,
  stopsFor,
  selectedColorway,
  graphicUrl,
  type PaintZone,
} from "../colorways";
import type { Product, Variant } from "../index";
import { dropoutOutline, type DropoutStyle } from "../steering";
export function FrameFinish2D({
  product,
  variant,
  metal = "#697482",
  rasterData = {},
}: {
  product: Product;
  variant: Variant;
  metal?: string;
  rasterData?: Record<string, string>;
}) {
  const uid = useId().replace(/:/g, ""),
    g = componentGeometry({ frameset: variant.specs }),
    c = selectedColorway(product, variant),
    anchors = finishAnchors(variant.specs);
  const p = (v: number[]) => ({ x: v[0] * 1000, y: -v[1] * 1000 });
  const segment = (a: number[], b: number[]) =>
    `M${p(a).x} ${p(a).y}L${p(b).x} ${p(b).y}`;
  const polygon = (points: number[][]) =>
    points.map((a, i) => `${i ? "L" : "M"}${p(a).x} ${p(a).y}`).join(" ") + "Z";
  const side = (center: number[], r: number) => [
    center[0] + g.axis[1] * r,
    center[1] - g.axis[0] * r,
    0,
  ];
  const headShape = polygon([
    side(g.lower, g.steering.headLowerRadius),
    side(g.head, g.steering.headUpperRadius),
    side(g.head, -g.steering.headUpperRadius),
    side(g.lower, -g.steering.headLowerRadius),
  ]);
  const points = forkBladePoints(g, 1),
    bladeEdges = [1, -1].map((sign) =>
      Array.from({ length: 29 }, (_, i) => {
        const t = i / 28,
          u = 1 - t,
          a = points[0],
          b = points[1],
          c = points[2],
          d = points[3],
          x =
            u * u * u * a[0] +
            3 * u * u * t * b[0] +
            3 * u * t * t * c[0] +
            t * t * t * d[0],
          y =
            u * u * u * a[1] +
            3 * u * u * t * b[1] +
            3 * u * t * t * c[1] +
            t * t * t * d[1],
          dx =
            3 * u * u * (b[0] - a[0]) +
            6 * u * t * (c[0] - b[0]) +
            3 * t * t * (d[0] - c[0]),
          dy =
            3 * u * u * (b[1] - a[1]) +
            6 * u * t * (c[1] - b[1]) +
            3 * t * t * (d[1] - c[1]),
          length = Math.hypot(dx, dy),
          r = (0.016 * u + 0.007 * t) * sign;
        return [x - (dy / length) * r, y + (dx / length) * r, 0];
      }),
    );
  const forkShape = polygon([...bladeEdges[0], ...bladeEdges[1].reverse()]);
  const crownShape = polygon(
    [
      [-0.011, -0.014],
      [0.011, -0.014],
      [0.011, 0.005],
      [0.007, 0.01],
      [-0.007, 0.01],
      [-0.011, 0.005],
    ].map(([x, y]) => [g.crown[0] + x, g.crown[1] + y, 0]),
  );
  const rearTop = [g.rear[0] + 0.012, g.rear[1] + 0.01, 0],
    rearBottom = [g.rear[0] + 0.012, g.rear[1] - 0.01, 0];
  const paths: {
    zone: PaintZone;
    d: string;
    width: number;
    filled?: boolean;
  }[] = [
    { zone: "seatstay", d: segment(rearTop, g.seat), width: 14 },
    { zone: "chainstay", d: segment(rearBottom, g.bb), width: 16 },
    {
      zone: "top",
      d: segment(g.seat, g.topJunction),
      width: g.frame.frameWidth,
    },
    { zone: "seat", d: segment(g.bb, g.seat), width: g.frame.frameWidth },
    {
      zone: "down",
      d: segment(g.bb, g.downJunction),
      width: g.frame.frameWidth + 8,
    },
    {
      zone: "head",
      d: headShape,
      width: 0,
      filled: true,
    },
    {
      zone: "fork",
      d: forkShape,
      width: 0,
      filled: true,
    },
    { zone: "crown", d: crownShape, width: 0, filled: true },
    { zone: "bb", d: `M${p(g.bb).x - 0.5} ${p(g.bb).y}h1`, width: 34 },
  ];
  const paint = (zone: PaintZone) =>
    !c && (zone === "fork" || zone === "crown")
      ? metal
      : `url(#${uid}-${zone})`;
  return (
    <g
      data-colorway-id={c?.id || "legacy"}
      data-colorway-revision={c?.revision || 0}
      data-finish-fidelity={c?.fidelity || "approximate"}
    >
      <defs>
        {paths.map(({ zone, d, width, filled }) => (
          <React.Fragment key={zone}>
            <linearGradient
              id={`${uid}-${zone}`}
              gradientUnits="userSpaceOnUse"
              x1={p(anchors[zone][0]).x}
              y1={p(anchors[zone][0]).y}
              x2={p(anchors[zone][1]).x}
              y2={p(anchors[zone][1]).y}
            >
              {stopsFor(c, zone, variant.color).map((s, i) => (
                <stop key={i} offset={s.at} stopColor={s.color} />
              ))}
            </linearGradient>
            <mask
              id={`${uid}-mask-${zone}`}
              maskUnits="userSpaceOnUse"
              x={-1000}
              y={-2000}
              width={4000}
              height={4000}
            >
              <path
                d={d}
                fill={filled ? "white" : "none"}
                stroke={filled ? "none" : "white"}
                strokeWidth={width}
                strokeLinecap="round"
              />
            </mask>
          </React.Fragment>
        ))}
      </defs>
      <path
        d={segment(g.crown, g.head)}
        fill="none"
        stroke={metal}
        strokeWidth={28}
      />
      <g
        data-layer="base-geometry"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map(({ zone, d, width, filled }) => (
          <path
            key={zone}
            d={d}
            fill={filled ? "#242b35" : "none"}
            stroke="#242b35"
            strokeWidth={filled ? 1.5 : width + 1.5}
          />
        ))}
      </g>
      <g
        data-layer="paint-regions"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map(({ zone, d, width, filled }) => (
          <path
            key={zone}
            data-paint-zone={zone}
            d={d}
            fill={filled ? paint(zone) : "none"}
            stroke={filled ? "none" : paint(zone)}
            strokeWidth={width}
          />
        ))}
      </g>
      <path
        d={segment(
          g.lower,
          g.lower.map((v, i) => v - g.axis[i] * 0.009),
        )}
        stroke={metal}
        strokeWidth={g.steering.headLowerRadius * 2000 + 2}
      />
      {(
        [
          [g.front, g.frontDropoutStyle, g.frontDropoutDiameter],
          [g.rear, g.rearDropoutStyle, g.rearDropoutDiameter],
        ] as const
      ).map(([center, style, diameter], i) => {
        const outline = dropoutOutline(style as DropoutStyle, diameter).map(
          ([x, y]) => [center[0] + x, center[1] + y, 0],
        );
        const a = p(center),
          r = (diameter / 2 + 0.0006) * 1000,
          hole =
            style === "through"
              ? ` M${a.x - r} ${a.y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
              : "";
        return (
          <path
            key={i}
            data-dropout-style={style}
            d={polygon(outline) + hole}
            fill={metal}
            fillRule="evenodd"
            stroke="#3a4350"
            strokeWidth=".7"
          />
        );
      })}
      <g data-layer="highlights" opacity={0.13} strokeLinecap="round">
        {paths
          .filter((path) => !path.filled)
          .map(({ zone, d }) => (
            <path key={zone} d={d} fill="none" stroke="white" strokeWidth={2} />
          ))}
      </g>
      <g data-layer="permitted-graphics">
        {c?.graphics
          .filter((l) => l.permission === "confirmed" && l.side !== "non-drive")
          .map((layer) => {
            const a = p(anchors[layer.zone][0]),
              b = p(anchors[layer.zone][1]),
              length = Math.hypot(b.x - a.x, b.y - a.y),
              width = length * (layer.to - layer.from),
              height = (width * layer.height) / layer.width;
            const source = Object.prototype.hasOwnProperty.call(
              rasterData,
              layer.id,
            )
              ? rasterData[layer.id]
              : graphicUrl(layer);
            return (
              <g
                key={layer.id}
                mask={`url(#${uid}-mask-${layer.zone})`}
                data-graphic-id={layer.id}
              >
                <g
                  transform={`translate(${a.x} ${a.y}) rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI})`}
                >
                  <svg
                    x={length * layer.from}
                    y={-height / 2}
                    width={width}
                    height={height}
                    viewBox={`0 0 ${layer.width} ${layer.height}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {layer.paths?.map((path, i) => (
                      <path key={i} d={path.d} fill={path.fill} />
                    ))}
                    {source && (
                      <image
                        href={source}
                        width={layer.width}
                        height={layer.height}
                        preserveAspectRatio="xMidYMid meet"
                      />
                    )}
                  </svg>
                </g>
              </g>
            );
          })}
      </g>
    </g>
  );
}
