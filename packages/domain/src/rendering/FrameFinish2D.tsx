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
  const f = forkBladePoints(g, 1).map(p);
  const paths: { zone: PaintZone; d: string; width: number }[] = [
    { zone: "seatstay", d: segment(g.rear, g.seat), width: 14 },
    { zone: "chainstay", d: segment(g.rear, g.bb), width: 16 },
    { zone: "top", d: segment(g.seat, g.head), width: g.frame.frameWidth },
    { zone: "seat", d: segment(g.bb, g.seat), width: g.frame.frameWidth },
    { zone: "down", d: segment(g.bb, g.lower), width: g.frame.frameWidth + 8 },
    {
      zone: "head",
      d: segment(g.lower, g.head),
      width: g.frame.frameWidth + 8,
    },
    {
      zone: "fork",
      d: `M${f[0].x} ${f[0].y}C${f[1].x} ${f[1].y} ${f[2].x} ${f[2].y} ${f[3].x} ${f[3].y}`,
      width: 22,
    },
    { zone: "crown", d: `M${p(g.crown).x - 13} ${p(g.crown).y}h26`, width: 17 },
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
        {paths.map(({ zone, d, width }) => (
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
                fill="none"
                stroke="white"
                strokeWidth={width}
                strokeLinecap="round"
              />
            </mask>
          </React.Fragment>
        ))}
      </defs>
      <path
        d={segment(g.crown, g.steererTop)}
        fill="none"
        stroke={metal}
        strokeWidth={28}
      />
      <g
        data-layer="base-geometry"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map(({ zone, d, width }) => (
          <path
            key={zone}
            d={d}
            fill="none"
            stroke="#242b35"
            strokeWidth={width + 1.5}
          />
        ))}
      </g>
      <g
        data-layer="paint-regions"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map(({ zone, d, width }) => (
          <path
            key={zone}
            data-paint-zone={zone}
            d={d}
            fill="none"
            stroke={paint(zone)}
            strokeWidth={width}
          />
        ))}
      </g>
      <circle cx={p(g.front).x} cy={p(g.front).y} r={10} fill={metal} />
      <g data-layer="highlights" opacity={0.13} strokeLinecap="round">
        {paths.map(({ zone, d }) => (
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
