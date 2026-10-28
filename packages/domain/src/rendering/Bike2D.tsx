import React, { useId, type KeyboardEvent } from "react";
import {
  componentGeometry,
  forkBladePoints,
  handlebarPoints,
  spokeEndpoints,
  variantById,
  type Configuration,
  type Product,
  type Slot,
  type Position,
} from "@tracklab/domain";
type Point = { x: number; y: number };
type Props = {
  configuration: Configuration;
  catalog: Product[];
  active?: Slot;
  onSelect?: (slot: Slot) => void;
  zoom?: number;
  compact?: boolean;
};
const project = (p: Position): Point => ({ x: p[0] * 1000, y: -p[1] * 1000 });
const add = (a: Position, b: Position): Position =>
  a.map((v, i) => v + b[i]) as Position;
const line = (points: Point[], close = false) =>
  points.map((p, i) => (i ? "L" : "M") + p.x + " " + p.y).join(" ") +
  (close ? "Z" : "");
function smooth(points: Point[]) {
  const p = points.filter(
    (v, i) =>
      !i || Math.hypot(v.x - points[i - 1].x, v.y - points[i - 1].y) > 0.01,
  );
  let d = "M" + p[0].x + " " + p[0].y;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i],
      b = p[i],
      c = p[i + 1],
      e = p[i + 2] || c;
    d +=
      " C" +
      (b.x + (c.x - a.x) / 6) +
      " " +
      (b.y + (c.y - a.y) / 6) +
      " " +
      (c.x - (e.x - b.x) / 6) +
      " " +
      (c.y - (e.y - b.y) / 6) +
      " " +
      c.x +
      " " +
      c.y;
  }
  return d;
}
function gear(teeth: number, radius: number, inner: number, center: Point) {
  const p: Point[] = [];
  for (let i = 0; i < teeth; i++)
    for (const [o, r] of [
      [-0.5, radius - 3.8],
      [-0.17, radius + 2.7],
      [0.17, radius + 2.7],
      [0.5, radius - 3.8],
    ]) {
      const a = ((i + o) * Math.PI * 2) / teeth;
      p.push({ x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r });
    }
  return (
    line(p, true) +
    " M" +
    (center.x - inner) +
    " " +
    center.y +
    "a" +
    inner +
    " " +
    inner +
    " 0 1 0 " +
    inner * 2 +
    " 0a" +
    inner +
    " " +
    inner +
    " 0 1 0 " +
    -inner * 2 +
    " 0Z"
  );
}
export function Bike2D({
  configuration,
  catalog,
  active,
  onSelect,
  zoom = 1,
  compact = false,
}: Props) {
  const uid = useId().replace(/:/g, ""),
    get = (slot: Slot) => variantById(catalog, configuration[slot])?.variant;
  const m = componentGeometry(
      Object.fromEntries(
        Object.keys(configuration).map((slot) => [
          slot,
          get(slot as Slot)?.specs,
        ]),
      ),
    ),
    g = m.frame,
    { rear, front, bb, seat, head, headBottom } = g,
    saddle = project(m.saddlePost),
    bar = project(m.barClamp),
    stem = project(m.stemBase),
    radius = m.wheel.radius * 1000;
  const paint = get("frameset")?.color || "#535963",
    highlight =
      "#" +
      [1, 3, 5]
        .map((i) =>
          Math.round(parseInt(paint.slice(i, i + 2), 16) * 0.86 + 255 * 0.14)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");
  const barPoints = handlebarPoints(get("cockpit")?.specs)
    .slice(Math.floor(handlebarPoints(get("cockpit")?.specs).length / 2))
    .map((p) => project(add(m.barClamp, p)));
  const bounds = {
    x: -radius - 8,
    y: Math.min(g.bounds.y, saddle.y - 65, ...barPoints.map((p) => p.y - 18)),
    width: front.x + radius * 2 + 16,
    height: 0,
  };
  bounds.height = radius + 12 - bounds.y;
  const margin = compact ? 12 : 16;
  const interactive = (slot: Slot) =>
    onSelect
      ? {
          role: "button",
          tabIndex: 0,
          "aria-label": "Select " + slot + " on bicycle",
          onClick: () => onSelect(slot),
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(slot);
            }
          },
          className: "bike-part " + (active === slot ? "is-active" : ""),
        }
      : {};
  const metal = "url(#" + uid + "-metal)",
    framePaint = "url(#" + uid + "-paint)";
  const tube = (a: Point, b: Point, width: number, color = framePaint) => (
    <g>
      <path
        d={line([a, b])}
        fill="none"
        stroke="#21252b"
        strokeWidth={width + 1.5}
      />
      <path d={line([a, b])} fill="none" stroke={color} strokeWidth={width} />
      <path
        d={line([
          { x: a.x, y: a.y - 2 },
          { x: b.x, y: b.y - 2 },
        ])}
        fill="none"
        stroke="#fff"
        opacity=".16"
        strokeWidth="2"
      />
    </g>
  );
  const crown = project(m.crown);
  const [forkStart, forkA, forkB, forkEnd] = forkBladePoints(m, 1).map(project);
  const forkPath = `M${forkStart.x} ${forkStart.y} C${forkA.x} ${forkA.y} ${forkB.x} ${forkB.y} ${forkEnd.x} ${forkEnd.y}`;
  const d = m.drivetrain,
    chain = line(d.chain.points.map(project), true),
    frontRadius = d.chain.frontRadius * 1000,
    rearRadius = d.chain.rearRadius * 1000;
  return (
    <svg
      className={"bike-svg " + (compact ? "compact" : "")}
      viewBox={[
        bounds.x - margin,
        bounds.y - margin,
        bounds.width + margin * 2,
        bounds.height + margin * 2,
      ].join(" ")}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Illustrative fixed-gear bicycle, side profile. Not manufacturer geometry."
      data-frame-variant={configuration.frameset}
      data-cockpit-variant={configuration.cockpit}
      data-cockpit-shape={m.cockpit.type}
      data-geometry-revision="components-v2"
    >
      <defs>
        <linearGradient id={uid + "-paint"} x1="0" y1="0" x2=".2" y2="1">
          <stop stopColor={paint} />
          <stop offset=".35" stopColor={paint} />
          <stop offset=".5" stopColor={highlight} />
          <stop offset=".65" stopColor={paint} />
          <stop offset="1" stopColor="#272c33" />
        </linearGradient>
        <linearGradient id={uid + "-metal"} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#8b94a0" />
          <stop offset=".3" stopColor="#444d59" />
          <stop offset="1" stopColor="#202630" />
        </linearGradient>
      </defs>
      <g
        transform={
          "translate(" +
          front.x / 2 +
          " " +
          (bounds.y + bounds.height / 2) +
          ") scale(" +
          zoom +
          ") translate(" +
          -front.x / 2 +
          " " +
          -(bounds.y + bounds.height / 2) +
          ")"
        }
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse
          cx={front.x / 2}
          cy={radius + 3}
          rx={front.x / 2 + radius - 30}
          ry="7"
          fill="#171c26"
          opacity=".08"
        />
        <g {...interactive("wheels")}>
          {[rear, front].map((axle, i) => (
            <g key={i} transform={"translate(" + axle.x + " 0)"}>
              <circle
                r={(m.wheel.bsd / 2 + m.wheel.tireHeight / 2) * 1000}
                fill="none"
                stroke="#1c2027"
                strokeWidth={m.wheel.tireHeight * 1000}
              />
              {m.wheel.sidewall === "tan" && (
                <circle
                  r={(m.wheel.bsd / 2 + m.wheel.tireHeight * 0.5) * 1000}
                  fill="none"
                  stroke="#a98b61"
                  strokeWidth={m.wheel.tireHeight * 450}
                />
              )}
              <circle
                r={(m.wheel.rimOuter + m.wheel.rimInner) * 500}
                fill="none"
                stroke={metal}
                strokeWidth={m.wheel.rimDepth * 1000}
              />
              <circle
                r={m.wheel.rimOuter * 1000}
                fill="none"
                stroke="#a7afba"
                strokeWidth="1.5"
              />
              {spokeEndpoints(m.wheel, i === 0).map((s, n) => (
                <line
                  key={n}
                  x1={s.hub[0] * 1000}
                  y1={-s.hub[1] * 1000}
                  x2={s.rim[0] * 1000}
                  y2={-s.rim[1] * 1000}
                  stroke="#858f9e"
                  strokeWidth="1.3"
                />
              ))}
              <circle r={i === 0 ? 28 : 22} fill={metal} />
              <circle r="6" fill="#c0c7d1" stroke="#353e4b" strokeWidth="2" />
            </g>
          ))}
        </g>
        <g {...interactive("tires")}>
          <path
            d={
              "M" +
              (rear.x - radius + 5) +
              " -45 A" +
              radius +
              " " +
              radius +
              " 0 0 1 " +
              (rear.x + radius - 5) +
              " -45 M" +
              (front.x - radius + 5) +
              " -45 A" +
              radius +
              " " +
              radius +
              " 0 0 1 " +
              (front.x + radius - 5) +
              " -45"
            }
            fill="none"
            stroke="transparent"
            strokeWidth="28"
          />
        </g>
        <g {...interactive("frameset")}>
          {tube(rear, seat, 14)}
          {tube(rear, bb, 16)}
          {tube(seat, head, g.frameWidth)}
          {tube(bb, seat, g.frameWidth)}
          {tube(bb, headBottom, g.frameWidth + 8)}
          {tube(head, headBottom, g.frameWidth + 8)}
          {tube(crown, project(m.steererTop), 28, metal)}
          <path d={forkPath} fill="none" stroke={metal} strokeWidth="22" />
          <circle cx={front.x} cy="0" r="10" fill={metal} />
          <path
            d={line([
              { x: crown.x - 13, y: crown.y },
              { x: crown.x + 13, y: crown.y },
            ])}
            stroke={metal}
            strokeWidth="17"
          />
        </g>
        <g {...interactive("saddle")}>
          {tube(seat, saddle, m.saddle.postDiameter * 1000, metal)}
          <path
            d={smooth([
              { x: saddle.x - 94, y: saddle.y - 31 },
              { x: saddle.x - 70, y: saddle.y - 15 },
              { x: saddle.x + 40, y: saddle.y - 12 },
              { x: saddle.x + 98, y: saddle.y - 31 },
            ])}
            fill="none"
            stroke="#87919e"
            strokeWidth="7"
          />
          <rect
            x={saddle.x - 23}
            y={saddle.y - 17}
            width="46"
            height="18"
            rx="5"
            fill={metal}
          />
          <path
            d={
              "M" +
              (saddle.x - m.saddle.length * 520) +
              " " +
              (saddle.y - 48) +
              " Q" +
              (saddle.x - m.saddle.length * 350) +
              " " +
              (saddle.y - 67) +
              " " +
              saddle.x +
              " " +
              (saddle.y - 54) +
              " L" +
              (saddle.x + m.saddle.length * 430) +
              " " +
              (saddle.y - 52) +
              " Q" +
              (saddle.x + m.saddle.length * 490) +
              " " +
              (saddle.y - 39) +
              " " +
              (saddle.x + m.saddle.length * 390) +
              " " +
              (saddle.y - 34) +
              " L" +
              (saddle.x - m.saddle.length * 410) +
              " " +
              (saddle.y - 32) +
              "Z"
            }
            fill="#252c36"
            stroke="#555f6e"
            strokeWidth="2"
          />
        </g>
        <g {...interactive("cockpit")}>
          {tube(stem, bar, 28, metal)}
          <circle cx={stem.x} cy={stem.y} r="18" fill={metal} />
          <circle
            cx={bar.x}
            cy={bar.y}
            r={m.cockpit.clamp * 500 + 4}
            fill={metal}
          />
          <path
            d={smooth(barPoints)}
            fill="none"
            stroke="#242c37"
            strokeWidth={m.cockpit.tubeDiameter * 1000 + 2.8}
          />
        </g>
        <g {...interactive("drivetrain")}>
          {tube(bb, project(d.pedals[1]), 22, metal)}
          <rect
            x={project(d.pedals[1]).x - 43}
            y={project(d.pedals[1]).y - 6}
            width="86"
            height="12"
            rx="4"
            fill="#404a58"
          />
          <path d={chain} fill="none" stroke="#88929e" strokeWidth="6.4" />
          <path
            d={chain}
            fill="none"
            stroke="#3c4552"
            strokeWidth="3"
            strokeDasharray="4 8.7"
          />
          <path
            d={gear(d.rearTeeth, rearRadius, 12, rear)}
            fill={metal}
            fillRule="evenodd"
            data-teeth={d.rearTeeth}
          />
          <path
            d={gear(d.frontTeeth, frontRadius, frontRadius - 26, bb)}
            fill={metal}
            fillRule="evenodd"
            data-teeth={d.frontTeeth}
          />
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i * Math.PI * 2) / 5 + d.crankAngle,
              p = {
                x: bb.x + Math.cos(a) * (frontRadius - 20),
                y: bb.y - Math.sin(a) * (frontRadius - 20),
              };
            return (
              <g key={i}>
                <path d={line([bb, p])} stroke="#4a5463" strokeWidth="14" />
                <circle cx={p.x} cy={p.y} r="3.7" fill="#b8c1ce" />
              </g>
            );
          })}
          {tube(bb, project(d.pedals[0]), 23, metal)}
          <rect
            x={project(d.pedals[0]).x - 44}
            y={project(d.pedals[0]).y - 7}
            width="88"
            height="14"
            rx="4"
            fill="#333d4b"
            stroke="#858f9e"
            strokeWidth="2"
          />
          <circle cx={bb.x} cy={bb.y} r="8" fill="#a9b3c0" />
        </g>
      </g>
    </svg>
  );
}
